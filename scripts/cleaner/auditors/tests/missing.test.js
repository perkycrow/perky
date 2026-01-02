import {describe, expect, test} from 'vitest'
import MissingTestsAuditor from './missing.js'


describe('MissingTestsAuditor', () => {

    test('has correct static properties', () => {
        expect(MissingTestsAuditor.$name).toBe('Missing Tests')
        expect(MissingTestsAuditor.$category).toBe('tests')
        expect(MissingTestsAuditor.$canFix).toBe(false)
    })


    test('analyze returns empty array', () => {
        const auditor = new MissingTestsAuditor('/tmp')
        const result = auditor.analyze('const x = 1')

        expect(result).toEqual([])
    })

})
