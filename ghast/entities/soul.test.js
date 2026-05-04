import {test, expect, vi} from 'vitest'
import Soul from './soul.js'


test('constructor defaults', () => {
    const soul = new Soul()
    expect(soul.maxSpeed).toBe(2.5)
    expect(soul.acceleration).toBe(15)
    expect(soul.hitbox.radius).toBe(0.3)
})


test('constructor custom params', () => {
    const soul = new Soul({maxSpeed: 3, acceleration: 20})
    expect(soul.maxSpeed).toBe(3)
    expect(soul.acceleration).toBe(20)
})


test('constructor position', () => {
    const soul = new Soul({x: 5, y: 10})
    expect(soul.x).toBe(5)
    expect(soul.y).toBe(10)
})


test('move sets direction', () => {
    const soul = new Soul()
    const direction = {x: 1, y: 0}
    soul.move(direction)
    expect(soul.direction).toBe(direction)
})


test('has velocity component', () => {
    const soul = new Soul()
    expect(soul.velocity).toBeDefined()
})


test('has steering component', () => {
    const soul = new Soul()
    expect(typeof soul.seek).toBe('function')
    expect(typeof soul.arrive).toBe('function')
    expect(typeof soul.wander).toBe('function')
    expect(typeof soul.separate).toBe('function')
    expect(typeof soul.resolveForce).toBe('function')
})


test('has health component', () => {
    const soul = new Soul()
    expect(typeof soul.damage).toBe('function')
    expect(typeof soul.updateHealth).toBe('function')
    expect(soul.isAlive()).toBe(true)
})


test('update calls updateHealth', () => {
    const soul = new Soul()
    const spy = vi.spyOn(soul, 'updateHealth')
    soul.update(0.1)
    expect(spy).toHaveBeenCalledWith(0.1)
})
