import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import NavigationControl from './navigation_control.js'


export default doc('NavigationControl', {advanced: true}, () => {

    text(`
        Input control for mouse wheel and trackpad scroll events. Extends [[InputControl@input]]
        to handle delta values from wheel events and distinguish between mouse wheel scrolling,
        trackpad panning, and pinch-to-zoom.
    `)


    section('Basic Usage', () => {

        text(`
            Create a NavigationControl and update it with wheel event data.
        `)

        code('Create and update', () => {
            const nav = new NavigationControl({
                device: null,
                name: 'navigation'
            })

            nav.on('updated', (value) => {
                logger.log(`deltaX: ${value.deltaX}, deltaY: ${value.deltaY}`)
            })

            nav.setValue({deltaX: 0, deltaY: -120, deltaZ: 0})
        })

    })


    section('Delta Accessors', () => {

        text(`
            Convenience getters for the three delta axes.
        `)

        action('Read deltas', () => {
            const nav = new NavigationControl({
                device: null,
                name: 'scroll'
            })

            nav.setValue({deltaX: 5, deltaY: -120, deltaZ: 0})

            logger.log('deltaX:', nav.deltaX)
            logger.log('deltaY:', nav.deltaY)
            logger.log('deltaZ:', nav.deltaZ)
        })

    })


    section('Gesture Detection', () => {

        text(`
            NavigationControl can distinguish between mouse wheel scrolling,
            trackpad panning, and trackpad pinch-to-zoom gestures.
        `)

        action('Mouse wheel scroll', () => {
            const nav = new NavigationControl({
                device: null,
                name: 'navigation'
            })

            nav.setValue({deltaX: 0, deltaY: -120, deltaZ: 0})
            logger.log('isMouseWheelZoom:', nav.isMouseWheelZoom)
            logger.log('isTrackpadPan:', nav.isTrackpadPan)
            logger.log('isTrackpadPinchZoom:', nav.isTrackpadPinchZoom)
        })

        action('Trackpad pan', () => {
            const nav = new NavigationControl({
                device: null,
                name: 'navigation'
            })

            nav.setValue({deltaX: 3, deltaY: 5, deltaZ: 0})
            logger.log('isTrackpadPan:', nav.isTrackpadPan)
            logger.log('isMouseWheelZoom:', nav.isMouseWheelZoom)
        })

    })

})
