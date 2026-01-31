import {doc, section, text, action, logger} from '../doc/runtime.js'
import {detectCollision, isBoxVsBox, isCircleVsCircle, isBoxVsCircle} from './collision_detector.js'
import BoxShape from './shapes/box_shape.js'
import CircleShape from './shapes/circle_shape.js'


export default doc('CollisionDetector', () => {

    text(`
        Pure functions for detecting collisions between shapes.
        Supports box-box, circle-circle, and box-circle pairs.
        Returns collision info (depth, normal, contact point) or null.
    `)


    section('Box vs Box', () => {

        action('Overlapping boxes', () => {
            const a = new BoxShape({width: 40, height: 40, x: 0, y: 0})
            const b = new BoxShape({width: 40, height: 40, x: 30, y: 0})
            const result = detectCollision(a, b)
            logger.log('depth:', result.depth)
            logger.log('normal:', result.normal)
            logger.log('contact:', result.contactPoint)
        })

        action('No collision', () => {
            const a = new BoxShape({width: 20, height: 20, x: 0, y: 0})
            const b = new BoxShape({width: 20, height: 20, x: 100, y: 0})
            logger.log('result:', detectCollision(a, b))
        })

    })


    section('Circle vs Circle', () => {

        action('Overlapping circles', () => {
            const a = new CircleShape({radius: 20, x: 0, y: 0})
            const b = new CircleShape({radius: 20, x: 30, y: 0})
            const result = detectCollision(a, b)
            logger.log('depth:', result.depth)
            logger.log('normal:', result.normal)
            logger.log('contact:', result.contactPoint)
        })

        action('No collision', () => {
            const a = new CircleShape({radius: 10, x: 0, y: 0})
            const b = new CircleShape({radius: 10, x: 50, y: 0})
            logger.log('result:', detectCollision(a, b))
        })

    })


    section('Box vs Circle', () => {

        action('Circle hitting box', () => {
            const box = new BoxShape({width: 60, height: 60, x: 0, y: 0})
            const circle = new CircleShape({radius: 15, x: 35, y: 0})
            const result = detectCollision(box, circle)
            logger.log('depth:', result.depth)
            logger.log('normal:', result.normal)
            logger.log('contact:', result.contactPoint)
        })

    })


    section('Shape Type Checks', () => {

        text('Helper functions to identify shape pair types.')

        action('Type checks', () => {
            const box = new BoxShape()
            const circle = new CircleShape()
            logger.log('box vs box:', isBoxVsBox(box, box))
            logger.log('circle vs circle:', isCircleVsCircle(circle, circle))
            logger.log('box vs circle:', isBoxVsCircle(box, circle))
        })

    })

})
