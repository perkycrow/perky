import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Layer from './layer.js'


export default doc('Layer', () => {

    text(`
        Base class for render layers. Layers are stacked render targets managed by
        RenderSystem. Subclassed by CanvasLayer and HTMLLayer.
        Supports viewport configuration with percentage or pixel values and anchor positioning.
    `)


    section('Creation', () => {

        text('Create a layer with optional display and viewport settings.')

        code('Default layer', () => {
            const layer = new Layer({$id: 'game'})
        })

        code('With options', () => {
            const layer = new Layer({
                $id: 'ui',
                zIndex: 10,
                visible: true,
                opacity: 0.8,
                pointerEvents: 'none'
            })
        })

    })


    section('Viewport', () => {

        text(`
            The viewport defines where the layer appears within its container.
            Values can be percentages or pixels. The anchor controls which corner
            the position is relative to.
        `)

        action('Full container (default)', () => {
            const layer = new Layer({$id: 'test'})
            const vp = layer.calculateViewport(800, 600)
            logger.log('x:', vp.x, 'y:', vp.y)
            logger.log('width:', vp.width, 'height:', vp.height)
        })

        action('Percentage viewport', () => {
            const layer = new Layer({
                $id: 'test',
                viewport: {x: 0, y: 0, width: '50%', height: '75%', anchor: 'top-left'}
            })
            const vp = layer.calculateViewport(800, 600)
            logger.log('width:', vp.width, '(50% of 800)')
            logger.log('height:', vp.height, '(75% of 600)')
        })

        action('Anchored to bottom-right', () => {
            const layer = new Layer({
                $id: 'minimap',
                viewport: {x: 10, y: 10, width: 200, height: 150, anchor: 'bottom-right'}
            })
            const vp = layer.calculateViewport(800, 600)
            logger.log('x:', vp.x, 'y:', vp.y)
            logger.log('width:', vp.width, 'height:', vp.height)
        })

    })


    section('Display Properties', () => {

        text('Control visibility, opacity, z-index, and pointer events. All methods return `this` for chaining.')

        action('setZIndex', () => {
            const layer = new Layer({$id: 'test'})
            layer.setZIndex(5)
            logger.log('zIndex:', layer.zIndex)
        })

        action('setVisible', () => {
            const layer = new Layer({$id: 'test'})
            layer.setVisible(false)
            logger.log('visible:', layer.visible)
        })

        action('setOpacity', () => {
            const layer = new Layer({$id: 'test'})
            layer.setOpacity(0.5)
            logger.log('opacity:', layer.opacity)
        })

        action('setPointerEvents', () => {
            const layer = new Layer({$id: 'test'})
            layer.setPointerEvents('none')
            logger.log('pointerEvents:', layer.pointerEvents)
        })

    })


    section('Mount and Unmount', () => {

        text('Layers are mounted to a DOM container and unmounted on disposal.')

        code('Mounting', () => {
            const container = document.getElementById('game-container')
            const layer = new Layer({$id: 'game'})
            layer.mount(container)
            layer.unmount()
        })

    })


    section('Resize', () => {

        text('Recalculates and applies the viewport when the container size changes.')

        action('Resize updates viewport', () => {
            const layer = new Layer({
                $id: 'test',
                viewport: {x: 0, y: 0, width: '50%', height: '50%', anchor: 'top-left'}
            })

            layer.resize(1000, 800)
            logger.log('width:', layer.resolvedViewport.width)
            logger.log('height:', layer.resolvedViewport.height)

            layer.resize(500, 400)
            logger.log('after resize - width:', layer.resolvedViewport.width)
            logger.log('after resize - height:', layer.resolvedViewport.height)
        })

    })

})
