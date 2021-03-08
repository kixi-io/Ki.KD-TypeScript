import { ParseError } from './ParseError';

export class Range {
	min: number | string;
	max: number | string;
	isOpenLeft: boolean;
	isOpenRight: boolean;

	constructor(left: number | string = '_', right: number | string = '_', openLeft: boolean = true, openRight: boolean = true) {
		this.checkValues(left, right);
		const leftValue = left === '_' ? -Infinity : +left;
		const rightValue = right === '_' ? Infinity : +right;

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

	equals(obj: Range) : boolean {
	  return obj !== null && obj.min === this.min && obj.max === this.max && obj.isOpenRight === this.isOpenRight && obj.isOpenLeft === this.isOpenLeft;
	}

	toString = () => `${this.min === -Infinity ? '_' : this.min}${this.isOpenLeft ? '' : '<'}..${this.isOpenRight ? '' : '<'}${this.max === Infinity ? '_' : this.max}`;

	private static parseOperator(operator: string, right: boolean) {
		const res = operator.split('<');
    const [value, openChar] = right ? res.reverse() : res;

		return { value, isOpen: !openChar && typeof openChar !== 'string' };
	}

	private checkValues(left: number | string, right: number | string) {
		if (left === '_' && right === '_') {
			throw new ParseError('Range requires at least one value.');
		}
	}
}
