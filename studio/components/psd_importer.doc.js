import {doc, section, text, code} from '../../doc/runtime.js'


export default doc('PSD Importer', {advanced: true}, () => {

    text(`
        A multi-step wizard for importing Photoshop files into the animator
        studio. Walks through file selection (drag-and-drop or file picker),
        preview with resize settings, and conversion. Saves the result to
        IndexedDB via [[PerkyStore@io]] and dispatches a \`complete\` event.
    `)


    section('open / close', () => {

        text(`
            \`open()\` resets the wizard to the drop step and shows the
            fullscreen overlay. \`close()\` hides it.
        `)

        code('Usage', () => {
            const importer = document.createElement('psd-importer')
            document.body.appendChild(importer)

            importer.open()
        })

    })


    section('setExistingNames', () => {

        text(`
            Provides a list of existing animator names so the importer can
            detect duplicates during the naming step. Comparison is
            case-insensitive.
        `)

        code('Usage', () => {
            importer.setExistingNames(['playerAnimator', 'enemyAnimator'])
        })

    })


    section('Conversion flow', () => {

        text(`
            After a PSD is loaded, the preview step shows the first frame,
            detected animations, and export settings (output size, resize
            mode, animator name). Clicking "Create Animator" runs the
            [[PsdConverter@io]] pipeline, saves the resulting spritesheet
            and config to IndexedDB, and dispatches a \`complete\` event
            with the result details.
        `)

    })

})
