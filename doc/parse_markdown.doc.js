import {doc, section, text, code, action, logger} from './runtime.js'
import {parseMarkdown} from './parse_markdown.js'


export default doc('Parse Markdown', {advanced: true}, () => {

    text(`
        Lightweight markdown parser for doc content.
        Converts a subset of markdown to HTML for rendering in doc pages.
    `)


    section('Supported Syntax', () => {

        text(`
            Handles the most common inline and block formatting:
            - \`**bold**\` → **bold**
            - \`*italic*\` → *italic*
            - Backtick inline code
            - Double-bracket cross-reference links
            - Unordered lists with \`- \` prefix
            - Horizontal rules with \`---\`
            - Paragraphs separated by blank lines
        `)

    })


    section('parseMarkdown', () => {

        text(`
            Takes a markdown string and returns an HTML string.
            Paragraphs are separated by double newlines.
        `)

        code('Basic usage', () => {
            parseMarkdown('Hello **world**')

            // → "<p>Hello <strong>world</strong></p>"

            parseMarkdown('Use `code` here')

            // → "<p>Use <code>code</code> here</p>"
        })

        action('Parse markdown', () => {
            const html = parseMarkdown(`
                First paragraph with **bold** and *italic*.

                Second paragraph with \`inline code\`.

                - Item one
                - Item two
            `)
            logger.log(html)
        })

    })


    section('Cross-References', () => {

        text(`
            Double-bracket syntax creates links to other doc pages.
            The link format supports page type, category, and section anchors.
        `)

        code('Link syntax', () => {
            // Basic link
            parseMarkdown('See [[Logger]]')

            // Link to API page
            parseMarkdown('See [[Logger:api]]')

            // Link with category
            parseMarkdown('See [[Application@application]]')

            // Link with section anchor
            parseMarkdown('See [[Logger#Events]]')
        })

    })

})
