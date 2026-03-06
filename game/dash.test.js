import {describe, test, expect} from 'vitest'
import Entity from './entity.js'
import Component from './component.js'
import Velocity from './velocity.js'
import Dash from './dash.js'


function createEntity (x = 0, y = 0) {
    const entity = new Entity({x, y})
    entity.create(Velocity)
    entity.create(Dash)
    return entity
}


describe('Dash', () => {

    test('extends Component', () => {
        const dash = new Dash()

        expect(dash).toBeInstanceOf(Component)
    })


    test('delegates methods to host', () => {
        const entity = createEntity()

        expect(entity.dash).toBeTypeOf('function')
        expect(entity.updateDash).toBeTypeOf('function')
        expect(entity.cancelDash).toBeTypeOf('function')
        expect(entity.isDashing).toBeTypeOf('function')
    })


    describe('dash', () => {

        test('applies velocity impulse in direction', () => {
            const entity = createEntity()

            entity.dash({x: 1, y: 0}, {power: 10})

            expect(entity.velocity.x).toBeCloseTo(10)
            expect(entity.velocity.y).toBeCloseTo(0)
        })


        test('normalizes direction', () => {
            const entity = createEntity()

            entity.dash({x: 3, y: 4}, {power: 10})

            expect(entity.velocity.x).toBeCloseTo(6)
            expect(entity.velocity.y).toBeCloseTo(8)
        })


        test('returns true on success', () => {
            const entity = createEntity()

            const result = entity.dash({x: 1, y: 0}, {power: 10})

            expect(result).toBe(true)
        })


        test('returns false if already dashing', () => {
            const entity = createEntity()

            entity.dash({x: 1, y: 0}, {power: 10, duration: 1})
            const result = entity.dash({x: 0, y: 1}, {power: 10})

            expect(result).toBe(false)
        })


        test('returns false if on cooldown', () => {
            const entity = createEntity()

            entity.dash({x: 1, y: 0}, {power: 10, duration: 0.1, cooldown: 1})
            entity.updateDash(0.2)
            const result = entity.dash({x: 0, y: 1}, {power: 10})

            expect(result).toBe(false)
        })


        test('returns false with zero direction', () => {
            const entity = createEntity()

            const result = entity.dash({x: 0, y: 0}, {power: 10})

            expect(result).toBe(false)
        })

    })


    describe('active', () => {

        test('is true during dash', () => {
            const entity = createEntity()
            const dashComp = entity.children[1]

            entity.dash({x: 1, y: 0}, {power: 10, duration: 0.5})

            expect(dashComp.active).toBe(true)
        })


        test('is false after dash ends', () => {
            const entity = createEntity()
            const dashComp = entity.children[1]

            entity.dash({x: 1, y: 0}, {power: 10, duration: 0.1})
            entity.updateDash(0.2)

            expect(dashComp.active).toBe(false)
        })

    })


    describe('progress', () => {

        test('is 0 at start', () => {
            const entity = createEntity()
            const dashComp = entity.children[1]

            entity.dash({x: 1, y: 0}, {power: 10, duration: 1})

            expect(dashComp.progress).toBeCloseTo(0)
        })


        test('is 0.5 at midpoint', () => {
            const entity = createEntity()
            const dashComp = entity.children[1]

            entity.dash({x: 1, y: 0}, {power: 10, duration: 1})
            entity.updateDash(0.5)

            expect(dashComp.progress).toBeCloseTo(0.5)
        })


        test('is 1 after completion', () => {
            const entity = createEntity()
            const dashComp = entity.children[1]

            entity.dash({x: 1, y: 0}, {power: 10, duration: 0.5})
            entity.updateDash(0.6)

            expect(dashComp.progress).toBeCloseTo(1)
        })

    })


    describe('cooldown', () => {

        test('enters cooldown after dash ends', () => {
            const entity = createEntity()
            const dashComp = entity.children[1]

            entity.dash({x: 1, y: 0}, {power: 10, duration: 0.1, cooldown: 1})
            entity.updateDash(0.2)

            expect(dashComp.onCooldown).toBe(true)
        })


        test('cooldown decreases over time', () => {
            const entity = createEntity()
            const dashComp = entity.children[1]

            entity.dash({x: 1, y: 0}, {power: 10, duration: 0.1, cooldown: 1})
            entity.updateDash(0.2)
            entity.updateDash(0.5)

            expect(dashComp.cooldownTimer).toBeCloseTo(0.5)
        })


        test('can dash again after cooldown expires', () => {
            const entity = createEntity()

            entity.dash({x: 1, y: 0}, {power: 10, duration: 0.1, cooldown: 0.5})
            entity.updateDash(0.2)
            entity.updateDash(0.6)

            const result = entity.dash({x: 0, y: 1}, {power: 10})

            expect(result).toBe(true)
        })

    })


    describe('sustain', () => {

        test('no sustained force when sustain is 0', () => {
            const entity = createEntity()

            entity.dash({x: 1, y: 0}, {power: 10, duration: 0.5, sustain: 0})
            const vxAfterImpulse = entity.velocity.x

            entity.updateDash(0.1)

            expect(entity.velocity.x).toBeCloseTo(vxAfterImpulse)
        })


        test('adds sustained force when sustain > 0', () => {
            const entity = createEntity()

            entity.dash({x: 1, y: 0}, {power: 10, duration: 0.5, sustain: 1})
            const vxAfterImpulse = entity.velocity.x

            entity.updateDash(1 / 60)

            expect(entity.velocity.x).toBeGreaterThan(vxAfterImpulse)
        })

    })


    describe('cancelDash', () => {

        test('stops active dash', () => {
            const entity = createEntity()
            const dashComp = entity.children[1]

            entity.dash({x: 1, y: 0}, {power: 10, duration: 1})
            entity.cancelDash()

            expect(dashComp.active).toBe(false)
        })


        test('clears cooldown', () => {
            const entity = createEntity()
            const dashComp = entity.children[1]

            entity.dash({x: 1, y: 0}, {power: 10, duration: 0.1, cooldown: 5})
            entity.updateDash(0.2)
            entity.cancelDash()

            expect(dashComp.onCooldown).toBe(false)
        })

    })

})
