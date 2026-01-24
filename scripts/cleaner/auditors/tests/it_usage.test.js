import {describe, expect, test} from 'vitest'
import ItUsageAuditor from './it_usage.js'


describe('ItUsageAuditor', () => {

    test('has correct static properties', () => {
        expect(ItUsageAuditor.$name).toBe('Test Style')
        expect(ItUsageAuditor.$category).toBe('tests')
        expect(ItUsageAuditor.$canFix).toBe(false)
    })

})
