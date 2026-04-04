import {describe, test, expect} from 'vitest'
import Survivor from './survivor.js'
import Vec2 from '../../math/vec2.js'


describe('Survivor', () => {

    test('has static $tags ["survivor"]', () => {
        expect(Survivor.$tags).toEqual(['survivor'])
    })


    test('has default properties', () => {
        const survivor = new Survivor()

        expect(survivor.bodyRadius).toBe(0.25)
        expect(survivor.colorIndex).toBe(0)
        expect(survivor.alive).toBe(true)
        expect(survivor.moveDirection).toBeInstanceOf(Vec2)
        expect(survivor.moveDirection.x).toBe(0)
        expect(survivor.moveDirection.y).toBe(0)
    })


    test('accepts colorIndex parameter', () => {
        const survivor = new Survivor({colorIndex: 3})

        expect(survivor.colorIndex).toBe(3)
    })


    test('has velocity component', () => {
        const survivor = new Survivor()

        expect(survivor.velocity).toBeInstanceOf(Vec2)
    })


    test('move sets moveDirection', () => {
        const survivor = new Survivor()

        survivor.move(1, -1)

        expect(survivor.moveDirection.x).toBe(1)
        expect(survivor.moveDirection.y).toBe(-1)
    })


    test('update applies normalized movement to velocity', () => {
        const survivor = new Survivor()

        survivor.move(1, 0)
        survivor.update(0)

        expect(survivor.velocity.x).toBe(3)
        expect(survivor.velocity.y).toBe(0)
    })


    test('update normalizes diagonal movement', () => {
        const survivor = new Survivor()

        survivor.move(1, 1)
        survivor.update(0)

        const expected = 3 / Math.sqrt(2)
        expect(survivor.velocity.x).toBeCloseTo(expected)
        expect(survivor.velocity.y).toBeCloseTo(expected)
    })


    test('update does not apply movement when dead', () => {
        const survivor = new Survivor()

        survivor.alive = false
        survivor.move(1, 0)
        survivor.update(0)

        expect(survivor.velocity.x).toBe(0)
        expect(survivor.velocity.y).toBe(0)
    })


    test('update does not apply movement when moveDirection is zero', () => {
        const survivor = new Survivor()

        survivor.update(0)

        expect(survivor.velocity.x).toBe(0)
        expect(survivor.velocity.y).toBe(0)
    })

})
