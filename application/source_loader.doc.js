import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import SourceLoader from './source_loader.js'
import Asset from './asset.js'


export default doc('SourceLoader', {advanced: true}, () => {

    text(`
        Handles the actual loading queue for a batch of assets.
        Takes a list of [[Asset@application]] instances and a set of type-specific loaders,
        then loads them in parallel while tracking progress.
        Used internally by [[SourceManager@application]].
    `)


    section('Basic Usage', () => {

        text('Create a SourceLoader with assets and loaders, then call `load()`.')

        code('Loading assets', () => {
            const assets = [
                new Asset({id: 'config', type: 'json', url: '/config.json'}),
                new Asset({id: 'hero', type: 'image', url: '/hero.png'})
            ]

            const loaders = {
                json: async ({url}) => (await fetch(url)).json(),
                image: async ({url}) => {
                    const img = new Image()
                    img.src = url
                    return img
                }
            }

            const loader = new SourceLoader(assets, loaders)

            loader.on('progress', (progress, {asset}) => {
                logger.log(`${Math.round(progress * 100)}% - loaded ${asset.id}`)
            })

            loader.on('complete', (loadedAssets) => {
                logger.log(`Done! Loaded ${loadedAssets.length} assets`)
            })

            loader.load()
        })

    })


    section('Progress Tracking', () => {

        text('Track loading progress with built-in properties.')

        action('Progress properties', () => {
            const assets = [
                new Asset({id: 'a', type: 'json', source: {ready: true}}),
                new Asset({id: 'b', type: 'json', url: '/b.json'}),
                new Asset({id: 'c', type: 'json', url: '/c.json'})
            ]

            const loader = new SourceLoader(assets, {json: async () => ({})})

            logger.log('assetCount:', loader.assetCount)
            logger.log('loadedCount:', loader.loadedCount)
            logger.log('progress:', loader.progress)
        })

    })


    section('Events', () => {

        text('SourceLoader emits events during the loading lifecycle.')

        code('Event handling', () => {
            const loader = new SourceLoader(assets, loaders)

            loader.on('progress', (progress, {asset, source}) => {
                // progress: number between 0 and 1
                // asset: the Asset that just loaded
                // source: the loaded data
            })

            loader.on('complete', (assets) => {
                // All assets finished loading
            })

            loader.on('error', (asset, error) => {
                // An asset failed to load
            })
        })

    })


    section('Deduplication', () => {

        text(`
            If the same asset is requested multiple times before it finishes loading,
            SourceLoader deduplicates the requests. Only one fetch is made per asset.
        `)

        code('Concurrent loads', () => {
            const asset = new Asset({id: 'hero', type: 'image', url: '/hero.png'})
            const loader = new SourceLoader([asset], loaders)

            // Both calls share the same underlying promise
            loader.loadAsset(asset)
            loader.loadAsset(asset)
        })

    })

})
