/**
 * Gets a random number fromNum to toNum, inclusive.
 */
export function rand(fromNum: number, toNum: number) {
	return fromNum + Math.floor(Math.random() * (toNum - fromNum + 1));
}
