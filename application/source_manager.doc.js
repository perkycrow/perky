import {doc, section, text, code, action, container, logger} from '../doc/runtime.js'
import SourceManager from './source_manager.js'
import Manifest from './manifest.js'
import Registry from '../core/registry.js'


export default doc('SourceManager', () => {

    text(`
        Handles asset loading for Perky applications.
        Uses type-specific loaders to fetch and process assets from [[Manifest@application]].
        Extends [[PerkyModule]] and emits progress events during loading.
    `)


    section('Basic Usage', () => {

        text(`
            SourceManager requires a manifest (asset registry) and loaders (type-specific load functions).
            It's typically created automatically by [[Application@application]].
        `)

        code('Setup with Application', () => {
            // Application creates SourceManager internally:
            // app.sourceManager handles all asset loading
            // app.loadAsset(), app.loadTag(), app.loadAll() are delegated

            class MyGame extends Application {
                static manifest = {
                    assets: {
                        hero: {type: 'image', url: '/hero.png', tags: ['preload']}
                    }
                }
            }

            const game = new MyGame({$id: 'game'})
            game.preload() // Loads all 'preload' tagged assets
        })

    })


    section('Loading Methods', () => {

        text('Three methods for loading assets: single asset, by tag, or all assets.')

        code('loadAsset', () => {
            // Load a single asset by id
            app.loadAsset('hero').then(() => {
                const sprite = app.getSource('hero')
            })
        })

        code('loadTag', () => {
            // Load all assets with a specific tag
            app.loadTag('preload').then(() => {
                // All 'preload' tagged assets are now loaded
            })
        })

        code('loadAll', () => {
            // Load every asset in the manifest
            app.loadAll().then(() => {
                // All assets are now loaded
            })
        })

    })


    section('Loading Events', () => {

        text(`
            SourceManager emits events during the loading process.
            When installed on a host, events are prefixed with \`loader:\`.
        `)

        code('Event handling', () => {
            app.on('loader:progress', ({loaded, total, asset}) => {
                const percent = Math.round((loaded / total) * 100)
                logger.log(`Loading: ${percent}% - ${asset.id}`)
            })

            app.on('loader:complete', (assets) => {
                logger.log(`Loaded ${assets.length} assets`)
            })

            app.on('loader:error', ({asset, error}) => {
                logger.error(`Failed to load ${asset.id}:`, error)
            })
        })

    })


    section('Custom Loaders', () => {

        text(`
            Loaders are functions that receive asset params and return the loaded source.
            Each asset type needs a corresponding loader.
        `)

        code('Loader function signature', () => {
            // Loader receives: {url, config} for URL-based assets
            // or the full asset object for inline sources

            const imageLoader = async ({url}) => {
                return new Promise((resolve, reject) => {
                    const img = new Image()
                    img.onload = () => resolve(img)
                    img.onerror = reject
                    img.src = url
                })
            }

            const jsonLoader = async ({url}) => {
                const response = await fetch(url)
                return response.json()
            }

            const loaders = new Registry({
                image: imageLoader,
                json: jsonLoader
            })
        })

        code('Using custom loaders', () => {
            const manifest = new Manifest({
                data: {
                    assets: {
                        data: {type: 'json', url: '/data.json'}
                    }
                }
            })

            const sourceManager = new SourceManager({
                manifest,
                loaders: {
                    json: async ({url}) => {
                        const res = await fetch(url)
                        return res.json()
                    }
                }
            })
        })

    })


    section('Host Delegation', () => {

        text(`
            When installed on a host module, SourceManager delegates its methods.
            This allows the host to use \`loadAsset\`, \`loadTag\`, etc. directly.
        `)

        code('Delegated methods', () => {
            // When sourceManager.onInstall(host) is called:
            // - host.loadAsset()  -> sourceManager.loadAsset()
            // - host.loadTag()    -> sourceManager.loadTag()
            // - host.loadAll()    -> sourceManager.loadAll()
            // - host.loaders      -> sourceManager.loaders
        })

        code('Delegated events', () => {
            // Events are prefixed with 'loader:':
            // - loader:progress  -> progress during loading
            // - loader:complete  -> all requested assets loaded
            // - loader:error     -> asset failed to load
        })

    })

})
