import {describe, test, expect} from 'vitest'
import Survivor from './survivor.js'
import Entity from '../../game/entity.js'


describe('Survivor', () => {

    test('extends Entity', () => {
        const survivor = new Survivor()
        expect(survivor).toBeInstanceOf(Entity)
    })


    test('has survivor tag', () => {
        expect(Survivor.$tags).toContain('survivor')
    })


    test('has velocity component', () => {
        const survivor = new Survivor()
        expect(survivor.velocity).toBeDefined()
    })


    test('has bodyRadius', () => {
        const survivor = new Survivor()
        expect(survivor.bodyRadius).toBe(0.25)
    })


    test('starts alive', () => {
        const survivor = new Survivor()
        expect(survivor.alive).toBe(true)
    })


    test('starts with zero moveDirection', () => {
        const survivor = new Survivor()
        expect(survivor.moveDirection.x).toBe(0)
        expect(survivor.moveDirection.y).toBe(0)
    })


    test('move sets direction', () => {
        const survivor = new Survivor()
        survivor.move(1, -1)
        expect(survivor.moveDirection.x).toBe(1)
        expect(survivor.moveDirection.y).toBe(-1)
    })


    test('update applies movement to velocity', () => {
        const survivor = new Survivor()
        survivor.move(1, 0)
        survivor.update(1 / 60)
        expect(survivor.velocity.x).not.toBe(0)
    })


    test('update dampens velocity', () => {
        const survivor = new Survivor()
        survivor.velocity.x = 5
        survivor.move(0, 0)
        survivor.update(1 / 60)
        expect(survivor.velocity.x).toBeLessThan(5)
    })


    test('update moves position', () => {
        const survivor = new Survivor()
        survivor.move(1, 0)
        survivor.update(1 / 60)
        expect(survivor.x).not.toBe(0)
    })


    test('diagonal movement is normalized', () => {
        const survivor = new Survivor()
        survivor.move(1, 1)
        survivor.update(1 / 60)
        const diagonalSpeed = Math.sqrt(
            survivor.velocity.x * survivor.velocity.x +
            survivor.velocity.y * survivor.velocity.y
        )

        const straight = new Survivor()
        straight.move(1, 0)
        straight.update(1 / 60)
        const straightSpeed = Math.abs(straight.velocity.x)

        expect(Math.abs(diagonalSpeed - straightSpeed)).toBeLessThan(0.1)
    })

})
