import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import {pack, unpack} from './pack.js'


export default doc('Pack', {advanced: true}, () => {

    text(`
        Binary file packing with gzip compression. Powers the \`.perky\` file format — a header
        with file metadata followed by concatenated blobs. Used by [[PerkyStore@perky_store]] to
        bundle resources for storage and export.
    `)


    section('pack', () => {

        text('Bundles multiple files into a single compressed blob. Each file needs a name and a blob.')

        action('Pack files', async () => {
            const files = [
                {name: 'data.json', blob: new Blob(['{"hello":"world"}'], {type: 'application/json'})},
                {name: 'readme.txt', blob: new Blob(['Hello'], {type: 'text/plain'})}
            ]

            const packed = await pack(files)
            logger.log('type:', packed.type)
            logger.log('size:', packed.size, 'bytes')
        })

        action('Pack without compression', async () => {
            const files = [
                {name: 'data.json', blob: new Blob(['{"key":"value"}'], {type: 'application/json'})}
            ]

            const packed = await pack(files, {compress: false})
            logger.log('uncompressed size:', packed.size, 'bytes')
        })

    })


    section('unpack', () => {

        text('Extracts files from a packed blob. Returns an array of `{name, blob}` objects.')

        action('Round-trip', async () => {
            const original = [
                {name: 'config.json', blob: new Blob(['{"fps":60}'], {type: 'application/json'})},
                {name: 'notes.txt', blob: new Blob(['test'], {type: 'text/plain'})}
            ]

            const packed = await pack(original)
            const extracted = await unpack(packed)

            for (const file of extracted) {
                const content = await file.blob.text()
                logger.log(file.name, '→', content)
            }
        })

    })


    section('File Format', () => {

        text(`
            The packed format is straightforward:

            1. A 4-byte uint32 header size
            2. A JSON header with file names, sizes, and MIME types
            3. Concatenated file blobs in order

            The whole thing is then gzip-compressed by default.
        `)

    })

})
