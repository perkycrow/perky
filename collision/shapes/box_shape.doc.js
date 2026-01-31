import {doc, section, text, action, logger} from '../../doc/runtime.js'
import BoxShape from './box_shape.js'


export default doc('BoxShape', () => {

    text(`
        Axis-aligned rectangular collision shape.
        Tracks position, size, and offset from a parent body.
        Supports scaled dimensions when attached to a body with scale.
    `)


    section('Creating a Box', () => {

        action('Default box', () => {
            const box = new BoxShape()
            logger.log('type:', box.type)
            logger.log('size:', box.width, 'x', box.height)
            logger.log('position:', box.x, box.y)
        })

        action('Custom box', () => {
            const box = new BoxShape({width: 60, height: 30, x: 10, y: 20})
            logger.log('size:', box.width, 'x', box.height)
            logger.log('position:', box.x, box.y)
        })

    })


    section('Bounds', () => {

        text('getBounds() returns the axis-aligned bounding box centered on the shape position.')

        action('Get bounds', () => {
            const box = new BoxShape({width: 40, height: 20, x: 10, y: 5})
            const bounds = box.getBounds()
            logger.log('left:', bounds.left, 'right:', bounds.right)
            logger.log('top:', bounds.top, 'bottom:', bounds.bottom)
            logger.log('center:', bounds.centerX, bounds.centerY)
        })

    })


    section('Point Testing', () => {

        action('Check if point is inside', () => {
            const box = new BoxShape({width: 40, height: 40, x: 0, y: 0})
            logger.log('(5, 5) inside:', box.containsPoint(5, 5))
            logger.log('(100, 100) inside:', box.containsPoint(100, 100))
        })

    })


    section('Updating from Body', () => {

        text('updateFromBody() syncs the shape position and scale with its parent body.')

        action('Sync with body', () => {
            const box = new BoxShape({width: 20, height: 20, offset: {x: 5, y: 0}})
            const body = {position: {x: 100, y: 50}, scale: {x: 2, y: 2}}

            box.updateFromBody(body)
            logger.log('position:', box.x, box.y)
            logger.log('scaled size:', box.scaledWidth, 'x', box.scaledHeight)
        })

    })


    section('Modifiers', () => {

        action('setSize and setOffset', () => {
            const box = new BoxShape()
            box.setSize(80, 40)
            logger.log('new size:', box.width, 'x', box.height)

            box.setOffset(10, -5)
            logger.log('offset:', box.offset)
        })

    })

})
