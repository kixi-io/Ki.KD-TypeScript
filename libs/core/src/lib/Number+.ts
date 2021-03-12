if (Number.prototype !== undefined) {
	Number.prototype.compareTo = function (val: number): number {
		return (this as number) - val;
	};

  Number.prototype.equals = function (val: number): boolean {
		return this === +val;
	};
}
