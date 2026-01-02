import {describe, expect, test} from 'vitest'
import ItUsageAuditor from './it_usage.js'


describe('ItUsageAuditor', () => {

    test('has correct static properties', () => {
        expect(ItUsageAuditor.$name).toBe('it() Usage')
        expect(ItUsageAuditor.$category).toBe('tests')
        expect(ItUsageAuditor.$canFix).toBe(false)
    })


    test('analyze returns empty array', () => {
        const auditor = new ItUsageAuditor('/tmp')
        const result = auditor.analyze('const x = 1')

        expect(result).toEqual([])
    })

})
