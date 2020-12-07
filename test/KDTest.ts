import {KDInterp} from '../src/KDInterp'
import {QA} from './QA'
import {KD} from "../src/KD";
import {log} from "../src/Log";
import {Quantity} from "../src/Quantity";
import {listOf} from "../src/List";
import {KDate} from "../src/KDate";

let interp = new KDInterp()
let qa = new QA("KD")

qa.section("Basic")
qa.equals(`foo 12 "bill" "hi" true false nil`, interp.eval("foo 12 bill `hi` true false nil").toString())
qa.equals(`foo:nugget 12000 "bill" "hi" true false nil`,
    interp.eval("foo:nugget 12_000 bill `hi` true false nil").toString())

qa.section("Comments")

qa.equals(`foo:nugget 12 name="john" horses=2 cool=true url=http://cnn.com/`,
    interp.eval(`foo:nugget 12 name=\`john\` horses= 2 cool = true url=http://cnn.com // comment`))
qa.equals(`foo:nugget 12 name="john" horses=2 cool=true url=http://cnn.com/`,
    interp.eval(`foo:nugget 12 name=\`john\` horses= 2 cool = true url=http://cnn.com # comment`))
qa.equals(`foo:nugget 12 horses=2 cool=true url=http://cnn.com/`,
    interp.eval("foo:nugget 12 /* name=\`john\` */ horses= 2 cool = true url=http://cnn.com"))
qa.equals(255, interp.eval("num 0xFF").value())

qa.section("String block")
qa.equals(" Foo\n Bar", interp.eval(`multiline \`
     Foo
     Bar
    \``).value())

qa.section("Anonymous Tags")
qa.equals("Hola", interp.eval(`"Hola"`).value())
qa.equals(listOf("Hola", "Alejandro"), interp.eval(`"Hola" "Alejandro"`).values)
qa.equals(listOf(interp.eval('"Bula"'), interp.eval('"Aloha"'), interp.eval('"Hola"')), interp.eval(`
    greetings {
        "Bula"
        "Aloha"
        "Hola"
    }
    `).children)

qa.section("String with \\ continuation")
qa.equals("continue 1 2 3", interp.eval(`continue 1 2 \
    3
    `).toString())

qa.section("Tags with children")
let tag = interp.eval(`
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
qa.equals(KDate.parse("2020/5/11"), interp.eval("2020/5/11").value())
// ISO version
qa.equals(KDate.parse("2020-5-11"), interp.eval("2020-5-11").value())

qa.section("Lists")

qa.equals(`[]`, KD.stringify(interp.eval("[]").value()))
qa.equals(`[1, 2, 3]`, KD.stringify(interp.eval("nums [1,2,3]").value()))
qa.equals(`[1, 2, 3]`, KD.stringify(interp.eval("nums [1 2 3]").value()))
qa.equals(`[1, 2, [3]]`, KD.stringify(interp.eval("nums [1,2,[3]]").value()))
qa.equals(`[1, 2, [3, 4]]`, KD.stringify(interp.eval("nums [1,2,[3,4]]").value()))
qa.equals(`[1, 2, [3, 4], 5]`, KD.stringify(interp.eval("nums [1,2,[3,4], 5]").value()))
qa.equals(`[[1, 2, [3, 4], 5, 6], "foo"]`, KD.stringify(interp.eval("nums [1,2,[3,4], 5, 6] foo").values))
qa.equals(`[[1, 2, [3, 4, [5, 6]], 7], "foo"]`,
    KD.stringify(interp.eval("nums [1,2,[3,4,[5, 6]], 7] foo").values))

qa.section("Lists w/ newline separated items")
qa.equals(`["fee", "fi", "foe", "fum"]`, KD.stringify(interp.eval(`words [
        fee
        fi
        foe
        fum
    ]`).value()))

qa.section("Maps")

qa.equals("[=]", KD.stringify(interp.eval("[=]").value()))
qa.equals(`["name"="Mika"]`, KD.stringify(interp.eval("user [name=`Mika`]").value()))
qa.equals(`[5="num"]`, KD.stringify(interp.eval("user [5=`num`]").value()))
qa.equals(`[[2, 3]="num"]`, KD.stringify(interp.eval("user [[2, 3]=`num`]").value()))

qa.section("Anonymous Tags")
qa.equals(`"Aloha"`, interp.eval(`"Aloha"`).toString())
qa.equals(`"Aloha" 808 https://lemur.duke.edu/`, interp.eval(`"Aloha" 808 https://lemur.duke.edu`).toString())

qa.section("Calls")
qa.equals("color()", "" + interp.eval("foo color()").value())
qa.equals("num(1)", "" + interp.eval("foo num(1)").value())
qa.equals("rgb(1, 2, 3)", "" + interp.eval("foo rgb(1, 2, 3)").value())
// no commas
qa.equals("rgb(1, 2, 3)", "" + interp.eval("foo rgb(1 2 3)").value())
qa.equals("rgb(1, 2, 3, a=1)", "" + interp.eval("foo rgb(1 2 3 a=1)").value())
// anonymous tag with Call value
qa.equals("rgb(1, 2, 3)", "" + interp.eval("rgb(1, 2, 3)").value())

qa.section("Quantities")

Quantity.registerUnits("vh", "px")
qa.equals(new Quantity(2, "vh"), Quantity.parse("2vh"))

qa.throws(() => {
    new Quantity(2, "")
}, "Empty unit")

qa.throws(() => {
    new Quantity(2, "eon")
}, "「eon」is not a registered unit.")

qa.doesntThrow(() => {
    new Quantity(2, "vh")
}, `new Quantity(2, "vh")`)
qa.equals(new Quantity(5, "px"), interp.eval("5px").value())

qa.summarize()