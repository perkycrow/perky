import {doc, section, setup, text, action, logger} from '../doc/runtime.js'
import CollisionResolver from './collision_resolver.js'
import {detectCollision} from './collision_detector.js'
import BoxShape from './shapes/box_shape.js'
import CircleShape from './shapes/circle_shape.js'


export default doc('CollisionResolver', () => {

    text(`
        Resolves collisions between two bodies by separating them
        and applying impulse-based velocity changes.
        Uses mass, restitution, and friction from \`body.userData\`.
    `)


    section('Basic Separation', () => {

        text('When two shapes overlap, resolve() pushes them apart based on collision depth and mass ratio.')

        action('Separate overlapping boxes', () => {
            const resolver = new CollisionResolver()

            const shapeA = new BoxShape({width: 40, height: 40, x: 0, y: 0})
            const shapeB = new BoxShape({width: 40, height: 40, x: 30, y: 0})

            const bodyA = {position: {x: 0, y: 0}, collisionShape: shapeA}
            const bodyB = {position: {x: 30, y: 0}, collisionShape: shapeB}

            const collision = detectCollision(shapeA, shapeB)
            logger.log('before A:', bodyA.position.x, bodyA.position.y)
            logger.log('before B:', bodyB.position.x, bodyB.position.y)

            resolver.resolve(bodyA, bodyB, collision)
            logger.log('after A:', bodyA.position.x, bodyA.position.y)
            logger.log('after B:', bodyB.position.x, bodyB.position.y)
        })

    })


    section('Velocity Resolution', () => {

        text('When bodies have velocity, impulses are applied to bounce them apart.')

        setup(ctx => {
            ctx.resolver = new CollisionResolver({restitution: 0.5})
        })

        action('Bouncing bodies', ctx => {
            const shapeA = new BoxShape({width: 40, height: 40, x: 0, y: 0})
            const shapeB = new BoxShape({width: 40, height: 40, x: 30, y: 0})

            const bodyA = {
                position: {x: 0, y: 0},
                collisionShape: shapeA,
                userData: {velocity: {x: 5, y: 0}, mass: 1}
            }
            const bodyB = {
                position: {x: 30, y: 0},
                collisionShape: shapeB,
                userData: {velocity: {x: -3, y: 0}, mass: 2}
            }

            const collision = detectCollision(shapeA, shapeB)
            logger.log('before A vel:', bodyA.userData.velocity.x, bodyA.userData.velocity.y)
            logger.log('before B vel:', bodyB.userData.velocity.x, bodyB.userData.velocity.y)

            ctx.resolver.resolve(bodyA, bodyB, collision)
            logger.log('after A vel:', bodyA.userData.velocity.x.toFixed(2), bodyA.userData.velocity.y.toFixed(2))
            logger.log('after B vel:', bodyB.userData.velocity.x.toFixed(2), bodyB.userData.velocity.y.toFixed(2))
        })

    })


    section('Static Bodies', () => {

        text('Static bodies are not moved or affected by impulses. Set `userData.isStatic` to `true`.')

        action('Ball hitting a wall', () => {
            const resolver = new CollisionResolver({restitution: 1})

            const ballShape = new CircleShape({radius: 20, x: 0, y: 0})
            const wallShape = new BoxShape({width: 100, height: 100, x: 25, y: 0})

            const ball = {
                position: {x: 0, y: 0},
                collisionShape: ballShape,
                userData: {velocity: {x: 10, y: 0}, mass: 1}
            }
            const wall = {
                position: {x: 25, y: 0},
                collisionShape: wallShape,
                userData: {isStatic: true, velocity: {x: 0, y: 0}, mass: 999}
            }

            const collision = detectCollision(ballShape, wallShape)
            resolver.resolve(ball, wall, collision)

            logger.log('ball vel:', ball.userData.velocity.x.toFixed(2), ball.userData.velocity.y.toFixed(2))
            logger.log('wall pos:', wall.position.x, wall.position.y)
        })

    })


    section('Configuration', () => {

        text(`
            Options control default physics behavior:
            - \`separationFactor\` — how much overlap to correct (default 0.5)
            - \`restitution\` — bounciness, 0 = no bounce, 1 = full bounce (default 0.2)
            - \`friction\` — surface friction between bodies (default 0.8)

            Bodies can override these via \`userData.restitution\` and \`userData.friction\`.
        `)

        action('Custom resolver', () => {
            const resolver = new CollisionResolver({
                separationFactor: 1,
                restitution: 0.8,
                friction: 0.3
            })
            logger.log('options:', resolver.options)
        })

    })

})
