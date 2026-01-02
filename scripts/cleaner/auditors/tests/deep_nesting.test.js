import {describe, expect, test} from 'vitest'
import DeepNestingAuditor from './deep_nesting.js'


describe('DeepNestingAuditor', () => {

    test('has correct static properties', () => {
        expect(DeepNestingAuditor.$name).toBe('Deep Nesting')
        expect(DeepNestingAuditor.$category).toBe('tests')
        expect(DeepNestingAuditor.$canFix).toBe(false)
    })


    test('analyze returns empty array', () => {
        const auditor = new DeepNestingAuditor('/tmp')
        const result = auditor.analyze('const x = 1')

        expect(result).toEqual([])
    })

})
