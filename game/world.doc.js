import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import PerkyModule from '../core/perky_module.js'
import World from './world.js'
import Entity from './entity.js'


export default doc('World', () => {

    text(`
        Container for game entities. Extends [[PerkyModule@core]] to manage
        entity lifecycle and updates. Provides hooks for game-specific logic.
    `)


    section('Basic Usage', () => {

        text(`
            Create a World and add entities to it using the inherited create method.
        `)

        code('Creating entities', () => {
            const app = new PerkyModule()
            const world = app.create(World)

            class Player extends Entity {}
            class Enemy extends Entity {}

            const player = world.create(Player, {x: 0, y: 0})
            const enemy = world.create(Enemy, {x: 5, y: 0})
        })

        action('Entities list', () => {
            const app = new PerkyModule()
            const world = app.create(World)

            class Ball extends Entity {}

            world.create(Ball, {x: 0, y: 0})
            world.create(Ball, {x: 1, y: 0})
            world.create(Ball, {x: 2, y: 0})

            logger.log('entity count:', world.entities.length)

            for (const entity of world.entities) {
                logger.log('  entity at:', entity.x, entity.y)
            }
        })

    })


    section('Update Loop', () => {

        text(`
            Call update() each frame to update all entities.
            Override preUpdate and postUpdate for game-specific logic.
        `)

        code('Update cycle', () => {
            class GameWorld extends World {
                preUpdate (deltaTime, context) {
                    // Called before entities update
                    // Handle input, spawn logic, etc.
                }

                postUpdate (deltaTime, context) {
                    // Called after entities update
                    // Handle collisions, cleanup, etc.
                }
            }
        })

        action('Entity updates', () => {
            const app = new PerkyModule()
            const world = app.create(World)

            class MovingEntity extends Entity {
                update (deltaTime) {
                    this.x += this.velocity.x * deltaTime
                    this.y += this.velocity.y * deltaTime
                }
            }

            const entity = world.create(MovingEntity, {x: 0, y: 0})
            entity.velocity.x = 10

            app.start()

            logger.log('before:', entity.x)
            world.update(0.1, {})
            logger.log('after:', entity.x)
        })

    })


    section('Entity Management', () => {

        text(`
            Entities are managed as children with category 'entity'.
            Use inherited methods from [[PerkyModule@core]] to add, remove, and query entities.
        `)

        action('Remove entities', () => {
            const app = new PerkyModule()
            const world = app.create(World)

            class Ball extends Entity {}

            const ball1 = world.create(Ball, {$id: 'ball1'})
            const ball2 = world.create(Ball, {$id: 'ball2'})

            logger.log('before:', world.entities.length)

            world.removeChild('ball1')

            logger.log('after:', world.entities.length)
        })

        action('Query by tags', () => {
            const app = new PerkyModule()
            const world = app.create(World)

            world.create(Entity, {$tags: ['enemy', 'flying']})
            world.create(Entity, {$tags: ['enemy', 'ground']})
            world.create(Entity, {$tags: ['friendly']})

            const enemies = world.childrenByTags('enemy')
            logger.log('enemies:', enemies.length)

            const flying = world.childrenByTags('flying')
            logger.log('flying:', flying.length)
        })

    })


    section('Subclassing', () => {

        text(`
            Create game-specific worlds by subclassing.
            Add spawn methods, collision handling, and game rules.
        `)

        code('Game world example', () => {
            class BattleWorld extends World {
                spawnPlayer (options = {}) {
                    return this.create(Player, {
                        $id: 'player',
                        $bind: 'player',
                        x: options.x || 0,
                        y: options.y || 0
                    })
                }

                postUpdate () {
                    this.checkCollisions()
                    this.cleanupDead()
                }

                checkCollisions () {
                    // Game-specific collision logic
                }

                cleanupDead () {
                    for (const entity of this.entities) {
                        if (entity.alive === false) {
                            this.removeChild(entity.$id)
                        }
                    }
                }
            }
        })

    })


    section('API', () => {

        code('Properties', () => {
            // world.entities - Array of all Entity children
        })

        code('Methods', () => {
            // update(deltaTime, context) - Update all entities
            // preUpdate(deltaTime, context) - Hook before entity updates
            // postUpdate(deltaTime, context) - Hook after entity updates
        })

        code('Inherited from PerkyModule', () => {
            // create(Class, options) - Create and add an entity
            // removeChild(id) - Remove an entity by id
            // childrenByCategory(category) - Get children by category
            // childrenByTags(tag) - Get children by tag
        })

    })

})
