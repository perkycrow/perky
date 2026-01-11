import {describe, test, expect, vi} from 'vitest'


vi.mock('../../core/utils.js', () => ({
    toKebabCase: vi.fn(str => str.toLowerCase().replace(/\s+/g, '-'))
}))


describe('parse_markdown', () => {

    let parseMarkdown

    beforeEach(async () => {
        const module = await import('./parse_markdown.js')
        parseMarkdown = module.parseMarkdown
    })


    describe('inline formatting', () => {

        test('code with backticks', () => {
            const result = parseMarkdown('Use `code` here')
            expect(result).toContain('<code>code</code>')
        })


        test('bold with double asterisks', () => {
            const result = parseMarkdown('This is **bold** text')
            expect(result).toContain('<strong>bold</strong>')
        })


        test('italic with single asterisks', () => {
            const result = parseMarkdown('This is *italic* text')
            expect(result).toContain('<em>italic</em>')
        })


        test('multiple inline formats', () => {
            const result = parseMarkdown('Use `code` and **bold** and *italic*')
            expect(result).toContain('<code>code</code>')
            expect(result).toContain('<strong>bold</strong>')
            expect(result).toContain('<em>italic</em>')
        })

    })


    describe('paragraphs', () => {

        test('single paragraph', () => {
            const result = parseMarkdown('Hello world')
            expect(result).toBe('<p>Hello world</p>')
        })


        test('multiple paragraphs separated by blank lines', () => {
            const result = parseMarkdown('First paragraph\n\nSecond paragraph')
            expect(result).toBe('<p>First paragraph</p><p>Second paragraph</p>')
        })


        test('trims whitespace', () => {
            const result = parseMarkdown('  Hello world  ')
            expect(result).toBe('<p>Hello world</p>')
        })

        test('renders --- as hr', () => {
            const result = parseMarkdown('Before\n\n---\n\nAfter')
            expect(result).toBe('<p>Before</p><hr><p>After</p>')
        })

    })


    describe('lists', () => {

        test('unordered list', () => {
            const result = parseMarkdown('- Item 1\n- Item 2\n- Item 3')
            expect(result).toBe('<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>')
        })


        test('list with inline formatting', () => {
            const result = parseMarkdown('- Use `code` here\n- **Bold** item')
            expect(result).toContain('<li>Use <code>code</code> here</li>')
            expect(result).toContain('<li><strong>Bold</strong> item</li>')
        })


        test('paragraph followed by list', () => {
            const result = parseMarkdown('Some text\n\n- Item 1\n- Item 2')
            expect(result).toBe('<p>Some text</p><ul><li>Item 1</li><li>Item 2</li></ul>')
        })


        test('list followed by paragraph', () => {
            const result = parseMarkdown('- Item 1\n- Item 2\n\nSome text')
            expect(result).toBe('<ul><li>Item 1</li><li>Item 2</li></ul><p>Some text</p>')
        })


        test('text and list in same block (no blank line)', () => {
            const result = parseMarkdown('Properties:\n- Item 1\n- Item 2')
            expect(result).toBe('<p>Properties:</p><ul><li>Item 1</li><li>Item 2</li></ul>')
        })

    })


    describe('see links', () => {

        test('basic doc link [[Name]]', () => {
            const result = parseMarkdown('See [[PerkyModule]] for more')
            expect(result).toContain('class="doc-see-inline"')
            expect(result).toContain('PerkyModule</a>')
        })


        test('doc link with section [[Name#Section]]', () => {
            const result = parseMarkdown('See [[PerkyModule#Lifecycle]]')
            expect(result).toContain('PerkyModule > Lifecycle</a>')
        })


        test('guide link [[Name:guide]]', () => {
            const result = parseMarkdown('Read [[PerkyModule:guide]]')
            expect(result).toContain('guide')
            expect(result).toContain('PerkyModule</a>')
        })


        test('api link [[Name:api]]', () => {
            const result = parseMarkdown('Check [[PerkyModule:api]]')
            expect(result).toContain('core_perky_module_api.html')
        })


        test('multiple links in same text', () => {
            const result = parseMarkdown('See [[Registry]] and [[Notifier]]')
            expect(result).toContain('Registry</a>')
            expect(result).toContain('Notifier</a>')
        })


        test('doc link with category [[Name@category]]', () => {
            const result = parseMarkdown('See [[Application@application]]')
            expect(result).toContain('application_application.html')
            expect(result).toContain('Application</a>')
        })


        test('doc link with category and section [[Name@category#Section]]', () => {
            const result = parseMarkdown('See [[Game@game#Lifecycle]]')
            expect(result).toContain('game_game.html#lifecycle')
            expect(result).toContain('Game > Lifecycle</a>')
        })

    })


    describe('custom buildSeeUrl', () => {

        test('uses provided buildSeeUrl function', () => {
            const customBuildUrl = vi.fn(() => '/custom/url')
            const result = parseMarkdown('See [[Test]]', {buildSeeUrl: customBuildUrl})

            expect(customBuildUrl).toHaveBeenCalledWith('Test', 'doc', null, null)
            expect(result).toContain('href="/custom/url"')
        })


        test('passes category to buildSeeUrl', () => {
            const customBuildUrl = vi.fn(() => '/custom/url')
            parseMarkdown('See [[Game@game]]', {buildSeeUrl: customBuildUrl})

            expect(customBuildUrl).toHaveBeenCalledWith('Game', 'doc', null, 'game')
        })

    })

})
