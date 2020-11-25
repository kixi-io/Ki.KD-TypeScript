import { log, listOf } from './KSL'
import { KDInterp } from './KDInterp'


let interp = new KDInterp()

let tag = interp.eval("foo 12 bill `hi` true false nil")
log("-- Tag ----")
log(tag)

tag = interp.eval("foo:nugget 12 bill `hi` true false nil")
log("-- Tag ----")
log(tag)

/*
tag = interp.eval("foo: 12 bill `hi` true false nil")
log("-- Tag ----")
log(tag)
*/

tag = interp.eval("foo:nugget 12 name=`john` horses= 2 cool = true url=http://cnn.com // comment")
log("-- Tag ----")
log(tag)

tag = interp.eval("foo:nugget 12 name=`john` horses= 2 cool = true url=http://cnn.com # comment")
log("-- Tag ----")
log(tag)

tag = interp.eval("foo:nugget 12 /* name=`john` */ horses= 2 cool = true url=http://cnn.com")
log("-- Tag ----")
log(tag)

tag = interp.eval("# foo:nugget 12 name=`john` horses= 2 cool = true url=http://cnn.com")
log("-- Tag ----")
log(tag)

log("Hex of 0xFF: " + interp.eval("num 0xFF").value())

log(interp.eval(`multiline \`
    Foo
    Bar
    \``).value())
log("---")

tag = interp.eval(`
    Foo 1 2 
    Bar 3 4 /* foo */ greet="hi" # foo
    
    fancy 5 6 url=https://www.nist.gov yellow=0xff00ff
    `);
log(tag)
