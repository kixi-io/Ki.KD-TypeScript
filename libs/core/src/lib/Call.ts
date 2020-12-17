import './String+';
import { KD, listOf } from './_internal';

export class Call {
	name: string;

	values = listOf();
	attributes = new Map<string, any>();

	constructor(name = '') {
		this.name = name;
	}

	setAttribute(key: string, value: any) {
		this.attributes.set(key, value);
	}

	getAttribute(key: string): any {
		return this.attributes.get(key);
	}

	value = () => this.values[0];

	equals(call: Call): boolean {
		return call != null && call.toString() === this.toString();
	}

	toString = () => {
		let text = this.name + '(';

		if (this.values != null && !this.values.isEmpty()) {
			let i = 0;
			for (const it of this.values) {
				text += KD.stringify(it);
				if (i < this.values.length - 1) {
					text += ', ';
				}
				i++;
			}

			if (this.attributes.size !== 0) {
				text += ', ';
			}
		}

		if (this.attributes != null && this.attributes.size > 0) {
			let i = 0;
			for (const [k, v] of this.attributes) {
				text += `${k}=${KD.stringify(v)}`;
				if (i < this.attributes.size - 1) {
					text += ' ';
				}
				i++;
			}
		}

		return text + ')';
	};
}
