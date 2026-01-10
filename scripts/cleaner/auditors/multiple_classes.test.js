import {describe, expect, test} from 'vitest'
import MultipleClassesAuditor from './multiple_classes.js'


describe('MultipleClassesAuditor', () => {

    test('detects two classes in same file', () => {
        const auditor = new MultipleClassesAuditor('/tmp')
        const content = `
class Foo {}
class Bar {}
        `
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(1)
        expect(issues[0]).toContain('2 classes found')
        expect(issues[0]).toContain('Foo')
        expect(issues[0]).toContain('Bar')
    })


    test('detects exported classes', () => {
        const auditor = new MultipleClassesAuditor('/tmp')
        const content = `
export class Foo {}
export default class Bar {}
        `
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(1)
        expect(issues[0]).toContain('2 classes found')
    })


    test('detects mix of exported and non-exported classes', () => {
        const auditor = new MultipleClassesAuditor('/tmp')
        const content = `
class Internal {}
export default class Public {}
        `
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(1)
        expect(issues[0]).toContain('2 classes found')
    })


    test('allows single class', () => {
        const auditor = new MultipleClassesAuditor('/tmp')
        const content = `
export default class Foo {
    constructor () {}
    method () {}
}
        `
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(0)
    })


    test('allows no classes', () => {
        const auditor = new MultipleClassesAuditor('/tmp')
        const content = `
function foo () {}
const bar = 42
        `
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(0)
    })


    test('handles invalid syntax gracefully', () => {
        const auditor = new MultipleClassesAuditor('/tmp')
        const content = 'this is not valid javascript {'
        const issues = auditor.analyze(content)

        expect(issues).toEqual([])
    })

})
