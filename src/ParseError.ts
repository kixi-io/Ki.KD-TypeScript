export class ParseError extends Error {

    line: number
    position: number

    constructor(message: string, position= -1, line= -1,) {
        super(ParseError.formatMessage(message, line, position));
        this.line = line
        this.position = position
        Object.setPrototypeOf(this, ParseError.prototype);
    }

    static formatMessage(message: string, line: number, position: number) {
        if(line===-1 && position===-1) {
            return message
        } else if(line===-1) {
            return `Parse error at position ${position}, ${message}`
        }
        return `Parse error at line ${line} position ${position}, ${message}`
    }
}