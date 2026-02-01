import {doc, section, text, code, see} from '../runtime.js'


export default doc('Block Renderers', {advanced: true}, () => {

    text(`
        Renderers for the doc tab's content blocks. Each function takes
        a block data object and returns a DOM element ready to insert
        into the page.
    `)


    section('renderText', () => {

        text(`
            Renders a text block. Parses the markdown content and
            returns a div with the resulting HTML.
        `)

        code('Usage', () => {
            const el = renderText({type: 'text', content: 'Hello **world**'})
        })

    })


    section('renderDisclaimer', () => {

        text(`
            Renders a disclaimer block. Similar to text but styled
            differently to stand out as a warning or notice.
        `)

        code('Usage', () => {
            const el = renderDisclaimer({type: 'disclaimer', content: 'Experimental feature'})
        })

    })


    section('renderCode', () => {

        text(`
            Renders a code block using the perky-code custom element.
            Accepts an optional extracted source string to override
            the block's own source.
        `)

        code('Usage', () => {
            const el = renderCode({type: 'code', title: 'Example', source: 'const x = 1'})

            const withExtracted = renderCode(block, 'overridden source')
        })

    })


    section('renderSee', () => {

        text(`
            Renders a cross-reference link to another doc page.
            Supports linking to specific page types (doc, api, test)
            and sections within a page.
        `)

        code('Usage', () => {
            const el = renderSee({
                type: 'see',
                name: 'Logger',
                pageType: 'api',
                section: 'Events'
            })
        })

        see('Parse Markdown', {section: 'Cross-References'})

    })

})
