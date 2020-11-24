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