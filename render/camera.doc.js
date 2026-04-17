import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Camera from './camera.js'


export default doc('Camera', () => {

    text(`
        Viewport control for 2D rendering. Handles position, zoom, rotation,
        coordinate conversion, frustum culling, follow targets, animated transitions,
        and screen effects like shake.
    `)


    section('Basic Setup', () => {

        text(`
            Create a camera with a position, zoom level, and viewport size.
            \`unitsInView\` defines how many world units fit in the viewport.
        `)

        action('Camera properties', () => {
            const camera = new Camera({
                x: 0,
                y: 0,
                zoom: 1,
                unitsInView: 10,
                viewportWidth: 800,
                viewportHeight: 600
            })

            logger.log('Position:', camera.x, camera.y)
            logger.log('Zoom:', camera.zoom)
            logger.log('Pixels per unit:', camera.pixelsPerUnit)
        })

        code('Units in view modes', () => {
            // Height-based (default) — height fits 10 units, width adapts to aspect ratio
            new Camera({unitsInView: 10})

            // Width-based
            new Camera({unitsInView: {width: 16}})

            // Both — uses the smaller fit
            new Camera({unitsInView: {width: 16, height: 9}})
        })

    })


    section('Position and Zoom', () => {

        text('Move the camera and change zoom. Methods return the camera for chaining.')

        action('Set position and zoom', () => {
            const camera = new Camera({unitsInView: 10, viewportWidth: 800, viewportHeight: 600})

            camera.setPosition(5, 3)
            logger.log('Position:', camera.x, camera.y)

            camera.setZoom(2)
            logger.log('Zoom:', camera.zoom)
            logger.log('Pixels per unit:', camera.pixelsPerUnit)
        })

    })


    section('Coordinate Conversion', () => {

        text(`
            Convert between world coordinates (game units) and screen coordinates
            (pixels). Essential for input handling and UI positioning.
        `)

        action('World to screen', () => {
            const camera = new Camera({
                unitsInView: 10,
                viewportWidth: 800,
                viewportHeight: 600
            })

            const screen = camera.worldToScreen(0, 0)
            logger.log('World (0, 0) → Screen:', screen.x, screen.y)

            const screen2 = camera.worldToScreen(5, 3)
            logger.log('World (5, 3) → Screen:', screen2.x, screen2.y)
        })

        action('Screen to world', () => {
            const camera = new Camera({
                unitsInView: 10,
                viewportWidth: 800,
                viewportHeight: 600
            })

            const world = camera.screenToWorld(400, 300)
            logger.log('Screen (400, 300) → World:', world.x, world.y)

            const world2 = camera.screenToWorld(0, 0)
            logger.log('Screen (0, 0) → World:', world2.x.toFixed(2), world2.y.toFixed(2))
        })

    })


    section('Follow Target', () => {

        text(`
            Make the camera follow a target object. The \`speed\` parameter
            controls how quickly the camera catches up (0 = no movement, 1 = instant).
        `)

        code('Follow a player', () => {
            const camera = new Camera()

            camera.follow(player, 0.1)

            // In your update loop, call camera.update(deltaTime)
            // The camera lerps toward player.x, player.y

            camera.stopFollow()
        })

    })


    section('Animated Transitions', () => {

        text(`
            Smoothly animate the camera to a new position, zoom, or rotation.
            Uses easing functions from [[Easing@math]].
        `)

        code('Animate to position', () => {
            camera.animateTo({x: 10, y: 5, zoom: 2}, {
                duration: 1,
                easing: 'easeOutQuad',
                onComplete: () => logger.log('Transition done')
            })

            // Or transition to match another camera
            camera.transitionTo(otherCamera, {duration: 0.5})

            // Cancel mid-transition
            camera.cancelTransition()
        })

    })


    section('Screen Shake', () => {

        text('Apply a screen shake effect with configurable intensity and duration.')

        action('Shake parameters', () => {
            const camera = new Camera({unitsInView: 10})

            camera.shake({intensity: 0.5, duration: 0.3, decay: true})
            logger.log('Effects active:', camera.effects.length)

            camera.clearEffects()
            logger.log('Effects after clear:', camera.effects.length)
        })

        code('Custom effect', () => {
            // Animate is the low-level API for custom effects
            camera.animate((deltaTime, elapsed, total) => {
                camera.offsetZoom = Math.sin(elapsed * 10) * 0.1
                return elapsed >= total // return true when done
            }, {
                duration: 2,
                onComplete: () => {
                    camera.offsetZoom = 0
                }
            })
        })

    })


    section('Frustum Culling', () => {

        text(`
            Check whether an object's bounds are visible in the current viewport.
            Used by renderers to skip off-screen objects.
        `)

        action('Visibility check', () => {
            const camera = new Camera({
                unitsInView: 10,
                viewportWidth: 800,
                viewportHeight: 600
            })

            const visible = camera.isVisible({
                minX: -1, maxX: 1, minY: -1, maxY: 1, width: 2, height: 2
            })
            logger.log('Center object visible:', visible)

            const offscreen = camera.isVisible({
                minX: 100, maxX: 102, minY: 100, maxY: 102, width: 2, height: 2
            })
            logger.log('Far object visible:', offscreen)
        })

    })

})
