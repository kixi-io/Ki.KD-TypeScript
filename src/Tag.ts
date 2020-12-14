import {List, listOf} from './List'
import {KD} from './KD'
import {NSID} from './NSID'
import './String+'

export class Tag {

    nsid: NSID

    values = listOf()
    children = new List<Tag>()
    attributes = new Map<NSID, any>()

    constructor(name = "", namespace = "") {
        this.nsid = new NSID(name, namespace)
    }

    getChild(name: string): Tag | null {
        for (const child of this.children) {
            if (child.name === name)
                return child
        }
        return null
    }

    setAttribute(key:string | NSID, value:any) {
        if(typeof key === "string") {
            this.attributes.set(new NSID(key as string), value)
        } else {
            this.attributes.set(key as NSID, value)
        }
    }

    getAttribute(key:string | NSID): any {
        return this.attributes.get(key instanceof NSID ? key : new NSID(key))
    }

    get name(): String { return this.nsid.name }

    get namespace(): String { return this.nsid.namespace }

    get isAnon(): boolean { return this.name.isEmpty() }

    value = () => this.values[0]

    equals(tag: Tag) : boolean {
        return tag!=null && tag.toString() === this.toString()
    }

    toString = (prefix="") => {
        let text = prefix

        if(this.name.length!==0) {
            text += this.nsid
            if(!this.values.isEmpty() || this.attributes.size!==0) {
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

            if(this.attributes.size!==0) {
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
            text += " {\n"

            let childText = ""
            for(const child of this.children) {
                childText = childText + child.toString(prefix + "  ") + "\n"
            }
            childText = childText + prefix + "}"
            text+=childText
        }
        return text
    }

}