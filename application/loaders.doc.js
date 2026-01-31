import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import {normalizeParams, replaceUrlFilename, removeFileExtension, loaders} from './loaders.js'


export default doc('Loaders', {advanced: true}, () => {

    text(`
        Built-in asset loaders for Perky applications.
        Each loader handles a specific asset type (image, json, audio, etc.) and is used
        by [[SourceManager@application]] to fetch and process assets from a [[Manifest@application]].
    `)


    section('Available Loaders', () => {

        text('The default loader registry maps asset types to loader functions.')

        code('Loader registry', () => {
            loaders.response    // fetch() wrapper, returns raw Response
            loaders.blob        // fetches as Blob
            loaders.image       // fetches and returns an Image element
            loaders.text        // fetches as text string
            loaders.json        // fetches and parses JSON
            loaders.arrayBuffer // fetches as ArrayBuffer
            loaders.audio       // returns deferred audio descriptor
            loaders.font        // loads a FontFace
            loaders.spritesheet // loads spritesheet JSON + images
            loaders.animator    // alias for json loader
        })

    })


    section('normalizeParams', () => {

        text('Normalizes loader input. Accepts either a URL string or an object with `url` and `config`.')

        action('String input', () => {
            const result = normalizeParams('/sprites/hero.png')
            logger.log('url:', result.url)
            logger.log('config:', JSON.stringify(result.config))
        })

        action('Object input', () => {
            const result = normalizeParams({
                url: '/data/levels.json',
                config: {credentials: 'include'}
            })
            logger.log('url:', result.url)
            logger.log('config:', JSON.stringify(result.config))
        })

    })


    section('URL Helpers', () => {

        text('Utility functions for manipulating asset URLs.')

        action('replaceUrlFilename', () => {
            const original = '/assets/sprites/hero.json'
            const replaced = replaceUrlFilename(original, 'hero.png')
            logger.log('original:', original)
            logger.log('replaced:', replaced)
        })

        action('removeFileExtension', () => {
            logger.log(removeFileExtension('hero.png'))
            logger.log(removeFileExtension('data.level.json'))
            logger.log(removeFileExtension('readme'))
        })

    })


    section('Custom Loaders', () => {

        text(`
            You can register custom loaders for new asset types.
            A loader is an async function that receives params (\`{url, config}\`) and returns the loaded source.
        `)

        code('Custom loader example', () => {
            const csvLoader = async ({url}) => {
                const response = await fetch(url)
                const content = await response.text()
                return content.split('\n').map(line => line.split(','))
            }

            // Register via SourceManager loaders
            app.loaders.set('csv', csvLoader)
        })

    })

})
