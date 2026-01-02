import {describe, expect, test} from 'vitest'
import ConsoleAuditor from './console.js'


describe('ConsoleAuditor', () => {

    test('detects console.log', () => {
        const auditor = new ConsoleAuditor('/tmp')
        const content = 'console.log("hello")'
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(1)
        expect(issues[0].method).toBe('log')
    })


    test('detects console.warn', () => {
        const auditor = new ConsoleAuditor('/tmp')
        const content = 'console.warn("warning")'
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(1)
        expect(issues[0].method).toBe('warn')
    })


    test('detects console.error', () => {
        const auditor = new ConsoleAuditor('/tmp')
        const content = 'console.error("error")'
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(1)
        expect(issues[0].method).toBe('error')
    })


    test('detects multiple console statements', () => {
        const auditor = new ConsoleAuditor('/tmp')
        const content = `
            console.log("a")
            console.warn("b")
            console.error("c")
        `
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(3)
    })


    test('ignores console inside strings', () => {
        const auditor = new ConsoleAuditor('/tmp')
        const content = 'const x = "console.log()"'
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(0)
    })


    test('returns line number', () => {
        const auditor = new ConsoleAuditor('/tmp')
        const content = 'const x = 1\nconsole.log("test")'
        const issues = auditor.analyze(content)

        expect(issues[0].line).toBe(2)
    })

})
