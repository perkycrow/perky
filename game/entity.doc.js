import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import PerkyModule from '../core/perky_module.js'
import World from './world.js'
import Entity from './entity.js'


export default doc('Entity', () => {

    text(`
        Base class for game objects in a [[World@game]].
        Provides position and velocity vectors. Subclass to add game-specific behavior.
    `)


    section('Basic Usage', () => {

        text(`
            Create entities directly or through a World.
        `)

        action('Create entity', () => {
            const entity = new Entity({x: 5, y: 3})

            logger.log('x:', entity.x)
            logger.log('y:', entity.y)
            logger.log('position:', entity.position.x, entity.position.y)
        })

        action('In a World', () => {
            const app = new PerkyModule()
            const world = app.create(World)

            const entity = world.create(Entity, {x: 10, y: 20})

            logger.log('x:', entity.x)
            logger.log('y:', entity.y)
        })

    })


    section('Position & Velocity', () => {

        text(`
            Position and velocity are [[Vec2@math]] instances.
            Shorthand x/y properties access position directly.
        `)

        action('Position access', () => {
            const entity = new Entity({x: 0, y: 0})

            entity.x = 5
            entity.y = 3

            logger.log('via x/y:', entity.x, entity.y)
            logger.log('via position:', entity.position.x, entity.position.y)

            entity.position.set(10, 20)
            logger.log('after set:', entity.x, entity.y)
        })

        action('Velocity', () => {
            const entity = new Entity()

            entity.velocity.set(2, -1)

            logger.log('velocity:', entity.velocity.x, entity.velocity.y)
        })

    })


    section('Subclassing', () => {

        text(`
            Extend Entity to create game-specific objects.
            Override update() for per-frame behavior.
        `)

        code('Custom entity', () => {
            class Bullet extends Entity {
                constructor (options = {}) {
                    super(options)
                    this.damage = options.damage ?? 10
                    this.alive = true
                }

                update (deltaTime) {
                    this.x += this.velocity.x * deltaTime
                    this.y += this.velocity.y * deltaTime

                    if (this.x > 100) {
                        this.alive = false
                    }
                }
            }
        })

        code('With physics', () => {
            class FallingObject extends Entity {
                constructor (options = {}) {
                    super(options)
                    this.gravity = options.gravity ?? -9.8
                }

                update (deltaTime) {
                    this.velocity.y += this.gravity * deltaTime
                    this.x += this.velocity.x * deltaTime
                    this.y += this.velocity.y * deltaTime
                }
            }
        })

    })


    section('API', () => {

        code('Constructor', () => {
            const entity = new Entity({
                x: 0,      // Initial x position (default: 0)
                y: 0       // Initial y position (default: 0)
            })
        })

        code('Properties', () => {
            // entity.x - X position (shorthand for position.x)
            // entity.y - Y position (shorthand for position.y)
            // entity.position - Vec2 position vector
            // entity.velocity - Vec2 velocity vector
        })

        code('Methods', () => {
            // update(deltaTime) - Called each frame by World
        })

    })

})
