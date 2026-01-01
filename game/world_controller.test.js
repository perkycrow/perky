import {describe, test, expect, beforeEach, vi} from 'vitest'
import WorldController from './world_controller.js'
import World from './world.js'
import Entity from './entity.js'


describe('WorldController', () => {

    let controller

    beforeEach(() => {
        controller = new WorldController()
    })


    describe('world getter/setter', () => {

        test('world is null by default', () => {
            expect(controller.world).toBeNull()
        })


        test('can set world', () => {
            const world = new World()

            controller.world = world

            expect(controller.world).toBe(world)
        })


        test('emits world:set when world is assigned', () => {
            const world = new World()
            const callback = vi.fn()

            controller.on('world:set', callback)
            controller.world = world

            expect(callback).toHaveBeenCalledWith(world)
        })


        test('emits world:delete when world is replaced', () => {
            const world1 = new World()
            const world2 = new World()
            const callback = vi.fn()

            controller.world = world1
            controller.on('world:delete', callback)
            controller.world = world2

            expect(callback).toHaveBeenCalledWith(world1)
        })


        test('does not emit world:delete when setting same world', () => {
            const world = new World()
            const callback = vi.fn()

            controller.world = world
            controller.on('world:delete', callback)
            controller.world = world

            expect(callback).not.toHaveBeenCalled()
        })


        test('does not emit world:set when setting null', () => {
            const world = new World()
            const setCallback = vi.fn()

            controller.world = world
            controller.on('world:set', setCallback)
            controller.world = null

            expect(setCallback).not.toHaveBeenCalled()
        })

    })


    describe('spawn', () => {

        test('returns null when no world', () => {
            const result = controller.spawn(Entity)

            expect(result).toBeNull()
        })


        test('creates entity in world', () => {
            const world = new World()
            controller.world = world

            const entity = controller.spawn(Entity, {$id: 'test-entity'})

            expect(entity).toBeInstanceOf(Entity)
            expect(entity.$id).toBe('test-entity')
            expect(world.entities).toContain(entity)
        })


        test('passes options to entity', () => {
            const world = new World()
            controller.world = world

            const entity = controller.spawn(Entity, {x: 100, y: 200})

            expect(entity.x).toBe(100)
            expect(entity.y).toBe(200)
        })

    })

})
