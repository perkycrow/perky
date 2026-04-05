import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import PerkyModule from '../core/perky_module.js'
import World from './world.js'
import Entity from './entity.js'
import Velocity from './velocity.js'


export default doc('Entity', () => {

    text(`
        Base class for game objects in a [[World@game]].
        Provides a position vector. Add components for extra capabilities like velocity.
        Subclass to add game-specific behavior.
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


    section('Position', () => {

        text(`
            Position is a [[Vec2@math]] instance.
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

    })


    section('Components', () => {

        text(`
            Entities support components — lightweight modules that add capabilities.
            Components are PerkyModules with \`$category = 'component'\`.
            Use \`create()\` to attach components and \`components\` to list them.
        `)

        action('Add velocity', () => {
            const entity = new Entity()

            entity.create(Velocity, {x: 2, y: -1})

            logger.log('velocity:', entity.velocity.x, entity.velocity.y)
            logger.log('components:', entity.components.length)
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
                    this.create(Velocity, {x: 10, y: 0})
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
                    this.create(Velocity)
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
                x: 0,
                y: 0
            })
        })

        code('Properties', () => {
            // entity.x - X position (shorthand for position.x)
            // entity.y - Y position (shorthand for position.y)
            // entity.position - Vec2 position vector
            // entity.components - Array of attached components
        })

        code('Methods', () => {
            // update(deltaTime) - Called each frame by World
            // create(ComponentClass, options) - Attach a component (inherited from PerkyModule)
        })

    })

})
