import {log,info,error} from "../source/Log";

export class QA {

    static line = "―".repeat(38)
    static doubleLine = "═".repeat(38)

    name: string
    passed = 0
    failed = 0

    constructor(name = "General") {
        log(QA.padWithDoubleLine(`🏁 ${name} Tests 🔎 `))
        this.name = name
    }

    section(name: string, prefix='📐 ') {
        log()
        log(QA.padWithLine(prefix + name + ' '))
    }

    equals(expected: any, got: any): boolean {
        if (got == expected) {
            info(`Equals「${expected}」: ✔️`)
            this.passed++
            return true
        } else {
            error(`Expected「${expected}」but got「${got}」: ❌`);
            this.failed++
            return false
        }
    }

    summarize() {
        log("══════════════════════════════════════")
        log(`${this.name} Test Summary`)
        log(`  Passed: ${this.passed}`)
        log(`  Failed: ${this.failed}`)
        log("――――――――――――――――――――――――――――――――――――――")
        if(this.failed==0) {
            log("🎉 PASSED 🎉")
        } else {
            log("👺 FAILED 👺")
        }
        log()
    }

    static padWithLine = (text: String) => (text.length > 37) ? text : text+QA.line.substring(0, 38-text.length)
    static padWithDoubleLine = (text: String) => (text.length > 37) ? text :
        text+QA.doubleLine.substring(0, 38-text.length)
}