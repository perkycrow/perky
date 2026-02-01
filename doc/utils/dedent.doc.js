import {doc, section, text, code, action, logger} from '../runtime.js'
import {dedent, dedentSource} from './dedent.js'


export default doc('Dedent', {advanced: true}, () => {

    text(`
        Removes common leading whitespace from multi-line strings.
        Used by the doc runtime to clean up template literals in text and code blocks.
    `)


    section('dedent', () => {

        text(`
            Strips the smallest shared indentation from all lines.
            Empty leading and trailing lines are trimmed by default.
        `)

        code('Basic usage', () => {
            const result = dedent(`
                hello
                world
            `)

            // → "hello\nworld"
        })

        action('Dedent a string', (ctx) => {
            const result = dedent(`
                first line
                    indented line
                back to base
            `)
            logger.log(result)
        })

    })


    section('Options', () => {

        text(`
            Pass an options object to control trimming and first-line behavior.
        `)

        code('trimEmptyLines', () => {
            // Default: true — removes empty leading/trailing lines
            dedent('\n    hello\n', {trimEmptyLines: false})
        })

        code('preserveFirstLine', () => {
            // Default: false — when true, the first line keeps its original indent
            dedent('first\n    second\n    third', {preserveFirstLine: true})
        })

    })


    section('dedentSource', () => {

        text(`
            Shortcut for dedenting source code.
            Preserves the first line and does not trim empty lines.
        `)

        code('Usage', () => {
            const source = dedentSource('function foo() {\n    return 1\n}')
        })

    })

})
