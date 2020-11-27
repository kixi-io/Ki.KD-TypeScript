
export class KD {
    static stringify(it) {
        if (it == null) {
            return "nil";
        }

        if (typeof it === 'string' || it instanceof String) {
            return '"' + it + '"';
        } else if(it instanceof Array) {
            return KD.stringifyArray(it)
        }

        return it.toString();
    }

    private static stringifyArray(list: Array<any>) {
        let text ="["

        let index = 0
        for(const obj of list) {
            if(obj instanceof Array) {
                text+=KD.stringifyArray(obj)
            } else {
                text+=KD.stringify(obj)
            }
            if(index<list.length-1)
                text+=", "

            index++
        }
        text+="]"

        return text
    }
}