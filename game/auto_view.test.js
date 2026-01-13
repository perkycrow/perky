import {describe, test, expect, vi} from 'vitest'
import AutoView from './auto_view.js'
import Circle from '../render/circle.js'
import Sprite from '../render/sprite.js'
import Group2D from '../render/group_2d.js'


describe('AutoView', () => {

    function createContext (ObjectClass, config = {}) {
        return {
            ObjectClass,
            config,
            group: new Group2D()
        }
    }


    function createEntity (props = {}) {
        return {
            x: props.x ?? 0,
            y: props.y ?? 0,
            ...props
        }
    }


    describe('constructor', () => {

        test('creates Object2D instance with entity position', () => {
            const entity = createEntity({x: 10, y: 20})
            const context = createContext(Circle, {radius: 0.5})

            const view = new AutoView(entity, context)

            expect(view.root).toBeInstanceOf(Circle)
            expect(view.root.x).toBe(10)
            expect(view.root.y).toBe(20)
        })


        test('passes config options to Object2D', () => {
            const entity = createEntity()
            const context = createContext(Circle, {radius: 0.8, color: '#ff0000'})

            const view = new AutoView(entity, context)

            expect(view.root.radius).toBe(0.8)
            expect(view.root.color).toBe('#ff0000')
        })


        test('does not pass sync to Object2D constructor', () => {
            const entity = createEntity()
            const context = createContext(Circle, {radius: 0.5, sync: {opacity: 'health'}})

            const view = new AutoView(entity, context)

            expect(view.root.sync).toBeUndefined()
        })


        test('works with Sprite', () => {
            const mockImage = {width: 100, height: 100}
            const entity = createEntity({x: 5, y: 10})
            const context = createContext(Sprite, {image: mockImage, width: 1, height: 1})

            const view = new AutoView(entity, context)

            expect(view.root).toBeInstanceOf(Sprite)
            expect(view.root.image).toBe(mockImage)
        })

    })


    describe('sync', () => {

        test('syncs x and y from entity', () => {
            const entity = createEntity({x: 0, y: 0})
            const context = createContext(Circle, {radius: 0.5})
            const view = new AutoView(entity, context)

            entity.x = 15
            entity.y = 25
            view.sync()

            expect(view.root.x).toBe(15)
            expect(view.root.y).toBe(25)
        })


        test('syncs string binding (property name)', () => {
            const entity = createEntity({health: 0.75})
            const context = createContext(Circle, {
                radius: 0.5,
                sync: {opacity: 'health'}
            })
            const view = new AutoView(entity, context)

            view.sync()

            expect(view.root.opacity).toBe(0.75)
        })


        test('syncs function binding', () => {
            const entity = createEntity({health: 50})
            const context = createContext(Circle, {
                radius: 0.5,
                sync: {scaleX: (e) => e.health / 100}
            })
            const view = new AutoView(entity, context)

            view.sync()

            expect(view.root.scaleX).toBe(0.5)
        })


        test('calls function binding with entity', () => {
            const syncFn = vi.fn((entity) => entity.health * 2)
            const entity = createEntity({health: 0.5})
            const context = createContext(Circle, {
                radius: 0.5,
                sync: {opacity: syncFn}
            })
            const view = new AutoView(entity, context)

            view.sync()

            expect(syncFn).toHaveBeenCalledWith(entity)
            expect(view.root.opacity).toBe(1)
        })


        test('ignores x and y in sync bindings (already handled)', () => {
            const entity = createEntity({x: 10, y: 20, customX: 100})
            const context = createContext(Circle, {
                radius: 0.5,
                sync: {x: 'customX'}
            })
            const view = new AutoView(entity, context)

            view.sync()

            expect(view.root.x).toBe(10)
        })


        test('does nothing if root is null', () => {
            const entity = createEntity()
            const context = createContext(Circle, {radius: 0.5})
            const view = new AutoView(entity, context)

            view.root = null

            expect(() => view.sync()).not.toThrow()
        })



    })


    describe('dispose', () => {

        test('clears references', () => {
            const entity = createEntity()
            const context = createContext(Circle, {radius: 0.5})
            const view = new AutoView(entity, context)

            view.dispose()

            expect(view.root).toBeNull()
            expect(view.entity).toBeNull()
            expect(view.context).toBeNull()
        })


        test('removes root from group if present', () => {
            const entity = createEntity()
            const context = createContext(Circle, {radius: 0.5})
            const view = new AutoView(entity, context)

            context.group.add(view.root)
            expect(context.group.children.length).toBe(1)

            view.dispose()

            expect(context.group.children.length).toBe(0)
        })

    })

})
