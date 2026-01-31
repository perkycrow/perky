import {doc, section, text, code} from '../doc/runtime.js'


export default doc('PerkyStore', {advanced: true}, () => {

    text(`
        IndexedDB wrapper for persistent resource storage. Each resource is packed into a
        compressed blob with metadata using [[Pack@pack]]. Used by Studio to save and
        manage custom assets like animators and spritesheets.
    `)


    section('Usage', () => {

        code('Basic workflow', async () => {
            const store = new PerkyStore()

            await store.save('playerAnimator', {
                type: 'animator',
                name: 'player',
                files: [
                    {name: 'playerAnimator.json', blob: jsonBlob},
                    {name: 'playerSpritesheet.json', blob: sheetBlob},
                    {name: 'player.png', blob: pngBlob}
                ]
            })

            const resource = await store.get('playerAnimator')
            resource.id        // 'playerAnimator'
            resource.type      // 'animator'
            resource.files     // [{name, blob}, ...]

            const all = await store.list()
            const animators = await store.list('animator')
        })

    })


    section('Saving and Retrieving', () => {

        text(`
            Resources are stored as compressed blobs in IndexedDB. Each resource requires
            a \`type\` and contains one or more files. The store adds a \`meta.json\` internally
            for tracking metadata.
        `)

        code('save and get', async () => {
            await store.save('heroAnimator', {
                type: 'animator',
                name: 'hero',
                files: [{name: 'heroAnimator.json', blob: configBlob}]
            })

            const resource = await store.get('heroAnimator')
            resource.name       // 'hero'
            resource.createdAt  // timestamp
            resource.updatedAt  // timestamp
        })

    })


    section('Listing', () => {

        text('List all resources or filter by type.')

        code('List resources', async () => {
            const all = await store.list()
            const animators = await store.list('animator')
        })

    })


    section('Import and Export', () => {

        text(`
            Export downloads a \`.perky\` file. Import reads one back in.
            The \`.perky\` format is a gzip-compressed bundle created by [[Pack@pack]].
        `)

        code('Export and import', async () => {
            await store.export('playerAnimator')

            const result = await store.import(file)
            result.id    // derived from meta.json name + type
            result.type  // 'animator'
            result.name  // 'player'
        })

    })


    section('Deleting', () => {

        text('Remove a resource by its id.')

        code('Delete a resource', async () => {
            await store.delete('playerAnimator')
        })

    })

})
