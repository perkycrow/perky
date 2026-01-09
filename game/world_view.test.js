import {describe, test, expect, beforeEach, vi} from 'vitest'
import WorldView from './world_view.js'
import Group2D from '../render/group_2d.js'
import Circle from '../render/circle.js'
import Image2D from '../render/image_2d.js'
import PerkyModule from '../core/perky_module.js'


// Mock EntityView for testing
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


// Mock Entity class
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


// Another mock entity for testing multiple registrations
class AnotherMockEntity extends PerkyModule {
    static $category = 'entity'
}


// Mock World that emits events
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


describe('WorldView', () => {

    let worldView
    let mockWorld
    let mockGame

    beforeEach(() => {
        mockWorld = new MockWorld()
        mockGame = {getSource: vi.fn()}

        worldView = new WorldView({
            world: mockWorld,
            game: mockGame
        })
    })


    describe('constructor', () => {

        test('initializes with world and game references', () => {
            expect(worldView.world).toBe(mockWorld)
            expect(worldView.game).toBe(mockGame)
        })


        test('creates a rootGroup', () => {
            expect(worldView.rootGroup).toBeInstanceOf(Group2D)
        })


        test('has correct $category', () => {
            expect(WorldView.$category).toBe('worldView')
        })

    })


    describe('register', () => {

        test('registers a view by class', () => {
            worldView.register(MockEntity, MockEntityView)

            const entity = new MockEntity({$id: 'test-1'})
            mockWorld.addEntity(entity)
            worldView.onStart()

            expect(worldView.getViews('test-1').length).toBe(1)
        })


        test('registers a view by matcher function', () => {
            const matcher = (entity) => entity.hasTag('enemy')
            worldView.register(matcher, MockEntityView)

            const entity = new MockEntity({$id: 'test-2', entityTags: ['enemy']})
            mockWorld.addEntity(entity)
            worldView.onStart()

            expect(worldView.getViews('test-2').length).toBe(1)
        })


        test('registers with config', () => {
            const config = {color: 'red', size: 10}
            worldView.register(MockEntity, MockEntityView, config)

            const entity = new MockEntity({$id: 'test-3'})
            mockWorld.addEntity(entity)
            worldView.onStart()

            const views = worldView.getViews('test-3')
            expect(views[0].context.config).toEqual(config)
        })


        test('returns this for chaining', () => {
            const result = worldView.register(MockEntity, MockEntityView)
            expect(result).toBe(worldView)
        })

    })


    describe('unregister', () => {

        test('unregisters a class registration', () => {
            worldView.register(MockEntity, MockEntityView)
            const result = worldView.unregister(MockEntity)

            expect(result).toBe(true)
        })


        test('unregisters a matcher registration', () => {
            const matcher = (entity) => entity.hasTag('test')
            worldView.register(matcher, MockEntityView)
            const result = worldView.unregister(matcher)

            expect(result).toBe(true)
        })


        test('returns false for non-existent registration', () => {
            const result = worldView.unregister(MockEntity)
            expect(result).toBe(false)
        })

    })


    test('clearRegistry clears all registrations', () => {
        worldView.register(MockEntity, MockEntityView)
        worldView.register(AnotherMockEntity, MockEntityView)

        const result = worldView.clearRegistry()

        expect(result).toBe(worldView)
    })


    describe('onStart', () => {

        test('listens to world entity:set events', () => {
            worldView.register(MockEntity, MockEntityView)
            worldView.onStart()

            const entity = new MockEntity({$id: 'dynamic-1'})
            mockWorld.addEntity(entity)

            expect(worldView.getViews('dynamic-1').length).toBe(1)
        })


        test('listens to world entity:delete events', () => {
            worldView.register(MockEntity, MockEntityView)
            worldView.onStart()

            const entity = new MockEntity({$id: 'to-delete'})
            mockWorld.addEntity(entity)

            expect(worldView.getViews('to-delete').length).toBe(1)

            mockWorld.removeEntity('to-delete')

            expect(worldView.getViews('to-delete').length).toBe(0)
        })


        test('processes existing entities on start', () => {
            const entity = new MockEntity({$id: 'existing-1'})
            mockWorld.addEntity(entity)

            worldView.register(MockEntity, MockEntityView)
            worldView.onStart()

            expect(worldView.getViews('existing-1').length).toBe(1)
        })


        test('does nothing if no world', () => {
            const noWorldView = new WorldView({game: mockGame})
            expect(() => noWorldView.onStart()).not.toThrow()
        })

    })


    test('onStop disposes all views', () => {
        worldView.register(MockEntity, MockEntityView)
        worldView.onStart()

        const entity = new MockEntity({$id: 'stop-test'})
        mockWorld.addEntity(entity)

        const views = worldView.getViews('stop-test')
        expect(views.length).toBe(1)

        worldView.onStop()

        // After stop, views should be cleared
        expect(worldView.getViews('stop-test').length).toBe(0)
    })


    test('sync calls sync on all views', () => {
        worldView.register(MockEntity, MockEntityView)
        worldView.onStart()

        const entity1 = new MockEntity({$id: 'sync-1'})
        const entity2 = new MockEntity({$id: 'sync-2'})
        mockWorld.addEntity(entity1)
        mockWorld.addEntity(entity2)

        worldView.sync()

        const views1 = worldView.getViews('sync-1')
        const views2 = worldView.getViews('sync-2')

        expect(views1[0].syncCalled).toBe(true)
        expect(views2[0].syncCalled).toBe(true)
    })


    describe('getViews', () => {

        test('returns empty array for unknown entity', () => {
            expect(worldView.getViews('unknown')).toEqual([])
        })


        test('returns views for known entity', () => {
            worldView.register(MockEntity, MockEntityView)
            worldView.onStart()

            const entity = new MockEntity({$id: 'get-test'})
            mockWorld.addEntity(entity)

            const views = worldView.getViews('get-test')
            expect(views.length).toBe(1)
            expect(views[0]).toBeInstanceOf(MockEntityView)
        })

    })


    describe('events', () => {

        test('emits view:added when entity is added', () => {
            const addedHandler = vi.fn()
            worldView.on('view:added', addedHandler)

            worldView.register(MockEntity, MockEntityView)
            worldView.onStart()

            const entity = new MockEntity({$id: 'event-add'})
            mockWorld.addEntity(entity)

            expect(addedHandler).toHaveBeenCalledWith('event-add', expect.any(Array))
        })


        test('emits view:removed when entity is deleted', () => {
            const removedHandler = vi.fn()
            worldView.on('view:removed', removedHandler)

            worldView.register(MockEntity, MockEntityView)
            worldView.onStart()

            const entity = new MockEntity({$id: 'event-remove'})
            mockWorld.addEntity(entity)
            mockWorld.removeEntity('event-remove')

            expect(removedHandler).toHaveBeenCalledWith('event-remove', expect.any(Array))
        })

    })


    describe('view root integration', () => {

        test('adds view root to rootGroup', () => {
            worldView.register(MockEntity, MockEntityView)
            worldView.onStart()

            const entity = new MockEntity({$id: 'root-test'})
            mockWorld.addEntity(entity)

            expect(worldView.rootGroup.children.length).toBe(1)
        })


        test('sets $entity on view root', () => {
            worldView.register(MockEntity, MockEntityView)
            worldView.onStart()

            const entity = new MockEntity({$id: 'meta-test'})
            mockWorld.addEntity(entity)

            const child = worldView.rootGroup.children[0]
            expect(child.$entity).toBe(entity)
        })


        test('sets $view and $viewName on view root', () => {
            worldView.register(MockEntity, MockEntityView)
            worldView.onStart()

            const entity = new MockEntity({$id: 'view-meta'})
            mockWorld.addEntity(entity)

            const child = worldView.rootGroup.children[0]
            expect(child.$view).toBeInstanceOf(MockEntityView)
            expect(child.$viewName).toBe('MockEntityView')
        })

    })


    describe('AutoView (Object2D registration)', () => {

        test('registers an Object2D class directly', () => {
            worldView.register(MockEntity, Circle, {radius: 0.5, color: '#ff0000'})
            worldView.onStart()

            const entity = new MockEntity({$id: 'circle-1', x: 10, y: 20})
            mockWorld.addEntity(entity)

            const views = worldView.getViews('circle-1')
            expect(views.length).toBe(1)
            expect(views[0].root).toBeInstanceOf(Circle)
            expect(views[0].root.radius).toBe(0.5)
            expect(views[0].root.color).toBe('#ff0000')
        })


        test('auto-syncs x and y from entity', () => {
            worldView.register(MockEntity, Circle, {radius: 0.5})
            worldView.onStart()

            const entity = new MockEntity({$id: 'sync-xy', x: 5, y: 10})
            mockWorld.addEntity(entity)

            const view = worldView.getViews('sync-xy')[0]
            expect(view.root.x).toBe(5)
            expect(view.root.y).toBe(10)

            entity.x = 15
            entity.y = 25
            worldView.sync()

            expect(view.root.x).toBe(15)
            expect(view.root.y).toBe(25)
        })


        test('supports custom sync bindings with string property name', () => {
            worldView.register(MockEntity, Circle, {
                radius: 0.5,
                sync: {
                    opacity: 'health'
                }
            })
            worldView.onStart()

            const entity = new MockEntity({$id: 'sync-string', x: 0, y: 0})
            entity.health = 0.75
            mockWorld.addEntity(entity)

            worldView.sync()

            const view = worldView.getViews('sync-string')[0]
            expect(view.root.opacity).toBe(0.75)
        })


        test('supports custom sync bindings with function', () => {
            worldView.register(MockEntity, Circle, {
                radius: 0.5,
                sync: {
                    scaleX: (entity) => entity.health / 100
                }
            })
            worldView.onStart()

            const entity = new MockEntity({$id: 'sync-fn', x: 0, y: 0})
            entity.health = 50
            mockWorld.addEntity(entity)

            worldView.sync()

            const view = worldView.getViews('sync-fn')[0]
            expect(view.root.scaleX).toBe(0.5)
        })


        test('passes deltaTime to sync function', () => {
            const syncFn = vi.fn((entity, dt) => dt * 2)
            worldView.register(MockEntity, Circle, {
                radius: 0.5,
                sync: {
                    opacity: syncFn
                }
            })
            worldView.onStart()

            const entity = new MockEntity({$id: 'sync-dt', x: 0, y: 0})
            mockWorld.addEntity(entity)

            worldView.sync(0.016)

            expect(syncFn).toHaveBeenCalledWith(entity, 0.016)
        })


        test('sets $viewName to Object2D class name', () => {
            worldView.register(MockEntity, Circle, {radius: 0.5})
            worldView.onStart()

            const entity = new MockEntity({$id: 'viewname-test'})
            mockWorld.addEntity(entity)

            const child = worldView.rootGroup.children[0]
            expect(child.$viewName).toBe('Circle')
        })


        test('works with Image2D', () => {
            const mockImage = {width: 100, height: 100}
            worldView.register(MockEntity, Image2D, {image: mockImage, width: 1, height: 1})
            worldView.onStart()

            const entity = new MockEntity({$id: 'image-test', x: 0, y: 0})
            mockWorld.addEntity(entity)

            const view = worldView.getViews('image-test')[0]
            expect(view.root).toBeInstanceOf(Image2D)
            expect(view.root.image).toBe(mockImage)
        })


        test('disposes correctly', () => {
            worldView.register(MockEntity, Circle, {radius: 0.5})
            worldView.onStart()

            const entity = new MockEntity({$id: 'dispose-test'})
            mockWorld.addEntity(entity)

            expect(worldView.rootGroup.children.length).toBe(1)

            mockWorld.removeEntity('dispose-test')

            expect(worldView.getViews('dispose-test').length).toBe(0)
        })

    })

})
