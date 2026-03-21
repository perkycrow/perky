import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Entity from './entity.js'
import MeleeAttack from './melee_attack.js'


export default doc('MeleeAttack', () => {

    text(`
        Component that adds melee attack capability to an entity.
        Handles wind-up, strike, and cooldown phases.
        Emits a 'strike' event when the attack connects.
    `)


    section('Basic Usage', () => {

        text(`
            Attach to an entity to enable melee attacks.
            Configure damage, range, cooldown, and timing via options.
        `)

        action('Create with defaults', () => {
            const entity = new Entity()
            entity.create(MeleeAttack)

            logger.log('damage:', entity.children[0].meleeDamage)
            logger.log('range:', entity.children[0].meleeRange)
            logger.log('cooldown:', entity.children[0].meleeCooldown)
        })

        action('Custom configuration', () => {
            const entity = new Entity()
            entity.create(MeleeAttack, {
                damage: 25,
                range: 1.2,
                cooldown: 0.5,
                windUp: 0.2,
                strikeTime: 0.15
            })

            const attack = entity.children[0]
            logger.log('damage:', attack.meleeDamage)
            logger.log('range:', attack.meleeRange)
            logger.log('cooldown:', attack.meleeCooldown)
        })

    })


    section('Attacking', () => {

        text(`
            Call \`meleeAttack(target)\` to initiate an attack.
            Returns true if the attack started, false if out of range or on cooldown.
        `)

        action('Attack in range', () => {
            const attacker = new Entity({x: 0, y: 0})
            attacker.create(MeleeAttack, {range: 1})

            const target = new Entity({x: 0.5, y: 0})

            const started = attacker.meleeAttack(target)
            logger.log('attack started:', started)
            logger.log('is attacking:', attacker.isAttacking())
        })

        action('Attack out of range', () => {
            const attacker = new Entity({x: 0, y: 0})
            attacker.create(MeleeAttack, {range: 1})

            const target = new Entity({x: 10, y: 0})

            const started = attacker.meleeAttack(target)
            logger.log('attack started:', started)
        })

    })


    section('Attack Phases', () => {

        text(`
            Attacks progress through phases: idle → winding → striking → idle.
            Call \`updateMeleeAttack(deltaTime)\` each frame to advance the attack.
        `)

        action('Phase progression', () => {
            const attacker = new Entity({x: 0, y: 0})
            attacker.create(MeleeAttack, {
                range: 1,
                windUp: 0.1,
                strikeTime: 0.1,
                cooldown: 0.5
            })

            const target = new Entity({x: 0.5, y: 0})

            const attack = attacker.children[0]

            logger.log('phase:', attack.phase)

            attacker.meleeAttack(target)
            logger.log('after attack:', attack.phase)

            attacker.updateMeleeAttack(0.15)
            logger.log('after wind-up:', attack.phase)

            attacker.updateMeleeAttack(0.15)
            logger.log('after strike:', attack.phase)
        })

        action('Attack progress', () => {
            const attacker = new Entity({x: 0, y: 0})
            attacker.create(MeleeAttack, {range: 1, windUp: 0.2})

            const target = new Entity({x: 0.5, y: 0})

            const attack = attacker.children[0]

            attacker.meleeAttack(target)
            logger.log('progress at start:', attack.attackProgress.toFixed(2))

            attacker.updateMeleeAttack(0.1)
            logger.log('progress at 50%:', attack.attackProgress.toFixed(2))
        })

    })


    section('Strike Event', () => {

        text(`
            When the strike lands, the entity emits a 'strike' event
            with target, direction, and damage information.
        `)

        code('Listening to strikes', () => {
            const attacker = new Entity()
            attacker.create(MeleeAttack, {damage: 10})

            attacker.on('strike', ({target, direction, damage}) => {
                target.health -= damage
            })
        })

    })


    section('API', () => {

        code('Constructor', () => {
            const attack = new MeleeAttack({
                damage: 1,
                range: 0.6,
                cooldown: 1,
                windUp: 0.15,
                strikeTime: 0.1
            })
        })

        code('Delegated to entity', () => {
            // entity.meleeAttack(target) - Start attack if in range
            // entity.updateMeleeAttack(deltaTime) - Advance attack state
            // entity.isAttacking() - Check if currently attacking
        })

        code('Properties', () => {
            // attack.phase - 'idle', 'winding', or 'striking'
            // attack.attackProgress - 0-1 progress through current phase
            // attack.meleeDamage - Damage dealt on strike
            // attack.meleeRange - Maximum attack range
            // attack.meleeCooldown - Time between attacks
        })

    })

})
