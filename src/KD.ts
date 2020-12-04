
export class KD {
    static stringify(it) {
        if (it == null) {
            return "nil";
        }

        if (typeof it === 'string' || it instanceof String) {
            return '"' + it + '"';
        } else if(it instanceof Array) {
            return KD.stringifyArray(it)
        } else if(it instanceof Map) {
            return KD.stringifyMap(it)
        }

        return it.toString();
    }

    private static stringifyArray(list: Array<any>) {
        let text ="["

        let index = 0
        for(const obj of list) {
            text+=KD.stringify(obj)

            if(index<list.length-1)
                text+=", "

            index++
        }
        text+="]"

        return text
    }

    private static stringifyMap(map: Map<any, any>) {
        if(map.size==0)
            return "[=]"

        let text ="["

        let i = 0
        for (const [k, v] of map) {
            text += `${KD.stringify(k)}=${KD.stringify(v)}`
            if(i<map.size-1) {
                text +=", "
            }
            i++
        }

        text+="]"

        return text
    }
}