import {test, expect, vi} from 'vitest'
import Inquisitor from './inquisitor.js'


test('constructor defaults', () => {
    const inquisitor = new Inquisitor()
    expect(inquisitor.rank).toBe(1)
    expect(inquisitor.maxSpeed).toBe(0.55)
    expect(inquisitor.acceleration).toBe(5)
    expect(inquisitor.hitbox.radius).toBe(0.3)
    expect(inquisitor.shootDamage).toBe(8)
    expect(inquisitor.stamina).toBe(70)
    expect(inquisitor.maxStamina).toBe(70)
})


test('constructor custom params', () => {
    const inquisitor = new Inquisitor({
        rank: 3,
        maxSpeed: 0.8,
        acceleration: 7,
        shootInterval: 1.5,
        shootDamage: 12
    })
    expect(inquisitor.rank).toBe(3)
    expect(inquisitor.maxSpeed).toBe(0.8)
    expect(inquisitor.acceleration).toBe(7)
    expect(inquisitor.shootDamage).toBe(12)
})


test('constructor position', () => {
    const inquisitor = new Inquisitor({x: 5, y: 10})
    expect(inquisitor.x).toBe(5)
    expect(inquisitor.y).toBe(10)
})


test('move sets direction', () => {
    const inquisitor = new Inquisitor()
    const direction = {x: 1, y: 0}
    inquisitor.move(direction)
    expect(inquisitor.direction).toBe(direction)
})


test('has velocity component', () => {
    const inquisitor = new Inquisitor()
    expect(inquisitor.velocity).toBeDefined()
})


test('has steering component', () => {
    const inquisitor = new Inquisitor()
    expect(typeof inquisitor.seek).toBe('function')
    expect(typeof inquisitor.flee).toBe('function')
    expect(typeof inquisitor.wander).toBe('function')
    expect(typeof inquisitor.separate).toBe('function')
    expect(typeof inquisitor.resolveForce).toBe('function')
})


test('has health component', () => {
    const inquisitor = new Inquisitor()
    expect(typeof inquisitor.damage).toBe('function')
    expect(typeof inquisitor.updateHealth).toBe('function')
    expect(inquisitor.isAlive()).toBe(true)
})


test('has buff system', () => {
    const inquisitor = new Inquisitor()
    expect(typeof inquisitor.applyBuff).toBe('function')
    expect(typeof inquisitor.hasBuff).toBe('function')
})


test('has combat stats', () => {
    const inquisitor = new Inquisitor()
    expect(typeof inquisitor.addStat).toBe('function')
    expect(typeof inquisitor.getStat).toBe('function')
})


test('has spore storage', () => {
    const inquisitor = new Inquisitor()
    expect(inquisitor.spores).toBeDefined()
    expect(inquisitor.imprint).toBeDefined()
})


test('update calls updateHealth', () => {
    const inquisitor = new Inquisitor()
    const spy = vi.spyOn(inquisitor, 'updateHealth')
    inquisitor.update(0.1)
    expect(spy).toHaveBeenCalledWith(0.1)
})


test('update decrements shootCooldown when idle', () => {
    const inquisitor = new Inquisitor()
    inquisitor.shootCooldown = 1.0
    inquisitor.target = null
    inquisitor.update(0.1)
    expect(inquisitor.shootCooldown).toBeLessThan(1.0)
})


test('rank affects health', () => {
    const rank1 = new Inquisitor({rank: 1})
    const rank3 = new Inquisitor({rank: 3})
    const health1 = rank1.components.find(c => c.constructor.name === 'Health')
    const health3 = rank3.components.find(c => c.constructor.name === 'Health')
    expect(health3.hp).toBeGreaterThan(health1.hp)
})
