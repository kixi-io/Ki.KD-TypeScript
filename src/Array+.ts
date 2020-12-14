import { rand } from "./KMath";
import {KD} from "./KD";

declare global {
    interface Array<T> {
        random(): T
        equals(obj: T): boolean
    }
}

if (!Array.prototype.random) {

    // eslint-disable-next-line no-extend-native
    Array.prototype.random = function<T>(): T {
        return this[rand(0, this.length-1)]
    }

    // eslint-disable-next-line no-extend-native
    Array.prototype.equals = function(list: any): boolean  {

        if(list == null || this.length!=list.length)
            return false

        for(let i = 0; i<this.length; i++) {
            if(!KD.equals(this[i], list[i]))
                return false
        }
        return true
    }
}

export {}