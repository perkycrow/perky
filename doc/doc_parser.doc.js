import {doc, section, text, code} from './runtime.js'


export default doc('Doc Parser', {advanced: true}, () => {

    text(`
        Parses .doc.js and .guide.js files to extract their block structure without executing them.
        Used by the discovery step to produce source JSON for the viewer.
    `)


    section('parseDocFile', () => {

        text(`
            Reads a doc file from disk and returns an array of extracted blocks.
            Each block has a type, title (if applicable), and its source code as a string.
        `)

        code('Basic usage', () => {
            const blocks = parseDocFile('/path/to/logger.doc.js')

            // [{type: 'code', title: 'Example', source: '...'}, ...]
        })

    })


    section('Block Types', () => {

        text(`
            The parser extracts code, action, container, and setup blocks.
            Text and section blocks are not extracted since they contain no executable source.
        `)

        code('Extracted block structure', () => {
            const codeBlock = {
                type: 'code',
                title: 'Basic usage',
                source: 'const x = 1\nconst y = 2'
            }

            const setupBlock = {
                type: 'setup',
                index: 0,
                source: 'logger.clear()'
            }
        })

    })


    section('Source Extraction', () => {

        text(`
            Block bodies are extracted from the AST, stripped of their surrounding braces,
            and dedented. Lines containing ctx.setApp() calls are filtered out since
            those are internal wiring not useful in the displayed source.
        `)

    })

})
