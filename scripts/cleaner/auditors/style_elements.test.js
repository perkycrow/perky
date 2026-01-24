import {describe, expect, test} from 'vitest'
import StyleElementAuditor from './style_elements.js'


describe('StyleElementAuditor', () => {

    test('detects document.createElement style with single quotes', () => {
        const auditor = new StyleElementAuditor('/tmp')
        const content = "document.createElement('style')"
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(1)
        expect(issues[0]).toContain("document.createElement('style')")
    })


    test('detects document.createElement style with double quotes', () => {
        const auditor = new StyleElementAuditor('/tmp')
        const content = 'document.createElement("style")'
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(1)
    })


    test('detects document.createElement style with backticks', () => {
        const auditor = new StyleElementAuditor('/tmp')
        const content = 'document.createElement(`style`)'
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(1)
    })


    test('detects multiple occurrences', () => {
        const auditor = new StyleElementAuditor('/tmp')
        const content = `
            const a = document.createElement('style')
            const b = document.createElement('style')
        `
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(2)
    })


    test('ignores inside strings', () => {
        const auditor = new StyleElementAuditor('/tmp')
        const content = 'const x = "document.createElement(\'style\')"'
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(0)
    })


    test('returns line number', () => {
        const auditor = new StyleElementAuditor('/tmp')
        const content = "const x = 1\ndocument.createElement('style')"
        const issues = auditor.analyze(content)

        expect(issues[0]).toContain('L2:')
    })


    test('handles spaces in createElement call', () => {
        const auditor = new StyleElementAuditor('/tmp')
        const content = "document.createElement( 'style' )"
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(1)
    })


    test('does not match other element types', () => {
        const auditor = new StyleElementAuditor('/tmp')
        const content = "document.createElement('div')"
        const issues = auditor.analyze(content)

        expect(issues).toHaveLength(0)
    })

})
