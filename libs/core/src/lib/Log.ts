/**
 * These logging utility methods are used in lieu of console .log, .warn, .error and .info to provide consistent behavior
 * on all platforms. Many platforms do strange things with console.error.
 */

/**
 * Logs zero or more objects to the console. If no arguments are provided
 * a blank line is logged.
 */
export let log = (...objs: any) => out(console.log, '', ...objs);

/**
 * Sends zero or more objects to console.error. If no arguments are provided
 * a blank line is logged.
 */
export let error = (...objs: any) => out(console.log, '🟥 ', ...objs);

/**
 * Sends zero or more objects to console.error. If no arguments are provided
 * a blank line is logged.
 */
export let info = (...objs: any) => out(console.log, '🟩 ', ...objs);

/**
 * Sends zero or more objects to console.warn. If no arguments are provided
 * a blank line is logged.
 */
export let warn = (...objs: any) => out(console.log, '🟧 ', ...objs);

function out(writer: Function, prefix: string, ...objs: any) {
	var line;

	if (objs == null || objs.length === 0) {
		line = '';
	} else {
		line = prefix;

		let i = 0;
		for (const obj of objs) {
			line += stringify(obj);
			if (i < objs.length - 1) {
				line += ', ';
			}
			i++;
		}
	}

	writer(line);

	return line;
}

function stringify(obj: any): string {
	if (obj instanceof Array) return stringifyArray(obj);
	else return '' + obj;
}

function stringifyArray(list: Array<any>) {
	let text = '[';

	let index = 0;
	for (const obj of list) {
		if (obj instanceof Array) {
			text += stringifyArray(obj);
		} else {
			text += obj.toString();
		}
		if (index < list.length - 1) text += ', ';

		index++;
	}
	text += ']';

	return text;
}
