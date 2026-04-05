import {describe, test, expect, beforeEach} from 'vitest'
import World from './world.js'
import Entity from './entity.js'


describe('World', () => {

    let world

    beforeEach(() => {
        world = new World()
    })


    describe('static properties', () => {

        test('has correct $category', () => {
            expect(World.$category).toBe('world')
        })


        test('extends PerkyModule', () => {
            expect(world.constructor.name).toBe('World')
        })

    })


    describe('entities', () => {

        test('returns empty array when no entities', () => {
            expect(world.entities).toEqual([])
        })


        test('returns entities created in world', () => {
            const entity1 = world.create(Entity, {$id: 'entity-1'})
            const entity2 = world.create(Entity, {$id: 'entity-2'})

            const entities = world.entities

            expect(entities).toContain(entity1)
            expect(entities).toContain(entity2)
            expect(entities.length).toBe(2)
        })


        test('does not return non-entity children', () => {
            world.create(Entity, {$id: 'entity-1'})

            class NonEntity extends Entity {
                static $category = 'other'
            }
            world.create(NonEntity, {$id: 'non-entity'})

            const entities = world.entities

            expect(entities.length).toBe(1)
            expect(entities[0].$id).toBe('entity-1')
        })

    })


    describe('findByType', () => {

        test('finds entity by class', () => {
            world.start()
            const entity = world.create(Entity, {$id: 'test'})

            expect(world.findByType(Entity)).toBe(entity)
        })


        test('returns null when not found', () => {
            expect(world.findByType(Entity)).toBeNull()
        })

    })


    describe('loadLayout', () => {

        test('creates entities from config', () => {
            world.start()

            const mockWiring = {
                get: (group, name) => (name === 'Entity' ? Entity : null)
            }

            world.loadLayout({
                entities: [
                    {type: 'Entity', x: 5, y: 3},
                    {type: 'Entity', x: -1, y: 2}
                ]
            }, mockWiring)

            expect(world.entities.length).toBe(2)
            expect(world.entities[0].x).toBe(5)
            expect(world.entities[1].x).toBe(-1)
        })


        test('skips unknown types', () => {
            world.start()

            const mockWiring = {
                get: () => null
            }

            world.loadLayout({
                entities: [{type: 'Unknown', x: 0, y: 0}]
            }, mockWiring)

            expect(world.entities.length).toBe(0)
        })


        test('handles missing config', () => {
            world.loadLayout(null, null)

            expect(world.entities.length).toBe(0)
        })


        test('creates decor entities from texture entries', () => {
            world.start()

            world.loadLayout({
                entities: [
                    {texture: 'tree', x: 3, y: 4}
                ]
            }, null)

            expect(world.entities.length).toBe(1)
            expect(world.entities[0].x).toBe(3)
            expect(world.entities[0].y).toBe(4)
            expect(world.entities[0].$tags).toContain('decor')
        })

    })


    describe('update', () => {

        test('does not call preUpdate when not started', () => {
            let called = false
            world.preUpdate = () => {
                called = true
            }

            world.update(0.016, {})

            expect(called).toBe(false)
        })


        test('calls preUpdate when started', () => {
            let called = false
            world.preUpdate = () => {
                called = true
            }

            world.start()
            world.update(0.016, {})

            expect(called).toBe(true)
        })


        test('calls postUpdate when started', () => {
            let called = false
            world.postUpdate = () => {
                called = true
            }

            world.start()
            world.update(0.016, {})

            expect(called).toBe(true)
        })


        test('passes deltaTime and context to preUpdate', () => {
            let receivedDeltaTime
            let receivedContext
            const context = {foo: 'bar'}
            world.preUpdate = (dt, ctx) => {
                receivedDeltaTime = dt
                receivedContext = ctx
            }

            world.start()
            world.update(0.016, context)

            expect(receivedDeltaTime).toBe(0.016)
            expect(receivedContext).toBe(context)
        })


        test('passes deltaTime and context to postUpdate', () => {
            let receivedDeltaTime
            let receivedContext
            const context = {foo: 'bar'}
            world.postUpdate = (dt, ctx) => {
                receivedDeltaTime = dt
                receivedContext = ctx
            }

            world.start()
            world.update(0.016, context)

            expect(receivedDeltaTime).toBe(0.016)
            expect(receivedContext).toBe(context)
        })


        test('calls update on started entities', () => {
            let updateCalled = false
            class TestEntity extends Entity {
                update () {
                    updateCalled = true
                }
            }

            world.start()
            const entity = world.create(TestEntity, {$id: 'test'})
            entity.start()

            world.update(0.016, {})

            expect(updateCalled).toBe(true)
        })


        test('does not call update on non-started entities', () => {
            let updateCalled = false
            class TestEntity extends Entity {
                update () {
                    updateCalled = true
                }
            }

            world.start()
            world.create(TestEntity, {$id: 'test', $eagerStart: false})

            world.update(0.016, {})

            expect(updateCalled).toBe(false)
        })


        test('passes deltaTime to entity update', () => {
            let receivedDeltaTime
            class TestEntity extends Entity {
                update (deltaTime) {
                    receivedDeltaTime = deltaTime
                }
            }

            world.start()
            const entity = world.create(TestEntity, {$id: 'test'})
            entity.start()

            world.update(0.033, {})

            expect(receivedDeltaTime).toBe(0.033)
        })

    })

})
