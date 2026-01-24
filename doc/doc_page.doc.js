import {doc, section, text, code, container, see, logger} from './runtime.js'


export default doc('Doc Page', {advanced: true}, () => {

    text(`
        Web component that renders documentation pages.
        Handles doc, API, and test tabs with navigation and code highlighting.
    `)


    section('Usage', () => {

        text(`
            The doc-page element is used internally by the doc viewer.
            Set the doc property with a doc data structure.
        `)

        code('Basic usage', () => {
            const docPage = document.createElement('doc-page')
            docPage.doc = {
                title: 'My Module',
                blocks: [
                    {type: 'text', content: 'Introduction text.'}
                ]
            }
            document.body.appendChild(docPage)
        })

    })


    section('Properties', () => {

        text('The component accepts several properties to control rendering.')

        code('doc', () => {
            // Main documentation data
            docPage.doc = {
                title: 'Module Name',
                blocks: []
            }
        })

        code('api', () => {
            // API reference data (classes, methods, properties)
            docPage.api = {
                classes: [{name: 'MyClass', methods: []}],
                functions: [],
                constants: []
            }
        })

        code('tests', () => {
            // Test suite data for the tests tab
            docPage.tests = {
                describes: [{
                    title: 'MyClass',
                    tests: [{title: 'does something'}]
                }]
            }
        })

        code('sources', () => {
            // Extracted source code for actions/containers
            docPage.sources = {
                'action-0': 'logger.log("hello")',
                'container-1': 'ctx.hint("demo")'
            }
        })

        code('initialTab', () => {
            // Set which tab to show first
            docPage.initialTab = 'api' // 'doc', 'api', or 'test'
        })

    })


    section('Tabs', () => {

        text(`
            Doc pages can have up to three tabs depending on available data:
            - Doc: main documentation with text, code, actions, containers
            - API: auto-generated API reference from source
            - Test: test suite visualization
        `)

        code('Available tabs', () => {
            // availableTabs returns array of visible tabs
            const tabs = docPage.availableTabs

            // ['doc', 'api', 'test'] if all data present

            // activeTab returns current tab
            const current = docPage.activeTab
        })

    })


    section('Block Types', () => {

        text('The doc tab renders various block types.')

        code('text block', () => {
            const block = {type: 'text', content: 'Hello **world**'}
        })

        code('code block', () => {
            const block = {type: 'code', title: 'Example', source: 'const x = 1'}
        })

        code('action block', () => {
            const block = {type: 'action', title: 'Demo', source: '...', fn: () => {}}
        })

        code('container block', () => {
            const block = {
                type: 'container',
                height: 300,
                preset: 'interactive',
                fn: (ctx) => {}
            }
        })

        code('section block', () => {
            const block = {
                type: 'section',
                title: 'Overview',
                blocks: [],
                setup: null
            }
        })

        code('see block', () => {
            const block = {type: 'see', name: 'Logger', pageType: 'doc', section: null}
        })

        code('disclaimer block', () => {
            const block = {type: 'disclaimer', content: 'Experimental feature'}
        })

    })


    section('Styling', () => {

        text(`
            The component uses Shadow DOM with scoped styles.
            Styles are defined in doc_page.styles.js.
        `)

        see('Doc Runtime', {section: 'Container Presets'})

    })

})
