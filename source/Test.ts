import { log, listOf } from './KSL'
import { KDLexer } from './KDLexer'

class Greeter {
    static greet = (name: String) => log(`Hello ${name}`)
}

Greeter.greet("Keiko")
log("Hello")
log(listOf(1,2,3,4,5).shuffle())
KDLexer.tokens('23 "blerp fiddle" `one "two" three` 15 101')
KDLexer.tokens("\"fi\" `ho 'hum'` foe [true false]")
KDLexer.tokens(`
    fud_123
    "hi joe"
    "hi bill"
`)