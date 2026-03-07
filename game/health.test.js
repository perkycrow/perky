import {describe, test, expect, vi} from 'vitest'
import Entity from './entity.js'
import Component from './component.js'
import Health from './health.js'


function createEntity (hp = 3) {
    const entity = new Entity()
    entity.create(Health, {hp})
    return entity
}


describe('Health', () => {

    test('extends Component', () => {
        const health = new Health()

        expect(health).toBeInstanceOf(Component)
    })


    test('delegates methods to host', () => {
        const entity = createEntity()

        expect(entity.damage).toBeTypeOf('function')
        expect(entity.heal).toBeTypeOf('function')
        expect(entity.isAlive).toBeTypeOf('function')
        expect(entity.isInvincible).toBeTypeOf('function')
    })


    test('initializes with given hp', () => {
        const entity = createEntity(5)
        const health = entity.children[0]

        expect(health.hp).toBe(5)
        expect(health.maxHp).toBe(5)
    })


    test('initializes with separate maxHp', () => {
        const entity = new Entity()
        entity.create(Health, {hp: 2, maxHp: 10})
        const health = entity.children[0]

        expect(health.hp).toBe(2)
        expect(health.maxHp).toBe(10)
    })


    describe('damage', () => {

        test('reduces hp', () => {
            const entity = createEntity(5)
            const health = entity.children[0]

            entity.damage(2)

            expect(health.hp).toBe(3)
        })


        test('returns true on success', () => {
            const entity = createEntity()

            expect(entity.damage(1)).toBe(true)
        })


        test('does not go below zero', () => {
            const entity = createEntity(2)
            const health = entity.children[0]

            entity.damage(10)

            expect(health.hp).toBe(0)
        })


        test('returns false when already dead', () => {
            const entity = createEntity(1)

            entity.damage(1)
            const result = entity.damage(1)

            expect(result).toBe(false)
        })


        test('emits damaged event', () => {
            const entity = createEntity(5)
            const handler = vi.fn()
            entity.on('damaged', handler)

            entity.damage(2)

            expect(handler).toHaveBeenCalledWith({amount: 2, hp: 3})
        })


        test('emits death event when hp reaches 0', () => {
            const entity = createEntity(1)
            const handler = vi.fn()
            entity.on('death', handler)

            entity.damage(1)

            expect(handler).toHaveBeenCalledOnce()
        })


        test('does not emit death when hp stays above 0', () => {
            const entity = createEntity(5)
            const handler = vi.fn()
            entity.on('death', handler)

            entity.damage(2)

            expect(handler).not.toHaveBeenCalled()
        })

    })


    describe('invincibility', () => {

        test('sets invincible timer on damage', () => {
            const entity = createEntity(5)
            const health = entity.children[0]

            entity.damage(1, {invincibility: 0.5})

            expect(entity.isInvincible()).toBe(true)
            expect(health.invincibleTimer).toBeCloseTo(0.5)
        })


        test('blocks damage while invincible', () => {
            const entity = createEntity(5)
            const health = entity.children[0]

            entity.damage(1, {invincibility: 1})
            const result = entity.damage(1)

            expect(result).toBe(false)
            expect(health.hp).toBe(4)
        })


        test('invincibility decreases over time', () => {
            const entity = createEntity(5)
            const health = entity.children[0]

            entity.damage(1, {invincibility: 1})
            health.updateHealth(0.6)

            expect(health.invincibleTimer).toBeCloseTo(0.4)
        })


        test('can take damage after invincibility expires', () => {
            const entity = createEntity(5)
            const health = entity.children[0]

            entity.damage(1, {invincibility: 0.5})
            health.updateHealth(0.6)

            const result = entity.damage(1)

            expect(result).toBe(true)
            expect(health.hp).toBe(3)
        })

    })


    describe('heal', () => {

        test('increases hp', () => {
            const entity = createEntity(5)
            const health = entity.children[0]

            entity.damage(3)
            entity.heal(2)

            expect(health.hp).toBe(4)
        })


        test('does not exceed maxHp', () => {
            const entity = createEntity(5)
            const health = entity.children[0]

            entity.damage(1)
            entity.heal(10)

            expect(health.hp).toBe(5)
        })


        test('returns false when dead', () => {
            const entity = createEntity(1)

            entity.damage(1)
            const result = entity.heal(1)

            expect(result).toBe(false)
        })


        test('emits healed event', () => {
            const entity = createEntity(5)
            const handler = vi.fn()
            entity.on('healed', handler)

            entity.damage(2)
            entity.heal(1)

            expect(handler).toHaveBeenCalledWith({amount: 1, hp: 4})
        })

    })


    describe('isAlive', () => {

        test('returns true when hp > 0', () => {
            const entity = createEntity(3)

            expect(entity.isAlive()).toBe(true)
        })


        test('returns false when hp = 0', () => {
            const entity = createEntity(1)

            entity.damage(1)

            expect(entity.isAlive()).toBe(false)
        })

    })

})
