import {describe, test, expect} from 'vitest'
import Entity from './entity.js'
import Velocity from './velocity.js'
import Vec2 from '../math/vec2.js'


describe('Entity', () => {

    test('has static $category "entity"', () => {
        expect(Entity.$category).toBe('entity')
    })


    test('can be instantiated with tags', () => {
        const entity = new Entity({$tags: ['enemy', 'collidable']})

        expect(entity.$category).toBe('entity')
        expect(entity.$tags).toEqual(['enemy', 'collidable'])
    })


    test('has default position at origin', () => {
        const entity = new Entity()

        expect(entity.position).toBeInstanceOf(Vec2)
        expect(entity.x).toBe(0)
        expect(entity.y).toBe(0)
    })


    test('accepts initial position', () => {
        const entity = new Entity({x: 5, y: 10})

        expect(entity.x).toBe(5)
        expect(entity.y).toBe(10)
    })


    test('does not have velocity by default', () => {
        const entity = new Entity()

        expect(entity.velocity).toBeUndefined()
    })


    test('x and y setters update position', () => {
        const entity = new Entity()

        entity.x = 42
        entity.y = 84

        expect(entity.position.x).toBe(42)
        expect(entity.position.y).toBe(84)
    })


    test('has update method', () => {
        const entity = new Entity()

        expect(typeof entity.update).toBe('function')
    })


    test('components returns children with category "component"', () => {
        const entity = new Entity()

        expect(entity.components).toEqual([])

        const velocity = entity.create(Velocity)

        expect(entity.components).toEqual([velocity])
    })

})
