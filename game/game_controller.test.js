import {describe, test, expect, beforeEach} from 'vitest'
import GameController from './game_controller.js'
import World from './world.js'
import Entity from './entity.js'


describe('GameController', () => {

    let controller

    beforeEach(() => {
        controller = new GameController()
    })


    test('has default resources', () => {
        expect(GameController.resources).toEqual(['world', 'renderer', 'camera'])
    })


    test('game getter returns engine', () => {
        const mockEngine = {name: 'test-engine'}
        controller.engine = mockEngine

        expect(controller.game).toBe(mockEngine)
    })


    describe('spawn', () => {

        test('returns undefined when no world', () => {
            const result = controller.spawn(Entity)

            expect(result).toBeUndefined()
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
