import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Entity from './entity.js'
import Velocity from './velocity.js'


export default doc('Velocity', () => {

    text(`
        Component that adds a velocity vector to an entity.
        Provides methods for applying, clamping, and dampening velocity.
        Delegates \`velocity\` property and movement methods to the host.
    `)


    section('Basic Usage', () => {

        text(`
            Attach to an entity to give it a velocity vector.
            Access via \`entity.velocity\`.
        `)

        action('Create with velocity', () => {
            const entity = new Entity()
            entity.create(Velocity, {x: 2, y: -1})

            logger.log('velocity.x:', entity.velocity.x)
            logger.log('velocity.y:', entity.velocity.y)
        })

        action('Modify velocity', () => {
            const entity = new Entity()
            entity.create(Velocity)

            entity.velocity.set(5, 3)
            logger.log('after set:', entity.velocity.x, entity.velocity.y)

            entity.velocity.multiplyScalar(2)
            logger.log('after scale:', entity.velocity.x, entity.velocity.y)
        })

    })


    section('Applying Velocity', () => {

        text(`
            Use \`applyVelocity(deltaTime)\` to move the entity based on its velocity.
            This is typically called each frame in your update loop.
        `)

        action('Apply velocity', () => {
            const entity = new Entity({x: 0, y: 0})
            entity.create(Velocity, {x: 10, y: 5})

            logger.log('before:', entity.x, entity.y)

            entity.applyVelocity(0.1)
            logger.log('after 0.1s:', entity.x, entity.y)

            entity.applyVelocity(0.1)
            logger.log('after 0.2s:', entity.x, entity.y)
        })

    })


    section('Clamping Velocity', () => {

        text(`
            Use \`clampVelocity(maxSpeed)\` to limit the velocity magnitude.
            Also zeroes out very small velocities (< 0.01) to prevent drift.
        `)

        action('Clamp to max speed', () => {
            const entity = new Entity()
            entity.create(Velocity, {x: 100, y: 100})

            logger.log('before:', entity.velocity.length().toFixed(2))

            entity.clampVelocity(10)
            logger.log('after clamp:', entity.velocity.length().toFixed(2))
        })

    })


    section('Dampening Velocity', () => {

        text(`
            Use \`dampenVelocity(ratio, deltaTime)\` to apply friction/drag.
            The ratio is applied per frame at 60fps, scaled by deltaTime.
        `)

        action('Apply friction', () => {
            const entity = new Entity()
            entity.create(Velocity, {x: 100, y: 0})

            logger.log('start:', entity.velocity.x.toFixed(2))

            entity.dampenVelocity(0.9, 1 / 60)
            logger.log('frame 1:', entity.velocity.x.toFixed(2))

            entity.dampenVelocity(0.9, 1 / 60)
            logger.log('frame 2:', entity.velocity.x.toFixed(2))

            entity.dampenVelocity(0.9, 1 / 60)
            logger.log('frame 3:', entity.velocity.x.toFixed(2))
        })

    })


    section('API', () => {

        code('Constructor', () => {
            const velocity = new Velocity({
                x: 0,
                y: 0
            })
        })

        code('Delegated to entity', () => {
            // entity.velocity - Vec2 velocity vector
            // entity.applyVelocity(deltaTime) - Move entity by velocity
            // entity.clampVelocity(maxSpeed) - Limit velocity magnitude
            // entity.dampenVelocity(ratio, deltaTime, referenceFps?) - Apply friction
        })

    })

})
