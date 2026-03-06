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

            // Create a non-entity child
            class NonEntity extends Entity {
                static $category = 'other'
            }
            world.create(NonEntity, {$id: 'non-entity'})

            const entities = world.entities

            expect(entities.length).toBe(1)
            expect(entities[0].$id).toBe('entity-1')
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


    describe('nearest', () => {

        test('returns closest entity in range', () => {
            world.start()
            const a = world.create(Entity, {$id: 'a', x: 0, y: 0})
            const b = world.create(Entity, {$id: 'b', x: 2, y: 0})
            world.create(Entity, {$id: 'c', x: 5, y: 0})

            const result = world.nearest(a, 3)

            expect(result).toBe(b)
        })


        test('returns null when no entity in range', () => {
            world.start()
            const a = world.create(Entity, {$id: 'a', x: 0, y: 0})
            world.create(Entity, {$id: 'b', x: 10, y: 0})

            const result = world.nearest(a, 3)

            expect(result).toBe(null)
        })


        test('applies filter function', () => {
            world.start()
            const a = world.create(Entity, {$id: 'a', x: 0, y: 0})
            a.team = 'shadow'
            const b = world.create(Entity, {$id: 'b', x: 1, y: 0})
            b.team = 'shadow'
            const c = world.create(Entity, {$id: 'c', x: 2, y: 0})
            c.team = 'light'

            const result = world.nearest(a, 10, e => e.team !== a.team)

            expect(result).toBe(c)
        })


        test('excludes self', () => {
            world.start()
            const a = world.create(Entity, {$id: 'a', x: 0, y: 0})

            const result = world.nearest(a, 10)

            expect(result).toBe(null)
        })

    })


    describe('entitiesInRange', () => {

        test('returns all entities within range', () => {
            world.start()
            const a = world.create(Entity, {$id: 'a', x: 0, y: 0})
            const b = world.create(Entity, {$id: 'b', x: 1, y: 0})
            const c = world.create(Entity, {$id: 'c', x: 2, y: 0})
            world.create(Entity, {$id: 'd', x: 10, y: 0})

            const results = world.entitiesInRange(a, 3)

            expect(results).toContain(b)
            expect(results).toContain(c)
            expect(results.length).toBe(2)
        })


        test('returns empty array when none in range', () => {
            world.start()
            const a = world.create(Entity, {$id: 'a', x: 0, y: 0})
            world.create(Entity, {$id: 'b', x: 10, y: 0})

            const results = world.entitiesInRange(a, 3)

            expect(results).toEqual([])
        })


        test('applies filter function', () => {
            world.start()
            const a = world.create(Entity, {$id: 'a', x: 0, y: 0})
            a.team = 'shadow'
            const b = world.create(Entity, {$id: 'b', x: 1, y: 0})
            b.team = 'shadow'
            const c = world.create(Entity, {$id: 'c', x: 2, y: 0})
            c.team = 'light'

            const results = world.entitiesInRange(a, 10, e => e.team === 'light')

            expect(results).toEqual([c])
        })

    })

})
