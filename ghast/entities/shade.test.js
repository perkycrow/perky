import {test, expect, vi} from 'vitest'
import Shade from './shade.js'


test('constructor defaults', () => {
    const shade = new Shade()
    expect(shade.maxSpeed).toBe(0.7)
    expect(shade.acceleration).toBe(5)
    expect(shade.hitbox.radius).toBe(0.3)
    expect(shade.rank).toBe(1)
})


test('constructor custom params', () => {
    const shade = new Shade({maxSpeed: 1, acceleration: 10, rank: 3})
    expect(shade.maxSpeed).toBe(1)
    expect(shade.acceleration).toBe(10)
    expect(shade.rank).toBe(3)
})


test('constructor position', () => {
    const shade = new Shade({x: 5, y: 10})
    expect(shade.x).toBe(5)
    expect(shade.y).toBe(10)
})


test('move sets direction', () => {
    const shade = new Shade()
    const direction = {x: 1, y: 0}
    shade.move(direction)
    expect(shade.direction).toBe(direction)
})


test('has velocity component', () => {
    const shade = new Shade()
    expect(shade.velocity).toBeDefined()
})


test('has steering component', () => {
    const shade = new Shade()
    expect(typeof shade.seek).toBe('function')
    expect(typeof shade.arrive).toBe('function')
    expect(typeof shade.wander).toBe('function')
    expect(typeof shade.separate).toBe('function')
    expect(typeof shade.resolveForce).toBe('function')
})


test('has health component', () => {
    const shade = new Shade()
    expect(typeof shade.damage).toBe('function')
    expect(typeof shade.updateHealth).toBe('function')
    expect(shade.isAlive()).toBe(true)
})


test('has melee attack component', () => {
    const shade = new Shade()
    expect(typeof shade.meleeAttack).toBe('function')
    expect(typeof shade.updateMeleeAttack).toBe('function')
    expect(typeof shade.isAttacking).toBe('function')
})


test('has dash component', () => {
    const shade = new Shade()
    expect(typeof shade.dash).toBe('function')
    expect(typeof shade.updateDash).toBe('function')
    expect(typeof shade.isDashing).toBe('function')
})


test('has buff system', () => {
    const shade = new Shade()
    expect(typeof shade.applyBuff).toBe('function')
    expect(typeof shade.hasBuff).toBe('function')
    expect(typeof shade.getBuffModifier).toBe('function')
})


test('has combat stats', () => {
    const shade = new Shade()
    expect(typeof shade.addStat).toBe('function')
    expect(typeof shade.getStat).toBe('function')
    expect(typeof shade.getXp).toBe('function')
})


test('has spore and imprint storage', () => {
    const shade = new Shade()
    expect(shade.spores).toBeDefined()
    expect(shade.imprint).toBeDefined()
})


test('has stamina', () => {
    const shade = new Shade()
    expect(shade.stamina).toBe(100)
    expect(shade.maxStamina).toBe(100)
})


test('getCooldownModifier', () => {
    const shade = new Shade()
    const modifier = shade.getCooldownModifier()
    expect(typeof modifier).toBe('number')
})


test('update calls updateMeleeAttack', () => {
    const shade = new Shade()
    const spy = vi.spyOn(shade, 'updateMeleeAttack')
    shade.update(0.1)
    expect(spy).toHaveBeenCalled()
})


test('update calls updateHealth', () => {
    const shade = new Shade()
    const spy = vi.spyOn(shade, 'updateHealth')
    shade.update(0.1)
    expect(spy).toHaveBeenCalledWith(0.1)
})


test('rank affects health', () => {
    const rank1 = new Shade({rank: 1})
    const rank3 = new Shade({rank: 3})
    const health1 = rank1.components.find(c => c.constructor.name === 'Health')
    const health3 = rank3.components.find(c => c.constructor.name === 'Health')
    expect(health3.hp).toBeGreaterThan(health1.hp)
})
