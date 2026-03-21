import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Entity from './entity.js'
import Velocity from './velocity.js'
import Dash from './dash.js'


export default doc('Dash', () => {

    text(`
        Component that adds a dash ability to an entity.
        Requires a [[Velocity@game]] component. Handles timing, cooldowns, and sustain.
    `)


    section('Basic Usage', () => {

        text(`
            Attach to an entity with velocity. Call \`dash(direction, options)\` to perform a dash.
        `)

        action('Simple dash', () => {
            const entity = new Entity()
            entity.create(Velocity)
            entity.create(Dash)

            logger.log('before:', entity.velocity.x, entity.velocity.y)

            entity.dash({x: 1, y: 0}, {power: 20})
            logger.log('after:', entity.velocity.x, entity.velocity.y)
            logger.log('dashing:', entity.isDashing())
        })

    })


    section('Options', () => {

        text(`
            Configure power, duration, cooldown, and sustain.
        `)

        code('Dash options', () => {
            entity.dash({x: 1, y: 1}, {
                power: 20,
                duration: 0.15,
                cooldown: 0.5,
                sustain: 0.5
            })
        })

        action('Dash parameters', () => {
            const entity = new Entity()
            entity.create(Velocity)
            entity.create(Dash)

            entity.dash({x: 1, y: 0}, {
                power: 15,
                duration: 0.2,
                cooldown: 1.0
            })

            const dash = entity.child(Dash)
            logger.log('power:', dash.dashPower)
            logger.log('duration:', dash.dashDuration)
            logger.log('cooldown:', dash.dashCooldown)
        })

    })


    section('State', () => {

        text(`
            Check dash state with \`active\`, \`onCooldown\`, \`progress\`, and \`remaining\`.
        `)

        action('Dash state', () => {
            const entity = new Entity()
            entity.create(Velocity)
            entity.create(Dash)

            entity.dash({x: 1, y: 0}, {power: 10, duration: 0.2, cooldown: 0.5})

            const dash = entity.child(Dash)
            logger.log('active:', dash.active)
            logger.log('progress:', dash.progress.toFixed(2))
            logger.log('remaining:', dash.remaining.toFixed(2))

            entity.updateDash(0.1)
            logger.log('-- after 0.1s --')
            logger.log('progress:', dash.progress.toFixed(2))
            logger.log('remaining:', dash.remaining.toFixed(2))
        })

    })


    section('Cooldown', () => {

        text(`
            After a dash ends, the cooldown timer starts.
            New dashes are blocked until cooldown expires.
        `)

        action('Cooldown blocking', () => {
            const entity = new Entity()
            entity.create(Velocity)
            entity.create(Dash)

            const success1 = entity.dash({x: 1, y: 0}, {power: 10, duration: 0.1, cooldown: 0.5})
            logger.log('dash 1:', success1)

            entity.updateDash(0.1)

            const success2 = entity.dash({x: 1, y: 0})
            logger.log('dash 2 (on cooldown):', success2)
            logger.log('onCooldown:', entity.child(Dash).onCooldown)

            entity.updateDash(0.5)

            const success3 = entity.dash({x: 1, y: 0}, {power: 10})
            logger.log('dash 3:', success3)
        })

    })


    section('Sustain', () => {

        text(`
            The \`sustain\` option adds continuous force during the dash.
            Useful for longer, momentum-based dashes.
        `)

        action('With sustain', () => {
            const entity = new Entity()
            entity.create(Velocity)
            entity.create(Dash)

            entity.dash({x: 1, y: 0}, {power: 10, duration: 0.3, sustain: 0.8})

            logger.log('start:', entity.velocity.x.toFixed(2))

            entity.updateDash(0.1)
            logger.log('0.1s:', entity.velocity.x.toFixed(2))

            entity.updateDash(0.1)
            logger.log('0.2s:', entity.velocity.x.toFixed(2))
        })

    })


    section('API', () => {

        code('Constructor', () => {
            const dash = new Dash()
        })

        code('Delegated to entity', () => {
            // entity.dash(direction, options?) - Start a dash
            // entity.updateDash(deltaTime) - Tick dash timers
            // entity.cancelDash() - Cancel dash and reset cooldown
            // entity.isDashing() - Check if currently dashing
        })

        code('Properties', () => {
            // dash.active - Currently dashing
            // dash.onCooldown - Cooldown timer active
            // dash.progress - 0 to 1, how far through the dash
            // dash.remaining - 1 to 0, time remaining as ratio
        })

    })

})
