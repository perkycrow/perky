import {doc, section, text, code} from '../../../doc/runtime.js'


export default doc('Anchor Editor', {advanced: true}, () => {

    text(`
        UI builder for editing a sprite's anchor point. Provides a visual
        preview with drag-to-position and numeric X/Y inputs. Used by
        [[AnimatorView@studio/animator]] in the settings drawer.
    `)


    section('buildAnchorEditor', () => {

        text(`
            Creates the full anchor editing panel: a canvas preview with a
            draggable handle and two number inputs for precise control. Returns
            the container element plus \`syncInputs()\` and \`updatePreview()\`
            methods for external updates.
        `)

        code('Usage', () => {
            const {container, syncInputs, updatePreview} = buildAnchorEditor(
                spritesheet,
                {x: 0.5, y: 0},
                (anchor) => save(anchor)
            )

            syncInputs()
            updatePreview()
        })

    })


    section('buildAnchorPreview', () => {

        text(`
            Creates just the canvas preview with a draggable anchor handle.
            Draws the first frame of the spritesheet scaled to fit and positions
            the handle at the current anchor coordinates.
        `)

    })


    section('setupAnchorDrag', () => {

        text(`
            Wires pointer events on the canvas and handle to enable
            click-to-place and drag-to-move for the anchor. Coordinates
            are clamped to [0, 1] and rounded to two decimal places.
        `)

    })


    section('buildAnchorInputs', () => {

        text(`
            Creates a row of two \`number-input\` elements for X and Y,
            configured with step 0.01 and range [0, 1]. Calls the
            onChange callback with the axis name and new value.
        `)

    })

})
