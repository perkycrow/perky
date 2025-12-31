import {describe, test, expect, beforeEach, vi} from 'vitest'
import ImageView from './image_view'
import Image2D from '../render/image_2d'
import Group2D from '../render/group_2d'


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
            getSource: vi.fn(() => ({width: 64, height: 64}))
        }
    }
}


describe('ImageView', () => {

    let entity
    let context
    let view

    beforeEach(() => {
        entity = new MockEntity(10, 20)
        context = new MockContext({image: 'test-sprite'})
        view = new ImageView(entity, context)
    })


    describe('constructor', () => {

        test('extends EntityView', () => {
            expect(view.entity).toBe(entity)
            expect(view.context).toBe(context)
        })


        test('creates an Image2D as root', () => {
            expect(view.root).toBeInstanceOf(Image2D)
        })


        test('positions image at entity position', () => {
            expect(view.root.x).toBe(10)
            expect(view.root.y).toBe(20)
        })


        test('loads image from game', () => {
            expect(context.game.getSource).toHaveBeenCalledWith('test-sprite')
        })


        test('uses default dimensions of 1x1', () => {
            expect(view.root.width).toBe(1)
            expect(view.root.height).toBe(1)
        })


        test('uses default anchor of 0.5, 0.5 (center)', () => {
            expect(view.root.anchorX).toBe(0.5)
            expect(view.root.anchorY).toBe(0.5)
        })

    })


    describe('config options', () => {

        test('accepts custom dimensions', () => {
            const customContext = new MockContext({
                image: 'test',
                width: 2.5,
                height: 3.0
            })
            const customView = new ImageView(entity, customContext)

            expect(customView.root.width).toBe(2.5)
            expect(customView.root.height).toBe(3.0)
        })


        test('accepts custom anchor', () => {
            const customContext = new MockContext({
                image: 'test',
                anchorX: 0,
                anchorY: 1
            })
            const customView = new ImageView(entity, customContext)

            expect(customView.root.anchorX).toBe(0)
            expect(customView.root.anchorY).toBe(1)
        })


        test('handles missing config gracefully', () => {
            const minimalContext = {
                group: new Group2D(),
                game: {getSource: vi.fn(() => ({width: 32, height: 32}))} // eslint-disable-line max-nested-callbacks
            }
            const minimalView = new ImageView(entity, minimalContext)

            expect(minimalView.root.width).toBe(1)
            expect(minimalView.root.height).toBe(1)
        })

    })


    describe('sync', () => {

        test('updates image position from entity', () => {
            entity.x = 100
            entity.y = 200
            view.sync()

            expect(view.root.x).toBe(100)
            expect(view.root.y).toBe(200)
        })

    })


    describe('dispose', () => {

        test('cleans up properly', () => {
            context.group.addChild(view.root)
            view.dispose()

            expect(view.root).toBeNull()
            expect(view.entity).toBeNull()
        })

    })

})
