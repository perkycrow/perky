import {describe, test, expect, beforeEach} from 'vitest'
import EntityRenderer from './entity_renderer'
import Group2D from './group_2d'


class MockEntity {
    constructor (x = 0, y = 0) {
        this.x = x
        this.y = y
    }
}


class MockContext {
    constructor () {
        this.group = new Group2D({name: 'test-group'})
        this.config = {}
    }
}


describe('EntityRenderer', () => {

    let entity
    let context
    let renderer

    beforeEach(() => {
        entity = new MockEntity(10, 20)
        context = new MockContext()
        renderer = new EntityRenderer(entity, context)
    })


    describe('constructor', () => {

        test('stores entity reference', () => {
            expect(renderer.entity).toBe(entity)
        })


        test('stores context reference', () => {
            expect(renderer.context).toBe(context)
        })


        test('initializes root as null', () => {
            expect(renderer.root).toBeNull()
        })

    })


    describe('sync', () => {

        test('does nothing when root is null', () => {
            expect(() => renderer.sync()).not.toThrow()
        })


        test('syncs root position from entity', () => {
            renderer.root = {x: 0, y: 0}

            entity.x = 100
            entity.y = 200
            renderer.sync()

            expect(renderer.root.x).toBe(100)
            expect(renderer.root.y).toBe(200)
        })


        test('updates root when entity moves', () => {
            renderer.root = {x: 0, y: 0}

            renderer.sync()
            expect(renderer.root.x).toBe(10)
            expect(renderer.root.y).toBe(20)

            entity.x = 50
            entity.y = 75
            renderer.sync()

            expect(renderer.root.x).toBe(50)
            expect(renderer.root.y).toBe(75)
        })

    })


    describe('dispose', () => {

        test('removes root from context group', () => {
            const mockRoot = new Group2D({name: 'mock-root'})
            context.group.addChild(mockRoot)
            renderer.root = mockRoot

            expect(context.group.children).toContain(mockRoot)

            renderer.dispose()

            expect(context.group.children).not.toContain(mockRoot)
        })


        test('sets root to null', () => {
            renderer.root = {x: 0, y: 0}
            renderer.dispose()

            expect(renderer.root).toBeNull()
        })


        test('sets entity to null', () => {
            renderer.dispose()
            expect(renderer.entity).toBeNull()
        })


        test('sets context to null', () => {
            renderer.dispose()
            expect(renderer.context).toBeNull()
        })


        test('handles null root gracefully', () => {
            renderer.root = null
            expect(() => renderer.dispose()).not.toThrow()
        })


        test('handles null context.group gracefully', () => {
            renderer.root = {x: 0, y: 0}
            context.group = null

            expect(() => renderer.dispose()).not.toThrow()
        })

    })

})
