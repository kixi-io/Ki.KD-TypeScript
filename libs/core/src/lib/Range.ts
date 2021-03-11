import { ParseError } from './ParseError';

const underscore = '_';
const closed = '<';

export class Range {
  left: number;
  right: number;
	isOpenLeft: boolean;
	isOpenRight: boolean;

	constructor(
		left: number | string,
		right: number | string = underscore,
		openLeft: boolean = true,
		openRight: boolean = true
	) {
		this.checkValues(left, right);
		this.left = left === underscore ? -Infinity : +left;
		this.right = right === underscore ? Infinity : +right;

    this.isOpenLeft = openLeft;
    this.isOpenRight = openRight;
	}

  get min() {
    return Math.min(this.left, this.right);
  }

  get max() {
    return Math.max(this.left, this.right);
  }

  get isReversed() {
    return this.left > this.max;
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
			obj.left === this.left &&
			obj.right === this.right &&
			obj.isOpenRight === this.isOpenRight &&
			obj.isOpenLeft === this.isOpenLeft
		);
	}

	toString = () =>
		`${this.left === -Infinity ? underscore : this.left}${this.isOpenLeft ? '' : closed}..${this.isOpenRight ? '' : closed}${
			this.right === Infinity ? underscore : this.right
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
