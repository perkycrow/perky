import {describe, test, expect, beforeEach} from 'vitest'
import {loadScene, serializeScene} from './scene_config.js'
import World from './world.js'
import Entity from './entity.js'
import Wiring from '../application/wiring.js'


class Player extends Entity {

    static $category = 'entity'

    constructor (options = {}) {
        super(options)
        this.speed = options.speed ?? 1
    }

}


class Enemy extends Entity {

    static $category = 'entity'

}


function createWiring () {
    return new Wiring({
        entities: {
            './entities/player.js': {default: Player},
            './entities/enemy.js': {default: Enemy}
        }
    })
}


describe('loadScene', () => {

    let world
    let wiring

    beforeEach(() => {
        world = new World()
        world.start()
        wiring = createWiring()
    })


    test('creates entities from config', () => {
        const config = {
            entities: [
                {type: 'Player', x: 1, y: 2},
                {type: 'Enemy', x: 3, y: 4}
            ]
        }

        const entities = loadScene(config, world, wiring)

        expect(entities.length).toBe(2)
        expect(entities[0]).toBeInstanceOf(Player)
        expect(entities[1]).toBeInstanceOf(Enemy)
    })


    test('sets entity positions', () => {
        const config = {
            entities: [
                {type: 'Player', x: 5, y: -3}
            ]
        }

        const entities = loadScene(config, world, wiring)

        expect(entities[0].x).toBe(5)
        expect(entities[0].y).toBe(-3)
    })


    test('passes extra options to entity constructor', () => {
        const config = {
            entities: [
                {type: 'Player', x: 0, y: 0, speed: 42}
            ]
        }

        const entities = loadScene(config, world, wiring)

        expect(entities[0].speed).toBe(42)
    })


    test('passes $id to entity', () => {
        const config = {
            entities: [
                {type: 'Player', $id: 'hero', x: 0, y: 0}
            ]
        }

        const entities = loadScene(config, world, wiring)

        expect(entities[0].$id).toBe('hero')
    })


    test('adds entities to world', () => {
        const config = {
            entities: [
                {type: 'Player', x: 0, y: 0},
                {type: 'Enemy', x: 1, y: 1}
            ]
        }

        loadScene(config, world, wiring)

        expect(world.entities.length).toBe(2)
    })


    test('skips unknown entity types', () => {
        const config = {
            entities: [
                {type: 'Player', x: 0, y: 0},
                {type: 'Unknown', x: 1, y: 1}
            ]
        }

        const entities = loadScene(config, world, wiring)

        expect(entities.length).toBe(1)
        expect(world.entities.length).toBe(1)
    })


    test('returns empty array for empty config', () => {
        const entities = loadScene({}, world, wiring)

        expect(entities).toEqual([])
    })


    test('returns empty array for null config', () => {
        const entities = loadScene(null, world, wiring)

        expect(entities).toEqual([])
    })


    test('returns empty array for missing world', () => {
        const config = {entities: [{type: 'Player', x: 0, y: 0}]}

        const entities = loadScene(config, null, wiring)

        expect(entities).toEqual([])
    })


    test('handles config with no entities key', () => {
        const entities = loadScene({decor: []}, world, wiring)

        expect(entities).toEqual([])
    })

})


describe('serializeScene', () => {

    let world
    let wiring

    beforeEach(() => {
        world = new World()
        world.start()
        wiring = createWiring()
    })


    test('serializes entities with type and position', () => {
        world.create(Player, {$id: 'player', x: 5, y: -3})

        const config = serializeScene(world, wiring)

        expect(config.entities.length).toBe(1)
        expect(config.entities[0].type).toBe('Player')
        expect(config.entities[0].x).toBe(5)
        expect(config.entities[0].y).toBe(-3)
    })


    test('omits zero positions', () => {
        world.create(Player, {x: 0, y: 0})

        const config = serializeScene(world, wiring)

        expect(config.entities[0].x).toBeUndefined()
        expect(config.entities[0].y).toBeUndefined()
    })


    test('includes $id when different from class name', () => {
        world.create(Player, {$id: 'hero', x: 1, y: 2})

        const config = serializeScene(world, wiring)

        expect(config.entities[0].$id).toBe('hero')
    })


    test('omits $id when same as class name', () => {
        world.create(Player, {x: 1, y: 2})

        const config = serializeScene(world, wiring)

        expect(config.entities[0].$id).toBeUndefined()
    })


    test('serializes multiple entities', () => {
        world.create(Player, {x: 1, y: 2})
        world.create(Enemy, {x: 3, y: 4})

        const config = serializeScene(world, wiring)

        expect(config.entities.length).toBe(2)
        expect(config.entities[0].type).toBe('Player')
        expect(config.entities[1].type).toBe('Enemy')
    })


    test('returns empty entities for empty world', () => {
        const config = serializeScene(world, wiring)

        expect(config.entities).toEqual([])
    })


    test('skips entities not found in wiring', () => {
        class Unknown extends Entity {
            static $category = 'entity'
        }

        world.create(Player, {x: 1, y: 2})
        world.create(Unknown, {x: 3, y: 4})

        const config = serializeScene(world, wiring)

        expect(config.entities.length).toBe(1)
        expect(config.entities[0].type).toBe('Player')
    })


    test('round-trip: load then serialize preserves config', () => {
        const original = {
            entities: [
                {type: 'Player', x: 5, y: -3, $id: 'hero'},
                {type: 'Enemy', x: 10, y: 0}
            ]
        }

        loadScene(original, world, wiring)
        const result = serializeScene(world, wiring)

        expect(result.entities.length).toBe(2)
        expect(result.entities[0].type).toBe('Player')
        expect(result.entities[0].x).toBe(5)
        expect(result.entities[0].y).toBe(-3)
        expect(result.entities[0].$id).toBe('hero')
        expect(result.entities[1].type).toBe('Enemy')
        expect(result.entities[1].x).toBe(10)
    })

})
