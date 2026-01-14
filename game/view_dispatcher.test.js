import {describe, test, expect, beforeEach, vi} from 'vitest'
import ViewDispatcher from './view_dispatcher.js'
import Group2D from '../render/group_2d.js'
import Circle from '../render/circle.js'
import Sprite from '../render/sprite.js'
import PerkyModule from '../core/perky_module.js'


class MockEntityView {
    constructor (entity, context) {
        this.entity = entity
        this.context = context
        this.root = new Group2D({name: 'mock-root'})
        this.syncCalled = false
        this.disposed = false
    }

    sync () {
        this.syncCalled = true
    }

    dispose () {
        this.disposed = true
        this.root = null
    }
}


class MockEntity extends PerkyModule {
    static $category = 'entity'

    constructor (options = {}) {
        super(options)
        this.x = options.x ?? 0
        this.y = options.y ?? 0
        this.entityTags = options.entityTags ?? []
    }

    hasTag (tag) {
        return this.entityTags.includes(tag)
    }
}


class AnotherMockEntity extends PerkyModule {
    static $category = 'entity'
}


class MockWorld extends PerkyModule {
    #entities = new Map()

    get entities () {
        return Array.from(this.#entities.values())
    }

    addEntity (entity) {
        this.#entities.set(entity.$id, entity)
        this.emit('entity:set', entity.$id, entity)
    }

    removeEntity (entityId) {
        this.#entities.delete(entityId)
        this.emit('entity:delete', entityId)
    }
}


describe('ViewDispatcher', () => {

    let viewDispatcher
    let mockWorld
    let mockGame
    let mockCanvas

    beforeEach(() => {
        mockWorld = new MockWorld()
        mockCanvas = {
            renderer: {
                setRenderGroups: vi.fn()
            },
            markDirty: vi.fn(),
            render: vi.fn()
        }
        mockGame = {
            getSource: vi.fn(),
            getCanvas: vi.fn().mockReturnValue(mockCanvas),
            clock: {deltaTime: 0.016}
        }

        viewDispatcher = new ViewDispatcher({
            world: mockWorld,
            game: mockGame
        })
    })


    describe('constructor', () => {

        test('initializes with world and game references', () => {
            expect(viewDispatcher.world).toBe(mockWorld)
            expect(viewDispatcher.game).toBe(mockGame)
        })


        test('creates a rootGroup', () => {
            expect(viewDispatcher.rootGroup).toBeInstanceOf(Group2D)
        })


        test('has correct $category', () => {
            expect(ViewDispatcher.$category).toBe('viewDispatcher')
        })

    })


    describe('register', () => {

        test('registers a view by class', () => {
            viewDispatcher.register(MockEntity, MockEntityView)

            const entity = new MockEntity({$id: 'test-1'})
            mockWorld.addEntity(entity)
            viewDispatcher.onStart()

            expect(viewDispatcher.getViews('test-1').length).toBe(1)
        })


        test('registers a view by matcher function', () => {
            const matcher = (entity) => entity.hasTag('enemy')
            viewDispatcher.register(matcher, MockEntityView)

            const entity = new MockEntity({$id: 'test-2', entityTags: ['enemy']})
            mockWorld.addEntity(entity)
            viewDispatcher.onStart()

            expect(viewDispatcher.getViews('test-2').length).toBe(1)
        })


        test('registers with config', () => {
            const config = {color: 'red', size: 10}
            viewDispatcher.register(MockEntity, MockEntityView, config)

            const entity = new MockEntity({$id: 'test-3'})
            mockWorld.addEntity(entity)
            viewDispatcher.onStart()

            const views = viewDispatcher.getViews('test-3')
            expect(views[0].context.config).toEqual(config)
        })


        test('returns this for chaining', () => {
            const result = viewDispatcher.register(MockEntity, MockEntityView)
            expect(result).toBe(viewDispatcher)
        })

    })


    describe('unregister', () => {

        test('unregisters a class registration', () => {
            viewDispatcher.register(MockEntity, MockEntityView)
            const result = viewDispatcher.unregister(MockEntity)

            expect(result).toBe(true)
        })


        test('unregisters a matcher registration', () => {
            const matcher = (entity) => entity.hasTag('test')
            viewDispatcher.register(matcher, MockEntityView)
            const result = viewDispatcher.unregister(matcher)

            expect(result).toBe(true)
        })


        test('returns false for non-existent registration', () => {
            const result = viewDispatcher.unregister(MockEntity)
            expect(result).toBe(false)
        })

    })


    test('clearRegistry clears all registrations', () => {
        viewDispatcher.register(MockEntity, MockEntityView)
        viewDispatcher.register(AnotherMockEntity, MockEntityView)

        const result = viewDispatcher.clearRegistry()

        expect(result).toBe(viewDispatcher)
    })


    describe('onStart', () => {

        test('listens to world entity:set events', () => {
            viewDispatcher.register(MockEntity, MockEntityView)
            viewDispatcher.onStart()

            const entity = new MockEntity({$id: 'dynamic-1'})
            mockWorld.addEntity(entity)

            expect(viewDispatcher.getViews('dynamic-1').length).toBe(1)
        })


        test('listens to world entity:delete events', () => {
            viewDispatcher.register(MockEntity, MockEntityView)
            viewDispatcher.onStart()

            const entity = new MockEntity({$id: 'to-delete'})
            mockWorld.addEntity(entity)

            expect(viewDispatcher.getViews('to-delete').length).toBe(1)

            mockWorld.removeEntity('to-delete')

            expect(viewDispatcher.getViews('to-delete').length).toBe(0)
        })


        test('processes existing entities on start', () => {
            const entity = new MockEntity({$id: 'existing-1'})
            mockWorld.addEntity(entity)

            viewDispatcher.register(MockEntity, MockEntityView)
            viewDispatcher.onStart()

            expect(viewDispatcher.getViews('existing-1').length).toBe(1)
        })


        test('does nothing if no world', () => {
            const noWorldView = new ViewDispatcher({game: mockGame})
            expect(() => noWorldView.onStart()).not.toThrow()
        })


        test('sets up render groups', () => {
            viewDispatcher.onStart()

            expect(mockCanvas.renderer.setRenderGroups).toHaveBeenCalledWith([
                {
                    $name: 'entities',
                    content: viewDispatcher.rootGroup
                }
            ])
        })

    })


    test('onStop disposes all views', () => {
        viewDispatcher.register(MockEntity, MockEntityView)
        viewDispatcher.onStart()

        const entity = new MockEntity({$id: 'stop-test'})
        mockWorld.addEntity(entity)

        const views = viewDispatcher.getViews('stop-test')
        expect(views.length).toBe(1)

        viewDispatcher.onStop()

        expect(viewDispatcher.getViews('stop-test').length).toBe(0)
    })


    describe('sync', () => {

        test('calls sync on all views', () => {
            viewDispatcher.register(MockEntity, MockEntityView)
            viewDispatcher.onStart()

            const entity1 = new MockEntity({$id: 'sync-1'})
            const entity2 = new MockEntity({$id: 'sync-2'})
            mockWorld.addEntity(entity1)
            mockWorld.addEntity(entity2)

            viewDispatcher.sync()

            const views1 = viewDispatcher.getViews('sync-1')
            const views2 = viewDispatcher.getViews('sync-2')

            expect(views1[0].syncCalled).toBe(true)
            expect(views2[0].syncCalled).toBe(true)
        })


        test('marks canvas dirty and renders', () => {
            viewDispatcher.onStart()
            viewDispatcher.sync()

            expect(mockCanvas.markDirty).toHaveBeenCalled()
            expect(mockCanvas.render).toHaveBeenCalled()
        })

    })


    describe('getViews', () => {

        test('returns empty array for unknown entity', () => {
            expect(viewDispatcher.getViews('unknown')).toEqual([])
        })


        test('returns views for known entity', () => {
            viewDispatcher.register(MockEntity, MockEntityView)
            viewDispatcher.onStart()

            const entity = new MockEntity({$id: 'get-test'})
            mockWorld.addEntity(entity)

            const views = viewDispatcher.getViews('get-test')
            expect(views.length).toBe(1)
            expect(views[0]).toBeInstanceOf(MockEntityView)
        })

    })


    describe('events', () => {

        test('emits view:added when entity is added', () => {
            const addedHandler = vi.fn()
            viewDispatcher.on('view:added', addedHandler)

            viewDispatcher.register(MockEntity, MockEntityView)
            viewDispatcher.onStart()

            const entity = new MockEntity({$id: 'event-add'})
            mockWorld.addEntity(entity)

            expect(addedHandler).toHaveBeenCalledWith('event-add', expect.any(Array))
        })


        test('emits view:removed when entity is deleted', () => {
            const removedHandler = vi.fn()
            viewDispatcher.on('view:removed', removedHandler)

            viewDispatcher.register(MockEntity, MockEntityView)
            viewDispatcher.onStart()

            const entity = new MockEntity({$id: 'event-remove'})
            mockWorld.addEntity(entity)
            mockWorld.removeEntity('event-remove')

            expect(removedHandler).toHaveBeenCalledWith('event-remove', expect.any(Array))
        })

    })


    describe('view root integration', () => {

        test('adds view root to rootGroup', () => {
            viewDispatcher.register(MockEntity, MockEntityView)
            viewDispatcher.onStart()

            const entity = new MockEntity({$id: 'root-test'})
            mockWorld.addEntity(entity)

            expect(viewDispatcher.rootGroup.children.length).toBe(1)
        })


        test('sets $entity on view root', () => {
            viewDispatcher.register(MockEntity, MockEntityView)
            viewDispatcher.onStart()

            const entity = new MockEntity({$id: 'meta-test'})
            mockWorld.addEntity(entity)

            const child = viewDispatcher.rootGroup.children[0]
            expect(child.$entity).toBe(entity)
        })


        test('sets $view and $viewName on view root', () => {
            viewDispatcher.register(MockEntity, MockEntityView)
            viewDispatcher.onStart()

            const entity = new MockEntity({$id: 'view-meta'})
            mockWorld.addEntity(entity)

            const child = viewDispatcher.rootGroup.children[0]
            expect(child.$view).toBeInstanceOf(MockEntityView)
            expect(child.$viewName).toBe('MockEntityView')
        })

    })


    describe('AutoView (Object2D registration)', () => {

        test('registers an Object2D class directly', () => {
            viewDispatcher.register(MockEntity, Circle, {radius: 0.5, color: '#ff0000'})
            viewDispatcher.onStart()

            const entity = new MockEntity({$id: 'circle-1', x: 10, y: 20})
            mockWorld.addEntity(entity)

            const views = viewDispatcher.getViews('circle-1')
            expect(views.length).toBe(1)
            expect(views[0].root).toBeInstanceOf(Circle)
            expect(views[0].root.radius).toBe(0.5)
            expect(views[0].root.color).toBe('#ff0000')
        })


        test('auto-syncs x and y from entity', () => {
            viewDispatcher.register(MockEntity, Circle, {radius: 0.5})
            viewDispatcher.onStart()

            const entity = new MockEntity({$id: 'sync-xy', x: 5, y: 10})
            mockWorld.addEntity(entity)

            const view = viewDispatcher.getViews('sync-xy')[0]
            expect(view.root.x).toBe(5)
            expect(view.root.y).toBe(10)

            entity.x = 15
            entity.y = 25
            viewDispatcher.sync()

            expect(view.root.x).toBe(15)
            expect(view.root.y).toBe(25)
        })


        test('supports custom sync bindings with string property name', () => {
            viewDispatcher.register(MockEntity, Circle, {
                radius: 0.5,
                sync: {
                    opacity: 'health'
                }
            })
            viewDispatcher.onStart()

            const entity = new MockEntity({$id: 'sync-string', x: 0, y: 0})
            entity.health = 0.75
            mockWorld.addEntity(entity)

            viewDispatcher.sync()

            const view = viewDispatcher.getViews('sync-string')[0]
            expect(view.root.opacity).toBe(0.75)
        })


        test('supports custom sync bindings with function', () => {
            viewDispatcher.register(MockEntity, Circle, {
                radius: 0.5,
                sync: {
                    scaleX: (entity) => entity.health / 100
                }
            })
            viewDispatcher.onStart()

            const entity = new MockEntity({$id: 'sync-fn', x: 0, y: 0})
            entity.health = 50
            mockWorld.addEntity(entity)

            viewDispatcher.sync()

            const view = viewDispatcher.getViews('sync-fn')[0]
            expect(view.root.scaleX).toBe(0.5)
        })


        test('calls sync function with entity', () => {
            const syncFn = vi.fn((entity) => entity.health * 2)
            viewDispatcher.register(MockEntity, Circle, {
                radius: 0.5,
                sync: {
                    opacity: syncFn
                }
            })
            viewDispatcher.onStart()

            const entity = new MockEntity({$id: 'sync-dt', x: 0, y: 0, health: 0.5})
            mockWorld.addEntity(entity)

            viewDispatcher.sync()

            expect(syncFn).toHaveBeenCalledWith(entity)
        })


        test('sets $viewName to Object2D class name', () => {
            viewDispatcher.register(MockEntity, Circle, {radius: 0.5})
            viewDispatcher.onStart()

            const entity = new MockEntity({$id: 'viewname-test'})
            mockWorld.addEntity(entity)

            const child = viewDispatcher.rootGroup.children[0]
            expect(child.$viewName).toBe('Circle')
        })


        test('works with Sprite', () => {
            const mockImage = {width: 100, height: 100}
            viewDispatcher.register(MockEntity, Sprite, {image: mockImage, width: 1, height: 1})
            viewDispatcher.onStart()

            const entity = new MockEntity({$id: 'image-test', x: 0, y: 0})
            mockWorld.addEntity(entity)

            const view = viewDispatcher.getViews('image-test')[0]
            expect(view.root).toBeInstanceOf(Sprite)
            expect(view.root.image).toBe(mockImage)
        })


        test('disposes correctly', () => {
            viewDispatcher.register(MockEntity, Circle, {radius: 0.5})
            viewDispatcher.onStart()

            const entity = new MockEntity({$id: 'dispose-test'})
            mockWorld.addEntity(entity)

            expect(viewDispatcher.rootGroup.children.length).toBe(1)

            mockWorld.removeEntity('dispose-test')

            expect(viewDispatcher.getViews('dispose-test').length).toBe(0)
        })

    })

})
