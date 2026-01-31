import {doc, section, text, action, logger} from '../doc/runtime.js'
import CollisionSystem from './collision_system.js'
import BoxShape from './shapes/box_shape.js'


export default doc('CollisionSystem', () => {

    text(`
        Manages a collection of collision bodies with gravity, detection, and resolution.
        Supports brute-force and spatial-grid detection strategies.
        Bodies can be dynamic or static.
    `)


    section('Adding Bodies', () => {

        text('Use addBody() to register objects. Each gets a collision shape and physics properties.')

        action('Add dynamic and static bodies', () => {
            const system = new CollisionSystem({gravity: {x: 0, y: 0}})

            const objectA = {position: {x: 0, y: 0}, constructor: {name: 'Entity'}}
            const objectB = {position: {x: 50, y: 0}, constructor: {name: 'Entity'}}

            system.addBody(objectA, {mass: 1})
            system.addBody(objectB, {isStatic: true})

            logger.log('dynamic bodies:', system.collisionBodies.length)
            logger.log('static bodies:', system.staticBodies.length)
        })

    })


    section('Removing Bodies', () => {

        action('Remove a body', () => {
            const system = new CollisionSystem({gravity: {x: 0, y: 0}})
            const object = {position: {x: 0, y: 0}, constructor: {name: 'Entity'}}

            system.addBody(object)
            logger.log('before:', system.collisionBodies.length)

            system.removeBody(object)
            logger.log('after:', system.collisionBodies.length)
        })

    })


    section('Gravity', () => {

        text('Gravity is applied to dynamic bodies each update. Default is {x: 0, y: -800}.')

        action('Set custom gravity', () => {
            const system = new CollisionSystem()
            logger.log('default:', system.gravity)

            system.setGravity(0, -400)
            logger.log('updated:', system.gravity)
        })

    })


    section('Collision Callback', () => {

        text('Use setCollisionCallback() to be notified when two bodies collide.')

        action('Register callback', () => {
            const system = new CollisionSystem({gravity: {x: 0, y: 0}})

            system.setCollisionCallback((a, b, collision) => {
                logger.log('collision between bodies, depth:', collision.depth)
            })

            const objectA = {position: {x: 0, y: 0}, constructor: {name: 'Entity'}}
            const objectB = {position: {x: 20, y: 0}, constructor: {name: 'Entity'}}

            system.addBody(objectA)
            system.addBody(objectB)
            system.detectCollisions()
        })

    })


    section('Spatial Queries', () => {

        text('Query bodies by point, radius, or axis-aligned bounding box.')

        action('Query by point', () => {
            const system = new CollisionSystem({gravity: {x: 0, y: 0}})

            const object = {position: {x: 0, y: 0}, constructor: {name: 'Entity'}}
            system.addBody(object)

            const hits = system.queryPoint(0, 0)
            logger.log('bodies at (0,0):', hits.length)

            const misses = system.queryPoint(1000, 1000)
            logger.log('bodies at (1000,1000):', misses.length)
        })

        action('Query by radius', () => {
            const system = new CollisionSystem({gravity: {x: 0, y: 0}})

            const object = {position: {x: 10, y: 0}, constructor: {name: 'Entity'}}
            system.addBody(object)

            const nearby = system.queryRadius(0, 0, 50)
            logger.log('bodies within radius 50:', nearby.length)
        })

    })


    section('Pause and Resume', () => {

        text('Pause a body to freeze its velocity. Resume restores it.')

        action('Pause and resume', () => {
            const system = new CollisionSystem({gravity: {x: 0, y: 0}})
            const object = {position: {x: 0, y: 0}, constructor: {name: 'Entity'}}
            system.addBody(object, {velocity: {x: 100, y: 50}})

            logger.log('before pause:', object.velocity)
            system.pauseBody(object)
            logger.log('paused:', object.velocity)

            system.resumeBody(object)
            logger.log('resumed:', object.velocity)
        })

    })

})
