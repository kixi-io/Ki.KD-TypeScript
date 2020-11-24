import { rand } from './KMath';

export class List<T> extends Array<T> {

    constructor(...obj) { super(...obj) }

    random = () : T => this[rand(0, this.length-1)]
    remove= (obj) => this.splice(this.findIndex(e => e == obj), 1)
    removeAt = (index: number) => this.splice(index, 1)
    add = (obj: T) => this.push(obj)
    isEmpty = () => this.length == 0
    slice = (start?: number, end?: number): List<T> => new List<T>(super.slice(start, end))

    shuffle() : List<T> {
        for (let i = this.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
        return this
    }

    /**
     * Gets the value at the index or `null` if its out of range.
     * @param index
     */
    safeGet(index: number) : T {
        if(index>=this.length) {
            return null
        }

        return this[index]
    }
}

export let listOf = <T>(...objs) => new List<T>(...objs)
