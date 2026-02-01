import {doc, section, text, code} from '../../doc/runtime.js'


export default doc('Animator View', {advanced: true}, () => {

    text(`
        The main animation editor view. A Web Component that provides a full
        editing interface for sprite animators: animation preview, timeline,
        frame editing, anchor settings, and auto-save to IndexedDB via
        [[PerkyStore@io]].
    `)


    section('setContext', () => {

        text(`
            Initializes the editor with game data. Receives the texture system,
            animator configuration, background image, and studio settings.
            Can be called before or after the element is connected to the DOM.
        `)

        code('Usage', () => {
            const view = document.createElement('animator-view')

            view.setContext({
                textureSystem,
                animatorConfig,
                animatorName: 'playerAnimator',
                backgroundImage: img,
                studioConfig: {unitsInView: {width: 7, height: 5}},
                isCustom: false,
                manifest
            })
        })

    })


    section('Editing workflow', () => {

        text(`
            The editor builds its UI from custom elements: an animation preview,
            a timeline for frame ordering, and side drawers for frame editing
            and animation settings. Frames are added by clicking regions in the
            spritesheet viewer. Changes are auto-saved after a 2-second debounce.
        `)

    })


    section('Saving and exporting', () => {

        text(`
            Custom animators save directly to IndexedDB. Game animators are
            forked on first edit — the spritesheet and config are copied to
            local storage so the original is preserved.

            Export to clipboard copies the anchor and animations as JavaScript
            code. Export as \`.perky\` creates a zip file with all assets.
        `)

    })

})
