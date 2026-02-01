import {doc, section, text, code} from './runtime.js'


export default doc('Test Parser', {advanced: true}, () => {

    text(`
        Extracts test structure from .test.js files using Acorn. Produces
        structured metadata for the Test tab in the doc viewer.
    `)


    section('parseTestFile', () => {

        text(`
            Parses test source code into an AST and extracts all top-level
            describe blocks with their nested tests, hooks, and sub-describes.
        `)

        code('Usage', () => {
            const result = parseTestFile(source, '/core/logger.test.js')

            result.file                     // '/core/logger.test.js'
            result.describes[0].title       // 'Logger'
            result.describes[0].tests[0]    // {title, line, source}
        })

        code('Result structure', () => {
            const describe = {
                title: 'Logger',
                line: 5,
                beforeEach: {line: 6, source: '...'},
                afterEach: null,
                tests: [{title: 'log', line: 10, source: '...'}],
                describes: []
            }
        })

    })


    section('getTestsForFile', () => {

        text(`
            Higher-level wrapper around parseTestFile. Returns the parsed
            result if any describe blocks were found, or null otherwise.
        `)

        code('Usage', () => {
            const tests = getTestsForFile(source, '/core/logger.test.js')

            tests.describes.length // number of top-level describe blocks
        })

    })

})
