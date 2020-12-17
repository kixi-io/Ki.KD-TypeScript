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
		if (!value || !unit || unit.isEmpty()) {
			throw new ParseError('Quantity requires a value and a unit.');
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
		if (text[0] === '-' || text[0] === '.') digitsEnd++;

		for (; ; digitsEnd < text.length) {
			if (this.digits.indexOf(text[digitsEnd]) == -1) {
				break;
			}
			digitsEnd++;
		}

		return new Quantity(+text.substring(0, digitsEnd).replace('_', ''), text.substring(digitsEnd));
	}

	equals(obj: Quantity): boolean {
		return obj != null && obj.value === this.value && obj.unit === this.unit;
	}

	toString = () => `${this.value}${this.unit}`;
}
