import {doc, section, text, code} from '../doc/runtime.js'


export default doc('HubView', {advanced: true}, () => {

    text(`
        The main gallery view of the studio. Displays all available animators
        and scenes (game and custom) as grids of thumbnail cards. Provides
        import, export, selection, deletion, and conflict resolution. Mounts
        inside an [[AppLayout@editor/layout]] with a [[StorageInfo@studio/components]]
        header widget.
    `)


    section('setContext', () => {

        text(`
            Initializes the hub with the game manifest, animator configs, scene
            configs, and texture system. Can be called before or after the
            element connects to the DOM.
        `)

        code('Usage', () => {
            const hub = document.createElement('hub-view')

            hub.setContext({
                manifest,
                animators: {playerAnimator: config},
                scenes: {mainScene: sceneConfig},
                textureSystem
            })
        })

    })


    section('Cards', () => {

        text(`
            Animators and scenes are shown as cards with thumbnail previews.
            Each card is labeled by state: "New" for custom-only items,
            "Modified" for locally changed game items, and no badge for
            unmodified game items. The animator grid includes a "+" card
            that opens the [[PsdImporter@studio/components]] wizard.
        `)

    })


    section('Selection mode', () => {

        text(`
            The "Select" button toggles selection mode, which shows
            checkboxes on cards. Selected items can be exported as
            \`.perky\` files, reverted to the game version, or deleted
            from IndexedDB.
        `)

    })


    section('Conflict reconciliation', () => {

        text(`
            On render, the hub compares custom and game versions. If both
            changed independently, it opens the [[ConflictResolver@studio/components]]
            dialog. Synced versions (game is newer or equal) are auto-cleaned
            from local storage.
        `)

    })

})
