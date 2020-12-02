import {KDInterp} from '../source/KDInterp'
import {QA} from './QA'
import {KD} from "../source/KD";
import {log} from "../source/Log";

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

qa.section("String with \\ continuation")
qa.equals("continue 1 2 3", interp.eval(`continue 1 2 \
    3
    `).toString())

qa.section("Tags with children")
let tag = interp.eval(`
    Foo 1 2 
    Bar 3 4 /* foo */ greet="hi" # foo
    
    fancy 5 6 url=https://www.nist.gov yellow=0xff00ff {
    
        child1 "hi"
        child2 "foo" favcolors=[red, green] {
            Hi test=true
            
        }
    }
    `)
qa.equals(`root {
  Foo 1 2
  Bar 3 4 greet="hi"
  fancy 5 6 url=https://www.nist.gov/ yellow=16711935 {
    child1 "hi"
    child2 "foo" favcolors=["red", "green"] {
      Hi test=true
    }
  }
}`, tag.toString())

log(tag.getChild("fancy"))

qa.section("Lists")

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

qa.section("Anonymous Tags")
qa.equals(`"Aloha"`, interp.eval(`"Aloha"`).toString())
qa.equals(`"Aloha" 808 https://lemur.duke.edu/`, interp.eval(`"Aloha" 808 https://lemur.duke.edu`).toString())

qa.summarize()