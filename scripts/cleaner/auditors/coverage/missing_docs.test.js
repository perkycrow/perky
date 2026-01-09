import {describe, test, expect, vi, beforeEach} from 'vitest'
import MissingDocsAuditor, {shouldExcludeFromDocAudit} from './missing_docs.js'
import fs from 'fs'


vi.mock('fs')
vi.mock('../../utils.js', () => ({
    findJsFiles: vi.fn(() => []),
    isExcludedFile: vi.fn(() => false)
}))


describe(MissingDocsAuditor, () => {

    beforeEach(() => {
        vi.clearAllMocks()
        fs.existsSync.mockReturnValue(false)
    })


    test('static properties', () => {
        expect(MissingDocsAuditor.$name).toBe('Missing Docs')
        expect(MissingDocsAuditor.$category).toBe('coverage')
        expect(MissingDocsAuditor.$canFix).toBe(false)
    })


    test('returns clean when all files have docs', async () => {
        fs.existsSync.mockReturnValue(false)

        const auditor = new MissingDocsAuditor('/root', {silent: true})
        vi.spyOn(auditor, 'scanFiles').mockReturnValue([])

        const result = await auditor.audit()

        expect(result.filesWithoutDocs).toBe(0)
        expect(result.files).toEqual([])
    })


    test('detects file without doc', async () => {
        fs.existsSync.mockImplementation((p) => {
            if (p.endsWith('.doc.js')) {
                return false
            }
            return false
        })

        const auditor = new MissingDocsAuditor('/root', {silent: true})
        vi.spyOn(auditor, 'scanFiles').mockReturnValue(['/root/src/module.js'])

        const result = await auditor.audit()

        expect(result.filesWithoutDocs).toBe(1)
        expect(result.files).toContain('src/module.doc.js')
    })


    test('skips test files', async () => {
        fs.existsSync.mockReturnValue(false)

        const auditor = new MissingDocsAuditor('/root', {silent: true})
        vi.spyOn(auditor, 'scanFiles').mockReturnValue(['/root/src/module.test.js'])

        const result = await auditor.audit()

        expect(result.filesWithoutDocs).toBe(0)
    })


    test('skips doc files', async () => {
        fs.existsSync.mockReturnValue(false)

        const auditor = new MissingDocsAuditor('/root', {silent: true})
        vi.spyOn(auditor, 'scanFiles').mockReturnValue(['/root/src/module.doc.js'])

        const result = await auditor.audit()

        expect(result.filesWithoutDocs).toBe(0)
    })


    test('skips guide files', async () => {
        fs.existsSync.mockReturnValue(false)

        const auditor = new MissingDocsAuditor('/root', {silent: true})
        vi.spyOn(auditor, 'scanFiles').mockReturnValue(['/root/src/intro.guide.js'])

        const result = await auditor.audit()

        expect(result.filesWithoutDocs).toBe(0)
    })


    test('skips scripts directory', async () => {
        fs.existsSync.mockReturnValue(false)

        const auditor = new MissingDocsAuditor('/root', {silent: true})
        vi.spyOn(auditor, 'scanFiles').mockReturnValue(['/root/scripts/build.js'])

        const result = await auditor.audit()

        expect(result.filesWithoutDocs).toBe(0)
    })


    test('skips index.js files', async () => {
        fs.existsSync.mockReturnValue(false)

        const auditor = new MissingDocsAuditor('/root', {silent: true})
        vi.spyOn(auditor, 'scanFiles').mockReturnValue(['/root/src/index.js'])

        const result = await auditor.audit()

        expect(result.filesWithoutDocs).toBe(0)
    })


    test('skips root level files', async () => {
        fs.existsSync.mockReturnValue(false)

        const auditor = new MissingDocsAuditor('/root', {silent: true})
        vi.spyOn(auditor, 'scanFiles').mockReturnValue(['/root/config.js'])

        const result = await auditor.audit()

        expect(result.filesWithoutDocs).toBe(0)
    })


    test('getHint returns doc creation message', () => {
        const auditor = new MissingDocsAuditor('/root', {silent: true})
        expect(auditor.getHint()).toContain('.doc.js')
    })


    test('analyze returns empty array', () => {
        const auditor = new MissingDocsAuditor('/root', {silent: true})
        expect(auditor.analyze()).toEqual([])
    })

})


describe('shouldExcludeFromDocAudit', () => {

    test('excludes root level files', () => {
        expect(shouldExcludeFromDocAudit('config.js')).toBe(true)
    })


    test('excludes index.js files', () => {
        expect(shouldExcludeFromDocAudit('src/index.js')).toBe(true)
        expect(shouldExcludeFromDocAudit('index.js')).toBe(true)
    })


    test('excludes scripts directory', () => {
        expect(shouldExcludeFromDocAudit('scripts/build.js')).toBe(true)
    })


    test('excludes doc directory when passed via excludeDirs', () => {
        expect(shouldExcludeFromDocAudit('doc/api.js', ['doc/'])).toBe(true)
    })


    test('excludes editor directory', () => {
        expect(shouldExcludeFromDocAudit('editor/main.js')).toBe(true)
    })


    test('excludes examples directory', () => {
        expect(shouldExcludeFromDocAudit('examples/demo.js')).toBe(true)
    })


    test('excludes eslint directory', () => {
        expect(shouldExcludeFromDocAudit('eslint/rules.js')).toBe(true)
    })


    test('excludes den directory when passed via excludeDirs', () => {
        expect(shouldExcludeFromDocAudit('den/module.js', ['den/'])).toBe(true)
    })


    test('excludes test_helpers.js', () => {
        expect(shouldExcludeFromDocAudit('src/test_helpers.js')).toBe(true)
    })


    test('excludes custom directories from config', () => {
        expect(shouldExcludeFromDocAudit('custom/', ['custom/'])).toBe(true)
    })


    test('includes regular source files', () => {
        expect(shouldExcludeFromDocAudit('src/module.js')).toBe(false)
        expect(shouldExcludeFromDocAudit('core/action.js')).toBe(false)
    })

})
