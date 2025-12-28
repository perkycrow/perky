import {describe, test, expect, beforeEach, vi} from 'vitest'
import WorldRenderer from './world_renderer'
import Group2D from './group_2d'
import PerkyModule from '../core/perky_module'


// Mock EntityRenderer for testing
class MockEntityRenderer {
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
        this._entityTags = options.entityTags ?? []
    }

    hasTag (tag) {
        return this._entityTags.includes(tag)
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


describe('WorldRenderer', () => {

    let worldRenderer
    let mockWorld
    let mockGame

    beforeEach(() => {
        mockWorld = new MockWorld()
        mockGame = {getImage: vi.fn()}

        worldRenderer = new WorldRenderer({
            world: mockWorld,
            game: mockGame
        })
    })


    describe('constructor', () => {

        test('initializes with world and game references', () => {
            expect(worldRenderer.world).toBe(mockWorld)
            expect(worldRenderer.game).toBe(mockGame)
        })


        test('creates a rootGroup', () => {
            expect(worldRenderer.rootGroup).toBeInstanceOf(Group2D)
        })


        test('has correct $category', () => {
            expect(WorldRenderer.$category).toBe('worldRenderer')
        })

    })


    describe('register', () => {

        test('registers a renderer by class', () => {
            worldRenderer.register(MockEntity, MockEntityRenderer)

            const entity = new MockEntity({$id: 'test-1'})
            mockWorld.addEntity(entity)
            worldRenderer.onStart()

            expect(worldRenderer.getRenderers('test-1').length).toBe(1)
        })


        test('registers a renderer by matcher function', () => {
            const matcher = (entity) => entity.hasTag('enemy')
            worldRenderer.register(matcher, MockEntityRenderer)

            const entity = new MockEntity({$id: 'test-2', entityTags: ['enemy']})
            mockWorld.addEntity(entity)
            worldRenderer.onStart()

            expect(worldRenderer.getRenderers('test-2').length).toBe(1)
        })


        test('registers with config', () => {
            const config = {color: 'red', size: 10}
            worldRenderer.register(MockEntity, MockEntityRenderer, config)

            const entity = new MockEntity({$id: 'test-3'})
            mockWorld.addEntity(entity)
            worldRenderer.onStart()

            const renderers = worldRenderer.getRenderers('test-3')
            expect(renderers[0].context.config).toEqual(config)
        })


        test('returns this for chaining', () => {
            const result = worldRenderer.register(MockEntity, MockEntityRenderer)
            expect(result).toBe(worldRenderer)
        })

    })


    describe('unregister', () => {

        test('unregisters a class registration', () => {
            worldRenderer.register(MockEntity, MockEntityRenderer)
            const result = worldRenderer.unregister(MockEntity)

            expect(result).toBe(true)
        })


        test('unregisters a matcher registration', () => {
            const matcher = (entity) => entity.hasTag('test')
            worldRenderer.register(matcher, MockEntityRenderer)
            const result = worldRenderer.unregister(matcher)

            expect(result).toBe(true)
        })


        test('returns false for non-existent registration', () => {
            const result = worldRenderer.unregister(MockEntity)
            expect(result).toBe(false)
        })

    })


    describe('clearRegistry', () => {

        test('clears all registrations', () => {
            worldRenderer.register(MockEntity, MockEntityRenderer)
            worldRenderer.register(AnotherMockEntity, MockEntityRenderer)

            const result = worldRenderer.clearRegistry()

            expect(result).toBe(worldRenderer)
        })

    })


    describe('onStart', () => {

        test('listens to world entity:set events', () => {
            worldRenderer.register(MockEntity, MockEntityRenderer)
            worldRenderer.onStart()

            const entity = new MockEntity({$id: 'dynamic-1'})
            mockWorld.addEntity(entity)

            expect(worldRenderer.getRenderers('dynamic-1').length).toBe(1)
        })


        test('listens to world entity:delete events', () => {
            worldRenderer.register(MockEntity, MockEntityRenderer)
            worldRenderer.onStart()

            const entity = new MockEntity({$id: 'to-delete'})
            mockWorld.addEntity(entity)

            expect(worldRenderer.getRenderers('to-delete').length).toBe(1)

            mockWorld.removeEntity('to-delete')

            expect(worldRenderer.getRenderers('to-delete').length).toBe(0)
        })


        test('processes existing entities on start', () => {
            const entity = new MockEntity({$id: 'existing-1'})
            mockWorld.addEntity(entity)

            worldRenderer.register(MockEntity, MockEntityRenderer)
            worldRenderer.onStart()

            expect(worldRenderer.getRenderers('existing-1').length).toBe(1)
        })


        test('does nothing if no world', () => {
            const noWorldRenderer = new WorldRenderer({game: mockGame})
            expect(() => noWorldRenderer.onStart()).not.toThrow()
        })

    })


    describe('onStop', () => {

        test('disposes all renderers', () => {
            worldRenderer.register(MockEntity, MockEntityRenderer)
            worldRenderer.onStart()

            const entity = new MockEntity({$id: 'stop-test'})
            mockWorld.addEntity(entity)

            const renderers = worldRenderer.getRenderers('stop-test')
            expect(renderers.length).toBe(1)

            worldRenderer.onStop()

            // After stop, renderers should be cleared
            expect(worldRenderer.getRenderers('stop-test').length).toBe(0)
        })

    })


    describe('sync', () => {

        test('calls sync on all renderers', () => {
            worldRenderer.register(MockEntity, MockEntityRenderer)
            worldRenderer.onStart()

            const entity1 = new MockEntity({$id: 'sync-1'})
            const entity2 = new MockEntity({$id: 'sync-2'})
            mockWorld.addEntity(entity1)
            mockWorld.addEntity(entity2)

            worldRenderer.sync()

            const renderers1 = worldRenderer.getRenderers('sync-1')
            const renderers2 = worldRenderer.getRenderers('sync-2')

            expect(renderers1[0].syncCalled).toBe(true)
            expect(renderers2[0].syncCalled).toBe(true)
        })

    })


    describe('getRenderers', () => {

        test('returns empty array for unknown entity', () => {
            expect(worldRenderer.getRenderers('unknown')).toEqual([])
        })


        test('returns renderers for known entity', () => {
            worldRenderer.register(MockEntity, MockEntityRenderer)
            worldRenderer.onStart()

            const entity = new MockEntity({$id: 'get-test'})
            mockWorld.addEntity(entity)

            const renderers = worldRenderer.getRenderers('get-test')
            expect(renderers.length).toBe(1)
            expect(renderers[0]).toBeInstanceOf(MockEntityRenderer)
        })

    })


    describe('events', () => {

        test('emits renderer:added when entity is added', () => {
            const addedHandler = vi.fn()
            worldRenderer.on('renderer:added', addedHandler)

            worldRenderer.register(MockEntity, MockEntityRenderer)
            worldRenderer.onStart()

            const entity = new MockEntity({$id: 'event-add'})
            mockWorld.addEntity(entity)

            expect(addedHandler).toHaveBeenCalledWith('event-add', expect.any(Array))
        })


        test('emits renderer:removed when entity is deleted', () => {
            const removedHandler = vi.fn()
            worldRenderer.on('renderer:removed', removedHandler)

            worldRenderer.register(MockEntity, MockEntityRenderer)
            worldRenderer.onStart()

            const entity = new MockEntity({$id: 'event-remove'})
            mockWorld.addEntity(entity)
            mockWorld.removeEntity('event-remove')

            expect(removedHandler).toHaveBeenCalledWith('event-remove', expect.any(Array))
        })

    })


    describe('renderer root integration', () => {

        test('adds renderer root to rootGroup', () => {
            worldRenderer.register(MockEntity, MockEntityRenderer)
            worldRenderer.onStart()

            const entity = new MockEntity({$id: 'root-test'})
            mockWorld.addEntity(entity)

            expect(worldRenderer.rootGroup.children.length).toBe(1)
        })


        test('sets $entity on renderer root', () => {
            worldRenderer.register(MockEntity, MockEntityRenderer)
            worldRenderer.onStart()

            const entity = new MockEntity({$id: 'meta-test'})
            mockWorld.addEntity(entity)

            const child = worldRenderer.rootGroup.children[0]
            expect(child.$entity).toBe(entity)
        })


        test('sets $renderer and $rendererName on renderer root', () => {
            worldRenderer.register(MockEntity, MockEntityRenderer)
            worldRenderer.onStart()

            const entity = new MockEntity({$id: 'renderer-meta'})
            mockWorld.addEntity(entity)

            const child = worldRenderer.rootGroup.children[0]
            expect(child.$renderer).toBeInstanceOf(MockEntityRenderer)
            expect(child.$rendererName).toBe('MockEntityRenderer')
        })

    })

})
