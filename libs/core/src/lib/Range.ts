import { ParseError } from './ParseError';
import { Quantity } from './_internal';
import './String+';
import './Number+';
const underscore = '_';
const closed = '<';

type RangeValue = number | string | Quantity;

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
		this.left = left === underscore ? -Infinity : +left;
		this.right = right === underscore ? Infinity : +right;

    this.isOpenLeft = openLeft;
    this.isOpenRight = openRight;
	}

  get min() {
    // try {
    //   if ((this.left as Quantity).compareTo(this.right as Quantity) <= 0)
    //     return this.left;
    //   else
    //     return this.right;
    // } catch {}
    // return Math.min(this.left as number, this.right as number);
    return (this.left as any).compareTo(this.right) <= 0 ? this.left : this.right;
  }

  get max() {
    // try {
    //   if ((this.left as Quantity).compareTo(this.right as Quantity) > 0)
    //     return this.left;
    //   else
    //     return this.right;
    // } catch {}
    // return Math.max(this.left as number, this.right as number);

    return (this.left as any).compareTo(this.right) > 0 ? this.left : this.right;
  }

  get isReversed() {
    return (this.left as any).compareTo(this.right) > 0;
  }

	public contains(element: RangeValue) {
    let inLeft = false;
    let inRight = false;

    // try {
      const compareResMin = (this.min as any).compareTo(element);
      inLeft =  this.isOpenLeft ? compareResMin <= 0 : compareResMin < 0;

      if (!inLeft) return false;

      const compareResMax = (this.max as any).compareTo(element);
      inRight =  this.isOpenRight ? compareResMax >= 0 : compareResMax > 0;

      return inRight;
    // } catch {
    //   inLeft = this.isOpenLeft ? element >= this.min : element > this.min;
    //   inRight = this.isOpenRight ? element <= this.max : element < this.max;
    //   return inLeft && inRight;
    // }

	}

	static parse(text: string): Range {
		if (text.isBlank()) throw new ParseError('Range requires a value. Got: ""');

		const [leftOperatorString, rightOperatorString] = text.split('..');

		const leftOperator = this.parseOperator(leftOperatorString, false);
		const rightOperator = this.parseOperator(rightOperatorString, true);

    try {
      leftOperator.value = Quantity.parse(leftOperator.value);
      rightOperator.value = Quantity.parse(rightOperator.value);
    } catch { } // object is not a quantity

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

		return { value: value as any, isOpen: !openChar && typeof openChar !== 'string' };
	}

	private checkValues(left: RangeValue, right: RangeValue) {
		if (left === underscore && right === underscore) {
			throw new ParseError('Range requires at least one value.');
		}
	}
}
