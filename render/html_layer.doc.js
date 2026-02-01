import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import HTMLLayer from './html_layer.js'
import Camera from './camera.js'


export default doc('HTMLLayer', () => {

    text(`
        DOM-based render layer for HTML elements positioned in world space.
        Extends [[Layer@render]]. Useful for labels, health bars, tooltips, or
        anything easier to build with HTML than canvas. Managed by [[RenderSystem@render]].
    `)


    section('Creation', () => {

        text('Create an HTML layer with optional content and class name.')

        code('Basic layer', () => {
            const layer = new HTMLLayer({$id: 'ui'})
        })

        code('With options', () => {
            const layer = new HTMLLayer({
                $id: 'labels',
                className: 'game-labels',
                zIndex: 10,
                pointerEvents: 'none'
            })
        })

    })


    section('Content', () => {

        text('Set the layer content as a string or DOM element.')

        action('String content', () => {
            const layer = new HTMLLayer({$id: 'test'})
            layer.setContent('<div style="color:#fff">Hello</div>')
            logger.log('innerHTML:', layer.div.innerHTML)
        })

        action('DOM element', () => {
            const layer = new HTMLLayer({$id: 'test'})
            const el = document.createElement('span')
            el.textContent = 'world'
            layer.setContent(el)
            logger.log('children:', layer.div.children.length)
        })

    })


    section('CSS Classes and Styles', () => {

        text('Manipulate classes and inline styles. All methods return `this` for chaining.')

        action('addClass / removeClass', () => {
            const layer = new HTMLLayer({$id: 'test'})
            layer.addClass('active').addClass('highlighted')
            logger.log('classes:', layer.div.className)
            layer.removeClass('highlighted')
            logger.log('after remove:', layer.div.className)
        })

        action('setStyle', () => {
            const layer = new HTMLLayer({$id: 'test'})
            layer.setStyle('background', '#1a1a2e')
            logger.log('background:', layer.div.style.background)
        })

    })


    section('World Elements', () => {

        text(`
            Place DOM elements at world coordinates. The layer converts world positions
            to screen positions using the camera and updates transforms each frame.
        `)

        action('createWorldElement / removeWorldElement', () => {
            const camera = new Camera({
                $id: 'main',
                viewportWidth: 800,
                viewportHeight: 600,
                unitsInView: 10
            })

            const layer = new HTMLLayer({$id: 'test', camera})
            const el = layer.createWorldElement('label', 0, 0)
            logger.log('world elements:', layer.worldElements.length)

            layer.removeWorldElement(el)
            logger.log('after remove:', layer.worldElements.length)
        })

        code('World element options', () => {
            const el = layer.createWorldElement('HP: 100', 5, 3, {
                offsetX: 0,
                offsetY: -20,
                autoCenter: true,
                pointerEvents: 'none'
            })
        })

    })


    section('Unit Conversion', () => {

        text('Convert between CSS pixels and world units using the camera.')

        action('cssToWorldUnits / worldUnitsToCss', () => {
            const camera = new Camera({
                $id: 'main',
                viewportWidth: 800,
                viewportHeight: 600,
                unitsInView: 10
            })

            const layer = new HTMLLayer({$id: 'test', camera})
            logger.log('100px in world:', layer.cssToWorldUnits(100))
            logger.log('1 unit in css:', layer.worldUnitsToCss(1))
        })

    })

})
