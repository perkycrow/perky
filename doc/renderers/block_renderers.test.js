import {describe, test, expect, vi, beforeEach} from 'vitest'


vi.mock('../parse_markdown.js', () => ({
    parseMarkdown: vi.fn(text => `<p>${text}</p>`)
}))

vi.mock('../utils/paths.js', () => ({
    buildDocUrl: vi.fn(() => 'test.html')
}))


describe('block_renderers', () => {

    let renderText
    let renderDisclaimer
    let renderCode
    let renderSee

    beforeEach(async () => {
        const module = await import('./block_renderers.js')
        renderText = module.renderText
        renderDisclaimer = module.renderDisclaimer
        renderCode = module.renderCode
        renderSee = module.renderSee
    })


    describe('renderText', () => {

        test('creates doc-text element', () => {
            const el = renderText({content: 'Hello'})
            expect(el.className).toBe('doc-text')
        })


        test('sets innerHTML from parsed content', () => {
            const el = renderText({content: 'Hello'})
            expect(el.innerHTML).toContain('Hello')
        })

    })


    describe('renderDisclaimer', () => {

        test('creates doc-disclaimer element', () => {
            const el = renderDisclaimer({content: 'Warning'})
            expect(el.className).toBe('doc-disclaimer')
        })


        test('sets innerHTML from parsed content', () => {
            const el = renderDisclaimer({content: 'Important note'})
            expect(el.innerHTML).toContain('Important note')
        })

    })


    describe('renderCode', () => {

        test('creates doc-code-block wrapper', () => {
            const el = renderCode({title: 'Test', source: 'code'})
            expect(el.className).toBe('doc-code-block')
        })


        test('uses block source when extractedSource is null', () => {
            const el = renderCode({title: 'Test', source: 'original'})
            const codeEl = el.querySelector('perky-code')
            expect(codeEl.code).toBe('original')
        })


        test('uses extracted source if provided', () => {
            const el = renderCode({title: 'Test', source: 'original'}, 'extracted')
            const codeEl = el.querySelector('perky-code')
            expect(codeEl.code).toBe('extracted')
        })


        test('sets title attribute on perky-code', () => {
            const el = renderCode({title: 'My Title', source: 'code'})
            const codeEl = el.querySelector('perky-code')
            expect(codeEl.getAttribute('title')).toBe('My Title')
        })

    })


    describe('renderSee', () => {

        test('creates doc-see wrapper', () => {
            const el = renderSee({name: 'Logger', pageType: 'doc'})
            expect(el.className).toBe('doc-see')
        })


        test('creates link with doc-see-link class', () => {
            const el = renderSee({name: 'Logger', pageType: 'doc'})
            const link = el.querySelector('.doc-see-link')
            expect(link).toBeTruthy()
        })


        test('sets href from buildDocUrl', () => {
            const el = renderSee({name: 'Logger', pageType: 'doc'})
            const link = el.querySelector('.doc-see-link')
            expect(link.href).toContain('test.html')
        })


        test('shows basic label for doc pageType', () => {
            const el = renderSee({name: 'Logger', pageType: 'doc'})
            const link = el.querySelector('.doc-see-link')
            expect(link.textContent).toContain('See Logger')
            expect(link.textContent).not.toContain('(doc)')
        })


        test('shows pageType in label when not doc', () => {
            const el = renderSee({name: 'Logger', pageType: 'guide'})
            const link = el.querySelector('.doc-see-link')
            expect(link.textContent).toContain('See Logger')
            expect(link.textContent).toContain('(guide)')
        })


        test('shows section in label when provided', () => {
            const el = renderSee({name: 'Logger', pageType: 'doc', section: 'Methods'})
            const link = el.querySelector('.doc-see-link')
            expect(link.textContent).toContain('See Logger')
            expect(link.textContent).toContain('> Methods')
        })


        test('includes svg icon', () => {
            const el = renderSee({name: 'Logger', pageType: 'doc'})
            const link = el.querySelector('.doc-see-link')
            const svg = link.querySelector('svg')
            expect(svg).toBeTruthy()
        })

    })

})
