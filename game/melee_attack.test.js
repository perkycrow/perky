import {describe, test, expect, vi} from 'vitest'
import Entity from './entity.js'
import Component from './component.js'
import MeleeAttack from './melee_attack.js'


function createEntity (x = 0, y = 0) {
    const entity = new Entity({x, y, hitRadius: 0.3})
    entity.create(MeleeAttack, {range: 0.6, cooldown: 1, windUp: 0.15, strikeTime: 0.1})
    return entity
}


function createTarget (x = 0.5, y = 0) {
    const target = new Entity({x, y, hitRadius: 0.3})
    return target
}


describe('MeleeAttack', () => {

    test('extends Component', () => {
        const attack = new MeleeAttack()

        expect(attack).toBeInstanceOf(Component)
    })


    test('has default values', () => {
        const attack = new MeleeAttack()

        expect(attack.meleeDamage).toBe(1)
        expect(attack.meleeRange).toBe(0.6)
        expect(attack.meleeCooldown).toBe(1)
        expect(attack.windUp).toBe(0.15)
        expect(attack.strikeTime).toBe(0.1)
        expect(attack.cooldownTimer).toBe(0)
        expect(attack.phase).toBe('idle')
    })


    test('accepts custom values', () => {
        const attack = new MeleeAttack({
            damage: 5,
            range: 1.2,
            cooldown: 2,
            windUp: 0.3,
            strikeTime: 0.2
        })

        expect(attack.meleeDamage).toBe(5)
        expect(attack.meleeRange).toBe(1.2)
        expect(attack.meleeCooldown).toBe(2)
        expect(attack.windUp).toBe(0.3)
        expect(attack.strikeTime).toBe(0.2)
    })


    test('delegates methods to host', () => {
        const entity = createEntity()

        expect(entity.meleeAttack).toBeTypeOf('function')
        expect(entity.updateMeleeAttack).toBeTypeOf('function')
        expect(entity.isAttacking).toBeTypeOf('function')
    })


    describe('meleeAttack', () => {

        test('returns true when in range', () => {
            const entity = createEntity()
            const target = createTarget(0.5, 0)

            const result = entity.meleeAttack(target)

            expect(result).toBe(true)
        })


        test('returns false when out of range', () => {
            const entity = createEntity()
            const target = createTarget(5, 0)

            const result = entity.meleeAttack(target)

            expect(result).toBe(false)
        })


        test('returns false when already attacking', () => {
            const entity = createEntity()
            const target = createTarget(0.5, 0)

            entity.meleeAttack(target)
            const result = entity.meleeAttack(target)

            expect(result).toBe(false)
        })


        test('returns false when on cooldown', () => {
            const entity = createEntity()
            const target = createTarget(0.5, 0)

            entity.meleeAttack(target)
            entity.updateMeleeAttack(0.15)
            entity.updateMeleeAttack(0.1)

            const result = entity.meleeAttack(target)

            expect(result).toBe(false)
        })


        test('sets phase to winding', () => {
            const entity = createEntity()
            const target = createTarget(0.5, 0)
            const comp = entity.children[0]

            entity.meleeAttack(target)

            expect(comp.phase).toBe('winding')
        })

    })


    describe('phases', () => {

        test('transitions from winding to striking', () => {
            const entity = createEntity()
            const target = createTarget(0.5, 0)
            const comp = entity.children[0]

            entity.meleeAttack(target)
            entity.updateMeleeAttack(0.15)

            expect(comp.phase).toBe('striking')
        })


        test('transitions from striking to idle', () => {
            const entity = createEntity()
            const target = createTarget(0.5, 0)
            const comp = entity.children[0]

            entity.meleeAttack(target)
            entity.updateMeleeAttack(0.15)
            entity.updateMeleeAttack(0.1)

            expect(comp.phase).toBe('idle')
        })


        test('enters cooldown after attack completes', () => {
            const entity = createEntity()
            const target = createTarget(0.5, 0)
            const comp = entity.children[0]

            entity.meleeAttack(target)
            entity.updateMeleeAttack(0.15)
            entity.updateMeleeAttack(0.1)

            expect(comp.cooldownTimer).toBeCloseTo(1)
        })


        test('can attack again after cooldown expires', () => {
            const entity = createEntity()
            const target = createTarget(0.5, 0)

            entity.meleeAttack(target)
            entity.updateMeleeAttack(0.15)
            entity.updateMeleeAttack(0.1)
            entity.updateMeleeAttack(1.1)

            const result = entity.meleeAttack(target)

            expect(result).toBe(true)
        })


        test('applies host getCooldownModifier to cooldown', () => {
            const entity = createEntity()
            entity.getCooldownModifier = () => 0.5
            const target = createTarget(0.5, 0)
            const comp = entity.children[0]

            entity.meleeAttack(target)
            entity.updateMeleeAttack(0.15)
            entity.updateMeleeAttack(0.1)

            expect(comp.cooldownTimer).toBeCloseTo(0.5)
        })

    })


    describe('strike event', () => {

        test('emits strike when winding completes', () => {
            const entity = createEntity()
            const target = createTarget(0.5, 0)
            const handler = vi.fn()
            entity.on('strike', handler)

            entity.meleeAttack(target)
            entity.updateMeleeAttack(0.15)

            expect(handler).toHaveBeenCalledOnce()
            expect(handler).toHaveBeenCalledWith(expect.objectContaining({
                target,
                damage: 1
            }))
        })


        test('does not emit strike during winding', () => {
            const entity = createEntity()
            const target = createTarget(0.5, 0)
            const handler = vi.fn()
            entity.on('strike', handler)

            entity.meleeAttack(target)
            entity.updateMeleeAttack(0.05)

            expect(handler).not.toHaveBeenCalled()
        })

    })


    describe('isAttacking', () => {

        test('returns false when idle', () => {
            const entity = createEntity()

            expect(entity.isAttacking()).toBe(false)
        })


        test('returns true during winding', () => {
            const entity = createEntity()
            const target = createTarget(0.5, 0)

            entity.meleeAttack(target)

            expect(entity.isAttacking()).toBe(true)
        })


        test('returns true during striking', () => {
            const entity = createEntity()
            const target = createTarget(0.5, 0)

            entity.meleeAttack(target)
            entity.updateMeleeAttack(0.15)

            expect(entity.isAttacking()).toBe(true)
        })


        test('returns false after attack completes', () => {
            const entity = createEntity()
            const target = createTarget(0.5, 0)

            entity.meleeAttack(target)
            entity.updateMeleeAttack(0.15)
            entity.updateMeleeAttack(0.1)

            expect(entity.isAttacking()).toBe(false)
        })

    })


    describe('attackProgress', () => {

        test('is 0 when idle', () => {
            const entity = createEntity()
            const comp = entity.children[0]

            expect(comp.attackProgress).toBe(0)
        })


        test('progresses during winding', () => {
            const entity = createEntity()
            const target = createTarget(0.5, 0)
            const comp = entity.children[0]

            entity.meleeAttack(target)
            entity.updateMeleeAttack(0.075)

            expect(comp.attackProgress).toBeCloseTo(0.5)
        })


        test('progresses during striking', () => {
            const entity = createEntity()
            const target = createTarget(0.5, 0)
            const comp = entity.children[0]

            entity.meleeAttack(target)
            entity.updateMeleeAttack(0.15)
            entity.updateMeleeAttack(0.05)

            expect(comp.attackProgress).toBeCloseTo(0.5)
        })

    })

})
