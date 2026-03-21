import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Line from './line.js'


export default doc('Line', () => {

    text(`
        A 2D line extending [[Object2D@render]].
        Use with [[CanvasRenderer@render]] for rendering.
    `)


    section('Creation', () => {

        text('Create lines with endpoints, color, and line width.')

        code('Basic line', () => {
            const line = new Line({
                x2: 100,
                y2: 50,
                color: '#e94560'
            })
        })

        code('With custom width', () => {
            const line = new Line({
                x2: 100,
                y2: 50,
                color: '#e94560',
                lineWidth: 3
            })
        })

        code('Positioned line', () => {
            const line = new Line({
                x: 50,
                y: 50,
                x2: 150,
                y2: 100,
                color: '#0f3460'
            })
        })

    })


    section('Properties', () => {

        text('Line-specific properties.')

        action('Endpoints', () => {
            const line = new Line({
                x2: 100,
                y2: 50,
                color: '#e94560'
            })
            logger.log('x2:', line.x2)
            logger.log('y2:', line.y2)

            line.x2 = 200
            line.y2 = 100
            logger.log('after change:', line.x2, line.y2)
        })

        action('Color and width', () => {
            const line = new Line({
                x2: 100,
                y2: 50,
                color: '#e94560',
                lineWidth: 3
            })
            logger.log('color:', line.color)
            logger.log('lineWidth:', line.lineWidth)
        })

    })


    section('Bounds', () => {

        text(`
            Get the bounding box of the line, calculated from origin to (x2, y2).
        `)

        action('Positive coordinates', () => {
            const line = new Line({x2: 100, y2: 50})
            const bounds = line.getBounds()
            logger.log('minX:', bounds.minX)
            logger.log('minY:', bounds.minY)
            logger.log('maxX:', bounds.maxX)
            logger.log('maxY:', bounds.maxY)
            logger.log('size:', bounds.width, 'x', bounds.height)
        })

        action('Negative coordinates', () => {
            const line = new Line({x2: -50, y2: -30})
            const bounds = line.getBounds()
            logger.log('minX:', bounds.minX)
            logger.log('minY:', bounds.minY)
            logger.log('maxX:', bounds.maxX)
            logger.log('maxY:', bounds.maxY)
        })

    })


    section('Transforms', () => {

        text('Inherited from [[Object2D@render]]. Supports position, rotation, scale, and anchor.')

        code('Transform example', () => {
            const line = new Line({
                x: 100,
                y: 100,
                x2: 50,
                y2: 50,
                color: '#533483',
                rotation: Math.PI / 4,
                opacity: 0.8
            })
        })

    })

})
