import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import BuffSystem from './buff_system.js'
import Entity from './entity.js'


export default doc('BuffSystem', () => {

    text(`
        Component for managing temporary stat modifiers on entities.
        Buffs have a duration and can apply multipliers to stats.
    `)


    section('Basic Usage', () => {

        text(`
            Attach BuffSystem to an entity to enable buff management.
            Methods are delegated to the host entity.
        `)

        action('Apply and check buff', () => {
            const entity = new Entity()
            entity.create(BuffSystem)

            entity.applyBuff('rage', 5, {damage: 1.5})

            logger.log('has rage:', entity.hasBuff('rage'))
            logger.log('damage modifier:', entity.getBuffModifier('damage'))
        })

        action('Stack modifiers', () => {
            const entity = new Entity()
            entity.create(BuffSystem)

            entity.applyBuff('potion', 10, {speed: 1.2})
            entity.applyBuff('haste', 5, {speed: 1.3})

            logger.log('speed modifier:', entity.getBuffModifier('speed'))
        })

    })


    section('Duration', () => {

        text(`
            Buffs expire after their duration. Call \`updateBuffs\` each frame
            to tick down remaining time. Use negative duration for permanent buffs.
        `)

        action('Timed buff', () => {
            const entity = new Entity()
            entity.create(BuffSystem)

            entity.applyBuff('shield', 2, {defense: 2})
            logger.log('before update:', entity.hasBuff('shield'))

            entity.updateBuffs(1)
            logger.log('after 1s:', entity.hasBuff('shield'))

            entity.updateBuffs(1.5)
            logger.log('after 2.5s:', entity.hasBuff('shield'))
        })

        action('Permanent buff', () => {
            const entity = new Entity()
            entity.create(BuffSystem)

            entity.applyBuff('curse', -1, {luck: 0.5})
            entity.updateBuffs(100)

            logger.log('still active:', entity.hasBuff('curse'))
        })

        action('Refresh duration', () => {
            const entity = new Entity()
            entity.create(BuffSystem)

            entity.applyBuff('focus', 3, {accuracy: 1.2})
            entity.updateBuffs(2)

            entity.applyBuff('focus', 3, {accuracy: 1.2})
            entity.updateBuffs(2)

            logger.log('still active:', entity.hasBuff('focus'))
        })

    })


    section('Events', () => {

        text(`
            The host entity emits \`buff:applied\` and \`buff:expired\` events.
        `)

        action('Listen to events', () => {
            const entity = new Entity()
            entity.create(BuffSystem)

            entity.on('buff:applied', buff => {
                logger.log('applied:', buff.key)
            })

            entity.on('buff:expired', buff => {
                logger.log('expired:', buff.key)
            })

            entity.applyBuff('boost', 1, {})
            entity.updateBuffs(2)
        })

    })


    section('API', () => {

        code('Delegated methods', () => {
            // entity.applyBuff(key, duration, modifiers) - Apply or refresh a buff
            // entity.removeBuff(key) - Remove a buff manually
            // entity.hasBuff(key) - Check if buff is active
            // entity.getBuffModifier(stat) - Get combined multiplier for a stat
            // entity.updateBuffs(deltaTime) - Tick down buff durations
            // entity.clearBuffs() - Remove all buffs
        })

        code('Buff object', () => {
            // buff.key - Unique identifier
            // buff.duration - Original duration (-1 for permanent)
            // buff.remaining - Time left
            // buff.modifiers - Object with stat multipliers
        })

    })

})
