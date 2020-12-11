import {buildLexer, Token} from './Lexer'
import {listOf} from './List'
import {ParseError} from "./ParseError";

export enum TokenKind {
    Number,
    HexNumber,
    String,
    StringBlock,
    Bool,
    ID,
    nil,
    URL,
    Quantity,
    Date,

    LSquare, RSquare,
    LParen, RParen,
    LBrace, RBrace,
    Comma,
    Equals,
    Colon,
    Dot,

    Space,
    NL,
    LineComment,
    BlockComment,
    Semicolon,
    Backslash
}

export class KDLexer {

    tokens = listOf<Token<TokenKind>>();

    static tokenizer = buildLexer<TokenKind>([
        [true, /^0x[0-9A-Fa-f]+/g, TokenKind.HexNumber],
        [true, /^((\d+-\d+-\d+)|(\d+\/\d+\/\d+))/g, TokenKind.Date],
        [true, /^-?((\d[\d_]*(\.\d+)?)|(\.\d+))/g, TokenKind.Number],
        [true, /^"([^\\"]|\\")*"/g, TokenKind.String],
        [true, /^`([^\\`]|\\`)*`/g, TokenKind.StringBlock],
        [true, /^(true|false)/g, TokenKind.Bool],
        [true, /^nil/g, TokenKind.nil],

        // TODO: Support unicode letters, numbers and emoji
        [true, /^[a-zA-Z_][\w._-]*/g, TokenKind.ID],

        [false, /^[\t\r ]+/g, TokenKind.Space],

        [true, /^[\n]+/g, TokenKind.NL],
        [true, /^=/g, TokenKind.Equals],

        [true, /^{/g, TokenKind.LBrace],
        [true, /^}/g, TokenKind.RBrace],
        [false, /^,/g, TokenKind.Comma],
        [true, /^:/g, TokenKind.Colon],
        [true, /^;/g, TokenKind.Semicolon],
        [true, /^\[/g, TokenKind.LSquare],
        [true, /^]/g, TokenKind.RSquare],
        [true, /^\(/g, TokenKind.LParen],
        [true, /^\)/g, TokenKind.RParen],
        [true, /^\\/g, TokenKind.Backslash],

        // URLs - We put this last because it's expensive
        [true,
            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi,
            TokenKind.URL],
        [true, /^(-?((\d[\d_]*(\.\d+)?)|(\.\d+))([-a-zA-Z][-a-zA-Z0-9]|%)*)/g, TokenKind.Quantity],
        // Comments
        // [false, /^(#|\/\/).*?$/g, TokenKind.LineComment],
        [false, /^(#|\/\/).*/g, TokenKind.LineComment],
        // TODO: Allow nested block comments
        [false, /^\/\*(.|[\r\n])*?\*\//g, TokenKind.BlockComment]
    ]);

    constructor(text: string) {
        try {
            let token = KDLexer.tokenizer.parse(text)
            if(!token) {
                // empty line
                return
            }

            while(true) {
                // console.log(`${token.text} (${TokenKind[token.kind]})`)
                this.tokens.add(token)

                token = token.next
                if(!token) break
            }
        } catch(e) {
            throw new ParseError(e.message ?? "Error")
        }
    }
}