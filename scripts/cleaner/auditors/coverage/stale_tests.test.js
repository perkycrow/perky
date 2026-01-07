import {describe, test, expect, beforeEach} from 'vitest'
import StaleTestsAuditor from './stale_tests.js'


describe(StaleTestsAuditor, () => {

    let auditor

    beforeEach(() => {
        auditor = new StaleTestsAuditor('/fake/root', {silent: true})
    })


    test('static properties', () => {
        expect(StaleTestsAuditor.$name).toBe('Stale Tests')
        expect(StaleTestsAuditor.$category).toBe('coverage')
        expect(StaleTestsAuditor.$canFix).toBe(false)
    })


    test('getHint returns threshold message', () => {
        expect(auditor.getHint()).toContain('30')
        expect(auditor.getHint()).toContain('days')
    })


    test('analyze returns empty array', () => {
        expect(auditor.analyze()).toEqual([])
    })

})
