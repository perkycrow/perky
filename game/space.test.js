import {describe, test, expect, beforeEach} from 'vitest'
import Space from './space.js'
import Entity from './entity.js'
import Hitbox from './hitbox.js'


describe('Space', () => {

    let space

    beforeEach(() => {
        space = new Space()
    })


    test('has static $category "space"', () => {
        expect(Space.$category).toBe('space')
    })


    test('starts empty', () => {
        expect(space.size).toBe(0)
        expect(space.entities).toEqual([])
    })


    describe('add', () => {

        test('adds an entity', () => {
            const entity = new Entity()

            space.add(entity)

            expect(space.has(entity)).toBe(true)
            expect(space.size).toBe(1)
            expect(space.entities).toContain(entity)
        })


        test('returns the added entity', () => {
            const entity = new Entity()

            const result = space.add(entity)

            expect(result).toBe(entity)
        })


        test('is idempotent', () => {
            const entity = new Entity()

            space.add(entity)
            space.add(entity)

            expect(space.size).toBe(1)
        })

    })


    describe('remove', () => {

        test('removes an entity', () => {
            const entity = new Entity()
            space.add(entity)

            space.remove(entity)

            expect(space.has(entity)).toBe(false)
            expect(space.size).toBe(0)
        })


        test('returns true when entity was present', () => {
            const entity = new Entity()
            space.add(entity)

            expect(space.remove(entity)).toBe(true)
        })


        test('returns false when entity was absent', () => {
            const entity = new Entity()

            expect(space.remove(entity)).toBe(false)
        })

    })


    test('drops the entity when it disposes', () => {
        const entity = new Entity()
        space.add(entity)

        entity.dispose()

        expect(space.has(entity)).toBe(false)
        expect(space.size).toBe(0)
    })


    describe('nearest', () => {

        test('returns closest entity in range around an entity', () => {
            const a = new Entity({x: 0, y: 0})
            const b = new Entity({x: 2, y: 0})
            const c = new Entity({x: 5, y: 0})

            space.add(a)
            space.add(b)
            space.add(c)

            expect(space.nearest(a, 3)).toBe(b)
        })


        test('returns null when no entity in range', () => {
            const a = new Entity({x: 0, y: 0})
            const b = new Entity({x: 10, y: 0})

            space.add(a)
            space.add(b)

            expect(space.nearest(a, 3)).toBe(null)
        })


        test('applies filter function', () => {
            const a = new Entity({x: 0, y: 0})
            a.team = 'shadow'
            const b = new Entity({x: 1, y: 0})
            b.team = 'shadow'
            const c = new Entity({x: 2, y: 0})
            c.team = 'light'

            space.add(a)
            space.add(b)
            space.add(c)

            const result = space.nearest(a, 10, e => e.team !== a.team)

            expect(result).toBe(c)
        })


        test('excludes the reference entity', () => {
            const a = new Entity({x: 0, y: 0})
            space.add(a)

            expect(space.nearest(a, 10)).toBe(null)
        })


        test('accepts a plain point as origin', () => {
            const a = new Entity({x: 1, y: 0})
            const b = new Entity({x: 3, y: 0})

            space.add(a)
            space.add(b)

            expect(space.nearest({x: 0, y: 0}, 10)).toBe(a)
        })

    })


    describe('entitiesInRange', () => {

        test('returns all entities within range', () => {
            const a = new Entity({x: 0, y: 0})
            const b = new Entity({x: 1, y: 0})
            const c = new Entity({x: 2, y: 0})
            const d = new Entity({x: 10, y: 0})

            space.add(a)
            space.add(b)
            space.add(c)
            space.add(d)

            const results = space.entitiesInRange(a, 3)

            expect(results).toContain(b)
            expect(results).toContain(c)
            expect(results.length).toBe(2)
        })


        test('returns empty array when none in range', () => {
            const a = new Entity({x: 0, y: 0})
            const b = new Entity({x: 10, y: 0})

            space.add(a)
            space.add(b)

            expect(space.entitiesInRange(a, 3)).toEqual([])
        })


        test('applies filter function', () => {
            const a = new Entity({x: 0, y: 0})
            a.team = 'shadow'
            const b = new Entity({x: 1, y: 0})
            b.team = 'shadow'
            const c = new Entity({x: 2, y: 0})
            c.team = 'light'

            space.add(a)
            space.add(b)
            space.add(c)

            const results = space.entitiesInRange(a, 10, e => e.team === 'light')

            expect(results).toEqual([c])
        })


        test('accepts a plain point as origin', () => {
            const a = new Entity({x: 1, y: 0})
            const b = new Entity({x: 5, y: 0})

            space.add(a)
            space.add(b)

            const results = space.entitiesInRange({x: 0, y: 0}, 3)

            expect(results).toEqual([a])
        })

    })


    describe('checkHit', () => {

        function withHitbox (x, y, radius) {
            const entity = new Entity({x, y})
            entity.create(Hitbox, {radius})
            return entity
        }


        test('returns entity when hit radii overlap', () => {
            const a = withHitbox(0, 0, 0.5)
            const b = withHitbox(0.8, 0, 0.5)

            space.add(a)
            space.add(b)

            expect(space.checkHit(a)).toBe(b)
        })


        test('returns null when no overlap', () => {
            const a = withHitbox(0, 0, 0.3)
            const b = withHitbox(5, 0, 0.3)

            space.add(a)
            space.add(b)

            expect(space.checkHit(a)).toBe(null)
        })


        test('applies filter function', () => {
            const a = withHitbox(0, 0, 0.5)
            a.team = 'shadow'
            const b = withHitbox(0.5, 0, 0.5)
            b.team = 'shadow'
            const c = withHitbox(0.8, 0, 0.5)
            c.team = 'light'

            space.add(a)
            space.add(b)
            space.add(c)

            expect(space.checkHit(a, e => e.team !== a.team)).toBe(c)
        })


        test('excludes self', () => {
            const a = withHitbox(0, 0, 1)

            space.add(a)

            expect(space.checkHit(a)).toBe(null)
        })


        test('skips entities without a hitbox', () => {
            const a = withHitbox(0, 0, 0.5)
            const b = new Entity({x: 0.1, y: 0})

            space.add(a)
            space.add(b)

            expect(space.checkHit(a)).toBe(null)
        })


        test('skips the reference entity when it has no hitbox', () => {
            const a = new Entity({x: 0, y: 0})
            const b = withHitbox(0.1, 0, 0.5)

            space.add(a)
            space.add(b)

            expect(space.checkHit(a)).toBe(null)
        })

    })


    test('clear removes all entities', () => {
        space.add(new Entity({x: 0, y: 0}))
        space.add(new Entity({x: 1, y: 0}))

        space.clear()

        expect(space.size).toBe(0)
    })


    test('installs itself as host.space', () => {
        class Host extends Entity {}
        const host = new Host()

        const space2 = host.create(Space)

        expect(host.space).toBe(space2)
    })

})
