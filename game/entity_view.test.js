import {describe, test, expect, beforeEach} from 'vitest'
import EntityView from './entity_view'
import Group2D from '../render/group_2d'


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


describe('EntityView', () => {

    let entity
    let context
    let view

    beforeEach(() => {
        entity = new MockEntity(10, 20)
        context = new MockContext()
        view = new EntityView(entity, context)
    })


    describe('constructor', () => {

        test('stores entity reference', () => {
            expect(view.entity).toBe(entity)
        })


        test('stores context reference', () => {
            expect(view.context).toBe(context)
        })


        test('initializes root as null', () => {
            expect(view.root).toBeNull()
        })

    })


    describe('sync', () => {

        test('does nothing when root is null', () => {
            expect(() => view.sync()).not.toThrow()
        })


        test('syncs root position from entity', () => {
            view.root = {x: 0, y: 0}

            entity.x = 100
            entity.y = 200
            view.sync()

            expect(view.root.x).toBe(100)
            expect(view.root.y).toBe(200)
        })


        test('updates root when entity moves', () => {
            view.root = {x: 0, y: 0}

            view.sync()
            expect(view.root.x).toBe(10)
            expect(view.root.y).toBe(20)

            entity.x = 50
            entity.y = 75
            view.sync()

            expect(view.root.x).toBe(50)
            expect(view.root.y).toBe(75)
        })

    })


    describe('dispose', () => {

        test('removes root from context group', () => {
            const mockRoot = new Group2D({name: 'mock-root'})
            context.group.addChild(mockRoot)
            view.root = mockRoot

            expect(context.group.children).toContain(mockRoot)

            view.dispose()

            expect(context.group.children).not.toContain(mockRoot)
        })


        test('sets root to null', () => {
            view.root = {x: 0, y: 0}
            view.dispose()

            expect(view.root).toBeNull()
        })


        test('sets entity to null', () => {
            view.dispose()
            expect(view.entity).toBeNull()
        })


        test('sets context to null', () => {
            view.dispose()
            expect(view.context).toBeNull()
        })


        test('handles null root gracefully', () => {
            view.root = null
            expect(() => view.dispose()).not.toThrow()
        })


        test('handles null context.group gracefully', () => {
            view.root = {x: 0, y: 0}
            context.group = null

            expect(() => view.dispose()).not.toThrow()
        })

    })

})
