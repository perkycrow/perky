import {describe, test, expect, beforeEach} from 'vitest'
import CircleView from './circle_view.js'
import Circle from '../render/circle.js'
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


describe('CircleView', () => {

    let entity
    let context
    let view

    beforeEach(() => {
        entity = new MockEntity(10, 20)
        context = new MockContext()
        view = new CircleView(entity, context)
    })


    describe('constructor', () => {

        test('extends EntityView', () => {
            expect(view.entity).toBe(entity)
            expect(view.context).toBe(context)
        })


        test('creates a Circle as root', () => {
            expect(view.root).toBeInstanceOf(Circle)
        })


        test('positions circle at entity position', () => {
            expect(view.root.x).toBe(10)
            expect(view.root.y).toBe(20)
        })


        test('uses default radius of 0.5', () => {
            expect(view.root.radius).toBe(0.5)
        })


        test('uses default color of white', () => {
            expect(view.root.color).toBe('#ffffff')
        })

    })


    describe('config options', () => {

        test('accepts custom radius', () => {
            const customContext = new MockContext({radius: 2.5})
            const customView = new CircleView(entity, customContext)

            expect(customView.root.radius).toBe(2.5)
        })


        test('accepts custom color', () => {
            const customContext = new MockContext({color: '#ff0000'})
            const customView = new CircleView(entity, customContext)

            expect(customView.root.color).toBe('#ff0000')
        })


        test('handles missing config gracefully', () => {
            const noConfigContext = {group: new Group2D()}
            const noConfigView = new CircleView(entity, noConfigContext)

            expect(noConfigView.root.radius).toBe(0.5)
            expect(noConfigView.root.color).toBe('#ffffff')
        })

    })


    test('sync updates circle position from entity', () => {
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
