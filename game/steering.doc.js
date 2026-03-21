import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Entity from './entity.js'
import Steering from './steering.js'


export default doc('Steering', () => {

    text(`
        Component that adds steering behaviors to an entity.
        Provides methods for seek, flee, arrive, wander, and separation.
        Forces accumulate and are resolved via \`resolveForce()\`.
    `)


    section('Basic Usage', () => {

        text(`
            Attach to an entity to enable steering behaviors.
            Methods are delegated to the host entity.
        `)

        action('Seek a target', () => {
            const entity = new Entity({x: 0, y: 0})
            entity.create(Steering)

            const target = {x: 10, y: 5}
            entity.seek(target)

            const force = entity.resolveForce()
            logger.log('force.x:', force.x.toFixed(2))
            logger.log('force.y:', force.y.toFixed(2))
        })

        action('Flee from a target', () => {
            const entity = new Entity({x: 0, y: 0})
            entity.create(Steering)

            const threat = {x: 5, y: 0}
            entity.flee(threat)

            const force = entity.resolveForce()
            logger.log('force.x:', force.x.toFixed(2))
            logger.log('force.y:', force.y.toFixed(2))
        })

    })


    section('Arrive', () => {

        text(`
            Like seek, but slows down when approaching the target.
            The \`slowRadius\` parameter controls when deceleration begins.
        `)

        action('Arrive at target', () => {
            const entity = new Entity({x: 0, y: 0})
            entity.create(Steering)

            const target = {x: 0.5, y: 0}

            entity.arrive(target, 1, 2)
            const force = entity.resolveForce()
            logger.log('close to target:', force.x.toFixed(2))
        })

        action('Far from target', () => {
            const entity = new Entity({x: 0, y: 0})
            entity.create(Steering)

            const target = {x: 10, y: 0}

            entity.arrive(target, 1, 2)
            const force = entity.resolveForce()
            logger.log('far from target:', force.x.toFixed(2))
        })

    })


    section('Wander', () => {

        text(`
            Adds randomized movement for natural-looking behavior.
            The \`jitter\` parameter controls how much the direction changes.
        `)

        action('Wander behavior', () => {
            const entity = new Entity()
            entity.create(Steering)

            entity.wander(1, 0.5)
            const force1 = entity.resolveForce()
            logger.log('wander 1:', force1.x.toFixed(2), force1.y.toFixed(2))

            entity.wander(1, 0.5)
            const force2 = entity.resolveForce()
            logger.log('wander 2:', force2.x.toFixed(2), force2.y.toFixed(2))
        })

    })


    section('Separation', () => {

        text(`
            Pushes entities apart to avoid crowding.
            Pass an array of neighbors and a separation radius.
        `)

        action('Separate from neighbors', () => {
            const entity = new Entity({x: 0, y: 0})
            entity.create(Steering)

            const neighbors = [
                {x: 0.3, y: 0},
                {x: 0, y: 0.3}
            ]

            entity.separate(neighbors, 1, 1)
            const force = entity.resolveForce()
            logger.log('separation force:', force.x.toFixed(2), force.y.toFixed(2))
        })

    })


    section('Combining Forces', () => {

        text(`
            Multiple behaviors can be combined by calling them before resolving.
            Forces are weighted and accumulated, then normalized on resolve.
        `)

        action('Combined behaviors', () => {
            const entity = new Entity({x: 0, y: 0})
            entity.create(Steering)

            const target = {x: 10, y: 0}
            const threat = {x: 0, y: 5}

            entity.seek(target, 1)
            entity.flee(threat, 0.5)

            const force = entity.resolveForce()
            logger.log('combined force:', force.x.toFixed(2), force.y.toFixed(2))
        })

        action('Manual force', () => {
            const entity = new Entity()
            entity.create(Steering)

            entity.addForce({x: 1, y: 0}, 2)
            const force = entity.resolveForce()
            logger.log('force:', force.x.toFixed(2), force.y.toFixed(2))
        })

    })


    section('API', () => {

        code('Constructor', () => {
            const steering = new Steering()
        })

        code('Delegated to entity', () => {
            // entity.seek(target, weight?) - Move toward target
            // entity.flee(target, weight?) - Move away from target
            // entity.arrive(target, weight?, slowRadius?) - Seek with deceleration
            // entity.wander(weight?, jitter?) - Random movement
            // entity.separate(neighbors, weight?, radius?) - Avoid crowding
            // entity.addForce(direction, weight?) - Add custom force
            // entity.resolveForce() - Get accumulated force and reset
        })

    })

})
