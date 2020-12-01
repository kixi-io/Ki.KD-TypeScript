import {KDLexer, TokenKind} from './KDLexer'
import {Tag} from './Tag';
import {ParseError} from './ParseError'
import {Token} from './ts-parsec';
import {List, listOf} from "./List";
import {log} from "./Log";

export class KDInterp {

    tokIndex: number
    tokens: List<Token<TokenKind>>
    tags: List<Tag>

    eval(text: string): Tag {
        this.tokIndex = 0
        this.tags = listOf()

        let lexer = new KDLexer(text)
        this.tokens = lexer.tokens
        if (this.tokens.length == 0) return new Tag("root")

        let tag: Tag
        while ((tag = this.parseTag()) != null) {
            this.tags.add(tag)
        }

        if (this.tags.isEmpty()) {
            return new Tag("root")
        } else if (this.tags.length == 1) {
            return this.tags[0]
        }

        let root = new Tag("root")
        root.children.addAll(...this.tags)

        return root
    }

    private skipNewLines() {
        while(this.tokIndex<this.tokens.length) {
            if(this.tokens[this.tokIndex].kind != TokenKind.NL) {
                return;
            }

            this.tokIndex++
        }
    }

    private parseTag(): Tag {
        this.skipNewLines()

        if(this.tokIndex>=this.tokens.length)
            return null

        let firstTok = this.current

        let tag: Tag
        let anon = false

        if(firstTok.kind == TokenKind.ID) {
            let secondTok = this.tokens.safeGet(this.tokIndex + 1)
            if(secondTok==null) {
                return new Tag(firstTok.text)
            } else if(secondTok.kind == TokenKind.Colon) {
                // name & namespace

                let thirdTok = this.tokens.safeGet(this.tokIndex + 2)
                if(thirdTok==null) {
                    throw new ParseError(`Expected ID for name after namespace: but got EOL`,
                        secondTok.pos.columnEnd, secondTok.pos.rowEnd)
                } else if(thirdTok.kind!=TokenKind.ID) {
                    throw new ParseError(`Expected ID for name after namespace: but got ` +
                        `${TokenKind[thirdTok.kind]}`, thirdTok.pos.columnBegin, thirdTok.pos.rowBegin)
                }
                tag = new Tag(thirdTok.text, firstTok.text)
                this.tokIndex += 3
            } else {
                tag = new Tag(firstTok.text)
                this.tokIndex += 1
            }
        } else if(KDInterp.isLiteral(firstTok.kind) || firstTok.kind==TokenKind.LSquare) {
            anon = true
            tag = new Tag() // anonymous tag
        }

        if(tag) {
            if (!this.isNewLine() || anon) this.parseValues(tag)
            if (!this.isNewLine() || anon) this.parseAttributes(tag)
            if (!this.isNewLine() || anon) this.parseChildren(tag)
        }

        return tag;
    }

    private static isLiteral(kind: TokenKind) {
        switch(kind) {
            case TokenKind.String:
            case TokenKind.Number:
            case TokenKind.Bool:
            case TokenKind.URL:
            case TokenKind.nil:
                return true
        }

        return false
    }

    private isNewLine(): boolean {
        let lastTok = this.tokens.safeGet(this.tokIndex-1)
        return (this.tokIndex == 0 || lastTok==null || lastTok.kind == TokenKind.NL ||
            lastTok.kind == TokenKind.Semicolon)
    }

    // TODO

    private indexIs(tokIndex: number, kind:TokenKind) {
        let tok = this.tokens.safeGet(tokIndex)
        return tok && tok.kind == kind
    }

    private parseValues(tag: Tag) {
        while(this.tokIndex<this.tokens.length) {
            let tok = this.current
            if(tok.kind==TokenKind.NL) {
                this.tokIndex++
                return;
            } else if(tok.kind == TokenKind.LBrace) {
                return;
            }

            if(this.indexIs(this.tokIndex+1, TokenKind.Equals)) {
                // This is an attribute. Return now.
                return;
            } else if(tok.kind==TokenKind.LSquare) {
                tag.values.add(this.parseList())
            } else {
                tag.values.add(this.evalLiteral(tok))
                this.tokIndex++
            }
        }
    }

    private parseAttributes(tag: Tag) {
        while(this.tokIndex<this.tokens.length) {
            let keyToken = this.current

            if(keyToken.kind == TokenKind.NL || keyToken.kind == TokenKind.Semicolon) {
                this.tokIndex++
                return;
            } else if(keyToken.kind == TokenKind.LBrace) {
                return;
            }

            if(keyToken.kind!=TokenKind.ID) {
                throw new ParseError(`Expected ID for attribute key but got ${TokenKind[keyToken.kind]}`,
                    keyToken.pos.columnEnd, keyToken.pos.rowBegin)
            }

            let key = keyToken.text

            this.tokIndex++

            let equalsToken = this.tokens.safeGet(this.tokIndex)

            if(equalsToken == null) {
                throw new ParseError(`Expected '=' after attribute key "${key}" but got EOL`,
                    keyToken.pos.columnEnd, keyToken.pos.rowBegin)
            } else if(equalsToken.kind != TokenKind.Equals) {
                throw new ParseError(
                    `Expected '=' after attribute key "${key}" but got ${TokenKind[equalsToken.kind]}`,
                    keyToken.pos.columnEnd, keyToken.pos.rowBegin)
            }

            this.tokIndex++

            let valueToken = this.tokens.safeGet(this.tokIndex)

            if(valueToken == null) {
                throw new ParseError("Expected value for attribute value but got EOL", equalsToken.pos.columnEnd,
                    equalsToken.pos.rowBegin)
            }

            if(valueToken.kind==TokenKind.LSquare) {
                tag.attributes.set(key, this.parseList())
            } else {
                tag.attributes.set(key, this.evalLiteral(valueToken))
            }

            this.tokIndex++
        }
    }

    private parseChildren(tag: Tag) {
        this.skipNewLines()
        let tok = this.current
        if(tok && tok.kind == TokenKind.LBrace) {
            this.tokIndex++
            let child: Tag
            while ((child = this.parseTag()) != null) {
                // log(`Got child: ${child} for ${tag}`)
                tag.children.add(child)
                let next = this.peek()
                if(next && next.kind==TokenKind.RBrace) {
                    this.tokIndex++
                    log(`At end of children: ${this.current.text}`)
                    return;
                }
            }
        }
        return;
    }

    private get current(): Token<TokenKind> { return this.tokens[this.tokIndex] }

    private peek(steps = 1): Token<TokenKind> { return this.tokens.safeGet(this.tokIndex+steps) }

    private parseList() : List<any> {
        let tok = this.current
        let list = listOf()

        this.tokIndex++

        while(this.tokIndex<this.tokens.length) {
            this.skipNewLines()
            tok = this.current
            if(tok.kind == TokenKind.LSquare) {
                // start a sublist
                list.add(this.parseList())
            } else if(tok.kind == TokenKind.RSquare) {
                // move past the ]
                this.tokIndex++
                break;
            } else {
                list.add(this.evalLiteral(tok))
                // on to next element
                this.tokIndex++
            }
        }

        return list
    }

    private static parseStringBlock(tok: Token<TokenKind>) {
        let text = tok.text.slice(1,-1)
        if(text.indexOf("\n")==-1) return text

        let lines = text.split("\n");
        if(lines[0].trim()=="") {
            lines = lines.slice(1)
        }

        let last = lines[lines.length-1]
        if(last.trim()=="") {
            lines = lines.slice(0, lines.length-1)
            // grab whitespace prefix and remove it from other lines if present
            let prefix = last;

            let trimmedLines = []

            for(const line of lines) {
                if(line.startsWith(prefix)) {
                    trimmedLines.push(line.substring(prefix.length))
                } else {
                    trimmedLines.push(line)
                }
            }

            lines = trimmedLines
        }

        return lines.join("\n")
    }

    private evalLiteral(tok: Token<TokenKind>) {

        switch(tok.kind) {
            case TokenKind.Number: { return +(tok.text.replace(/_/g, "")) }
            case TokenKind.HexNumber: { return parseInt(tok.text.slice(2), 16) }
            case TokenKind.String: { return tok.text.slice(1,-1) }
            case TokenKind.StringBlock: { return KDInterp.parseStringBlock(tok) }
            case TokenKind.Bool: { return tok.text == "true" }
            case TokenKind.ID: { return tok.text } // bare string
            case TokenKind.nil: { return null }
            case TokenKind.URL: { return new URL(tok.text) }
            default: {
                throw new ParseError("Parse Error: Unknown token type for literal: " + TokenKind[tok.kind],
                    tok.pos.columnBegin, tok.pos.rowBegin)
            }
        }
    }
}