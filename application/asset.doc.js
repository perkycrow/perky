import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Asset from './asset.js'


export default doc('Asset', {context: 'simple'}, () => {

    text(`
        Represents a loadable resource in a Perky application.
        Stores metadata (type, id, name, tags) and the loaded source data.
        Used by [[Manifest@application]] to manage application resources.
    `)


    section('Creation', () => {

        text('Create assets with type, id, and either a URL to load or inline source data.')

        action('From URL', () => {
            const asset = new Asset({
                id: 'hero',
                type: 'sprite',
                url: '/sprites/hero.png',
                tags: ['character', 'preload']
            })

            logger.log('id:', asset.id)
            logger.log('type:', asset.type)
            logger.log('url:', asset.url)
            logger.log('tags:', asset.tags)
            logger.log('loaded:', asset.loaded)
        })

        action('With inline source', () => {
            const asset = new Asset({
                id: 'config',
                type: 'json',
                source: {debug: true, volume: 0.8}
            })

            logger.log('id:', asset.id)
            logger.log('source:', asset.source)
            logger.log('loaded:', asset.loaded)
        })

        action('Auto-generated id', () => {
            const asset1 = new Asset({name: 'Player Sprite', type: 'sprite'})
            const asset2 = new Asset({type: 'audio'})

            logger.log('from name:', asset1.id)
            logger.log('from type:', asset2.id)
        })

    })


    section('Properties', () => {

        text('Assets have several properties for identification and configuration.')

        code('Available properties', () => {
            const asset = new Asset({
                id: 'hero',
                name: 'Hero Sprite',
                type: 'sprite',
                url: '/sprites/hero.png',
                tags: ['character', 'preload'],
                config: {frameWidth: 32, frameHeight: 32}
            })

            asset.id       // Unique identifier
            asset.name     // Display name (defaults to id)
            asset.type     // Asset type (sprite, audio, json, etc.)
            asset.url      // URL to load from
            asset.source   // Loaded data (null until loaded)
            asset.tags     // Array of tags for querying
            asset.config   // Extra configuration data
            asset.loaded   // Boolean: true if source is set
        })

    })


    section('Tags', () => {

        text('Tags allow grouping and querying assets.')

        action('hasTag', () => {
            const asset = new Asset({
                id: 'music',
                type: 'audio',
                tags: ['music', 'preload']
            })

            logger.log('has preload:', asset.hasTag('preload'))
            logger.log('has sfx:', asset.hasTag('sfx'))
        })

    })


    section('Loading State', () => {

        text('The `loaded` property indicates whether the asset has source data.')

        action('Check loaded state', () => {
            const unloaded = new Asset({
                id: 'sprite',
                type: 'image',
                url: '/sprite.png'
            })

            logger.log('before load:', unloaded.loaded)

            // Simulate loading
            unloaded.source = new Image()
            logger.log('after load:', unloaded.loaded)
        })

    })


    section('Export', () => {

        text('Export asset data for serialization.')

        action('export', () => {
            const asset = new Asset({
                id: 'hero',
                type: 'sprite',
                name: 'Hero',
                url: '/sprites/hero.png',
                tags: ['character'],
                config: {animated: true}
            })

            const exported = asset.export()
            logger.log('exported:', JSON.stringify(exported, null, 2))
        })

        action('Export with source', () => {
            const asset = new Asset({
                id: 'settings',
                type: 'json',
                source: {volume: 0.5}
            })

            const exported = asset.export()
            logger.log('exported:', JSON.stringify(exported, null, 2))
        })

    })

})
