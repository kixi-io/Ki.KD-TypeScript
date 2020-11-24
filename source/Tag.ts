import { listOf, List } from './KSL'
import { KD } from './KD'

export class Tag {

    namespace = ""
    name = ""

    values = listOf()
    children = new List<Tag>()
    attributes = new Map<string, any>()

    constructor(name = "", namespace = "") {
        this.name = name
        this.namespace = namespace
    }

    getChild(name: string): Tag {
        for (const child of this.children) {
            if(child.name == name)
                return child
        }
        return null
    }

    value = () => this.values[0]

    toString = () => {
        let text = (this.namespace == "") ? this.name : `${this.namespace}:${this.name}`

        if(this.values != null && !this.values.isEmpty()) {
            for (const it of this.values) {
                text += ` ${KD.stringify(it)}`
            }
        }

        if(this.attributes != null && Object.keys(this.attributes).length > 0) {
            for (const k of Object.keys(this.attributes)) {
                text += ` ${k}=${KD.stringify(this.attributes[k])}`
            }
        }

        if(this.children != null && this.children.length > 0) {
            text+=" {\n"
            for(var child of this.children)
                text+=`  ${child}\n`
            text+="}"
        }
        return text
    }
}