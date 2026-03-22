import {doc, section, text, code} from '../../doc/runtime.js'


export default doc('Scene Launcher', () => {

    text(`
        Entry point for the scene studio. Loads a game manifest, builds
        the texture system, fetches scene configs, and mounts a
        [[SceneView@studio/scene]] into the provided container.
    `)


    section('Usage', () => {

        code('Launching the scene studio', () => {
            // import {launchSceneStudio} from './launcher.js'
            //
            // await launchSceneStudio(manifestData, document.body, {
            //     basePath: '/game/',
            //     sceneId: 'level1',
            //     wiring: myWiring
            // })
        })

    })


    section('How It Works', () => {

        text(`
            1. Loads the manifest and resolves all asset sources
            2. Builds a [[TextureSystem@render/textures]] from the manifest's images and spritesheets
            3. Reads studio config from \`studio.scene\` in the manifest
            4. Collects scene assets from the manifest
            5. Checks [[PerkyStore@io]] for a custom override of the selected scene
            6. Creates a \`<scene-view>\` element and passes everything via \`setContext\`

            If no \`sceneId\` is provided, the first scene asset is used.
            Custom scenes saved in IndexedDB take priority over manifest scenes.
        `)

    })


    section('Options', () => {

        code('launchSceneStudio options', () => {
            // manifestData  — raw manifest JSON object
            // container     — DOM element to mount into
            // options.basePath — URL prefix for asset paths (optional)
            // options.sceneId  — scene to open (optional, defaults to first)
            // options.wiring   — Wiring instance for entity types (optional)
        })

    })

})
