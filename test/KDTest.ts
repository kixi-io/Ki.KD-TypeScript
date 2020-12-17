import {QA} from './QA'
import {KD, KDInterp, listOf, log} from "../src";
import {Quantity} from "../src/Quantity";
import {KDate} from "../src/KDate";
import {KDLexer, TokenKind} from "../src/KDLexer";

let qa = new QA("KD")

qa.section("Numbers")
qa.equals(5, KD.value("5"))
qa.equals(-5, KD.value("-5"))
qa.equals(5.5, KD.value("5.5"))
qa.equals(.5, KD.value(".5"))
qa.equals(-.5, KD.value("-.5"))

qa.section("Basic")
qa.equals(`foo 12 "bill" "hi" true false nil`, KD.eval("foo 12 bill `hi` true false nil").toString())
qa.equals(`foo:nugget 12000 "bill" "hi" true false nil`,
    KD.eval("foo:nugget 12_000 bill `hi` true false nil").toString())
qa.equals(255, KD.value("0xFF"))

qa.section("Comments")

qa.equals(`foo:nugget 12 name="john" horses=2 cool=true url=http://cnn.com/`,
    KD.eval(`foo:nugget 12 name=\`john\` horses= 2 cool = true url=http://cnn.com // comment`).toString())
qa.equals(`foo:nugget 12 name="john" horses=2 cool=true url=http://cnn.com/`,
    KD.eval(`foo:nugget 12 name=\`john\` horses= 2 cool = true url=http://cnn.com # comment`).toString())
qa.equals(`foo:nugget 12 horses=2 cool=true url=http://cnn.com/`,
    KD.eval("foo:nugget 12 /* name=\`john\` */ horses= 2 cool = true url=http://cnn.com").toString())

qa.section("String block")
qa.equals(" Foo\n Bar", KD.eval(`multiline \`
     Foo
     Bar
    \``).value())

qa.section("Anonymous Tags")
qa.equals("Hola", KD.eval(`"Hola"`).value())
qa.equals(listOf("Hola", "Alejandro"), KD.eval(`"Hola" "Alejandro"`).values)
qa.equals(listOf(KD.eval('"Bula"'), KD.eval('"Aloha"'), KD.eval('"Hola"')), KD.eval(`
    greetings {
        "Bula"
        "Aloha"
        "Hola"
    }
    `).children)

qa.section("String with \\ continuation")
qa.equals("continue 1 2 3", KD.eval(`continue 1 2 \
    3
    `).toString())

qa.section("Tags with children")
let tag = KD.eval(`
    Foo 1 2 
    Bar 3 4 /* foo */ greet="hi" # foo
    
    fancy 5 6 url=https://www.nist.gov yellow=0xff00ff {
    
        child1 "hi" { "anon child" }
        child2 "foo" favcolors=[red, green] {
            Hi test=true
            
        }
    }
    `)
qa.equals(`root {
  Foo 1 2
  Bar 3 4 greet="hi"
  fancy 5 6 url=https://www.nist.gov/ yellow=16711935 {
    child1 "hi" {
      "anon child"
    }
    child2 "foo" favcolors=["red", "green"] {
      Hi test=true
    }
  }
}`, tag.toString())

log(tag.getChild("fancy"))

qa.section("Dates")
qa.equals(KDate.parse("2020/5/11"), KD.value("2020/5/11"))
// ISO version
qa.equals(KDate.parse("2024-05-11"), KD.value("2024-05-11"))

qa.section("Lists")

qa.equals(`[]`, KD.stringify(KD.eval("[]").value()))
qa.equals(`[1, 2, 3]`, KD.stringify(KD.value("[1,2,3]")))
qa.equals(`[1, 2, 3]`, KD.stringify(KD.value("[1 2 3]")))
qa.equals(`[1, 2, [3]]`, KD.stringify(KD.value("[1,2,[3]]")))
qa.equals(`[1, 2, [3, 4]]`, KD.stringify(KD.value("[1,2,[3,4]]")))
qa.equals(`[1, 2, [3, 4], 5]`, KD.stringify(KD.value("[1,2,[3,4], 5]")))
qa.equals(`[[1, 2, [3, 4], 5, 6], "foo"]`, KD.stringify(KD.eval("[1,2,[3,4], 5, 6] foo").values))
qa.equals(`[[1, 2, [3, 4, [5, 6]], 7], "foo"]`,
    KD.stringify(KD.eval("nums [1,2,[3,4,[5, 6]], 7] foo").values))

qa.section("Lists w/ newline separated items")
qa.equals(`["fee", "fi", "foe", "fum"]`, KD.stringify(KD.value(`[
        fee
        fi
        foe
        fum
    ]`)))

qa.section("Maps")

qa.equals("[=]", KD.stringify(KD.value("[=]")))
qa.equals(`["name"="Mika"]`, KD.stringify(KD.value("[name=`Mika`]")))
qa.equals(`[5="num"]`, KD.stringify(KD.value("[5=`num`]")))
qa.equals(`[[2, 3]="num"]`, KD.stringify(KD.value("[[2, 3]=`num`]")))

qa.section("Anonymous Tags")
qa.equals(`"Aloha"`, KD.eval(`"Aloha"`).toString())
qa.equals(`"Aloha" 808 https://lemur.duke.edu/`, KD.eval(`"Aloha" 808 https://lemur.duke.edu`).toString())

qa.section("Calls")
qa.equals("color()", "" + KD.eval("color()").value())
qa.equals("num(1)", "" + KD.eval("num(1)").value())
qa.equals("rgb(1, 2, 3)", "" + KD.value(" rgb(1, 2, 3)"))
// no commas
qa.equals("rgb(1, 2, 3)", "" + KD.value("rgb(1 2 3)"))
qa.equals("rgb(1, 2, 3, a=1)", "" + KD.value("rgb(1 2 3 a=1)"))
// anonymous tag with Call value
qa.equals("rgb(1, 2, 3)", "" + KD.value("rgb(1, 2, 3)"))

qa.section("Quantities")

Quantity.registerUnits("vh", "vw", "em", "rem", "px", "%")
let toks = new KDLexer("1.5vw .2px").tokens
log("Quant tok test.", toks)
log(TokenKind[toks[0].kind] + " " + TokenKind[toks[1].kind])

qa.equals(new Quantity(2, "vh"), Quantity.parse("2vh"))
qa.equals(new Quantity(-2, "px"), Quantity.parse("-2px"))
qa.equals(new Quantity(.5, "vw"), Quantity.parse(".5vw"))
qa.equals(new Quantity(-.5, "vw"), Quantity.parse("-.5vw"))
qa.equals(new Quantity(1.5, "vw"), Quantity.parse("1.5vw"))
qa.equals(new Quantity(1.5, "vw"), KD.value("1.5vw"))
qa.equals(new Quantity(25, "%"), KD.value("25%"))

qa.equals(new Quantity(23, "rem"), KD.eval("foo 23rem").value())

qa.throws(() => {
    new Quantity(2, "")
}, "Empty unit")

qa.throws(() => {
    new Quantity(2, "eon")
}, "「eon」is not a registered unit.")

qa.doesntThrow(() => {
    new Quantity(2, "vh")
}, `new Quantity(2, "vh")`)
qa.equals(new Quantity(5, "px"), KD.value("5px"))

qa.summarize()