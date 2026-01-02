import {describe, expect, test} from 'vitest'
import {isUnusedDirectiveMessage} from './errors.js'


describe('isUnusedDirectiveMessage', () => {

    test('detects unused directive message', () => {
        expect(isUnusedDirectiveMessage('Unused eslint-disable directive')).toBe(true)
        expect(isUnusedDirectiveMessage("Unused eslint-disable directive (no problems were reported from 'no-unused-vars')")).toBe(true)
    })


    test('returns false for other messages', () => {
        expect(isUnusedDirectiveMessage('Expected indentation of 4 spaces')).toBe(false)
        expect(isUnusedDirectiveMessage('no-unused-vars')).toBe(false)
    })


    test('handles null and undefined', () => {
        expect(isUnusedDirectiveMessage(null)).toBeFalsy()
        expect(isUnusedDirectiveMessage(undefined)).toBeFalsy()
    })

})
