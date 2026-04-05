import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Entity from './entity.js'
import Hitbox from './hitbox.js'
import Space from './space.js'


export default doc('Space', () => {

    text(`
        Opt-in container that tracks a set of entities for spatial queries — nearest
        neighbor, entities in range, collision hit tests. A [[World@game]] has no
        built-in collision; create a Space and \`add()\` the entities you want to query.

        Spaces never own their entities (the World does). They hold references and
        auto-remove entities when they dispose.
    `)


    section('Basic Usage', () => {

        text(`
            Create a Space, add entities, then query it. Entities are explicitly added —
            nothing is automatic. This keeps ownership clear and lets you scope queries
            (e.g. one Space for characters, one for pickups).
        `)

        action('Distance queries', () => {
            const space = new Space()

            const a = new Entity({x: 0, y: 0})
            const b = new Entity({x: 2, y: 0})
            const c = new Entity({x: 5, y: 0})

            space.add(a)
            space.add(b)
            space.add(c)

            logger.log('nearest within 3:', space.nearest(a, 3)?.x)
            logger.log('in range 3:', space.entitiesInRange(a, 3).length)
        })

        action('Collision hit', () => {
            const space = new Space()

            const a = new Entity({x: 0, y: 0})
            a.create(Hitbox, {radius: 0.5})

            const b = new Entity({x: 0.8, y: 0})
            b.create(Hitbox, {radius: 0.5})

            space.add(a)
            space.add(b)

            const hit = space.checkHit(a)
            logger.log('hit:', hit === b)
        })

    })


    section('checkHit and Hitboxes', () => {

        text(`
            \`checkHit(entity, filter)\` requires both entities to have a [[Hitbox@game]]
            component — entities without one are invisible to hit tests. \`nearest\` and
            \`entitiesInRange\` only look at positions, so they work on any entity.
        `)

    })


    section('Point queries', () => {

        text(`
            \`nearest\` and \`entitiesInRange\` accept a plain \`{x, y}\` point instead
            of an entity. Useful for AOE effects, mouse queries, or any location-based lookup.
        `)

        action('Query around a point', () => {
            const space = new Space()

            space.add(new Entity({x: 1, y: 0}))
            space.add(new Entity({x: 5, y: 0}))

            const near = space.entitiesInRange({x: 0, y: 0}, 3)
            logger.log('found:', near.length)
        })

    })


    section('Lifecycle', () => {

        text(`
            When an entity disposes, it's automatically removed from every Space it was in.
            Call \`space.remove(entity)\` to take an entity out without disposing it — useful
            to disable collision on a dying entity while keeping it alive for animation.
        `)

    })


    section('Multiple spaces', () => {

        text(`
            A game can have several Spaces — for example one per team, one for projectiles,
            one for pickups. Filtering via Spaces is usually faster and clearer than filtering
            via callbacks on a single big Space.
        `)

        code('Scoped spaces', () => {
            class GameWorld {
                constructor () {
                    this.characters = new Space()
                    this.projectiles = new Space()
                    this.pickups = new Space()
                }
            }
        })

    })


    section('API', () => {

        code('Methods', () => {
            // space.add(entity) - Track the entity for queries
            // space.remove(entity) - Stop tracking the entity
            // space.has(entity) - True if the entity is tracked
            // space.clear() - Remove all entities
            // space.nearest(from, range, filter) - Closest entity, or null
            // space.entitiesInRange(from, range, filter) - All entities within range
            // space.checkHit(entity, filter) - First overlapping hitbox, or null
        })

        code('Properties', () => {
            // space.entities - Array of tracked entities
            // space.size - Number of tracked entities
        })

    })

})
