import { KDInterp } from './_internal';

export class KD {
	private static interp: KDInterp;

	static eval = (text: string) => (KD.interp ? KD.interp.eval(text) : (KD.interp = new KDInterp()).eval(text));

	// TODO: This isn't very efficient.
	static value = (text: string) => KD.eval(`tag ${text}`).value();

	static stringify(it: any): string {
		if (it == null) {
			return 'nil';
		}

		if (typeof it === 'string' || it instanceof String) {
			return '"' + it + '"';
		} else if (it instanceof Array) {
			return KD.stringifyArray(it);
		} else if (it instanceof Map) {
			return KD.stringifyMap(it);
		}

		return it.toString();
	}

	private static stringifyArray(list: Array<any>): string {
		let text = '[';

		let index = 0;
		for (const obj of list) {
			text += KD.stringify(obj);

			if (index < list.length - 1) text += ', ';

			index++;
		}
		text += ']';

		return text;
	}

	private static stringifyMap(map: Map<any, any>): string {
		if (map.size === 0) return '[=]';

		let text = '[';

		let i = 0;
		for (const [k, v] of map) {
			text += `${KD.stringify(k)}=${KD.stringify(v)}`;
			if (i < map.size - 1) {
				text += ', ';
			}
			i++;
		}

		text += ']';

		return text;
	}

	static equals(first: any, second: any): boolean {
		if (first == null || second == null) {
			return second == null && first == null;
		}

		return first.equals === undefined ? second === first : first.equals(second);
	}
}
