import {QA} from './QA'
import "../source/String+";

let qa = new QA("QA")

qa.section("Error handling")

qa.throws(() => {
    throw new Error("Disaster!")
}, "Empty unit")

qa.doesntThrow(() => {
    // no action
}, `new Quantity(2, "a")`)

qa.section("Booleans")

qa.isTrue(true)
qa.isFalse(false)

qa.summarize()