import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import CanvasLayer from './canvas_layer.js'
import Group2D from './group_2d.js'
import Rectangle from './rectangle.js'
import Circle from './circle.js'


export default doc('CanvasLayer', () => {

    text(`
        Render layer that creates a \`<canvas>\` element and instantiates a renderer.
        Extends [[Layer@render]]. Supports both Canvas 2D and WebGL backends via the
        \`rendererType\` option. Managed by [[RenderSystem@render]].
    `)


    section('Creation', () => {

        text('Create a canvas layer with a renderer type and optional settings.')

        code('Canvas 2D layer', () => {
            const layer = new CanvasLayer({
                $id: 'game',
                rendererType: 'canvas',
                width: 800,
                height: 600,
                backgroundColor: '#1a1a2e'
            })
        })

        code('WebGL layer', () => {
            const layer = new CanvasLayer({
                $id: 'effects',
                rendererType: 'webgl',
                width: 800,
                height: 600,
                pixelRatio: 2
            })
        })

    })


    section('Content', () => {

        text(`
            Set the scene to render with \`setContent\`. The layer renders its content
            on each \`render()\` call. If the renderer has render groups, those take priority.
        `)

        action('setContent and render', () => {
            const layer = new CanvasLayer({
                $id: 'test',
                rendererType: 'canvas',
                width: 400,
                height: 300,
                backgroundColor: '#16213e'
            })

            const scene = new Group2D()
            scene.add(new Rectangle({width: 4, height: 2, color: '#e94560'}))

            layer.setContent(scene)
            layer.render()
            logger.log('content set and rendered')
        })

    })


    section('Resize', () => {

        text('Resizing recalculates the viewport and updates the renderer dimensions.')

        action('resize', () => {
            const layer = new CanvasLayer({
                $id: 'test',
                rendererType: 'canvas',
                width: 800,
                height: 600
            })

            logger.log('before:', layer.renderer.displayWidth, 'x', layer.renderer.displayHeight)
            layer.resize(1024, 768)
            logger.log('after:', layer.renderer.displayWidth, 'x', layer.renderer.displayHeight)
        })

    })


    section('Auto Render', () => {

        text(`
            When \`autoRender\` is true (default), [[RenderSystem@render]] calls \`render()\`
            on this layer automatically each frame. Set to false for manual control.
        `)

        code('Manual render', () => {
            const layer = new CanvasLayer({
                $id: 'game',
                rendererType: 'canvas',
                autoRender: false
            })

            const scene = new Group2D()
            scene.add(new Rectangle({width: 4, height: 2, color: '#e94560'}))

            layer.setContent(scene)
            layer.render()
        })

    })

})
