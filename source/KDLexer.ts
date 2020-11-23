import { buildLexer } from './ts-parsec/index'
import { log } from './KSL'

enum TokenKind {
    Number,
    String,
    Bool,
    ID,
    Comma,
    LSquare,
    RSquare,
    LParen,
    RParen,
    LBracket,
    RBracket,
    Equals,
    Colon,
    Dot,
    Space,
    NL
}

export class KDLexer {
    static tokenizer = buildLexer([
        [true, /^\d+(\.\d+)?/g, TokenKind.Number],
        [true, /^"([^\\"]|\\")*"/g, TokenKind.String],
        [true, /^`([^\\`]|\\`)*`/g, TokenKind.String],
        [true, /^(true|false)/g, TokenKind.Bool],
        [true, /^[a-zA-Z_\.][\w\._]*/g, TokenKind.ID],
        [true, /^\,/g, TokenKind.Comma],
        [true, /^\[/g, TokenKind.LSquare],
        [true, /^\]/g, TokenKind.RSquare],
        [true, /^\(/g, TokenKind.LParen],
        [true, /^\)/g, TokenKind.RParen],
        [true, /^\{/g, TokenKind.LBracket],
        [true, /^\}/g, TokenKind.RBracket],
        [false, /^[\t\r ]+/g, TokenKind.Space],
        [true, /^[\n]+/g, TokenKind.NL]
    ]);

    static tokens(text:string) {
        let token = KDLexer.tokenizer.parse(text)
        log(`For line: ${text.trim()}`)

        while(true) {
            if(token.kind == TokenKind.NL) {
                log("(NL)")
            } else {
                log(`${token.text} (${TokenKind[token.kind]})`)
            }
            token = token.next;
            if(!token) break;
        }
    }
}