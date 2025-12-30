import {describe, test, expect, beforeEach, vi} from 'vitest'
import WorldView from './world_view'
import Group2D from '../render/group_2d'
import PerkyModule from '../core/perky_module'


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
        mockGame = {getImage: vi.fn()}

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


    describe('clearRegistry', () => {

        test('clears all registrations', () => {
            worldView.register(MockEntity, MockEntityView)
            worldView.register(AnotherMockEntity, MockEntityView)

            const result = worldView.clearRegistry()

            expect(result).toBe(worldView)
        })

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


    describe('onStop', () => {

        test('disposes all views', () => {
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

    })


    describe('sync', () => {

        test('calls sync on all views', () => {
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

})
