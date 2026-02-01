import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import BaseRenderer from './base_renderer.js'


export default doc('BaseRenderer', {advanced: true}, () => {

    text(`
        Base class for [[CanvasRenderer@canvas_renderer]] and [[WebGLRenderer@webgl_renderer]].
        Manages the canvas element, pixel ratio, camera, auto-fit resizing, and container
        mounting. Both renderers share this interface.
    `)


    section('Creation', () => {

        text('Create a renderer with default or custom options.')

        action('Default renderer', () => {
            const renderer = new BaseRenderer()
            logger.log('width:', renderer.displayWidth)
            logger.log('height:', renderer.displayHeight)
            logger.log('pixel ratio:', renderer.pixelRatio)
        })

        action('With dimensions', () => {
            const renderer = new BaseRenderer({width: 800, height: 600})
            logger.log('width:', renderer.displayWidth)
            logger.log('height:', renderer.displayHeight)
        })

    })


    section('Pixel Ratio', () => {

        text(`
            The pixel ratio scales the internal canvas resolution while keeping the
            display size constant. A ratio of 2 renders at double resolution for
            sharper output on HiDPI displays.
        `)

        action('Set pixel ratio', () => {
            const renderer = new BaseRenderer({width: 400, height: 300})
            renderer.setPixelRatio(2)
            logger.log('display:', renderer.displayWidth, '×', renderer.displayHeight)
            logger.log('canvas:', renderer.canvas.width, '×', renderer.canvas.height)
        })

    })


    section('Resizing', () => {

        text('Resize the renderer and its camera. Emits a `resize` event.')

        action('Manual resize', () => {
            const renderer = new BaseRenderer({width: 100, height: 100})
            let resized = false
            renderer.on('resize', () => {
                resized = true
            })

            renderer.resize(640, 480)
            logger.log('new width:', renderer.displayWidth)
            logger.log('new height:', renderer.displayHeight)
            logger.log('event emitted:', resized)
        })

    })


    section('Auto-Fit', () => {

        text(`
            When \`autoFit\` is enabled and the renderer has a container, it uses a
            ResizeObserver to automatically resize whenever the container dimensions change.
        `)

        code('Enable auto-fit', () => {
            const renderer = new BaseRenderer({
                container: document.getElementById('game'),
                autoFit: true
            })
        })

    })


    section('Disposal', () => {

        text(`
            Disposing a renderer disconnects the auto-fit observer, removes the canvas
            from the DOM, and clears references.
        `)

        action('Dispose', () => {
            const renderer = new BaseRenderer({width: 100, height: 100})
            renderer.dispose()
            logger.log('canvas:', renderer.canvas)
            logger.log('camera:', renderer.camera)
        })

    })

})
