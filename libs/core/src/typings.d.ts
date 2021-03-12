interface String {
	isEmpty(): boolean;
	isBlank(): boolean;
	padEnd(places: number, char: string, trim: boolean): string;
	compareTo(val: string): number;
	equals(val: string): boolean;
}

interface Array<T> {
	random(): T;
	equals(obj: T): boolean;
}

interface Number {
	compareTo(val: number): number;
	equals(val: number): boolean;
}
