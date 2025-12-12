import {describe, test, expect, beforeEach} from 'vitest'
import Entity from './entity'


describe('Entity', () => {

    describe('constructor', () => {

        test('creates entity with default category', () => {
            const entity = new Entity()

            expect(entity.$category).toBe('entity')
            expect(entity.$tags).toEqual([])
        })

        test('accepts custom $category', () => {
            const entity = new Entity({$category: 'player'})

            expect(entity.$category).toBe('player')
        })

        test('accepts custom $tags', () => {
            const entity = new Entity({$tags: ['collidable', 'updatable']})

            expect(entity.$tags).toEqual(['collidable', 'updatable'])
        })

        test('combines metadata params', () => {
            const entity = new Entity({
                $category: 'enemy',
                $tags: ['hostile']
            })

            expect(entity.$category).toBe('enemy')
            expect(entity.$tags).toEqual(['hostile'])
        })

    })


    describe('inheritance', () => {

        test('extends PerkyModule', () => {
            const entity = new Entity()

            expect(entity.start).toBeDefined()
            expect(entity.stop).toBeDefined()
            expect(entity.emit).toBeDefined()
        })

        test('supports lifecycle methods', () => {
            const entity = new Entity()

            expect(entity.started).toBe(false)

            entity.start()
            expect(entity.started).toBe(true)

            entity.stop()
            expect(entity.started).toBe(false)
        })

    })

})
