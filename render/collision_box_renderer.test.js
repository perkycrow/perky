import {describe, test, expect, beforeEach} from 'vitest'
import CollisionBoxRenderer from './collision_box_renderer'
import Rectangle from './rectangle'
import Group2D from './group_2d'


class MockEntity {
    constructor (x = 0, y = 0) {
        this.x = x
        this.y = y
    }
}


class MockContext {
    constructor (config = {}) {
        this.group = new Group2D({name: 'test-group'})
        this.config = config
    }
}


describe('CollisionBoxRenderer', () => {

    let entity
    let context
    let renderer

    beforeEach(() => {
        entity = new MockEntity(10, 20)
        context = new MockContext()
        renderer = new CollisionBoxRenderer(entity, context)
    })


    describe('constructor', () => {

        test('extends EntityRenderer', () => {
            expect(renderer.entity).toBe(entity)
            expect(renderer.context).toBe(context)
        })


        test('creates a Rectangle as root', () => {
            expect(renderer.root).toBeInstanceOf(Rectangle)
        })


        test('positions rectangle at entity position', () => {
            expect(renderer.root.x).toBe(10)
            expect(renderer.root.y).toBe(20)
        })


        test('uses default dimensions of 1x1', () => {
            expect(renderer.root.width).toBe(1)
            expect(renderer.root.height).toBe(1)
        })


        test('has transparent fill color', () => {
            expect(renderer.root.color).toBe('transparent')
        })


        test('uses default red stroke color', () => {
            expect(renderer.root.strokeColor).toBe('#ff0000')
        })


        test('uses default stroke width of 2', () => {
            expect(renderer.root.strokeWidth).toBe(2)
        })

    })


    describe('config options', () => {

        test('accepts custom dimensions', () => {
            const customContext = new MockContext({width: 2.5, height: 3.0})
            const customRenderer = new CollisionBoxRenderer(entity, customContext)

            expect(customRenderer.root.width).toBe(2.5)
            expect(customRenderer.root.height).toBe(3.0)
        })


        test('accepts custom stroke color', () => {
            const customContext = new MockContext({strokeColor: '#00ff00'})
            const customRenderer = new CollisionBoxRenderer(entity, customContext)

            expect(customRenderer.root.strokeColor).toBe('#00ff00')
        })


        test('accepts custom stroke width', () => {
            const customContext = new MockContext({strokeWidth: 5})
            const customRenderer = new CollisionBoxRenderer(entity, customContext)

            expect(customRenderer.root.strokeWidth).toBe(5)
        })


        test('handles missing config gracefully', () => {
            const noConfigContext = {group: new Group2D()}
            const noConfigRenderer = new CollisionBoxRenderer(entity, noConfigContext)

            expect(noConfigRenderer.root.width).toBe(1)
            expect(noConfigRenderer.root.height).toBe(1)
            expect(noConfigRenderer.root.strokeColor).toBe('#ff0000')
            expect(noConfigRenderer.root.strokeWidth).toBe(2)
        })

    })


    describe('sync', () => {

        test('updates rectangle position from entity', () => {
            entity.x = 100
            entity.y = 200
            renderer.sync()

            expect(renderer.root.x).toBe(100)
            expect(renderer.root.y).toBe(200)
        })

    })


    describe('dispose', () => {

        test('cleans up properly', () => {
            context.group.addChild(renderer.root)
            renderer.dispose()

            expect(renderer.root).toBeNull()
            expect(renderer.entity).toBeNull()
        })

    })

})
