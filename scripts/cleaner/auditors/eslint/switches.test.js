import {describe, expect, test} from 'vitest'
import SwitchesAuditor from './switches.js'


describe('SwitchesAuditor', () => {

    test('has correct static properties', () => {
        expect(SwitchesAuditor.$name).toBe('Switch Statements')
        expect(SwitchesAuditor.$canFix).toBe(false)
    })

})
