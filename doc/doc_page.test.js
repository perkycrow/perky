import {describe, test, expect, beforeEach, vi} from 'vitest'


vi.mock('../editor/editor_theme.js', () => ({
    buildEditorStyles: vi.fn((...args) => args.join('')),
    editorButtonStyles: '',
    editorScrollbarStyles: ''
}))

vi.mock('../editor/perky_code.js', () => ({}))

vi.mock('../core/logger.js', () => ({
    default: {
        log: vi.fn(),
        error: vi.fn(),
        spacer: vi.fn(),
        history: []
    }
}))

vi.mock('../core/utils.js', () => ({
    toKebabCase: vi.fn(str => str.toLowerCase().replace(/\s+/g, '-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase())
}))

vi.mock('./runtime.js', () => ({
    applyContainerPreset: vi.fn()
}))


describe('doc_page', () => {

    let DocPage

    beforeEach(async () => {
        if (!globalThis.customElements) {
            globalThis.customElements = {
                define: vi.fn(),
                get: vi.fn()
            }
        }

        if (!globalThis.HTMLElement) {
            globalThis.HTMLElement = class {
                attachShadow () {
                    return {
                        appendChild: vi.fn(),
                        querySelector: vi.fn(() => ({innerHTML: '', appendChild: vi.fn()})),
                        querySelectorAll: vi.fn(() => []),
                        getElementById: vi.fn(),
                        addEventListener: vi.fn()
                    }
                }
            }
        }

        const module = await import('./doc_page.js')
        DocPage = module.default
    })


    test('exports DocPage class', () => {
        expect(DocPage).toBeDefined()
        expect(typeof DocPage).toBe('function')
    })


    test('DocPage extends HTMLElement', () => {
        expect(DocPage.prototype).toBeInstanceOf(HTMLElement)
    })


    describe('properties', () => {

        test('doc getter and setter', () => {
            const page = new DocPage()
            expect(page.doc).toBeNull()

            const docData = {title: 'Test', blocks: []}
            page.doc = docData
            expect(page.doc).toBe(docData)
        })


        test('api getter and setter', () => {
            const page = new DocPage()
            expect(page.api).toBeNull()

            const apiData = {type: 'class', name: 'Test'}
            page.api = apiData
            expect(page.api).toBe(apiData)
        })


        test('sources getter and setter', () => {
            const page = new DocPage()
            expect(page.sources).toBeNull()

            const sources = [{type: 'code', title: 'Example', source: 'code'}]
            page.sources = sources
            expect(page.sources).toBe(sources)
        })


        test('tests getter and setter', () => {
            const page = new DocPage()
            expect(page.tests).toBeNull()

            const tests = {describes: []}
            page.tests = tests
            expect(page.tests).toBe(tests)
        })


        test('initialTab setter validates values', () => {
            const page = new DocPage()
            page.initialTab = 'api'
            page.initialTab = 'invalid'
        })

    })


    describe('see block rendering', () => {

        test('renderBlock handles see block type', () => {
            const page = new DocPage()
            const seeBlock = {
                type: 'see',
                name: 'ActionController',
                pageType: 'doc',
                section: null
            }

            page.doc = {
                title: 'Test',
                blocks: [seeBlock]
            }
        })

    })


    describe('inline see links in text', () => {

        test('parses [[Name]] as doc link', () => {
            const page = new DocPage()
            page.doc = {
                title: 'Test',
                blocks: [{
                    type: 'text',
                    content: 'See [[ActionController]] for more.'
                }]
            }
        })


        test('parses [[Name#Section]] as doc link with section', () => {
            const page = new DocPage()
            page.doc = {
                title: 'Test',
                blocks: [{
                    type: 'text',
                    content: 'See [[ActionController#Propagation]] for details.'
                }]
            }
        })


        test('parses [[Name:api]] as API link', () => {
            const page = new DocPage()
            page.doc = {
                title: 'Test',
                blocks: [{
                    type: 'text',
                    content: 'Check [[ActionController:api]] for methods.'
                }]
            }
        })


        test('parses [[Name:api#Section]] as API link with section', () => {
            const page = new DocPage()
            page.doc = {
                title: 'Test',
                blocks: [{
                    type: 'text',
                    content: 'See [[ActionController:api#methods]] for the full list.'
                }]
            }
        })


        test('parses [[Name:guide]] as guide link', () => {
            const page = new DocPage()
            page.doc = {
                title: 'Test',
                blocks: [{
                    type: 'text',
                    content: 'Read [[philosophy:guide]] for the overview.'
                }]
            }
        })


        test('parses multiple inline links in same text', () => {
            const page = new DocPage()
            page.doc = {
                title: 'Test',
                blocks: [{
                    type: 'text',
                    content: 'See [[ActionController]] and [[ActionDispatcher#Stack]].'
                }]
            }
        })

    })

})
