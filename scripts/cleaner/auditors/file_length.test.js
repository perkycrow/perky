import {describe, expect, test, vi, beforeEach} from 'vitest'
import FileLengthAuditor from './file_length.js'


vi.mock('fs', () => ({
    default: {
        readdirSync: vi.fn(() => []),
        readFileSync: vi.fn(() => ''),
        statSync: vi.fn(() => ({isFile: () => false, isDirectory: () => true}))
    }
}))

vi.mock('../utils.js', async (importOriginal) => {
    const original = await importOriginal()
    return {
        ...original,
        findJsFiles: vi.fn(() => []),
        loadCleanerConfig: vi.fn(async () => ({}))
    }
})


import fs from 'fs'
import {findJsFiles, loadCleanerConfig} from '../utils.js'


describe('FileLengthAuditor', () => {

    beforeEach(() => {
        vi.clearAllMocks()
        findJsFiles.mockReturnValue([])
        loadCleanerConfig.mockResolvedValue({})
    })


    test('static properties', () => {
        expect(FileLengthAuditor.$name).toBe('File Length')
        expect(FileLengthAuditor.$category).toBe('file_length')
        expect(FileLengthAuditor.$canFix).toBe(false)
        expect(FileLengthAuditor.$hint).toBe('Files sorted by line count')
    })


    test('audit returns empty result when no files', async () => {
        const auditor = new FileLengthAuditor('/tmp/test', {silent: true})
        const result = await auditor.audit()

        expect(result.filesAnalyzed).toBe(0)
        expect(result.totalLines).toBe(0)
        expect(result.files).toEqual([])
    })


    test('audit counts lines in files', async () => {
        findJsFiles.mockReturnValue(['/tmp/test/src/a.js', '/tmp/test/src/b.js'])
        fs.readFileSync
            .mockReturnValueOnce('line1\nline2\nline3')
            .mockReturnValueOnce('line1\nline2')

        const auditor = new FileLengthAuditor('/tmp/test', {silent: true})
        const result = await auditor.audit()

        expect(result.filesAnalyzed).toBe(2)
        expect(result.totalLines).toBe(5)
        expect(result.files[0].lines).toBe(3)
        expect(result.files[1].lines).toBe(2)
    })


    test('audit sorts files by line count descending', async () => {
        findJsFiles.mockReturnValue(['/tmp/test/small.js', '/tmp/test/big.js'])
        fs.readFileSync
            .mockReturnValueOnce('a')
            .mockReturnValueOnce('a\nb\nc\nd\ne')

        const auditor = new FileLengthAuditor('/tmp/test', {silent: true})
        const result = await auditor.audit()

        expect(result.files[0].file).toBe('big.js')
        expect(result.files[1].file).toBe('small.js')
    })


    test('audit skips test files', async () => {
        findJsFiles.mockReturnValue(['/tmp/test/a.js', '/tmp/test/a.test.js'])
        fs.readFileSync.mockReturnValue('line1')

        const auditor = new FileLengthAuditor('/tmp/test', {silent: true})
        const result = await auditor.audit()

        expect(result.filesAnalyzed).toBe(1)
        expect(result.files[0].file).toBe('a.js')
    })


    test('audit skips doc files', async () => {
        findJsFiles.mockReturnValue(['/tmp/test/a.js', '/tmp/test/a.doc.js'])
        fs.readFileSync.mockReturnValue('line1')

        const auditor = new FileLengthAuditor('/tmp/test', {silent: true})
        const result = await auditor.audit()

        expect(result.filesAnalyzed).toBe(1)
        expect(result.files[0].file).toBe('a.js')
    })


    test('audit skips guide files', async () => {
        findJsFiles.mockReturnValue(['/tmp/test/a.js', '/tmp/test/intro.guide.js'])
        fs.readFileSync.mockReturnValue('line1')

        const auditor = new FileLengthAuditor('/tmp/test', {silent: true})
        const result = await auditor.audit()

        expect(result.filesAnalyzed).toBe(1)
    })


    test('audit respects excludeFiles config with glob prefix', async () => {
        loadCleanerConfig.mockResolvedValue({fileLength: {excludeFiles: ['**/excluded.js']}})
        findJsFiles.mockReturnValue(['/tmp/test/a.js', '/tmp/test/lib/excluded.js'])
        fs.readFileSync.mockReturnValue('line1')

        const auditor = new FileLengthAuditor('/tmp/test', {silent: true})
        const result = await auditor.audit()

        expect(result.filesAnalyzed).toBe(1)
        expect(result.files[0].file).toBe('a.js')
    })


    test('audit respects excludeFiles config with exact match', async () => {
        loadCleanerConfig.mockResolvedValue({fileLength: {excludeFiles: ['vendor.js']}})
        findJsFiles.mockReturnValue(['/tmp/test/a.js', '/tmp/test/vendor.js'])
        fs.readFileSync.mockReturnValue('line1')

        const auditor = new FileLengthAuditor('/tmp/test', {silent: true})
        const result = await auditor.audit()

        expect(result.filesAnalyzed).toBe(1)
        expect(result.files[0].file).toBe('a.js')
    })


    test('audit respects excludeFiles config with wildcard pattern', async () => {
        loadCleanerConfig.mockResolvedValue({fileLength: {excludeFiles: ['vendor/*.js']}})
        findJsFiles.mockReturnValue(['/tmp/test/a.js', '/tmp/test/vendor/lib.js'])
        fs.readFileSync.mockReturnValue('line1')

        const auditor = new FileLengthAuditor('/tmp/test', {silent: true})
        const result = await auditor.audit()

        expect(result.filesAnalyzed).toBe(1)
        expect(result.files[0].file).toBe('a.js')
    })

})
