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
}
