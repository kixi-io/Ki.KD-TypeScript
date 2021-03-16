if (!String.prototype.isEmpty) {
	// eslint-disable-next-line no-extend-native
	String.prototype.isEmpty = function (): boolean {
		return this.length === 0;
	};

	// eslint-disable-next-line no-extend-native
	String.prototype.isBlank = function (): boolean {
		return this.trim().length === 0;
	};

	// eslint-disable-next-line no-extend-native
	String.prototype.padEnd = function (places: number, char = ' ', trim = false): string {
		if (this.length >= places) return trim ? this.substring(0, places) : '' + this;

		return this + char.repeat(places - this.length);
	};

	String.prototype.compareTo = function (val: string): number {
		if (this < val) return -1;
		if (this === val) return 0;
		if (this > val) return 1;

		return 0;
	};

  String.prototype.equals = function (val: string): boolean {
		return this === val.toString();
	};
}
