import {describe, test, expect, beforeEach} from 'vitest'
import World from './world'
import Entity from './entity'


describe('World', () => {

    let world

    beforeEach(() => {
        world = new World()
    })


    describe('constructor', () => {

        test('has correct $category', () => {
            expect(World.$category).toBe('world')
        })

    })


    describe('entities', () => {

        test('returns empty array when no entities', () => {
            expect(world.entities).toEqual([])
        })


        test('returns entities created in world', () => {
            const entity1 = world.create(Entity, {$id: 'entity-1'})
            const entity2 = world.create(Entity, {$id: 'entity-2'})

            const entities = world.entities

            expect(entities).toContain(entity1)
            expect(entities).toContain(entity2)
            expect(entities.length).toBe(2)
        })


        test('does not return non-entity children', () => {
            world.create(Entity, {$id: 'entity-1'})

            // Create a non-entity child
            class NonEntity extends Entity {
                static $category = 'other'
            }
            world.create(NonEntity, {$id: 'non-entity'})

            const entities = world.entities

            expect(entities.length).toBe(1)
            expect(entities[0].$id).toBe('entity-1')
        })

    })

})
