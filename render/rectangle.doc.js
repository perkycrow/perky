import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Rectangle from './rectangle.js'


export default doc('Rectangle', () => {

    text(`
        A filled rectangle shape extending [[Object2D@render]].
        Use with [[Canvas2D@render]] or [[WebGLCanvas2D@render]] for rendering.
    `)


    section('Creation', () => {

        text('Create rectangles with size, color, and optional stroke.')

        code('Basic rectangle', () => {
            const rect = new Rectangle({
                width: 100,
                height: 50,
                color: '#e94560'
            })
        })

        code('With stroke', () => {
            const rect = new Rectangle({
                width: 100,
                height: 50,
                color: '#e94560',
                strokeColor: '#ffffff',
                strokeWidth: 2
            })
        })

        code('Positioned rectangle', () => {
            const rect = new Rectangle({
                x: 50,
                y: 30,
                width: 100,
                height: 50,
                color: '#0f3460'
            })
        })

    })


    section('Properties', () => {

        text('Rectangle-specific properties.')

        action('Dimensions', () => {
            const rect = new Rectangle({
                width: 100,
                height: 50,
                color: '#e94560'
            })
            logger.log('width:', rect.width)
            logger.log('height:', rect.height)

            rect.width = 200
            rect.height = 100
            logger.log('after resize:', rect.width, 'x', rect.height)
        })

        action('Colors', () => {
            const rect = new Rectangle({
                color: '#e94560',
                strokeColor: '#ffffff',
                strokeWidth: 2
            })
            logger.log('color:', rect.color)
            logger.log('strokeColor:', rect.strokeColor)
            logger.log('strokeWidth:', rect.strokeWidth)
        })

    })


    section('Bounds', () => {

        text('Get the bounding box, accounting for anchor point.')

        action('Default anchor (0.5, 0.5)', () => {
            const rect = new Rectangle({
                width: 100,
                height: 50
            })
            const bounds = rect.getBounds()
            logger.log('minX:', bounds.minX)
            logger.log('minY:', bounds.minY)
            logger.log('maxX:', bounds.maxX)
            logger.log('maxY:', bounds.maxY)
        })

        action('Top-left anchor (0, 0)', () => {
            const rect = new Rectangle({
                width: 100,
                height: 50,
                anchorX: 0,
                anchorY: 0
            })
            const bounds = rect.getBounds()
            logger.log('minX:', bounds.minX)
            logger.log('minY:', bounds.minY)
            logger.log('maxX:', bounds.maxX)
            logger.log('maxY:', bounds.maxY)
        })

    })


    section('Transforms', () => {

        text('Inherited from [[Object2D@render]]. Supports position, rotation, scale, and anchor.')

        code('Transform example', () => {
            const rect = new Rectangle({
                x: 100,
                y: 100,
                width: 50,
                height: 50,
                color: '#533483',
                rotation: Math.PI / 4,
                scaleX: 2,
                scaleY: 1.5,
                anchorX: 0.5,
                anchorY: 0.5
            })
        })

        action('Method chaining', () => {
            const rect = new Rectangle({width: 50, height: 50, color: '#e94560'})
            rect.setPosition(100, 100)
                .setRotation(Math.PI / 4)
                .setScale(2)
                .setOpacity(0.8)
            logger.log('x:', rect.x, 'y:', rect.y)
            logger.log('rotation:', rect.rotation)
            logger.log('scale:', rect.scaleX, rect.scaleY)
            logger.log('opacity:', rect.opacity)
        })

    })

})
