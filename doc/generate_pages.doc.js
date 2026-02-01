import {doc, section, text, code, see} from './runtime.js'


export default doc('Generate Pages', {advanced: true}, () => {

    text(`
        Node.js script that reads the JSON indexes produced by [[Discovery]]
        and generates static HTML pages plus a sitemap. Used for pre-rendering
        and CDN deployment.
    `)


    section('What It Produces', () => {

        text(`
            For each doc entry, the script generates up to three HTML pages
            (doc, api, test) depending on available data. Guides get a single
            page each. A sitemap.xml is written at the end.
        `)

        see('Discovery', {section: 'What It Generates'})

    })


    section('Page Structure', () => {

        text(`
            Each page includes a sidebar with navigation, search, and the
            docs/guides switcher. The main content area renders the
            appropriate tab (doc, api, or test) as static HTML inside a
            noscript block for SEO. When JavaScript is available, the
            interactive viewer takes over.
        `)

    })


    section('Running', () => {

        text(`
            The script is meant to run after discovery and a Vite build.
            It reads from dist/doc/ and writes back to the same directory.
        `)

        code('Usage', () => {
            // node doc/generate_pages.js
        })

    })

})
