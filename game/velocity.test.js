import {describe, test, expect} from 'vitest'
import Entity from './entity.js'
import Component from './component.js'
import Velocity from './velocity.js'
import Vec2 from '../math/vec2.js'


describe('Velocity', () => {

    test('extends Component', () => {
        const velocity = new Velocity()

        expect(velocity).toBeInstanceOf(Component)
    })


    test('creates Vec2 with default zero values', () => {
        const velocity = new Velocity()

        expect(velocity.vec2).toBeInstanceOf(Vec2)
        expect(velocity.vec2.x).toBe(0)
        expect(velocity.vec2.y).toBe(0)
    })


    test('creates Vec2 with provided values', () => {
        const velocity = new Velocity({x: 3, y: -2})

        expect(velocity.vec2.x).toBe(3)
        expect(velocity.vec2.y).toBe(-2)
    })


    test('onInstall sets host.velocity to vec2', () => {
        const entity = new Entity()

        entity.create(Velocity, {x: 1, y: 2})

        expect(entity.velocity).toBeInstanceOf(Vec2)
        expect(entity.velocity.x).toBe(1)
        expect(entity.velocity.y).toBe(2)
    })


    test('velocity vec2 is shared reference', () => {
        const entity = new Entity()
        const velocity = entity.create(Velocity)

        velocity.vec2.set(5, 10)

        expect(entity.velocity.x).toBe(5)
        expect(entity.velocity.y).toBe(10)
    })


    test('delegation is cleaned up on remove', () => {
        const entity = new Entity()

        entity.create(Velocity, {$id: 'velocity'})

        expect(entity.velocity).toBeDefined()

        entity.removeChild('velocity')

        expect(entity.velocity).toBeUndefined()
    })

})
