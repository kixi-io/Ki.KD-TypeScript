import {KDLexer, TokenKind} from './KDLexer'
import {Tag} from './Tag';
import {ParseError} from './ParseError'
import {Token} from './ts-parsec';
import {List} from "./List";
import {log} from "./Log";

export class KDInterp {

    eval(text: string): Tag {

        let lexer = new KDLexer(text)
        let tokens = lexer.tokens

        if(tokens.length == 0) return new Tag("root")

        let tokIndex = 0

        let firstTok = tokens[0]
        let tag = new Tag()

        if(firstTok.kind == TokenKind.ID) {
            let secondTok = tokens.safeGet(1)
            if(secondTok==null) {
                tag.name = firstTok.text
                return tag
            } else if(secondTok.kind == TokenKind.Colon) {
                let thirdTok = tokens.safeGet(2)
                if(thirdTok==null) {
                    throw new ParseError(`Expected ID for name after namespace: but got EOL`,
                        secondTok.pos.columnEnd, secondTok.pos.rowEnd)
                } else if(thirdTok.kind!=TokenKind.ID) {
                    throw new ParseError(`Expected ID for name after namespace: but got ` +
                        `${TokenKind[thirdTok.kind]}`, thirdTok.pos.columnBegin, thirdTok.pos.rowBegin)
                }

                tag.name = thirdTok.text
                tag.namespace = firstTok.text
                tokIndex = 3
            } else {
                tag.name = firstTok.text
                tokIndex = 1
            }
        }

        tokIndex = this.parseValues(tag, tokens, tokIndex)
        this.parseAttributes(tag, tokens, tokIndex)

        return tag;
    }

    // TODO

    indexIs(tokens:List<Token<TokenKind>>, tokIndex: number, kind:TokenKind) {
        let tok = tokens.safeGet(tokIndex);
        return tok && tok.kind == kind
    }

    parseValues(tag: Tag, tokens:List<Token<TokenKind>>, tokIndex: number) {
        log("Parsing values ---")
        while(true) {
            let tok = tokens.safeGet(tokIndex)
            if(tok==null) {
                return tokIndex
            }

            // Remove /////
            if(tok.kind==TokenKind.NL) {
                return tokIndex
            }
            ///////////////

            if(this.indexIs(tokens, tokIndex+1, TokenKind.Equals)) {
                // this is an attribute, return now
                return tokIndex
            } else {
                tag.values.add(this.evalLiteral(tok))
                tokIndex++
            }
        }
    }

    parseAttributes(tag: Tag, tokens:List<Token<TokenKind>>, tokIndex: number) {
        log("Parsing attributes ---")

        while(true) {
            let keyToken = tokens.safeGet(tokIndex)

            if(keyToken==null) {
                return tokIndex
            } else if(keyToken.kind==TokenKind.NL) {
                return tokIndex+1;
            } else if(keyToken.kind!=TokenKind.ID) {
                throw new ParseError(`Expected ID for attribute key but got ${TokenKind[keyToken.kind]}`,
                    keyToken.pos.columnEnd, keyToken.pos.rowBegin)
            }

            let key = keyToken.text
            log("  Got key: " + key)

            tokIndex++

            let equalsToken = tokens.safeGet(tokIndex)

            if(equalsToken == null) {
                throw new ParseError("Expected '=' after attribute key but got EOL", keyToken.pos.columnEnd,
                    keyToken.pos.rowBegin)
            } else if(equalsToken.kind != TokenKind.Equals) {
                throw new ParseError(`Expected '=' after attribute key but got ${TokenKind[equalsToken.kind]}`,
                    keyToken.pos.columnEnd, keyToken.pos.rowBegin)
            }

            log("  Got equals: " + equalsToken)

            tokIndex++
            let valueToken = tokens.safeGet(tokIndex)

            log("  Got value: " + valueToken)

            if(valueToken == null) {
                throw new ParseError("Expected value for attribute value but got EOL", equalsToken.pos.columnEnd,
                    equalsToken.pos.rowBegin)
            }

            tag.attributes[key]=this.evalLiteral(valueToken)
            tokIndex++
        }
    }

    evalLiteral(tok: Token<TokenKind>) {
        switch(tok.kind) {
            case TokenKind.Number: { return +tok.text }
            case TokenKind.String: { return tok.text.slice(1,-1) }
            case TokenKind.Bool: { return tok.text == "true" }
            case TokenKind.ID: { return tok.text } // bare string
            case TokenKind.nil: { return null }
            case TokenKind.URL: { return new URL(tok.text) }
            default: {
                throw new ParseError("Internal Error: Unknown token type for literal: " + TokenKind[tok.kind],
                    tok.pos.columnBegin, tok.pos.rowBegin)
            }
        }
    }
}