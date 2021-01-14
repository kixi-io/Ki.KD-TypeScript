import { ParseError } from './ParseError';
import './String+';

/**
 * A simple (KTS Date)[https://github.com/kixi-io/Ki.Docs/wiki/Ki-Types#Date]
 *
 * This class supports the KD format (year/month/day) and the (ISO-8601)[https://en.wikipedia.org/wiki/ISO_8601]
 * standard (year-month-day).
 */
export class KDate {
	year: number;
	month: number;
	day: number;

	constructor(year: number, month: number, day: number) {
		this.year = year;
		this.month = month;
		this.day = day;
	}

	static parse(text: String = ''): KDate {
		if (text.isBlank()) throw new ParseError('Date formats are yyyy/mm/dd or yyyy-mm-dd. Got: ""');

		let comps = text.split(/[-\/]/);

		if (comps.length !== 3) {
			throw new ParseError(`Date formats are yyyy/mm/dd or yyyy-mm-dd. Got: ${text}`);
		}

		try {
			let year = +comps[0];
			let month = +comps[1];
			let day = +comps[2];

			return new KDate(year, month, day);
		} catch (e) {
			throw new ParseError(`Date formats are yyyy/mm/dd or yyyy-mm-dd. Got: ${text}`);
		}
	}

	equals(date: KDate): boolean {
		return date != null && date.year === this.year && date.month === this.month && date.day === this.day;
	}

	toDate = () => new Date(this.toISOString());

	toISOString = () => `${this.year}-${this.month}-${this.day}`;

	toString = () => `${this.year}/${this.month}/${this.day}`;
}
