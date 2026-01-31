import {doc, section, text, action, logger} from '../doc/runtime.js'
import SimpleCollisionDetector from './simple_collision_detector.js'


export default doc('SimpleCollisionDetector', () => {

    text(`
        Lightweight radius-based collision detector.
        Register bodies with a type and radius, then define callbacks per type pair.
        No shape math — just distance checks between positions.
    `)


    section('Adding Bodies', () => {

        action('Register bodies', () => {
            const detector = new SimpleCollisionDetector()

            const player = {position: {x: 0, y: 0}}
            const enemy = {position: {x: 30, y: 0}}

            detector.addBody(player, {type: 'player', radius: 20})
            detector.addBody(enemy, {type: 'enemy', radius: 20})

            logger.log('bodies:', detector.bodies.length)
        })

    })


    section('Collision Callbacks', () => {

        text('Register callbacks with onCollision(typeA, typeB, callback). They fire during detectCollisions().')

        action('Detect player-enemy collision', () => {
            const detector = new SimpleCollisionDetector()

            const player = {position: {x: 0, y: 0}}
            const enemy = {position: {x: 10, y: 0}}

            detector.addBody(player, {type: 'player', radius: 20})
            detector.addBody(enemy, {type: 'enemy', radius: 20})

            detector.onCollision('player', 'enemy', (a, b, info) => {
                logger.log('hit! distance:', info.distance.toFixed(1))
            })

            detector.detectCollisions()
        })

    })


    section('Enable and Disable', () => {

        text('Disable the detector to skip collision checks. Re-enable to resume.')

        action('Toggle detection', () => {
            const detector = new SimpleCollisionDetector()
            logger.log('enabled:', detector.enabled)

            detector.disable()
            logger.log('after disable:', detector.enabled)

            detector.enable()
            logger.log('after enable:', detector.enabled)
        })

    })


    section('Queries', () => {

        action('Get bodies by type', () => {
            const detector = new SimpleCollisionDetector()
            detector.addBody({position: {x: 0, y: 0}}, {type: 'bullet'})
            detector.addBody({position: {x: 10, y: 0}}, {type: 'bullet'})
            detector.addBody({position: {x: 50, y: 0}}, {type: 'enemy'})

            const bullets = detector.getBodiesOfType('bullet')
            logger.log('bullets:', bullets.length)
        })

        action('Get bodies near a point', () => {
            const detector = new SimpleCollisionDetector()
            detector.addBody({position: {x: 5, y: 5}}, {type: 'item'})
            detector.addBody({position: {x: 500, y: 500}}, {type: 'item'})

            const nearby = detector.getBodiesNear(0, 0, 50)
            logger.log('nearby:', nearby.length)
        })

    })


    section('Removing and Clearing', () => {

        action('Remove a body', () => {
            const detector = new SimpleCollisionDetector()
            const obj = {position: {x: 0, y: 0}}
            detector.addBody(obj, {type: 'player'})

            logger.log('before:', detector.bodies.length)
            detector.removeBody(obj)
            logger.log('after:', detector.bodies.length)
        })

        action('Clear all', () => {
            const detector = new SimpleCollisionDetector()
            detector.addBody({position: {x: 0, y: 0}})
            detector.addBody({position: {x: 10, y: 0}})
            detector.onCollision('default', 'default', () => {})

            detector.clear()
            logger.log('bodies:', detector.bodies.length)
            logger.log('callbacks:', detector.callbacks.size)
        })

    })

})
