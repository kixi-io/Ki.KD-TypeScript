interface String {
	isEmpty(): boolean;
	isBlank(): boolean;
	padEnd(places: number, char: string, trim: boolean): string;
}

interface Array<T> {
	random(): T;
	equals(obj: T): boolean;
}
