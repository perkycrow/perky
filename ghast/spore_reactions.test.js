import {describe, test, expect} from 'vitest'
import Entity from '../game/entity.js'
import BuffSystem from '../game/buff_system.js'
import {createSporeStorage, addSpore} from './spores.js'
import {applySporeReactions, applySwarmReaction} from './spore_reactions.js'
import Swarm from './swarm.js'


function createCombatEntity () {
    const entity = new Entity()
    entity.create(BuffSystem)
    entity.spores = createSporeStorage()
    return entity
}


describe('SporeReactions', () => {

    describe('applySporeReactions', () => {

        test('does nothing without spores', () => {
            const entity = new Entity()
            entity.create(BuffSystem)

            applySporeReactions(entity, 'ally_died')

            expect(entity.hasBuff('rage')).toBe(false)
        })


        test('does nothing without matching spore', () => {
            const entity = createCombatEntity()
            addSpore(entity, 'naive')

            applySporeReactions(entity, 'ally_died')

            expect(entity.hasBuff('rage')).toBe(false)
        })


        test('does nothing for unknown event', () => {
            const entity = createCombatEntity()
            addSpore(entity, 'anger')

            applySporeReactions(entity, 'unknown_event')

            expect(entity.hasBuff('rage')).toBe(false)
        })


        test('does nothing without applyBuff method', () => {
            const entity = {spores: createSporeStorage()}
            addSpore(entity, 'anger')

            applySporeReactions(entity, 'ally_died')
        })


        test('ally_died + anger applies rage', () => {
            const entity = createCombatEntity()
            addSpore(entity, 'anger')

            applySporeReactions(entity, 'ally_died')

            expect(entity.hasBuff('rage')).toBe(true)
        })


        test('ally_died + sadness applies grief', () => {
            const entity = createCombatEntity()
            addSpore(entity, 'sadness')

            applySporeReactions(entity, 'ally_died')

            expect(entity.hasBuff('grief')).toBe(true)
        })


        test('ally_died + fear applies panic', () => {
            const entity = createCombatEntity()
            addSpore(entity, 'fear')

            applySporeReactions(entity, 'ally_died')

            expect(entity.hasBuff('panic')).toBe(true)
        })


        test('ally_died + surprise applies shock', () => {
            const entity = createCombatEntity()
            addSpore(entity, 'surprise')

            applySporeReactions(entity, 'ally_died')

            expect(entity.hasBuff('shock')).toBe(true)
        })


        test('catalyst combo overrides normal reactions', () => {
            const entity = createCombatEntity()
            addSpore(entity, 'anger')
            addSpore(entity, 'fear')

            applySporeReactions(entity, 'ally_died')

            expect(entity.hasBuff('panic')).toBe(true)
            expect(entity.hasBuff('rage')).toBe(false)
        })


        test('catalyst falls back to normal for undefined events', () => {
            const entity = createCombatEntity()
            addSpore(entity, 'fear')
            addSpore(entity, 'sadness')

            applySporeReactions(entity, 'isolated')

            expect(entity.hasBuff('despair')).toBe(false)
            expect(entity.hasBuff('panic')).toBe(true)
            expect(entity.hasBuff('grief')).toBe(true)
        })


        test('low_hp + fear applies terror (permanent)', () => {
            const entity = createCombatEntity()
            addSpore(entity, 'fear')

            applySporeReactions(entity, 'low_hp')

            expect(entity.hasBuff('terror')).toBe(true)

            entity.updateBuffs(100)

            expect(entity.hasBuff('terror')).toBe(true)
        })


        test('low_hp + anger applies lastBreath (permanent)', () => {
            const entity = createCombatEntity()
            addSpore(entity, 'anger')

            applySporeReactions(entity, 'low_hp')

            expect(entity.hasBuff('lastBreath')).toBe(true)
        })


        test('low_hp + arrogance applies indignation', () => {
            const entity = createCombatEntity()
            addSpore(entity, 'arrogance')

            applySporeReactions(entity, 'low_hp')

            expect(entity.hasBuff('indignation')).toBe(true)
        })


        test('kill + arrogance applies triumph', () => {
            const entity = createCombatEntity()
            addSpore(entity, 'arrogance')

            applySporeReactions(entity, 'kill')

            expect(entity.hasBuff('triumph')).toBe(true)
        })


        test('kill + naive applies excitement', () => {
            const entity = createCombatEntity()
            addSpore(entity, 'naive')

            applySporeReactions(entity, 'kill')

            expect(entity.hasBuff('excitement')).toBe(true)
        })


        test('kill + lust applies trophy', () => {
            const entity = createCombatEntity()
            addSpore(entity, 'lust')

            applySporeReactions(entity, 'kill')

            expect(entity.hasBuff('trophy')).toBe(true)
        })


        test('surrounded + fear applies panic', () => {
            const entity = createCombatEntity()
            addSpore(entity, 'fear')

            applySporeReactions(entity, 'surrounded')

            expect(entity.hasBuff('panic')).toBe(true)
        })


        test('surrounded + naive applies party', () => {
            const entity = createCombatEntity()
            addSpore(entity, 'naive')

            applySporeReactions(entity, 'surrounded')

            expect(entity.hasBuff('party')).toBe(true)
        })


        test('surrounded + surprise applies startle', () => {
            const entity = createCombatEntity()
            addSpore(entity, 'surprise')

            applySporeReactions(entity, 'surrounded')

            expect(entity.hasBuff('startle')).toBe(true)
        })


        test('re-applying reaction resets buff timer', () => {
            const entity = createCombatEntity()
            addSpore(entity, 'anger')

            applySporeReactions(entity, 'ally_died')
            entity.updateBuffs(2)
            applySporeReactions(entity, 'ally_died')

            const system = entity.children[0]
            const buff = system.buffs.get('rage')

            expect(buff.remaining).toBe(3)
        })


        test('buff modifiers affect getBuffModifier', () => {
            const entity = createCombatEntity()
            addSpore(entity, 'anger')

            applySporeReactions(entity, 'ally_died')

            expect(entity.getBuffModifier('damage')).toBe(1.5)
            expect(entity.getBuffModifier('speed')).toBe(1.3)
        })

    })


    describe('applySwarmReaction', () => {

        test('applies buff to swarm', () => {
            const swarm = new Swarm('shadow')

            applySwarmReaction(swarm, 'disarray')

            expect(swarm.hasBuff('disarray')).toBe(true)
        })


        test('swarm buff has correct modifiers', () => {
            const swarm = new Swarm('shadow')

            applySwarmReaction(swarm, 'disarray')

            expect(swarm.getBuffModifier('speed')).toBe(0.7)
            expect(swarm.getBuffModifier('damage')).toBe(0.8)
        })


        test('does nothing with unknown buff key', () => {
            const swarm = new Swarm('shadow')

            applySwarmReaction(swarm, 'nonexistent')

            expect(swarm.buffs.size).toBe(0)
        })

    })

})
