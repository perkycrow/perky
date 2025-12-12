import {describe, test, expect, beforeEach} from 'vitest'
import World from './world'


describe('World', () => {

    let world

    beforeEach(() => {
        world = new World()
    })


    describe('constructor', () => {

        test('creates an empty world', () => {
            expect(world.size).toBe(0)
        })

        test('has entities registry', () => {
            expect(world.entities).toBeDefined()
        })

    })


    describe('addEntity', () => {

        test('adds an entity with $category', () => {
            const entity = {$category: 'player', x: 0, y: 0}
            world.addEntity('player1', entity)

            expect(world.size).toBe(1)
            expect(world.getEntity('player1')).toBe(entity)
        })

        test('assigns default "entity" category if not provided', () => {
            const entity = {x: 0, y: 0}

            world.addEntity('test', entity)

            expect(entity.$category).toBe('entity')
            expect(world.getEntity('test')).toBe(entity)
        })

        test('returns this for chaining', () => {
            const entity = {$category: 'player'}
            const result = world.addEntity('player1', entity)

            expect(result).toBe(world)
        })

    })


    describe('removeEntity', () => {

        test('removes an entity', () => {
            const entity = {$category: 'player', x: 0, y: 0}
            world.addEntity('player1', entity)

            const removed = world.removeEntity('player1')

            expect(removed).toBe(true)
            expect(world.size).toBe(0)
            expect(world.hasEntity('player1')).toBe(false)
        })

        test('returns false if entity does not exist', () => {
            const removed = world.removeEntity('nonexistent')

            expect(removed).toBe(false)
        })

    })


    describe('getEntity', () => {

        test('returns entity by id', () => {
            const entity = {$category: 'player', x: 0, y: 0}
            world.addEntity('player1', entity)

            expect(world.getEntity('player1')).toBe(entity)
        })

        test('returns undefined for non-existent entity', () => {
            expect(world.getEntity('nonexistent')).toBeUndefined()
        })

    })


    describe('hasEntity', () => {

        test('returns true if entity exists', () => {
            const entity = {$category: 'player'}
            world.addEntity('player1', entity)

            expect(world.hasEntity('player1')).toBe(true)
        })

        test('returns false if entity does not exist', () => {
            expect(world.hasEntity('nonexistent')).toBe(false)
        })

    })


    describe('clear', () => {

        test('removes all entities', () => {
            world.addEntity('player1', {$category: 'player'})
            world.addEntity('enemy1', {$category: 'enemy'})

            world.clear()

            expect(world.size).toBe(0)
        })

    })


    describe('byCategory', () => {

        test('returns entities by $category', () => {
            const player1 = {$category: 'player', name: 'Alice'}
            const player2 = {$category: 'player', name: 'Bob'}
            const enemy1 = {$category: 'enemy', name: 'Goblin'}

            world.addEntity('p1', player1)
            world.addEntity('p2', player2)
            world.addEntity('e1', enemy1)

            const players = world.byCategory('player')

            expect(players).toHaveLength(2)
            expect(players).toContain(player1)
            expect(players).toContain(player2)
        })

        test('returns empty array for non-existent category', () => {
            const result = world.byCategory('nonexistent')

            expect(result).toEqual([])
        })

        test('is performant (no filtering on each call)', () => {
            // Add many entities
            for (let i = 0; i < 1000; i++) {
                world.addEntity(`enemy${i}`, {$category: 'enemy', id: i})
            }

            world.addEntity('player1', {$category: 'player', id: 0})

            // Lookup should be O(1) not O(n)
            const start = performance.now()
            const enemies = world.byCategory('enemy')
            const duration = performance.now() - start

            expect(enemies).toHaveLength(1000)

            // Should be instant (< 1ms for indexed lookup)
            expect(duration).toBeLessThan(1)
        })

    })


    describe('byTag', () => {

        test('returns entities by $tag', () => {
            const entity1 = {$category: 'player', $tags: ['collidable', 'movable']}
            const entity2 = {$category: 'enemy', $tags: ['collidable', 'hostile']}
            const entity3 = {$category: 'decoration', $tags: ['static']}

            world.addEntity('e1', entity1)
            world.addEntity('e2', entity2)
            world.addEntity('e3', entity3)

            const collidables = world.byTag('collidable')

            expect(collidables).toHaveLength(2)
            expect(collidables).toContain(entity1)
            expect(collidables).toContain(entity2)
        })

        test('handles entities without $tags', () => {
            const entity = {$category: 'player'}
            world.addEntity('e1', entity)

            const result = world.byTag('sometag')

            expect(result).toEqual([])
        })

        test('returns empty array for non-existent tag', () => {
            const result = world.byTag('nonexistent')

            expect(result).toEqual([])
        })

        test('supports multiple tags per entity', () => {
            const entity = {$category: 'player', $tags: ['a', 'b', 'c']}
            world.addEntity('e1', entity)

            expect(world.byTag('a')).toContain(entity)
            expect(world.byTag('b')).toContain(entity)
            expect(world.byTag('c')).toContain(entity)
        })

    })


    describe('forEach', () => {

        test('iterates over all entities', () => {
            const entity1 = {$category: 'player', id: 1}
            const entity2 = {$category: 'enemy', id: 2}

            world.addEntity('e1', entity1)
            world.addEntity('e2', entity2)

            const visited = []
            world.forEach((entity) => {
                visited.push(entity)
            })

            expect(visited).toHaveLength(2)
            expect(visited).toContain(entity1)
            expect(visited).toContain(entity2)
        })

    })


    describe('integration with game loop', () => {

        test('supports typical update pattern', () => {
            // Setup entities
            const player = {$category: 'player', $tags: ['updatable'], update: () => { }}
            const enemy1 = {$category: 'enemy', $tags: ['updatable', 'hostile'], update: () => { }}
            const enemy2 = {$category: 'enemy', $tags: ['updatable', 'hostile'], update: () => { }}
            const decoration = {$category: 'decoration', $tags: ['static']}

            world.addEntity('player', player)
            world.addEntity('enemy1', enemy1)
            world.addEntity('enemy2', enemy2)
            world.addEntity('deco1', decoration)

            // Update loop pattern
            const updatables = world.byTag('updatable')
            expect(updatables).toHaveLength(3)

            // Collision detection pattern
            const hostiles = world.byTag('hostile')
            expect(hostiles).toHaveLength(2)

            // Category-based rendering
            const enemies = world.byCategory('enemy')
            expect(enemies).toHaveLength(2)
        })

    })

})
