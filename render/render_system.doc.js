import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import RenderSystem from './render_system.js'


export default doc('RenderSystem', () => {

    text(`
        Manages cameras and layers for rendering. Creates a DOM container, handles
        resizing, and orchestrates render calls across all layers.
        Extends [[PerkyModule@core]]. Install it on an [[Application@application]]
        or use standalone.
    `)


    section('Creation', () => {

        text('Create a render system with optional dimensions, cameras, and layers.')

        code('Basic setup', () => {
            const renderSystem = new RenderSystem({
                width: 800,
                height: 600
            })
        })

        code('With layers', () => {
            const renderSystem = new RenderSystem({
                layers: [
                    {name: 'game', type: 'canvas'},
                    {name: 'ui', type: 'html'}
                ]
            })
        })

    })


    section('Cameras', () => {

        text(`
            A default "main" camera is created automatically unless you provide one.
            Create additional cameras for split-screen, minimaps, or UI layers.
        `)

        action('createCamera / getCamera', () => {
            const rs = new RenderSystem()
            const main = rs.getCamera('main')
            logger.log('main camera:', main.$id)

            rs.createCamera('minimap', {unitsInView: 50})
            const minimap = rs.getCamera('minimap')
            logger.log('minimap:', minimap.$id)
        })

        action('setCamera', () => {
            const rs = new RenderSystem()
            rs.setCamera('main', {unitsInView: 20, zoom: 2})
            const cam = rs.getCamera('main')
            logger.log('zoom:', cam.zoom)
        })

    })


    section('Layers', () => {

        text(`
            Layers are stacked render targets. Canvas layers use a \`<canvas>\` with
            a 2D or WebGL renderer. HTML layers host DOM elements in world space.
        `)

        action('createLayer / getLayer', () => {
            const rs = new RenderSystem()
            rs.createLayer('game', 'canvas', {backgroundColor: '#1a1a2e'})
            rs.createLayer('ui', 'html', {zIndex: 10})

            const game = rs.getLayer('game')
            const ui = rs.getLayer('ui')
            logger.log('game layer:', game.$id)
            logger.log('ui layer:', ui.$id)
        })

        action('removeLayer', () => {
            const rs = new RenderSystem()
            rs.createLayer('temp', 'canvas')
            logger.log('before:', rs.childrenByCategory('layer').length)
            rs.removeLayer('temp')
            logger.log('after:', rs.childrenByCategory('layer').length)
        })

        action('showLayer / hideLayer', () => {
            const rs = new RenderSystem()
            rs.createLayer('debug', 'canvas')
            rs.hideLayer('debug')
            logger.log('visible:', rs.getLayer('debug').visible)
            rs.showLayer('debug')
            logger.log('visible:', rs.getLayer('debug').visible)
        })

    })


    section('Rendering', () => {

        text(`
            Call \`render()\` to render all auto-render canvas layers and update
            all auto-update HTML layers. Use \`renderLayer()\` for a single layer.
        `)

        code('Render all', () => {
            renderSystem.render()
        })

        code('Render one layer', () => {
            renderSystem.renderLayer('game')
        })

    })


    section('Resizing', () => {

        text(`
            By default, the system auto-resizes when a resize event is emitted.
            Disable auto-resize for fixed dimensions.
        `)

        action('Manual resize', () => {
            const rs = new RenderSystem({width: 800, height: 600})
            rs.disableAutoResize()
            rs.resize(1024, 768)
            logger.log('width:', rs.layerWidth, 'height:', rs.layerHeight)
        })

    })

})
