import {doc, section, text, action, logger} from '../../doc/runtime.js'
import CircleShape from './circle_shape.js'


export default doc('CircleShape', () => {

    text(`
        Circular collision shape defined by a radius.
        Tracks position and offset from a parent body.
        Scales using the larger of the body's x/y scale.
    `)


    section('Creating a Circle', () => {

        action('Default circle', () => {
            const circle = new CircleShape()
            logger.log('type:', circle.type)
            logger.log('radius:', circle.radius)
            logger.log('position:', circle.x, circle.y)
        })

        action('Custom circle', () => {
            const circle = new CircleShape({radius: 25, x: 10, y: -5})
            logger.log('radius:', circle.radius)
            logger.log('position:', circle.x, circle.y)
        })

    })


    section('Bounds', () => {

        text('getBounds() returns the axis-aligned bounding box around the circle.')

        action('Get bounds', () => {
            const circle = new CircleShape({radius: 20, x: 5, y: 5})
            const bounds = circle.getBounds()
            logger.log('left:', bounds.left, 'right:', bounds.right)
            logger.log('top:', bounds.top, 'bottom:', bounds.bottom)
            logger.log('size:', bounds.width, 'x', bounds.height)
        })

    })


    section('Point Testing', () => {

        action('Check if point is inside', () => {
            const circle = new CircleShape({radius: 20, x: 0, y: 0})
            logger.log('(5, 5) inside:', circle.containsPoint(5, 5))
            logger.log('(100, 100) inside:', circle.containsPoint(100, 100))
        })

    })


    section('Updating from Body', () => {

        text('updateFromBody() syncs position and computes scaled radius from the body scale.')

        action('Sync with body', () => {
            const circle = new CircleShape({radius: 10, offset: {x: 5, y: 0}})
            const body = {position: {x: 50, y: 30}, scale: {x: 1, y: 3}}

            circle.updateFromBody(body)
            logger.log('position:', circle.x, circle.y)
            logger.log('scaled radius:', circle.scaledRadius)
        })

    })


    section('Modifiers', () => {

        action('setRadius and setOffset', () => {
            const circle = new CircleShape()
            circle.setRadius(50)
            logger.log('new radius:', circle.radius)

            circle.setOffset(3, -3)
            logger.log('offset:', circle.offset)
        })

    })

})
