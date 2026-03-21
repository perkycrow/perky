import {doc, section, text, code} from '../doc/runtime.js'


export default doc('Tap Gesture', () => {

    text(`
        Multi-finger tap detection for touch devices. Triggers a callback
        when two or more fingers tap without significant movement.
    `)


    section('Usage', () => {

        text(`
            Create a TapGesture with an element and options.
            Call \`attach()\` to start listening for pointer events.
        `)

        code('Basic setup', () => {
            // const tap = new TapGesture(canvas, {
            //     onTap: (fingerCount) => {
            //         if (fingerCount === 2) {
            //             toggleGizmoMode()
            //         } else if (fingerCount === 3) {
            //             resetCamera()
            //         }
            //     }
            // })
            //
            // tap.attach()
            //
            // // When done:
            // tap.detach()
        })

    })


    section('Options', () => {

        text(`
            - \`onTap(fingerCount)\`: Called when a valid tap is detected
            - \`moveThreshold\`: Max pixels of movement before tap is cancelled (default: 10)
            - \`timeThreshold\`: Max milliseconds for the tap duration (default: 300)
        `)

        code('Custom thresholds', () => {
            // const tap = new TapGesture(canvas, {
            //     onTap: handleTap,
            //     moveThreshold: 15,
            //     timeThreshold: 500
            // })
        })

    })


    section('Detection Rules', () => {

        text(`
            A tap is triggered when:

            1. Two or more fingers touch the element
            2. All fingers are released
            3. No finger moved more than \`moveThreshold\` pixels
            4. Total gesture duration is under \`timeThreshold\` ms

            Single-finger taps are ignored (use standard click events instead).
        `)

    })

})
