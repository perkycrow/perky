import {doc, section, text, code} from './runtime.js'


export default doc('Doc Registry', {advanced: true}, () => {

    text(`
        Lookup table for docs and guides. Maps identifiers to their metadata
        so the viewer can resolve cross-references from \`see\` blocks and \`[[ ]]\` links.
    `)


    section('initRegistry', () => {

        text(`
            Populates the registry with doc and guide entries. Call this once
            after loading docs.json. Docs are indexed by lowercase title,
            guides by both lowercase title and id.
        `)

        code('Usage', () => {
            initRegistry(docs, guides)
        })

    })


    section('lookupDoc', () => {

        text(`
            Returns the doc entry matching the given name (case-insensitive),
            or null if not found or the registry has not been initialized.
        `)

        code('Usage', () => {
            const entry = lookupDoc('Logger')
            entry.file     // '/core/logger.doc.js'
            entry.category // 'core'
        })

    })


    section('lookupGuide', () => {

        text(`
            Returns the guide entry matching the given name or id (case-insensitive),
            or null if not found.
        `)

        code('Usage', () => {
            const guide = lookupGuide('foreword')
            guide.title    // 'foreword'
            guide.category // 'prologue'
        })

    })


    section('isRegistryInitialized', () => {

        text(`
            Returns true if [[initRegistry]] has been called at least once.
            Useful for guarding lookups during early startup.
        `)

    })

})
