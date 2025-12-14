import { describe, test, expect } from 'vitest'
import Entity from './entity'


describe('Entity', () => {

    test('has static category "entity"', () => {
        expect(Entity.category).toBe('entity')
    })


    test('can be instantiated with tags', () => {
        const entity = new Entity({ $tags: ['enemy', 'collidable'] })

        expect(entity.$category).toBe('entity')
        expect(entity.$tags).toEqual(['enemy', 'collidable'])
    })

})
