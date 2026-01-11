import {describe, test, expect, vi, beforeEach} from 'vitest'
import BrokenLinksAuditor from './broken_links.js'
import fs from 'fs'


vi.mock('fs')
vi.mock('../../utils.js', () => ({
    findJsFiles: vi.fn(() => [])
}))


describe('BrokenLinksAuditor', () => {

    beforeEach(() => {
        vi.clearAllMocks()
    })


    test('exports auditor class', () => {
        expect(BrokenLinksAuditor).toBeDefined()
        expect(BrokenLinksAuditor.$name).toBe('Doc Links')
    })


    test('returns clean when no doc files', async () => {
        fs.existsSync.mockReturnValue(true)
        fs.readFileSync.mockReturnValue('{"docs": [], "guides": []}')

        const auditor = new BrokenLinksAuditor('/root', {silent: true})
        vi.spyOn(auditor, 'scanFiles').mockReturnValue([])

        const result = await auditor.audit()

        expect(result.brokenLinks).toBe(0)
    })


    test('detects broken see() link', async () => {
        fs.existsSync.mockReturnValue(true)
        fs.readFileSync.mockImplementation((filePath) => {
            if (filePath.endsWith('docs.json')) {
                return JSON.stringify({
                    docs: [{title: 'ActionController', id: 'action_controller'}],
                    guides: []
                })
            }
            return 'see(\'NonExistent\')'
        })

        const auditor = new BrokenLinksAuditor('/root', {silent: true})
        vi.spyOn(auditor, 'scanFiles').mockReturnValue(['/root/test.doc.js'])

        const result = await auditor.audit()

        expect(result.brokenLinks).toBe(1)
        expect(result.issues[0].file).toBe('test.doc.js')
    })


    test('accepts valid see() link', async () => {
        fs.existsSync.mockReturnValue(true)
        fs.readFileSync.mockImplementation((filePath) => {
            if (filePath.endsWith('docs.json')) {
                return JSON.stringify({
                    docs: [{title: 'ActionController', id: 'action_controller'}],
                    guides: []
                })
            }
            return 'see(\'ActionController\')'
        })

        const auditor = new BrokenLinksAuditor('/root', {silent: true})
        vi.spyOn(auditor, 'scanFiles').mockReturnValue(['/root/test.doc.js'])

        const result = await auditor.audit()

        expect(result.brokenLinks).toBe(0)
    })


    test('detects broken inline [[]] link', async () => {
        fs.existsSync.mockReturnValue(true)
        fs.readFileSync.mockImplementation((filePath) => {
            if (filePath.endsWith('docs.json')) {
                return JSON.stringify({
                    docs: [{title: 'ActionController', id: 'action_controller'}],
                    guides: []
                })
            }
            return 'text(`See [[NonExistent]] for details`)'
        })

        const auditor = new BrokenLinksAuditor('/root', {silent: true})
        vi.spyOn(auditor, 'scanFiles').mockReturnValue(['/root/test.doc.js'])

        const result = await auditor.audit()

        expect(result.brokenLinks).toBe(1)
    })


    test('accepts valid inline [[]] link', async () => {
        fs.existsSync.mockReturnValue(true)
        fs.readFileSync.mockImplementation((filePath) => {
            if (filePath.endsWith('docs.json')) {
                return JSON.stringify({
                    docs: [{title: 'ActionController', id: 'action_controller'}],
                    guides: []
                })
            }
            return 'text(`See [[ActionController]] for details`)'
        })

        const auditor = new BrokenLinksAuditor('/root', {silent: true})
        vi.spyOn(auditor, 'scanFiles').mockReturnValue(['/root/test.doc.js'])

        const result = await auditor.audit()

        expect(result.brokenLinks).toBe(0)
    })


    test('handles inline link with section', async () => {
        fs.existsSync.mockReturnValue(true)
        fs.readFileSync.mockImplementation((filePath) => {
            if (filePath.endsWith('docs.json')) {
                return JSON.stringify({
                    docs: [{title: 'ActionController', id: 'action_controller'}],
                    guides: []
                })
            }
            return 'text(`See [[ActionController#Propagation]]`)'
        })

        const auditor = new BrokenLinksAuditor('/root', {silent: true})
        vi.spyOn(auditor, 'scanFiles').mockReturnValue(['/root/test.doc.js'])

        const result = await auditor.audit()

        expect(result.brokenLinks).toBe(0)
    })


    test('handles guide type link', async () => {
        fs.existsSync.mockReturnValue(true)
        fs.readFileSync.mockImplementation((filePath) => {
            if (filePath.endsWith('docs.json')) {
                return JSON.stringify({
                    docs: [],
                    guides: [{title: 'Philosophy', id: 'philosophy'}]
                })
            }
            return 'see(\'philosophy\', {type: \'guide\'})'
        })

        const auditor = new BrokenLinksAuditor('/root', {silent: true})
        vi.spyOn(auditor, 'scanFiles').mockReturnValue(['/root/test.doc.js'])

        const result = await auditor.audit()

        expect(result.brokenLinks).toBe(0)
    })


    test('ignores JS array syntax like [[a, 1]]', async () => {
        fs.existsSync.mockReturnValue(true)
        fs.readFileSync.mockImplementation((filePath) => {
            if (filePath.endsWith('docs.json')) {
                return JSON.stringify({docs: [], guides: []})
            }
            return "new Map([['a', 1], ['b', 2]])"
        })

        const auditor = new BrokenLinksAuditor('/root', {silent: true})
        vi.spyOn(auditor, 'scanFiles').mockReturnValue(['/root/test.doc.js'])

        const result = await auditor.audit()

        expect(result.brokenLinks).toBe(0)
    })

})
