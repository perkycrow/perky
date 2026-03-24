import {describe, test, expect} from 'vitest'
import Entity from '../../game/entity.js'
import Projectile from './projectile.js'


describe('Projectile', () => {

    test('extends Entity', () => {
        const p = new Projectile()

        expect(p).toBeInstanceOf(Entity)
    })


    test('has default hitRadius of 0.15', () => {
        const p = new Projectile()

        expect(p.hitRadius).toBe(0.15)
    })


    test('sets velocity from direction and speed', () => {
        const p = new Projectile({dirX: 1, dirY: 0, speed: 10})

        expect(p.velocity.x).toBeCloseTo(10)
        expect(p.velocity.y).toBeCloseTo(0)
    })


    test('sets diagonal velocity', () => {
        const p = new Projectile({dirX: 0, dirY: -1, speed: 5})

        expect(p.velocity.x).toBeCloseTo(0)
        expect(p.velocity.y).toBeCloseTo(-5)
    })


    test('stores faction and source', () => {
        const source = {}
        const p = new Projectile({faction: 'shadow', source})

        expect(p.faction).toBe('shadow')
        expect(p.source).toBe(source)
    })


    test('has damage with default of 1', () => {
        const p = new Projectile()

        expect(p.damage).toBe(1)
    })


    test('accepts custom damage', () => {
        const p = new Projectile({damage: 5})

        expect(p.damage).toBe(5)
    })


    test('starts with time at 0', () => {
        const p = new Projectile()

        expect(p.time).toBe(0)
    })


    test('accumulates time on update', () => {
        const p = new Projectile()

        p.update(0.1)
        p.update(0.2)

        expect(p.time).toBeCloseTo(0.3)
    })


    test('starts alive', () => {
        const p = new Projectile()

        expect(p.alive).toBe(true)
    })


    test('moves by velocity on update', () => {
        const p = new Projectile({x: 0, y: 0, dirX: 1, dirY: 0, speed: 10})

        p.update(0.1)

        expect(p.x).toBeCloseTo(1)
        expect(p.y).toBeCloseTo(0)
    })


    test('dies after ttl expires', () => {
        const p = new Projectile({ttl: 0.5})

        p.update(0.6)

        expect(p.alive).toBe(false)
    })


    test('stays alive before ttl', () => {
        const p = new Projectile({ttl: 1})

        p.update(0.5)

        expect(p.alive).toBe(true)
    })

})
