import {describe, test, expect, beforeEach} from 'vitest'
import StaleFilesAuditor from './stale_files.js'


describe(StaleFilesAuditor, () => {

    let auditor

    beforeEach(() => {
        auditor = new StaleFilesAuditor('/fake/root', {silent: true})
    })


    test('static properties', () => {
        expect(StaleFilesAuditor.$name).toBe('Stale Files')
        expect(StaleFilesAuditor.$category).toBe('coverage')
        expect(StaleFilesAuditor.$canFix).toBe(false)
    })


    test('getHint returns threshold message', () => {
        expect(auditor.getHint()).toContain('30')
        expect(auditor.getHint()).toContain('days')
    })


    test('analyze returns empty array', () => {
        expect(auditor.analyze()).toEqual([])
    })

})
