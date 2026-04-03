import {doc, section, text, code} from '../../doc/runtime.js'


export default doc('AssetBrowserView', {advanced: true}, () => {

    text(`
        A studio tool for browsing game assets. Displays a searchable grid of
        assets from the manifest with previews. Extends [[StudioTool@studio]]
        with a simple browser interface.
    `)


    section('Usage', () => {

        text(`
            Create an AssetBrowserView and provide it with a manifest and
            texture system context. The view renders a grid of asset cards
            with previews and a search filter.
        `)

        code('Basic setup', () => {
            const browser = document.createElement('asset-browser-view')
            browser.setContext({
                manifest: gameManifest,
                textureSystem: textureSystem
            })
            document.body.appendChild(browser)
        })

    })


    section('Context', () => {

        text(`
            Call \`setContext()\` with the game manifest and texture system
            before the view initializes. The manifest provides asset metadata
            via \`listAssets()\` and source images via \`getSource()\`.
        `)

    })


    section('Search', () => {

        text(`
            The search input filters assets by ID. Filtering updates the grid
            in real-time as the user types.
        `)

    })


    section('Asset Cards', () => {

        text(`
            Each card shows a preview thumbnail, asset ID, and type. Image
            assets display their source with pixelated rendering for sprites.
        `)

    })

})
