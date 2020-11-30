import {List, listOf} from './KSL'
import {KD} from './KD'

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

    get isAnon(): boolean { return this.name.length==0 }

    value = () => this.values[0]

    toString = (prefix="") => {
        let text = ""

        if(this.name.length!=0) {
            text += (prefix + ((this.namespace == "") ? this.name : `${this.namespace}:${this.name}`))
            if(!this.values.isEmpty() || this.attributes.size!=0) {
                text +=" "
            }
        }

        if(this.values != null && !this.values.isEmpty()) {
            let i = 0
            for (const it of this.values) {
                text += KD.stringify(it)
                if(i<this.values.length-1) {
                    text +=" "
                }
                i++
            }

            if(this.attributes.size!=0) {
                text +=" "
            }
        }

        if(this.attributes != null && this.attributes.size > 0) {
            let i = 0
            for (const [k, v] of this.attributes) {
                text += `${k}=${KD.stringify(v)}`
                if(i<this.attributes.size-1) {
                    text +=" "
                }
                i++
            }
        }

        if(this.children != null && !this.children.isEmpty()) {
            let childPrefix = prefix + "  "
            text = text + " {\n"
            for(const child of this.children) {
                text = text + child.toString(childPrefix) + "\n"
            }
            text += (prefix + "}")
        }
        return text
    }
}