import {describe, test, expect, beforeEach} from 'vitest'
import ImportUsageAuditor from './import_usage.js'


describe(ImportUsageAuditor, () => {

    let auditor

    beforeEach(() => {
        auditor = new ImportUsageAuditor('/fake/root', {silent: true})
    })


    test('static properties', () => {
        expect(ImportUsageAuditor.$name).toBe('Import Usage')
        expect(ImportUsageAuditor.$category).toBe('coverage')
        expect(ImportUsageAuditor.$canFix).toBe(false)
    })


    test('getHint returns description', () => {
        expect(auditor.getHint()).toContain('imported')
    })

})
