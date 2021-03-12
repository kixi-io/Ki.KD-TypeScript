if (Number.prototype !== undefined) {
	Number.prototype.compareTo = function (val: number): number {
		return (this as number) - val;
	};
}
