import {describe, test, expect, beforeEach} from 'vitest'
import MissingCoverageAuditor from './missing_coverage.js'


describe(MissingCoverageAuditor, () => {

    let auditor

    beforeEach(() => {
        auditor = new MissingCoverageAuditor('/fake/root', {silent: true})
    })


    test('static properties', () => {
        expect(MissingCoverageAuditor.$name).toBe('Missing Coverage')
        expect(MissingCoverageAuditor.$category).toBe('coverage')
        expect(MissingCoverageAuditor.$canFix).toBe(false)
    })


    test('getHint returns description', () => {
        expect(auditor.getHint()).toContain('not referenced')
    })


    test('analyze returns empty array', () => {
        expect(auditor.analyze()).toEqual([])
    })

})
