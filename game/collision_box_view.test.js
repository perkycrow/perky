import {describe, test, expect, beforeEach} from 'vitest'
import CollisionBoxView from './collision_box_view.js'
import Rectangle from '../render/rectangle.js'
import Group2D from '../render/group_2d.js'


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


describe('CollisionBoxView', () => {

    let entity
    let context
    let view

    beforeEach(() => {
        entity = new MockEntity(10, 20)
        context = new MockContext()
        view = new CollisionBoxView(entity, context)
    })


    describe('constructor', () => {

        test('extends EntityView', () => {
            expect(view.entity).toBe(entity)
            expect(view.context).toBe(context)
        })


        test('creates a Rectangle as root', () => {
            expect(view.root).toBeInstanceOf(Rectangle)
        })


        test('positions rectangle at entity position', () => {
            expect(view.root.x).toBe(10)
            expect(view.root.y).toBe(20)
        })


        test('uses default dimensions of 1x1', () => {
            expect(view.root.width).toBe(1)
            expect(view.root.height).toBe(1)
        })


        test('has transparent fill color', () => {
            expect(view.root.color).toBe('transparent')
        })


        test('uses default red stroke color', () => {
            expect(view.root.strokeColor).toBe('#ff0000')
        })


        test('uses default stroke width of 2', () => {
            expect(view.root.strokeWidth).toBe(2)
        })

    })


    describe('config options', () => {

        test('accepts custom dimensions', () => {
            const customContext = new MockContext({width: 2.5, height: 3.0})
            const customView = new CollisionBoxView(entity, customContext)

            expect(customView.root.width).toBe(2.5)
            expect(customView.root.height).toBe(3.0)
        })


        test('accepts custom stroke color', () => {
            const customContext = new MockContext({strokeColor: '#00ff00'})
            const customView = new CollisionBoxView(entity, customContext)

            expect(customView.root.strokeColor).toBe('#00ff00')
        })


        test('accepts custom stroke width', () => {
            const customContext = new MockContext({strokeWidth: 5})
            const customView = new CollisionBoxView(entity, customContext)

            expect(customView.root.strokeWidth).toBe(5)
        })


        test('handles missing config gracefully', () => {
            const noConfigContext = {group: new Group2D()}
            const noConfigView = new CollisionBoxView(entity, noConfigContext)

            expect(noConfigView.root.width).toBe(1)
            expect(noConfigView.root.height).toBe(1)
            expect(noConfigView.root.strokeColor).toBe('#ff0000')
            expect(noConfigView.root.strokeWidth).toBe(2)
        })

    })


    test('sync updates rectangle position from entity', () => {
        entity.x = 100
        entity.y = 200
        view.sync()

        expect(view.root.x).toBe(100)
        expect(view.root.y).toBe(200)
    })


    test('dispose cleans up properly', () => {
        context.group.addChild(view.root)
        view.dispose()

        expect(view.root).toBeNull()
        expect(view.entity).toBeNull()
    })

})
