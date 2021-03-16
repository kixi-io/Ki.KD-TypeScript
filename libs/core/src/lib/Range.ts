import { ParseError } from './ParseError';
import { Quantity } from './_internal';
import './String+';
import './Number+';
const underscore = '_';
const closed = '<';

export type RangeValue = number | string | Quantity;

export class Range {
	left: RangeValue;
	right: RangeValue;
	isOpenLeft: boolean;
	isOpenRight: boolean;

	constructor(
		left: RangeValue = underscore,
		right: RangeValue = underscore,
		openLeft: boolean = true,
		openRight: boolean = true
	) {
		this.checkValues(left, right);
		this.left = left === underscore ? -Infinity : left;
		this.right = right === underscore ? Infinity : right;

		this.isOpenLeft = openLeft;
		this.isOpenRight = openRight;
	}

	get min() {
		return (this.left as any).compareTo(this.right) <= 0 ? this.left : this.right;
	}

	get max() {
		return (this.left as any).compareTo(this.right) > 0 ? this.left : this.right;
	}

	get isReversed() {
		return (this.left as any).compareTo(this.right) > 0;
	}

	public contains(element: RangeValue) {
		let inMin = false;
		let inMax = false;

    if (this.min === -Infinity) {
      inMin = true;
    } else {
      const compareResMin = (this.min as any).compareTo(element);
      inMin = this.isReversed && this.isOpenRight || this.isOpenLeft ? compareResMin <= 0 : compareResMin < 0;
    }

		if (!inMin) return false;

    if (this.max === Infinity) {
      inMax = true;
    } else {
    const compareResMax = (this.max as any).compareTo(element);
      inMax = this.isReversed && this.isOpenLeft || this.isOpenRight ? compareResMax >= 0 : compareResMax > 0;
    }

		return inMax;
	}

	static parse(text: string): Range {
		if (text.isBlank()) throw new ParseError('Range requires a value. Got: ""');

		const [leftOperatorString, rightOperatorString] = text.split('..');

		const leftOperator = this.parseOperator(leftOperatorString, false);
		const rightOperator = this.parseOperator(rightOperatorString, true);

		try {
			leftOperator.value = Quantity.parse(leftOperator.value);
		} catch {} // object is not a quantity, we don't want to do anything

		try {
			rightOperator.value = Quantity.parse(rightOperator.value);
		} catch {} // object is not a quantity, we don't want to do anything

		return new Range(leftOperator.value, rightOperator.value, leftOperator.isOpen, rightOperator.isOpen);
	}

	equals(obj: Range): boolean {
		return (
			obj !== null &&
			(obj.left as any).equals(this.left) &&
      (obj.right as any).equals(this.right) &&
			obj.isOpenRight === this.isOpenRight &&
			obj.isOpenLeft === this.isOpenLeft
		);
	}

	toString = () =>
		`${this.left === -Infinity ? underscore : this.left.toString()}${this.isOpenLeft ? '' : closed}..${
			this.isOpenRight ? '' : closed
		}${this.right === Infinity ? underscore : this.right.toString()}`;

	private static parseOperator(operator: string, right: boolean) {
		const res = operator.split(closed);
		const [value, openChar] = right ? res.reverse() : res;

		return { value: value as any, isOpen: !openChar && typeof openChar !== 'string' };
	}

	private checkValues(left: RangeValue, right: RangeValue) {
		if (left === underscore && right === underscore) {
			throw new ParseError('Range requires at least one value.');
		}
	}
}
