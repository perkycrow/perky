import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Entity from './entity.js'
import Hitbox from './hitbox.js'


export default doc('Hitbox', () => {

    text(`
        Component that gives an [[Entity@game]] a collision shape.
        Attach one to any entity that should participate in collision or hit queries.
        Without a Hitbox, an entity is invisible to [[Space@game]] hit tests.
    `)


    section('Basic Usage', () => {

        text(`
            Hitbox is a component — create it on an entity with \`entity.create(Hitbox, options)\`.
            The entity automatically gets a \`hitbox\` property that points at the component.
        `)

        action('Attach a hitbox', () => {
            const entity = new Entity({x: 0, y: 0})

            entity.create(Hitbox, {radius: 0.5})

            logger.log('radius:', entity.hitbox.radius)
            logger.log('shape:', entity.hitbox.shape)
        })

    })


    section('Why opt-in', () => {

        text(`
            Not every entity needs collision. Decor, markers, spawn points, and UI entities
            typically don't. Keeping Hitbox separate from Entity lets you pay only for what
            you use, and makes it explicit which entities participate in collision.
        `)

    })


    section('API', () => {

        code('Options', () => {
            // radius - Collision radius in world units (default: 0)
            // shape - Shape type: 'circle' (default), 'box' later
        })

        code('Properties', () => {
            // hitbox.radius - Collision radius
            // hitbox.shape - Shape type
        })

        code('Binding', () => {
            // After `entity.create(Hitbox, ...)`, `entity.hitbox` returns the component.
            // Removing the component (`entity.removeChild('hitbox')`) unbinds it.
        })

    })

})
