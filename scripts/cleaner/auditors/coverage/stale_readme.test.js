import {describe, test, expect, beforeEach} from 'vitest'
import StaleReadmeAuditor from './stale_readme.js'


describe(StaleReadmeAuditor, () => {

    let auditor

    beforeEach(() => {
        auditor = new StaleReadmeAuditor('/fake/root', {silent: true})
    })


    test('static properties', () => {
        expect(StaleReadmeAuditor.$name).toBe('Stale Readme')
        expect(StaleReadmeAuditor.$category).toBe('coverage')
        expect(StaleReadmeAuditor.$canFix).toBe(false)
    })


    test('getHint returns threshold message', () => {
        expect(auditor.getHint()).toContain('7')
        expect(auditor.getHint()).toContain('days')
    })

})
