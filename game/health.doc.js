import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Entity from './entity.js'
import Health from './health.js'


export default doc('Health', () => {

    text(`
        Component that adds health management to an entity.
        Tracks HP, max HP, and invincibility frames.
        Emits \`damaged\`, \`healed\`, and \`death\` events.
    `)


    section('Basic Usage', () => {

        text(`
            Attach to an entity to give it a health pool.
            Configure initial HP and max HP.
        `)

        action('Create with health', () => {
            const entity = new Entity()
            entity.create(Health, {hp: 3, maxHp: 5})

            logger.log('hp:', entity.child(Health).hp)
            logger.log('maxHp:', entity.child(Health).maxHp)
            logger.log('alive:', entity.isAlive())
        })

        action('Default health', () => {
            const entity = new Entity()
            entity.create(Health, {hp: 10})

            logger.log('hp:', entity.child(Health).hp)
            logger.log('maxHp:', entity.child(Health).maxHp)
        })

    })


    section('Damage and Healing', () => {

        text(`
            Use \`damage(amount)\` to deal damage and \`heal(amount)\` to restore HP.
            Both methods emit events and return whether the operation succeeded.
        `)

        action('Take damage', () => {
            const entity = new Entity()
            entity.create(Health, {hp: 5})

            entity.on('damaged', (data) => {
                logger.log('damaged:', data.amount, '- hp:', data.hp)
            })

            entity.damage(2)
            entity.damage(1)
        })

        action('Heal', () => {
            const entity = new Entity()
            entity.create(Health, {hp: 2, maxHp: 5})

            entity.on('healed', (data) => {
                logger.log('healed:', data.amount, '- hp:', data.hp)
            })

            entity.heal(1)
            entity.heal(10)
        })

    })


    section('Death', () => {

        text(`
            When HP reaches 0, the \`death\` event fires.
            Damage and healing have no effect on dead entities.
        `)

        action('Death event', () => {
            const entity = new Entity()
            entity.create(Health, {hp: 2})

            entity.on('death', () => logger.log('entity died'))

            entity.damage(1)
            logger.log('alive:', entity.isAlive())

            entity.damage(1)
            logger.log('alive:', entity.isAlive())
        })

    })


    section('Invincibility', () => {

        text(`
            Pass \`invincibility\` duration when dealing damage.
            While invincible, further damage is ignored.
            Call \`updateHealth(deltaTime)\` to tick down the timer.
        `)

        action('Invincibility frames', () => {
            const entity = new Entity()
            entity.create(Health, {hp: 5})

            const hit1 = entity.damage(1, {invincibility: 1.0})
            logger.log('hit 1:', hit1, '- hp:', entity.child(Health).hp)

            const hit2 = entity.damage(1)
            logger.log('hit 2 (blocked):', hit2, '- hp:', entity.child(Health).hp)

            entity.updateHealth(1.0)

            const hit3 = entity.damage(1)
            logger.log('hit 3:', hit3, '- hp:', entity.child(Health).hp)
        })

    })


    section('API', () => {

        code('Constructor', () => {
            const health = new Health({
                hp: 3,
                maxHp: 5
            })
        })

        code('Delegated to entity', () => {
            // entity.damage(amount, options?) - Deal damage, returns success
            // entity.heal(amount) - Restore HP, returns success
            // entity.isAlive() - Check if HP > 0
            // entity.isInvincible() - Check if in invincibility frames
            // entity.updateHealth(deltaTime) - Tick invincibility timer
        })

        code('Events', () => {
            // damaged - Fired when damage dealt {amount, hp}
            // healed - Fired when health restored {amount, hp}
            // death - Fired when HP reaches 0
        })

    })

})
