import {describe, expect, test} from 'vitest'
import SwitchesAuditor from './switches.js'


describe('SwitchesAuditor', () => {

    test('has correct static properties', () => {
        expect(SwitchesAuditor.$name).toBe('Switch Statements')
        expect(SwitchesAuditor.$canFix).toBe(false)
    })


    test('analyze returns empty array', () => {
        const auditor = new SwitchesAuditor('/tmp')
        const result = auditor.analyze('const x = 1')

        expect(result).toEqual([])
    })

})
