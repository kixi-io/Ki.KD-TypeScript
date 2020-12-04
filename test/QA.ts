import {log,info,error} from "../source/Log";

/**
 * This class represents a simple testing framework.
 */
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

    /**
     * Create a new section of tests
     */
    section(name: string, prefix='📐 ') {
        log()
        log(QA.padWithLine(prefix + name + ' '))
    }

    /**
     * This method uses the `equals` method on `expected` if available, otherwise uses `==`.
     */
    equals(expected: any, got: any, prefix = ""): boolean {
        if(expected == null || got == null) {
            return got == null && expected == null
        }

        let equals = (typeof expected.equals == "undefined") ? got == expected : expected.equals(got)

        let modPrefix = prefix.isEmpty() ? "" : prefix + " "

        if (equals) {
            info(`${modPrefix}Equals「${expected}」: ✔️`)
            this.passed++
            return true
        } else {
            error(`${modPrefix}Expected「${expected}」but got「${got}」: ❌`);
            this.failed++
            return false
        }
    }

    /**
     * Checks if an error is thrown
     */
    throws(test: () => any, prefix = ""): boolean {

        let modPrefix = prefix.isEmpty() ? "" : prefix + " "

        try {
            test()
        }catch (e) {
            info(`${modPrefix}Threw ${typeof e} ${e}`)
            this.passed++
            return true;
        }

        error(`${modPrefix}Didn't throw Error`)
        this.failed++
        return false;
    }

    /**
     * Checks if an error is thrown
     */
    doesntThrow(test: () => any, prefix = ""): boolean {

        let modPrefix = prefix.isEmpty() ? "" : prefix + " "

        try {
            test()
        }catch (e) {
            error(`${modPrefix}Threw ${typeof e} ${e}`)
            this.failed++
            return false;
        }

        info(`${modPrefix}Didn't throw Error`)
        this.passed++
        return true;
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