import {doc, section, text, code} from '../../doc/runtime.js'


export default doc('SceneView', {advanced: true}, () => {

    text(`
        The main scene editor view. A Web Component that provides a visual
        interface for placing and arranging entities in a scene: viewport with
        camera controls, entity selection and dragging, properties panel, and
        auto-save to IndexedDB via [[PerkyStore@io]].
    `)


    section('setContext', () => {

        text(`
            Initializes the editor with game data. Receives the manifest,
            texture system, scene configurations, and optional wiring for
            custom entity types. Can be called before or after the element
            connects to the DOM.
        `)

        code('Usage', () => {
            const view = document.createElement('scene-view')

            view.setContext({
                manifest,
                textureSystem,
                studioConfig: {camera: {width: 26, height: 15}},
                scenes: {level1: {entities: []}},
                sceneId: 'level1',
                wiring
            })
        })

    })


    section('Viewport controls', () => {

        text(`
            The viewport displays entities on a grid with axis lines and a
            camera frame showing the game's visible area. Pan with middle-click
            or right-click drag. Zoom with the scroll wheel. Click entities to
            select them, then drag to reposition.
        `)

    })


    section('Entity management', () => {

        text(`
            The properties panel shows coordinates for the selected entity and
            a delete button. The scene tree lists all entities. The palette
            offers typed entities from wiring and sprite entities from the
            manifest. New entities spawn at the camera center.
        `)

    })


    section('Undo and redo', () => {

        text(`
            All entity operations (add, move, delete) go through a
            CommandHistory stack. Undo with Ctrl+Z or the toolbar
            button. Redo with Ctrl+Shift+Z. Keyboard shortcuts also handle
            Delete and Backspace for removing selected entities.
        `)

    })


    section('Saving', () => {

        text(`
            Changes auto-save to IndexedDB after a 2-second debounce. The
            editor also flushes on window unload. Saved scenes are picked up
            by the game when running with the \`?studio\` URL parameter.
        `)

    })

})
