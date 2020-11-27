/**
 * Logs zero or more objects to the console. If no arguments are provided
 * a blank line is logged.
 */
export var log = (...objs) => out(console.log, ...objs);

/**
 * Sends zero or more objects to console.error. If no arguments are provided
 * the output is an empty String.
 */
export var error = (...objs) => out(console.error, ...objs)

/**
 * Sends zero or more objects to console.warn. If no arguments are provided
 * the output is an empty String.
 */
export var warn = (...objs) => out(console.warn, ...objs)

function out(writer, ...objs) {

    var line;

    if(objs==null || objs.length == 0) {
        line = ""
    } else {
        line = ""

        let i = 0
        for(const obj of objs) {
            line+=stringify(obj)
            if(i<objs.length-1) {
                line+=", "
            }
            i++
        }
    }

    writer(line)

    return line
}

function stringify(obj): string {
    if(obj instanceof Array)
        return stringifyArray(obj)
    else
        return "" + obj
}

function stringifyArray(list: Array<any>) {
    let text ="["

    let index = 0
    for(const obj of list) {
        if(obj instanceof Array) {
            text+=stringifyArray(obj)
        } else {
            text+=obj.toString()
        }
        if(index<list.length-1)
            text+=", "

        index++
    }
    text+="]"

    return text
}