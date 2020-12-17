import { rand } from './KMath';
import { KD } from './_internal';

export class List<T> extends Array<T> {
	random = (): T => this[rand(0, this.length - 1)];
	remove = (obj: T) =>
		this.splice(
			this.findIndex(e => e === obj),
			1
		);
	removeAt = (index: number) => this.splice(index, 1);
	add = (obj: T) => this.push(obj);
	addAll(...objs: Array<T>) {
		for (const obj of objs) {
			this.push(obj);
		}
	}
	isEmpty = () => this.length === 0;
	slice = (start?: number, end?: number): List<T> => new List<T>(...super.slice(start, end));
	contains(obj: T): boolean {
		return this.indexOf(obj) !== -1;
	}

	shuffle(): List<T> {
		for (let i = this.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this[i], this[j]] = [this[j], this[i]];
		}
		return this;
	}

	/**
	 * Gets the value at the index or `null` if its out of range.
	 * @param index
	 */
	safeGet(index: number): T | null {
		if (index >= this.length) {
			return null;
		}

		return this[index];
	}

	equals(list: any): boolean {
		console.log(`List.equals(${this}, ${list})`);

		if (list == null || this.length != list.length) return false;

		for (let i = 0; i < this.length; i++) {
			if (!KD.equals(this[i], list[i])) return false;
		}
		return true;
	}
}

export const listOf = <T>(...objs: any) => new List<T>(...objs);
