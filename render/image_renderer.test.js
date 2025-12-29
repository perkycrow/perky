import {describe, test, expect, beforeEach, vi} from 'vitest'
import ImageRenderer from './image_renderer'
import Image2D from './image_2d'
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
        this.game = {
            getImage: vi.fn(() => ({width: 64, height: 64}))
        }
    }
}


describe('ImageRenderer', () => {

    let entity
    let context
    let renderer

    beforeEach(() => {
        entity = new MockEntity(10, 20)
        context = new MockContext({image: 'test-sprite'})
        renderer = new ImageRenderer(entity, context)
    })


    describe('constructor', () => {

        test('extends EntityRenderer', () => {
            expect(renderer.entity).toBe(entity)
            expect(renderer.context).toBe(context)
        })


        test('creates an Image2D as root', () => {
            expect(renderer.root).toBeInstanceOf(Image2D)
        })


        test('positions image at entity position', () => {
            expect(renderer.root.x).toBe(10)
            expect(renderer.root.y).toBe(20)
        })


        test('loads image from game', () => {
            expect(context.game.getImage).toHaveBeenCalledWith('test-sprite')
        })


        test('uses default dimensions of 1x1', () => {
            expect(renderer.root.width).toBe(1)
            expect(renderer.root.height).toBe(1)
        })


        test('uses default anchor of 0.5, 0.5 (center)', () => {
            expect(renderer.root.anchorX).toBe(0.5)
            expect(renderer.root.anchorY).toBe(0.5)
        })

    })


    describe('config options', () => {

        test('accepts custom dimensions', () => {
            const customContext = new MockContext({
                image: 'test',
                width: 2.5,
                height: 3.0
            })
            const customRenderer = new ImageRenderer(entity, customContext)

            expect(customRenderer.root.width).toBe(2.5)
            expect(customRenderer.root.height).toBe(3.0)
        })


        test('accepts custom anchor', () => {
            const customContext = new MockContext({
                image: 'test',
                anchorX: 0,
                anchorY: 1
            })
            const customRenderer = new ImageRenderer(entity, customContext)

            expect(customRenderer.root.anchorX).toBe(0)
            expect(customRenderer.root.anchorY).toBe(1)
        })


        test('handles missing config gracefully', () => {
            const minimalContext = {
                group: new Group2D(),
                game: {getImage: vi.fn(() => ({width: 32, height: 32}))}
            }
            const minimalRenderer = new ImageRenderer(entity, minimalContext)

            expect(minimalRenderer.root.width).toBe(1)
            expect(minimalRenderer.root.height).toBe(1)
        })

    })


    describe('sync', () => {

        test('updates image position from entity', () => {
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
