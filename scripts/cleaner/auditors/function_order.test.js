import {describe, expect, test} from 'vitest'
import FunctionOrderAuditor from './function_order.js'


describe('FunctionOrderAuditor', () => {

    test('has correct static properties', () => {
        expect(FunctionOrderAuditor.$name).toBe('Function Order')
        expect(FunctionOrderAuditor.$category).toBe('function_order')
        expect(FunctionOrderAuditor.$canFix).toBe(false)
    })


    test('detects function declared before class', () => {
        const auditor = new FunctionOrderAuditor('/tmp')
        const content = `
function helper () {}

export default class Foo {
    method () {}
}
        `
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(1)
        expect(issues[0]).toContain('helper')
        expect(issues[0]).toContain('declared before class')
    })


    test('detects multiple functions before class', () => {
        const auditor = new FunctionOrderAuditor('/tmp')
        const content = `
function helperA () {}
function helperB () {}

export default class Foo {
    method () {}
}
        `
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(2)
        expect(issues[0]).toContain('helperA')
        expect(issues[1]).toContain('helperB')
    })


    test('allows functions after class', () => {
        const auditor = new FunctionOrderAuditor('/tmp')
        const content = `
export default class Foo {
    method () {}
}

function helper () {}
        `
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(0)
    })


    test('returns empty array when no export default class', () => {
        const auditor = new FunctionOrderAuditor('/tmp')
        const content = `
function helper () {}

class Foo {
    method () {}
}
        `
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(0)
    })


    test('handles export default with named class', () => {
        const auditor = new FunctionOrderAuditor('/tmp')
        const content = `
function beforeClass () {}

export default class NamedClass {
    method () {}
}

function afterClass () {}
        `
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(1)
        expect(issues[0]).toContain('beforeClass')
    })


    test('handles invalid syntax gracefully', () => {
        const auditor = new FunctionOrderAuditor('/tmp')
        const content = 'this is not valid javascript {'
        const issues = auditor.analyze(content)

        expect(issues).toEqual([])
    })


    test('handles empty content', () => {
        const auditor = new FunctionOrderAuditor('/tmp')
        const content = ''
        const issues = auditor.analyze(content)

        expect(issues).toEqual([])
    })


    test('handles file with only imports and class', () => {
        const auditor = new FunctionOrderAuditor('/tmp')
        const content = `
import Something from './something.js'

export default class Foo {
    method () {}
}
        `
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(0)
    })


    test('handles anonymous function declaration', () => {
        const auditor = new FunctionOrderAuditor('/tmp')
        const content = `
const helper = function () {}

export default class Foo {
    method () {}
}
        `
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(0)
    })


    test('handles arrow functions (not detected as issues)', () => {
        const auditor = new FunctionOrderAuditor('/tmp')
        const content = `
const helper = () => {}

export default class Foo {
    method () {}
}
        `
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(0)
    })

})
