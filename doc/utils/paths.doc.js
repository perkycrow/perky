import {doc, section, text, code} from '../runtime.js'


export default doc('Paths', {advanced: true}, () => {

    text(`
        URL helpers for the documentation system.
        Builds page URLs for docs, guides, API references, and test pages.
    `)


    section('buildDocUrl', () => {

        text(`
            Builds a URL for a documentation page.
            Resolves the name against the doc registry, falling back to a kebab-case convention.
        `)

        code('Basic usage', () => {
            buildDocUrl({name: 'Logger'})

            // → "core_logger.html"

            buildDocUrl({name: 'Logger', pageType: 'api'})

            // → "core_logger_api.html"

            buildDocUrl({name: 'Logger', section: 'Events'})

            // → "core_logger.html#events"
        })

        code('Guide URLs', () => {
            buildDocUrl({name: 'Foreword', pageType: 'guide'})

            // → "guide_foreword.html"
        })

    })


    section('getTabUrl', () => {

        text(`
            Returns the URL for a tab (doc, api, or test) based on the current page.
            Used by the doc page component to switch between tabs.
        `)

        code('Tab switching', () => {
            getTabUrl('doc')   // → "core_logger.html"
            getTabUrl('api')   // → "core_logger_api.html"
            getTabUrl('test')  // → "core_logger_test.html"
        })

    })


    section('docFileToHtml', () => {

        text(`
            Converts a doc file path to an HTML filename.
        `)

        code('Usage', () => {
            docFileToHtml('/core/logger.doc.js')

            // → "core_logger.html"

            docFileToHtml('/core/logger.doc.js', 'api')

            // → "core_logger_api.html"
        })

    })


    section('extractBaseName', () => {

        text(`
            Extracts the base name from an HTML filename by stripping suffixes.
        `)

        code('Usage', () => {
            extractBaseName('core_logger_api.html')

            // → "core_logger"

            extractBaseName('core_logger.html')

            // → "core_logger"
        })

    })

})
