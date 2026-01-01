import {describe, test, expect, beforeEach} from 'vitest'
import World from './world.js'
import Entity from './entity.js'


describe('World', () => {

    let world

    beforeEach(() => {
        world = new World()
    })


    describe('constructor', () => {

        test('has correct $category', () => {
            expect(World.$category).toBe('world')
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

})
