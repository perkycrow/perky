import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import {applyOverrides, loadStudioOverrides} from './manifest_patcher.js'


export default doc('ManifestPatcher', {advanced: true}, () => {

    text(`
        Bridges Studio and the game at runtime. Loads custom assets from IndexedDB
        via [[PerkyStore@perky_store]] and patches them into the game manifest so they
        override the built-in versions. Used by games that support the \`?studio\` URL parameter.
    `)


    section('applyOverrides', () => {

        text('Applies a list of overrides to a manifest data object. Each override replaces the source of a matching asset by id.')

        action('Override an asset', () => {
            const manifest = {
                assets: {
                    player: {type: 'spritesheet', source: '/assets/player.json'},
                    enemy: {type: 'spritesheet', source: '/assets/enemy.json'}
                }
            }

            const overrides = [
                {id: 'player', source: {custom: true}}
            ]

            const patched = applyOverrides(manifest, overrides)
            logger.log('player source:', JSON.stringify(patched.assets.player.source))
            logger.log('enemy source:', patched.assets.enemy.source)
        })

        action('Non-matching overrides are ignored', () => {
            const manifest = {
                assets: {
                    player: {type: 'spritesheet', source: '/assets/player.json'}
                }
            }

            const overrides = [
                {id: 'unknown', source: {custom: true}}
            ]

            const patched = applyOverrides(manifest, overrides)
            logger.log('player unchanged:', patched.assets.player.source)
            logger.log('unknown added:', patched.assets.unknown === undefined)
        })

    })


    section('loadStudioOverrides', () => {

        text(`
            Reads all animator and scene resources from [[PerkyStore@perky_store]], extracts their
            configuration files, and builds an override list. Each animator produces an
            override for its config, and optionally one for its spritesheet if present.
            Each scene produces an override for its config.
        `)

        code('Typical usage', async () => {
            const overrides = await loadStudioOverrides()
            const patchedManifest = applyOverrides(originalManifest, overrides)
        })

    })

})
