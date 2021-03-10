import { ParseError } from './ParseError';

const underscore = '_';
const closed = '<';

export class Range {
	min: number | string;
	max: number | string;
	isOpenLeft: boolean;
	isOpenRight: boolean;
	isReversed: boolean;

	constructor(
		left: number | string = underscore,
		right: number | string = underscore,
		openLeft: boolean = true,
		openRight: boolean = true
	) {
		this.checkValues(left, right);
		const leftValue = left === underscore ? -Infinity : +left;
		const rightValue = right === underscore ? Infinity : +right;

		this.isReversed = leftValue > rightValue;

		if (leftValue > rightValue) {
			this.min = rightValue;
			this.max = leftValue;
			this.isOpenLeft = openRight;
			this.isOpenRight = openLeft;
		} else {
			this.min = leftValue;
			this.max = rightValue;
			this.isOpenLeft = openLeft;
			this.isOpenRight = openRight;
		}
	}

	public contains(element: number) {
		const inLeft = this.isOpenLeft ? element >= this.min : element > this.min;
		const inRight = this.isOpenRight ? element <= this.max : element < this.max;

		return inLeft && inRight;
	}

	static parse(text: String): Range {
		if (text.isBlank()) throw new ParseError('Range requires a value. Got: ""');

		const [leftOperatorString, rightOperatorString] = text.split('..');

		const leftOperator = this.parseOperator(leftOperatorString, false);
		const rightOperator = this.parseOperator(rightOperatorString, true);

		return new Range(leftOperator.value, rightOperator.value, leftOperator.isOpen, rightOperator.isOpen);
	}

	equals(obj: Range): boolean {
		return (
			obj !== null &&
			obj.min === this.min &&
			obj.max === this.max &&
			obj.isOpenRight === this.isOpenRight &&
			obj.isOpenLeft === this.isOpenLeft
		);
	}

	toString = () =>
		`${this.min === -Infinity ? underscore : this.min}${this.isOpenLeft ? '' : closed}..${this.isOpenRight ? '' : closed}${
			this.max === Infinity ? underscore : this.max
		}`;

	private static parseOperator(operator: string, right: boolean) {
		const res = operator.split(closed);
		const [value, openChar] = right ? res.reverse() : res;

		return { value, isOpen: !openChar && typeof openChar !== 'string' };
	}

	private checkValues(left: number | string, right: number | string) {
		if (left === underscore && right === underscore) {
			throw new ParseError('Range requires at least one value.');
		}
	}
}
