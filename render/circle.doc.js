import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Circle from './circle.js'


export default doc('Circle', () => {

    text(`
        A filled circle shape extending [[Object2D@render]].
        Use with [[CanvasRenderer@render]] or [[WebGLRenderer@render]] for rendering.
    `)


    section('Creation', () => {

        text('Create circles with radius, color, and optional stroke.')

        code('Basic circle', () => {
            const circle = new Circle({
                radius: 25,
                color: '#e94560'
            })
        })

        code('With stroke', () => {
            const circle = new Circle({
                radius: 25,
                color: '#e94560',
                strokeColor: '#ffffff',
                strokeWidth: 2
            })
        })

        code('Positioned circle', () => {
            const circle = new Circle({
                x: 100,
                y: 100,
                radius: 30,
                color: '#0f3460'
            })
        })

    })


    section('Properties', () => {

        text('Circle-specific properties.')

        action('Radius', () => {
            const circle = new Circle({
                radius: 25,
                color: '#e94560'
            })
            logger.log('radius:', circle.radius)

            circle.radius = 50
            logger.log('after resize:', circle.radius)
        })

        action('setRadius', () => {
            const circle = new Circle({radius: 10, color: '#e94560'})
            circle.setRadius(30)
            logger.log('radius:', circle.radius)
        })

        action('Colors', () => {
            const circle = new Circle({
                radius: 25,
                color: '#e94560',
                strokeColor: '#ffffff',
                strokeWidth: 3
            })
            logger.log('color:', circle.color)
            logger.log('strokeColor:', circle.strokeColor)
            logger.log('strokeWidth:', circle.strokeWidth)
        })

    })


    section('Bounds', () => {

        text(`
            Get the bounding box. The bounds form a square with side length
            equal to the diameter (radius * 2).
        `)

        action('Default anchor (0.5, 0.5)', () => {
            const circle = new Circle({radius: 25})
            const bounds = circle.getBounds()
            logger.log('minX:', bounds.minX)
            logger.log('minY:', bounds.minY)
            logger.log('maxX:', bounds.maxX)
            logger.log('maxY:', bounds.maxY)
            logger.log('size:', bounds.width, 'x', bounds.height)
        })

        action('Top-left anchor (0, 0)', () => {
            const circle = new Circle({
                radius: 25,
                anchorX: 0,
                anchorY: 0
            })
            const bounds = circle.getBounds()
            logger.log('minX:', bounds.minX)
            logger.log('minY:', bounds.minY)
            logger.log('maxX:', bounds.maxX)
            logger.log('maxY:', bounds.maxY)
        })

    })


    section('Transforms', () => {

        text('Inherited from [[Object2D@render]]. Supports position, rotation, scale, and anchor.')

        code('Transform example', () => {
            const circle = new Circle({
                x: 100,
                y: 100,
                radius: 30,
                color: '#533483',
                scaleX: 2,
                scaleY: 1,
                opacity: 0.8
            })
        })

        action('Method chaining', () => {
            const circle = new Circle({radius: 20, color: '#e94560'})
            circle.setPosition(50, 50)
                .setRadius(30)
                .setScale(1.5)
                .setOpacity(0.9)
            logger.log('position:', circle.x, circle.y)
            logger.log('radius:', circle.radius)
            logger.log('scale:', circle.scaleX, circle.scaleY)
            logger.log('opacity:', circle.opacity)
        })

    })

})
