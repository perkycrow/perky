import {doc, section, setup, text, code, action, logger} from '../doc/runtime.js'
import Manifest from './manifest.js'


export default doc('Manifest', () => {

    text(`
        Manages application configuration and assets.
        Stores key-value config and an [[Asset]] registry with type/tag indexes.
        Extends [[PerkyModule]] and can be installed on a host to delegate its methods.
    `)


    section('Basic Usage', () => {

        text('Create a manifest with initial config and assets.')

        action('Create empty manifest', () => {
            const manifest = new Manifest()

            logger.log('config:', manifest.getConfig())
            logger.log('assets:', manifest.getAllAssets())
        })

        action('Create with data', () => {
            const manifest = new Manifest({
                data: {
                    config: {
                        title: 'My Game',
                        version: '1.0.0'
                    },
                    assets: {
                        hero: {type: 'sprite', url: '/sprites/hero.png'},
                        music: {type: 'audio', url: '/audio/theme.mp3'}
                    }
                }
            })

            logger.log('title:', manifest.getConfig('title'))
            logger.log('assets count:', manifest.getAllAssets().length)
        })

    })


    section('Configuration', () => {

        text('Store and retrieve configuration values using dot notation paths.')

        action('getConfig / setConfig', () => {
            const manifest = new Manifest()

            manifest.setConfig('game.title', 'My Game')
            manifest.setConfig('game.settings.difficulty', 'hard')

            logger.log('title:', manifest.getConfig('game.title'))
            logger.log('difficulty:', manifest.getConfig('game.settings.difficulty'))
            logger.log('all config:', manifest.getConfig())
        })

        action('Nested paths', () => {
            const manifest = new Manifest({
                data: {
                    config: {
                        display: {
                            width: 800,
                            height: 600,
                            fullscreen: false
                        }
                    }
                }
            })

            logger.log('width:', manifest.getConfig('display.width'))
            logger.log('display:', manifest.getConfig('display'))
        })

    })


    section('Managing Assets', () => {

        text(`
            Assets are stored in a [[Registry]] with indexes on \`type\` and \`tags\`.
            Each asset is an [[Asset]] instance with id, type, source, url, tags, and config.
        `)

        action('addAsset', () => {
            const manifest = new Manifest()

            const sprite = manifest.addAsset({
                id: 'player',
                type: 'sprite',
                url: '/sprites/player.png',
                tags: ['character', 'controllable']
            })

            logger.log('added:', sprite.id, sprite.type)
            logger.log('tags:', sprite.tags)
        })

        action('getAsset / getSource', () => {
            const manifest = new Manifest({
                data: {
                    assets: {
                        config: {
                            type: 'json',
                            source: {debug: true, level: 5}
                        }
                    }
                }
            })

            const asset = manifest.getAsset('config')
            logger.log('asset:', asset.id, asset.type)
            logger.log('source:', manifest.getSource('config'))
            logger.log('missing:', manifest.getAsset('unknown'))
        })

        action('hasAsset / removeAsset', () => {
            const manifest = new Manifest()
            manifest.addAsset({id: 'temp', type: 'data'})

            logger.log('has temp:', manifest.hasAsset('temp'))
            manifest.removeAsset('temp')
            logger.log('after remove:', manifest.hasAsset('temp'))
        })

    })


    section('Querying Assets', () => {

        setup(ctx => {
            ctx.manifest = new Manifest()
            ctx.manifest.addAsset({id: 'hero', type: 'sprite', tags: ['character']})
            ctx.manifest.addAsset({id: 'enemy', type: 'sprite', tags: ['character', 'hostile']})
            ctx.manifest.addAsset({id: 'theme', type: 'audio', tags: ['music']})
            ctx.manifest.addAsset({id: 'coin', type: 'audio', tags: ['sfx']})
        })

        text('Query assets by type or tag using the built-in indexes.')

        action('getAssetsByType', ctx => {
            const sprites = ctx.manifest.getAssetsByType('sprite')
            const audio = ctx.manifest.getAssetsByType('audio')

            logger.log('sprites:', sprites.map(a => a.id))
            logger.log('audio:', audio.map(a => a.id))
        })

        action('getAssetsByTag', ctx => {
            const characters = ctx.manifest.getAssetsByTag('character')
            const hostile = ctx.manifest.getAssetsByTag('hostile')

            logger.log('characters:', characters.map(a => a.id))
            logger.log('hostile:', hostile.map(a => a.id))
        })

        action('getAllAssets / getAssets', ctx => {
            const all = ctx.manifest.getAllAssets()
            logger.log('all assets:', all.map(a => a.id))
        })

    })


    section('Import / Export', () => {

        text('Serialize and restore manifest data as JSON.')

        action('export', () => {
            const manifest = new Manifest()
            manifest.setConfig('title', 'My Game')
            manifest.addAsset({id: 'hero', type: 'sprite', url: '/hero.png'})

            const exported = manifest.export()
            logger.log('exported:', JSON.stringify(exported, null, 2))
        })

        action('import (object)', () => {
            const manifest = new Manifest()

            manifest.import({
                config: {title: 'Imported Game'},
                assets: {
                    player: {type: 'sprite', url: '/player.png'}
                }
            })

            logger.log('title:', manifest.getConfig('title'))
            logger.log('player:', manifest.getAsset('player').url)
        })

        action('import (JSON string)', () => {
            const manifest = new Manifest()
            const json = '{"config":{"version":"2.0"},"assets":{}}'

            manifest.import(json)
            logger.log('version:', manifest.getConfig('version'))
        })

    })


    section('Host Delegation', () => {

        text(`
            When installed on a host module, Manifest delegates its methods.
            This allows the host to use \`getConfig\`, \`addAsset\`, etc. directly.
        `)

        code('Delegated methods', () => {
            // When manifest.onInstall(host) is called:
            // - host.getConfig()     -> manifest.getConfig()
            // - host.setConfig()     -> manifest.setConfig()
            // - host.addAsset()      -> manifest.addAsset()
            // - host.getAsset()      -> manifest.getAsset()
            // - host.getAssets()     -> manifest.getAssets()
            // - host.getAssetsByType() -> manifest.getAssetsByType()
            // - host.getAssetsByTag()  -> manifest.getAssetsByTag()
            // - host.getSource()     -> manifest.getSource()
            // - host.getAllAssets()  -> manifest.getAllAssets()
            // - host.exportManifest() -> manifest.export()
            // - host.importManifest() -> manifest.import()
        })

    })


})
