
export class KD {
    static stringify(it) {
        if (it == null) {
            return "nil";
        }

        if (typeof it === 'string' || it instanceof String) {
            return `"` + it + `"`;
        }

        return it.toString();
    }
}