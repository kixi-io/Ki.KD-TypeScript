if (Number.prototype !== undefined) {
	Number.prototype.compareTo = function (val: number): number {
    if (this < val) return -1;
		if (this === val) return 0;
		if (this > val) return 1;

		return 0;
	};

  Number.prototype.equals = function (val: number): boolean {
		return this === +val;
	};
}
