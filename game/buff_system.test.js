import {describe, test, expect, vi} from 'vitest'
import Entity from './entity.js'
import Component from './component.js'
import BuffSystem from './buff_system.js'


function createEntity () {
    const entity = new Entity()
    entity.create(BuffSystem)
    return entity
}


describe('BuffSystem', () => {

    test('extends Component', () => {
        const system = new BuffSystem()

        expect(system).toBeInstanceOf(Component)
    })


    test('delegates methods to host', () => {
        const entity = createEntity()

        expect(entity.applyBuff).toBeTypeOf('function')
        expect(entity.removeBuff).toBeTypeOf('function')
        expect(entity.hasBuff).toBeTypeOf('function')
        expect(entity.getBuffModifier).toBeTypeOf('function')
        expect(entity.updateBuffs).toBeTypeOf('function')
        expect(entity.clearBuffs).toBeTypeOf('function')
    })


    describe('applyBuff', () => {

        test('adds a buff', () => {
            const entity = createEntity()

            entity.applyBuff('rage', 3, {damage: 1.5})

            expect(entity.hasBuff('rage')).toBe(true)
        })


        test('returns the buff object', () => {
            const entity = createEntity()

            const buff = entity.applyBuff('rage', 3, {damage: 1.5})

            expect(buff.key).toBe('rage')
            expect(buff.duration).toBe(3)
            expect(buff.remaining).toBe(3)
            expect(buff.modifiers.damage).toBe(1.5)
        })


        test('resets timer on re-apply (non-stackable)', () => {
            const entity = createEntity()

            entity.applyBuff('rage', 3, {damage: 1.5})
            entity.updateBuffs(2)
            entity.applyBuff('rage', 3, {damage: 1.8})

            const system = entity.children[0]
            const buff = system.buffs.get('rage')

            expect(buff.remaining).toBe(3)
            expect(buff.modifiers.damage).toBe(1.8)
        })


        test('does not emit buff:applied on re-apply', () => {
            const entity = createEntity()
            const handler = vi.fn()

            entity.applyBuff('rage', 3, {damage: 1.5})
            entity.on('buff:applied', handler)
            entity.applyBuff('rage', 3, {damage: 1.5})

            expect(handler).not.toHaveBeenCalled()
        })


        test('emits buff:applied on first apply', () => {
            const entity = createEntity()
            const handler = vi.fn()
            entity.on('buff:applied', handler)

            entity.applyBuff('rage', 3, {damage: 1.5})

            expect(handler).toHaveBeenCalledOnce()
            expect(handler).toHaveBeenCalledWith(expect.objectContaining({key: 'rage'}))
        })

    })


    describe('removeBuff', () => {

        test('removes existing buff', () => {
            const entity = createEntity()

            entity.applyBuff('rage', 3)
            entity.removeBuff('rage')

            expect(entity.hasBuff('rage')).toBe(false)
        })


        test('returns true on success', () => {
            const entity = createEntity()

            entity.applyBuff('rage', 3)

            expect(entity.removeBuff('rage')).toBe(true)
        })


        test('returns false when buff does not exist', () => {
            const entity = createEntity()

            expect(entity.removeBuff('rage')).toBe(false)
        })


        test('emits buff:expired on remove', () => {
            const entity = createEntity()
            const handler = vi.fn()
            entity.on('buff:expired', handler)

            entity.applyBuff('rage', 3, {damage: 1.5})
            entity.removeBuff('rage')

            expect(handler).toHaveBeenCalledOnce()
            expect(handler).toHaveBeenCalledWith(expect.objectContaining({key: 'rage'}))
        })

    })


    describe('getBuffModifier', () => {

        test('returns 1 with no buffs', () => {
            const entity = createEntity()

            expect(entity.getBuffModifier('speed')).toBe(1)
        })


        test('returns modifier from single buff', () => {
            const entity = createEntity()

            entity.applyBuff('rage', 3, {speed: 1.3})

            expect(entity.getBuffModifier('speed')).toBe(1.3)
        })


        test('returns 1 for unaffected stat', () => {
            const entity = createEntity()

            entity.applyBuff('rage', 3, {damage: 1.5})

            expect(entity.getBuffModifier('speed')).toBe(1)
        })


        test('multiplies modifiers from multiple buffs', () => {
            const entity = createEntity()

            entity.applyBuff('rage', 3, {speed: 1.3})
            entity.applyBuff('haste', 2, {speed: 1.2})

            expect(entity.getBuffModifier('speed')).toBeCloseTo(1.56)
        })

    })


    describe('updateBuffs', () => {

        test('decrements remaining time', () => {
            const entity = createEntity()
            const system = entity.children[0]

            entity.applyBuff('rage', 3)
            entity.updateBuffs(1)

            expect(system.buffs.get('rage').remaining).toBeCloseTo(2)
        })


        test('removes expired buffs', () => {
            const entity = createEntity()

            entity.applyBuff('rage', 1)
            entity.updateBuffs(1.5)

            expect(entity.hasBuff('rage')).toBe(false)
        })


        test('emits buff:expired when buff runs out', () => {
            const entity = createEntity()
            const handler = vi.fn()
            entity.on('buff:expired', handler)

            entity.applyBuff('rage', 1)
            entity.updateBuffs(1.5)

            expect(handler).toHaveBeenCalledOnce()
            expect(handler).toHaveBeenCalledWith(expect.objectContaining({key: 'rage'}))
        })


        test('does not decrement permanent buffs (duration -1)', () => {
            const entity = createEntity()
            const system = entity.children[0]

            entity.applyBuff('laststand', -1, {damage: 2})
            entity.updateBuffs(100)

            expect(entity.hasBuff('laststand')).toBe(true)
            expect(system.buffs.get('laststand').remaining).toBe(-1)
        })

    })


    test('clearBuffs removes all buffs', () => {
        const entity = createEntity()

        entity.applyBuff('rage', 3)
        entity.applyBuff('haste', 2)
        entity.clearBuffs()

        expect(entity.hasBuff('rage')).toBe(false)
        expect(entity.hasBuff('haste')).toBe(false)
    })

})
