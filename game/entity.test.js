import {describe, test, expect} from 'vitest'
import Entity from './entity.js'
import Velocity from './velocity.js'
import Vec2 from '../math/vec2.js'


describe('Entity', () => {

    test('has static $category "entity"', () => {
        expect(Entity.$category).toBe('entity')
    })


    test('can be instantiated with tags', () => {
        const entity = new Entity({$tags: ['enemy', 'collidable']})

        expect(entity.$category).toBe('entity')
        expect(entity.$tags).toEqual(['enemy', 'collidable'])
    })


    test('has default position at origin', () => {
        const entity = new Entity()

        expect(entity.position).toBeInstanceOf(Vec2)
        expect(entity.x).toBe(0)
        expect(entity.y).toBe(0)
    })


    test('accepts initial position', () => {
        const entity = new Entity({x: 5, y: 10})

        expect(entity.x).toBe(5)
        expect(entity.y).toBe(10)
    })


    test('does not have velocity by default', () => {
        const entity = new Entity()

        expect(entity.velocity).toBeUndefined()
    })


    test('x and y setters update position', () => {
        const entity = new Entity()

        entity.x = 42
        entity.y = 84

        expect(entity.position.x).toBe(42)
        expect(entity.position.y).toBe(84)
    })


    test('has update method', () => {
        const entity = new Entity()

        expect(typeof entity.update).toBe('function')
    })


    test('components returns children with category "component"', () => {
        const entity = new Entity()

        expect(entity.components).toEqual([])

        const velocity = entity.create(Velocity)

        expect(entity.components).toEqual([velocity])
    })


    describe('export and import', () => {

        test('declares x, y in static $exports', () => {
            expect(Entity.$exports).toEqual(['x', 'y'])
        })


        test('export returns identity metadata + declared state fields', () => {
            const entity = new Entity({$id: 'e1', x: 3, y: 5})
            const snapshot = entity.export()

            expect(snapshot.$id).toBe('e1')
            expect(snapshot.$type).toBe('Entity')
            expect(snapshot.$started).toBe(false)
            expect(snapshot.x).toBe(3)
            expect(snapshot.y).toBe(5)
        })


        test('export captures $started: true after the entity has been started', () => {
            const entity = new Entity({$id: 'e1', x: 1, y: 2})
            entity.start()

            const snapshot = entity.export()
            expect(snapshot.$started).toBe(true)
        })


        test('import updates declared scalar fields in place', () => {
            const entity = new Entity({x: 0, y: 0})
            entity.import({x: 7, y: 9})

            expect(entity.x).toBe(7)
            expect(entity.y).toBe(9)
        })


        test('import preserves the Vec2 instance reference (critical)', () => {
            const entity = new Entity({x: 1, y: 1})
            const originalVec = entity.position

            expect(originalVec).toBeInstanceOf(Vec2)

            entity.import({x: 42, y: 84})

            expect(entity.position).toBe(originalVec)
            expect(entity.position).toBeInstanceOf(Vec2)
            expect(entity.position.x).toBe(42)
            expect(entity.position.y).toBe(84)

            expect(entity.position.length()).toBeCloseTo(Math.sqrt(42 * 42 + 84 * 84), 5)
        })


        test('import ignores fields not declared in $exports', () => {
            const entity = new Entity({x: 0, y: 0})
            entity.import({x: 3, y: 5, rogue: 'intrusion'})

            expect(entity.x).toBe(3)
            expect(entity.y).toBe(5)
            expect(entity.rogue).toBeUndefined()
        })


        test('roundtrip export → new Entity(snapshot) reconstructs a fresh instance', () => {
            const original = new Entity({$id: 'e1', x: 3, y: 5})
            const snapshot = original.export()

            const restored = new Entity(snapshot)

            expect(restored).toBeInstanceOf(Entity)
            expect(restored.$id).toBe('e1')
            expect(restored.x).toBe(3)
            expect(restored.y).toBe(5)
            expect(restored.position).toBeInstanceOf(Vec2)
        })


        test('roundtrip preserves started state and skips onStart on reconstruction', () => {
            let onStartCalls = 0

            class LivingEntity extends Entity {
                onStart () {
                    onStartCalls++
                    this.x = 999
                }
            }

            const original = new LivingEntity({$id: 'alive', x: 10, y: 20})
            original.start()
            original.x = 42

            const snapshot = original.export()
            expect(snapshot.$started).toBe(true)
            expect(snapshot.x).toBe(42)

            const onStartCallsBefore = onStartCalls
            const restored = new LivingEntity(snapshot)

            expect(restored.started).toBe(true)
            expect(restored.x).toBe(42)
            expect(restored.y).toBe(20)

            restored.start()
            expect(onStartCalls).toBe(onStartCallsBefore)
            expect(restored.x).toBe(42)
        })


        test('subclass can extend $exports with additional fields', () => {
            class Enemy extends Entity {
                static $exports = [...Entity.$exports, 'health', 'alive']
                constructor (options = {}) {
                    super(options)
                    this.health = options.health ?? 10
                    this.alive = options.alive ?? true
                }
            }

            const enemy = new Enemy({$id: 'e1', x: 5, y: 3, health: 8, alive: true})
            const snapshot = enemy.export()

            expect(snapshot.$type).toBe('Enemy')
            expect(snapshot.x).toBe(5)
            expect(snapshot.y).toBe(3)
            expect(snapshot.health).toBe(8)
            expect(snapshot.alive).toBe(true)

            const restored = new Enemy(snapshot)
            expect(restored.health).toBe(8)
            expect(restored.alive).toBe(true)
            expect(restored.x).toBe(5)
        })


        test('import on existing entity does not touch identity or lifecycle state', () => {
            const entity = new Entity({$id: 'stable', x: 0, y: 0})
            entity.start()

            entity.import({x: 10, y: 20, $id: 'hijacked', $started: false})

            expect(entity.x).toBe(10)
            expect(entity.y).toBe(20)
            expect(entity.$id).toBe('stable')
            expect(entity.started).toBe(true)
        })

    })

})
