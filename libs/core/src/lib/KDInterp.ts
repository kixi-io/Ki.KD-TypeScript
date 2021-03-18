import { Call } from './Call';
import { KDate } from './KDate';
import { KDLexer, TokenKind } from './KDLexer';
import { Token } from './Lexer';
import { NSID } from './NSID';
import { ParseError } from './ParseError';
import { Tag } from './Tag';
import { List, listOf, Quantity } from './_internal';

export class KDInterp {
	tokIndex: number = 0;
	tokens: List<Token<TokenKind>> = listOf();
	tags: List<Tag> = listOf();

	eval(text: string): Tag {
		this.tokIndex = 0;
		this.tags = listOf();

		let lexer = new KDLexer(text);
		this.tokens = lexer.tokens;
		if (this.tokens.length === 0) return new Tag('root');

		let tag: Tag | null;
		while ((tag = this.parseTag()) != null) {
			this.tags.add(tag);
		}

		if (this.tags.isEmpty()) {
			return new Tag('root');
		} else if (this.tags.length === 1) {
			return this.tags[0];
		}

		let root = new Tag('root');
		root.children.addAll(...this.tags);

		return root;
	}

	private skipNewLines() {
		while (this.tokIndex < this.tokens.length) {
			if (this.tokens[this.tokIndex].kind !== TokenKind.NL) {
				return;
			}

			this.tokIndex++;
		}
	}

	private parseTag(): Tag | null {
		this.skipNewLines();

		if (this.tokIndex >= this.tokens.length) return null;

		let firstTok = this.current;
		let next = this.peek();

		let tag: Tag | null = null;
		if (firstTok.kind === TokenKind.ID && !(next && next.kind === TokenKind.LParen)) {
			let secondTok = this.tokens.safeGet(this.tokIndex + 1);
			if (secondTok == null) {
				return new Tag(firstTok.text);
			} else if (secondTok.kind === TokenKind.Colon) {
				// name & namespace
				let thirdTok = this.tokens.safeGet(this.tokIndex + 2);
				if (thirdTok == null) {
					throw new ParseError(
						`Expected ID for name after namespace: but got EOL`,
						secondTok.pos.columnEnd,
						secondTok.pos.rowEnd
					);
				} else if (thirdTok.kind !== TokenKind.ID) {
					throw new ParseError(
						`Expected ID for name after namespace: but got ` + `${TokenKind[thirdTok.kind]}`,
						thirdTok.pos.columnBegin,
						thirdTok.pos.rowBegin
					);
				}
				tag = new Tag(thirdTok.text, firstTok.text);
				this.tokIndex += 3;
			} else {
				tag = new Tag(firstTok.text);
				this.tokIndex += 1;
			}
		} else if (KDInterp.isSimpleLiteral(firstTok.kind) || firstTok.kind === TokenKind.LSquare) {
			tag = new Tag(); // anonymous tag
		} else if (firstTok.kind === TokenKind.RBrace) {
			return null;
		}

		if (tag) {
			this.parseValues(tag.values);
			this.parseAttributes(tag.attributes);
			this.parseChildren(tag);
		}

		return tag;
	}

	private static isSimpleLiteral(kind: TokenKind) {
		switch (kind) {
			case TokenKind.String:
			case TokenKind.ID:
			case TokenKind.Number:
			case TokenKind.Bool:
			case TokenKind.nil:
			case TokenKind.URL:
			case TokenKind.Quantity:
			case TokenKind.Date:
			case TokenKind.Range:
				return true;
		}

		return false;
	}

	private indexIs(tokIndex: number, kind: TokenKind) {
		let tok = this.tokens.safeGet(tokIndex);
		return tok && tok.kind === kind;
	}

	private parseValues(values: List<any>) {
		while (this.tokIndex < this.tokens.length) {
			let tok = this.current;

			let last = this.peek(-1);
			if (tok.kind === TokenKind.NL && (last == null || last.kind !== TokenKind.Backslash)) {
				return;
			} else if (tok.kind === TokenKind.Semicolon || tok.kind === TokenKind.RParen) {
				return;
			} else if (tok.kind === TokenKind.LBrace || tok.kind === TokenKind.RBrace) {
				return;
			}

			if (tok.kind === TokenKind.ID && this.indexIs(this.tokIndex + 1, TokenKind.Equals)) {
				// This is an attribute. Return now.
				return;
			} else {
				values.add(this.readLiteral());
			}
		}
	}

	private parseAttributes(atts: Map<string, any> | Map<NSID, any>) {
		while (this.tokIndex < this.tokens.length) {
			let keyToken = this.current;

			if (
				keyToken.kind === TokenKind.NL ||
				keyToken.kind === TokenKind.Semicolon ||
				keyToken.kind === TokenKind.RParen
			) {
				return;
			} else if (keyToken.kind === TokenKind.LBrace || keyToken.kind === TokenKind.RBrace) {
				return;
			}

			if (keyToken.kind !== TokenKind.ID) {
				throw new ParseError(
					`Expected ID for attribute key but got ${TokenKind[keyToken.kind]}`,
					keyToken.pos.columnEnd,
					keyToken.pos.rowBegin
				);
			}

			let key = keyToken.text;

			this.tokIndex++;

			let equalsToken = this.tokens.safeGet(this.tokIndex);

			if (equalsToken == null) {
				throw new ParseError(
					`Expected '=' after attribute key "${key}" but got EOL`,
					keyToken.pos.columnEnd,
					keyToken.pos.rowBegin
				);
			} else if (equalsToken.kind !== TokenKind.Equals) {
				throw new ParseError(
					`Expected '=' after attribute key "${key}" but got ${TokenKind[equalsToken.kind]}`,
					keyToken.pos.columnEnd,
					keyToken.pos.rowBegin
				);
			}

			this.tokIndex++;

			let valueToken = this.tokens.safeGet(this.tokIndex);

			if (valueToken == null) {
				throw new ParseError(
					'Expected value for attribute value but got EOL',
					equalsToken.pos.columnEnd,
					equalsToken.pos.rowBegin
				);
			}

			if (atts.keys.name === 'string') {
				(atts as Map<string, any>).set(key, this.readLiteral());
			} else {
				(atts as Map<NSID, any>).set(new NSID(key), this.readLiteral());
			}
		}
	}

	private parseChildren(tag: Tag) {
		let tok = this.current;
		if (tok && tok.kind === TokenKind.LBrace) {
			this.tokIndex++;
			let child: Tag | null = null;

			while ((child = this.parseTag()) != null) {
				tag.children.add(child);
				this.skipNewLines();
				tok = this.current;
				if (tok.kind === TokenKind.RBrace) {
					break;
				}
			}

			this.skipNewLines();

			tok = this.current;
			if (tok && tok.kind === TokenKind.RBrace) {
				this.tokIndex++;
				return;
			}
		}
		return;
	}

	private get current(): Token<TokenKind> {
		return this.tokens[this.tokIndex];
	}

	private peek(steps = 1): Token<TokenKind> | null {
		return this.tokens.safeGet(this.tokIndex + steps);
	}

	private parseListOrMap() {
		let tok = this.current;
		let list: List<any> | null = null;
		let mark = this.tokIndex;

		if (tok.kind !== TokenKind.LSquare)
			throw new ParseError(
				`List must begin with a [, got「${TokenKind[tok.kind]}」`,
				tok.pos.columnEnd,
				tok.pos.rowBegin
			);

		this.tokIndex++;

		if (TokenKind.Equals === this.current?.kind) {
			this.tokIndex = mark;
			return this.parseMap();
		}

		while (this.tokIndex < this.tokens.length) {
			this.skipNewLines();
			tok = this.current;

			if (tok.kind === TokenKind.RSquare) {
				// move past the ]
				this.tokIndex++;
				break;
			} else {
				let literal = this.readLiteral();

				// @ts-ignore
				if (TokenKind.Equals === this.current?.kind) {
					this.tokIndex = mark;
					return this.parseMap();
				} else {
					if (!list) list = listOf();
					list.add(literal);
				}
			}
		}

		return list ?? new List();
	}

	private parseCall(): Call {
		let tok = this.current;
		if (tok.kind !== TokenKind.ID) {
			throw new ParseError('Call type must be an identifier.', tok.pos.columnBegin, tok.pos.rowBegin);
		}
		let name = tok.text;
		this.tokIndex++;

		tok = this.current;
		if (!tok) {
			let last = this.peek(-1);
			throw new ParseError('Unexpected EOF in Call', last?.pos.columnBegin ?? -1, last?.pos.rowBegin ?? -1);
		} else if (tok.kind !== TokenKind.LParen) {
			throw new ParseError(`Expected ( after ID in Call but got「${tok.text}」`, tok.pos.columnBegin, tok.pos.rowBegin);
		}

		this.tokIndex++;
		tok = this.current;

		let last = this.peek(-1);
		if (!tok) {
			throw new ParseError('Unexpected EOF in Call', last?.pos.columnBegin ?? -1, last?.pos.rowBegin ?? -1);
		}

		let call = new Call(name);
		this.parseValues(call.values);
		this.parseAttributes(call.attributes);

		tok = this.current;
		if (!tok) {
			let last = this.peek(-1);
			throw new ParseError(
				'Expected ) at end of call, but got EOF',
				last?.pos.columnBegin ?? -1,
				last?.pos.rowBegin ?? -1
			);
		} else if (tok.kind !== TokenKind.RParen) {
			throw new ParseError(
				`Expected ) at end of Call literal but got「${tok.text}」`,
				tok.pos.columnBegin,
				tok.pos.rowBegin
			);
		}
		this.tokIndex++;
		return call;
	}

	/*
    private parseList() : List<any> {
        let tok = this.current
        let list = listOf()

        if(tok.kind!=TokenKind.LSquare)
            throw new ParseError(`List must begin with a [, got「${TokenKind[tok.kind]}」`, tok.pos.columnEnd,
                tok.pos.rowBegin)

        this.tokIndex++

        while(this.tokIndex<this.tokens.length) {
            this.skipNewLines()
            tok = this.current

            if(tok.kind == TokenKind.RSquare) {
                // move past the ]
                this.tokIndex++
                break;
            } else {
                list.add(this.readLiteral())
            }
        }

        return list
    }
    */

	private parseMap(): Map<any, any> {
		let tok = this.current;
		let map = new Map();

		if (tok.kind !== TokenKind.LSquare)
			throw new ParseError(
				`Map must begin with a [, got「${TokenKind[tok.kind]}」`,
				tok.pos.columnEnd,
				tok.pos.rowBegin
			);

		this.tokIndex++;

		// Check for empty Map literal
		if (TokenKind.Equals === this.current?.kind) {
			this.tokIndex++;

			// @ts-ignore
			if (TokenKind.RSquare === this.current?.kind) {
				this.tokIndex++;
				return map;
			} else {
				throw new ParseError(
					`Empty Map termination ']' expected but got「${TokenKind[tok.kind]}」`,
					tok.pos.columnEnd,
					tok.pos.rowBegin
				);
			}
		}

		while (this.tokIndex < this.tokens.length) {
			let keyToken = this.current;

			//  end of map
			if (TokenKind.RSquare === keyToken?.kind) {
				this.tokIndex++;
				break;
			}

			if (
				!(
					KDInterp.isSimpleLiteral(keyToken.kind) ||
					TokenKind.ID === keyToken?.kind ||
					TokenKind.LSquare === keyToken?.kind
				)
			) {
				throw new ParseError(
					`Expected literal for map key but got ${TokenKind[keyToken?.kind]}`,
					keyToken.pos.columnEnd,
					keyToken.pos.rowBegin
				);
			}

			let key = this.readLiteral();

			let equalsToken = this.tokens.safeGet(this.tokIndex);

			if (equalsToken == null) {
				throw new ParseError(
					`Expected '=' after map key「${key}」but got EOL`,
					keyToken.pos.columnEnd,
					keyToken.pos.rowBegin
				);
			} else if (equalsToken.kind !== TokenKind.Equals) {
				throw new ParseError(
					`Expected '=' after attribute key「${key}」but got ${TokenKind[equalsToken.kind]}`,
					keyToken.pos.columnEnd,
					keyToken.pos.rowBegin
				);
			}

			// move past ']'
			this.tokIndex++;

			let valueToken = this.tokens.safeGet(this.tokIndex);

			if (valueToken == null) {
				throw new ParseError(
					'Expected value for attribute value but got EOL',
					equalsToken.pos.columnEnd,
					equalsToken.pos.rowBegin
				);
			}

			map.set(key, this.readLiteral());
		}

		return map;
	}

	private readLiteral() {
		let tok = this.current;
		let next = this.peek();

		if (tok.kind === TokenKind.LSquare) {
			return this.parseListOrMap();
		} else if (TokenKind.ID === tok.kind && next && TokenKind.LParen === next.kind) {
			return this.parseCall();
		} else {
			this.tokIndex++;
			return KDInterp.evalLiteral(tok);
		}
	}

	private static parseStringBlock(tok: Token<TokenKind>) {
		let text = tok.text.slice(1, -1);
		if (text.indexOf('\n') === -1) return text;

		let lines = listOf<string>(...text.split('\n'));
		if (lines[0].trim() === '') {
			lines = lines.slice(1);
		}

		let last = lines[lines.length - 1];
		if (last.trim() === '') {
			lines = lines.slice(0, lines.length - 1);
			// grab whitespace prefix and remove it from other lines if present
			let prefix = last;

			let trimmedLines = listOf<string>();

			for (const line of lines) {
				if (line.startsWith(prefix)) {
					trimmedLines.push(line.substring(prefix.length));
				} else {
					trimmedLines.push(line);
				}
			}

			lines = trimmedLines;
		}

		return lines.join('\n');
	}

	static evalLiteral(tok: Token<TokenKind>) {
		switch (tok.kind) {
			case TokenKind.Number: {
				let text = tok.text.replace(/_/g, '');
				return text.indexOf('.') != -1 ? parseFloat(text) : parseInt(text);
			}
			case TokenKind.HexNumber: {
				return parseInt(tok.text.slice(2), 16);
			}
			case TokenKind.String: {
				return tok.text.slice(1, -1);
			}
			case TokenKind.StringBlock: {
				return KDInterp.parseStringBlock(tok);
			}
			case TokenKind.Bool: {
				return tok.text === 'true';
			}
			case TokenKind.ID: {
				return tok.text;
			} // bare string
			case TokenKind.nil: {
				return null;
			}
			case TokenKind.URL: {
				return new URL(tok.text);
			}
			case TokenKind.Quantity: {
				return Quantity.parse(tok.text);
			}
			case TokenKind.Date: {
				return KDate.parse(tok.text.replace('/', '-'));
			}
			default: {
				throw new ParseError(
					'Parse Error: Unknown token type for literal: ' + TokenKind[tok.kind],
					tok.pos.columnBegin,
					tok.pos.rowBegin
				);
			}
		}
	}
}
