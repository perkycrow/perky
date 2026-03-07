import {describe, test, expect} from 'vitest'
import Entity from './entity.js'
import Component from './component.js'
import Steering from './steering.js'


describe('Steering', () => {

    test('extends Component', () => {
        const steering = new Steering()

        expect(steering).toBeInstanceOf(Component)
    })


    test('onInstall delegates methods to host', () => {
        const entity = new Entity({x: 0, y: 0})

        entity.create(Steering)

        expect(entity.seek).toBeTypeOf('function')
        expect(entity.flee).toBeTypeOf('function')
        expect(entity.arrive).toBeTypeOf('function')
        expect(entity.wander).toBeTypeOf('function')
        expect(entity.separate).toBeTypeOf('function')
        expect(entity.addForce).toBeTypeOf('function')
        expect(entity.resolveForce).toBeTypeOf('function')
    })


    describe('seek', () => {

        test('adds force toward target', () => {
            const entity = new Entity({x: 0, y: 0})
            entity.create(Steering)

            entity.seek({x: 10, y: 0}, 1)
            const result = entity.resolveForce()

            expect(result.x).toBeCloseTo(1)
            expect(result.y).toBeCloseTo(0)
        })


        test('applies weight', () => {
            const entity = new Entity({x: 0, y: 0})
            entity.create(Steering)

            entity.seek({x: 10, y: 0}, 0.5)
            const result = entity.resolveForce()

            expect(result.x).toBeCloseTo(0.5)
            expect(result.y).toBeCloseTo(0)
        })

    })


    test('flee adds force away from target', () => {
        const entity = new Entity({x: 0, y: 0})
        entity.create(Steering)

        entity.flee({x: 10, y: 0}, 1)
        const result = entity.resolveForce()

        expect(result.x).toBeCloseTo(-1)
        expect(result.y).toBeCloseTo(0)
    })


    describe('arrive', () => {

        test('full force when far from target', () => {
            const entity = new Entity({x: 0, y: 0})
            entity.create(Steering)

            entity.arrive({x: 10, y: 0}, 1, 2)
            const result = entity.resolveForce()

            expect(result.x).toBeCloseTo(1)
        })


        test('reduced force when within slowRadius', () => {
            const entity = new Entity({x: 0, y: 0})
            entity.create(Steering)

            entity.arrive({x: 1, y: 0}, 1, 2)
            const result = entity.resolveForce()

            expect(result.x).toBeCloseTo(0.5)
        })


        test('zero force when at target', () => {
            const entity = new Entity({x: 5, y: 5})
            entity.create(Steering)

            entity.arrive({x: 5, y: 5}, 1, 2)
            const result = entity.resolveForce()

            expect(result.x).toBeCloseTo(0)
            expect(result.y).toBeCloseTo(0)
        })

    })


    test('wander produces non-zero force', () => {
        const entity = new Entity({x: 0, y: 0})
        entity.create(Steering)

        entity.wander(1)
        const result = entity.resolveForce()

        expect(result.length()).toBeGreaterThan(0)
    })


    describe('separate', () => {

        test('pushes away from close neighbors', () => {
            const entity = new Entity({x: 0, y: 0})
            entity.create(Steering)

            const neighbor = new Entity({x: 0.5, y: 0})

            entity.separate([neighbor], 1, 2)
            const result = entity.resolveForce()

            expect(result.x).toBeLessThan(0)
        })


        test('ignores self in neighbors list', () => {
            const entity = new Entity({x: 0, y: 0})
            entity.create(Steering)

            entity.separate([entity], 1, 2)
            const result = entity.resolveForce()

            expect(result.x).toBeCloseTo(0)
            expect(result.y).toBeCloseTo(0)
        })


        test('ignores neighbors outside radius', () => {
            const entity = new Entity({x: 0, y: 0})
            entity.create(Steering)

            const neighbor = new Entity({x: 10, y: 0})

            entity.separate([neighbor], 1, 2)
            const result = entity.resolveForce()

            expect(result.x).toBeCloseTo(0)
            expect(result.y).toBeCloseTo(0)
        })

    })


    describe('addForce', () => {

        test('adds raw directional force', () => {
            const entity = new Entity({x: 0, y: 0})
            entity.create(Steering)

            entity.addForce({x: 0.5, y: 0.3}, 1)
            const result = entity.resolveForce()

            expect(result.x).toBeCloseTo(0.5)
            expect(result.y).toBeCloseTo(0.3)
        })


        test('applies weight', () => {
            const entity = new Entity({x: 0, y: 0})
            entity.create(Steering)

            entity.addForce({x: 1, y: 0}, 2)
            const result = entity.resolveForce()

            expect(result.x).toBeCloseTo(1)
        })

    })


    describe('resolveForce', () => {

        test('normalizes when force exceeds 1', () => {
            const entity = new Entity({x: 0, y: 0})
            entity.create(Steering)

            entity.seek({x: 10, y: 0}, 3)
            const result = entity.resolveForce()

            expect(result.length()).toBeCloseTo(1)
        })


        test('preserves magnitude under 1', () => {
            const entity = new Entity({x: 0, y: 0})
            entity.create(Steering)

            entity.seek({x: 10, y: 0}, 0.3)
            const result = entity.resolveForce()

            expect(result.length()).toBeCloseTo(0.3)
        })


        test('resets force after resolve', () => {
            const entity = new Entity({x: 0, y: 0})
            entity.create(Steering)

            entity.seek({x: 10, y: 0}, 1)
            entity.resolveForce()

            const result = entity.resolveForce()

            expect(result.x).toBeCloseTo(0)
            expect(result.y).toBeCloseTo(0)
        })


        test('combines multiple forces', () => {
            const entity = new Entity({x: 0, y: 0})
            entity.create(Steering)

            entity.seek({x: 10, y: 0}, 1)
            entity.seek({x: 0, y: 10}, 1)
            const result = entity.resolveForce()

            expect(result.x).toBeGreaterThan(0)
            expect(result.y).toBeGreaterThan(0)
            expect(result.length()).toBeCloseTo(1)
        })

    })

})
