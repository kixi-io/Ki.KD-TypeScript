import {Quantity} from "../source/Quantity";
import {QA} from './QA'

let qa = new QA("QA")

qa.throws(() => {
    new Quantity(2, "")
}, "Empty unit")

qa.doesntThrow(() => {
    new Quantity(2, "a")
}, `new Quantity(2, "a")`)