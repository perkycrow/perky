import {doc, section, text, code} from '../doc/runtime.js'
import {loadManifest, buildTextureSystem, collectAnimators, collectScenes, getStudioConfig, getBackgroundImage} from './launcher.js'


export default doc('Launcher', {advanced: true}, () => {

    text(`
        Shared utilities for studio entry points. Handles manifest loading,
        texture system construction, and animator collection. Used by both
        the hub ([[HubView@studio]]) and the animator editor
        ([[AnimatorView@studio/animator]]).
    `)


    section('loadManifest', () => {

        text(`
            Loads and resolves a game manifest. Optionally rewrites asset URLs
            with a base path prefix, then loads all sources via a
            [[SourceManager@application]].
        `)

        code('Usage', async () => {
            const manifest = await loadManifest(manifestData, '../game/')
        })

    })


    section('buildTextureSystem', () => {

        text(`
            Creates a [[TextureSystem@render/textures]] from a loaded manifest.
            Registers all image assets and spritesheets so they can be
            queried by name.
        `)

        code('Usage', () => {
            const textureSystem = buildTextureSystem(manifest)
        })

    })


    section('collectAnimators / collectScenes', () => {

        text(`
            Extract assets of a given type from the manifest into a plain object
            keyed by asset id. \`collectAnimators\` extracts animator assets,
            \`collectScenes\` extracts scene assets.
        `)

        code('Usage', () => {
            const animators = collectAnimators(manifest)
            const scenes = collectScenes(manifest)
        })

    })


    section('getStudioConfig / getBackgroundImage', () => {

        text(`
            Helper accessors for studio-specific manifest configuration.
            \`getStudioConfig\` reads the \`studio.<tool>\` config block.
            \`getBackgroundImage\` resolves the background asset source
            from the studio config.
        `)

        code('Usage', () => {
            const config = getStudioConfig(manifest, 'animator')
            const bgImage = getBackgroundImage(manifest, config)
        })

    })

})
