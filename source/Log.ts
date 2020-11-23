/**
 * Logs zero or more objects to the console. If no arguments are provided
 * a blank line is logged.
 */
export var log = (...objs) => out(console.log, objs);

/**
 * Sends zero or more objects to console.error. If no arguments are provided
 * the output is an empty String.
 */
export var error = (...objs) => out(console.error, objs)

/**
 * Sends zero or more objects to console.warn. If no arguments are provided
 * the output is an empty String.
 */
export var warn = (...objs: any) => out(console.warn, objs)

function out(writer: any, ...objs: any) {

    var line;

    if(objs==null || objs.length == 0) {
        line = ""
    } else {
        line = objs.join(", ")
    }

    writer(line)

    return line
}