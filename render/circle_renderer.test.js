import {describe, test, expect, beforeEach} from 'vitest'
import CircleRenderer from './circle_renderer'
import Circle from './circle'
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


describe('CircleRenderer', () => {

    let entity
    let context
    let renderer

    beforeEach(() => {
        entity = new MockEntity(10, 20)
        context = new MockContext()
        renderer = new CircleRenderer(entity, context)
    })


    describe('constructor', () => {

        test('extends EntityRenderer', () => {
            expect(renderer.entity).toBe(entity)
            expect(renderer.context).toBe(context)
        })


        test('creates a Circle as root', () => {
            expect(renderer.root).toBeInstanceOf(Circle)
        })


        test('positions circle at entity position', () => {
            expect(renderer.root.x).toBe(10)
            expect(renderer.root.y).toBe(20)
        })


        test('uses default radius of 0.5', () => {
            expect(renderer.root.radius).toBe(0.5)
        })


        test('uses default color of white', () => {
            expect(renderer.root.color).toBe('#ffffff')
        })

    })


    describe('config options', () => {

        test('accepts custom radius', () => {
            const customContext = new MockContext({radius: 2.5})
            const customRenderer = new CircleRenderer(entity, customContext)

            expect(customRenderer.root.radius).toBe(2.5)
        })


        test('accepts custom color', () => {
            const customContext = new MockContext({color: '#ff0000'})
            const customRenderer = new CircleRenderer(entity, customContext)

            expect(customRenderer.root.color).toBe('#ff0000')
        })


        test('handles missing config gracefully', () => {
            const noConfigContext = {group: new Group2D()}
            const noConfigRenderer = new CircleRenderer(entity, noConfigContext)

            expect(noConfigRenderer.root.radius).toBe(0.5)
            expect(noConfigRenderer.root.color).toBe('#ffffff')
        })

    })


    describe('sync', () => {

        test('updates circle position from entity', () => {
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
