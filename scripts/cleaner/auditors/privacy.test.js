import {describe, expect, test} from 'vitest'
import PrivacyAuditor from './privacy.js'


describe('PrivacyAuditor', () => {

    test('detects underscore method', () => {
        const auditor = new PrivacyAuditor('/tmp')
        const content = `
class Foo {
    _privateMethod () {}
}
        `
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(1)
        expect(issues[0].type).toBe('method')
        expect(issues[0].name).toBe('_privateMethod')
    })


    test('detects underscore property', () => {
        const auditor = new PrivacyAuditor('/tmp')
        const content = `
class Foo {
    _privateProperty = 42
}
        `
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(1)
        expect(issues[0].type).toBe('property')
        expect(issues[0].name).toBe('_privateProperty')
    })


    test('detects this._property assignment', () => {
        const auditor = new PrivacyAuditor('/tmp')
        const content = `
class Foo {
    constructor () {
        this._value = 42
    }
}
        `
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(1)
        expect(issues[0].type).toBe('this-property')
        expect(issues[0].name).toBe('this._value')
    })


    test('ignores double underscore', () => {
        const auditor = new PrivacyAuditor('/tmp')
        const content = `
class Foo {
    __dunder__ () {}
}
        `
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(0)
    })


    test('ignores real private fields', () => {
        const auditor = new PrivacyAuditor('/tmp')
        const content = `
class Foo {
    #realPrivate = 42
    #realPrivateMethod () {}
}
        `
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(0)
    })


    test('handles invalid syntax gracefully', () => {
        const auditor = new PrivacyAuditor('/tmp')
        const content = 'this is not valid javascript {'
        const issues = auditor.analyze(content)

        expect(issues).toEqual([])
    })

})
