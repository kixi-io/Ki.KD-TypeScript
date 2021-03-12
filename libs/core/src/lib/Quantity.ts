/**
 * This is a lightweight version of the [Ki Quantity](https://github.com/kixi-io/Ki.Docs/wiki/Ki-Types#Quantity)
 * type. We need to change the unit property to a type parameter.
 */
import { ParseError } from './ParseError';
import { listOf } from './_internal';

export class Quantity {
	value: number;
	unit: string;

	private static units = listOf<string>();
	private static digits = listOf('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.');

	constructor(value: number, unit: string) {
		if (unit.isEmpty()) {
			throw new ParseError('Quantity requires a unit.');
		}

		this.value = value;
		Quantity.checkUnit(unit);
		this.unit = unit;
	}

	static checkUnit(unit: string) {
		if (!Quantity.units.contains(unit))
			throw new ParseError(`${unit} is not a registered unit. Registered: ${Quantity.units}`);
	}

	static registerUnits(...units: string[]) {
		this.units.addAll(...units);
	}

	static parse(text: String): Quantity {
		if (text.isBlank()) throw new ParseError('Quantity requires a value and a unit. Got: ""');

		if (!Quantity.digits.contains(text[0]) && text[0] !== '-') {
			throw new ParseError(`Quantity must start with a digit, '.' or '-'. Got '${text[0]}'`);
		}

		let digitsEnd = 0;
		text = text.replace('_', '');

		if (text[0] === '-' || text[0] === '.') digitsEnd++;

		for (; ; digitsEnd < text.length) {
			if (this.digits.indexOf(text[digitsEnd]) == -1) {
				break;
			}
			digitsEnd++;
		}

		return new Quantity(+text.substring(0, digitsEnd), text.substring(digitsEnd));
	}

	equals(obj: Quantity): boolean {
		return obj != null && obj.value === this.value && obj.unit === this.unit;
	}

	/** Compares one Quantity with another
	 * @param {Quantity} obj - The quantity to compare against
	 * @returns {number} 0 if equal, < 0 if lower than, > 0 if greater than
	 */
	compareTo(obj: Quantity): number {
		if (obj.unit !== this.unit) throw 'Quantities must have the same unit to be compared';
		return this.value - obj.value;
	}

	toString = () => `${this.value}${this.unit}`;
}
