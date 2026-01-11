import {describe, expect, test} from 'vitest'
import MissingTestsAuditor from './missing.js'


describe('MissingTestsAuditor', () => {

    test('has correct static properties', () => {
        expect(MissingTestsAuditor.$name).toBe('Missing Tests')
        expect(MissingTestsAuditor.$category).toBe('tests')
        expect(MissingTestsAuditor.$canFix).toBe(false)
    })

})
