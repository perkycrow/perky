import {test, expect, vi} from 'vitest'
import Shroom from './shroom.js'


test('constructor defaults', () => {
    const shroom = new Shroom()
    expect(shroom.sporeType).toBe('fear')
    expect(shroom.stock).toBe(2)
    expect(shroom.spawnInterval).toBe(3)
    expect(shroom.hitbox).toBeUndefined()
})


test('constructor custom params', () => {
    const shroom = new Shroom({sporeType: 'anger', stock: 1, spawnInterval: 5})
    expect(shroom.sporeType).toBe('anger')
    expect(shroom.stock).toBe(1)
    expect(shroom.spawnInterval).toBe(5)
})


test('sporeColor', () => {
    const shroom = new Shroom({sporeType: 'anger'})
    expect(shroom.sporeColor).toBe('#ef5350')
})


test('sporeColor fallback', () => {
    const shroom = new Shroom({sporeType: 'unknown'})
    expect(shroom.sporeColor).toBe('#ffffff')
})


test('depleted', () => {
    const shroom = new Shroom({stock: 0})
    expect(shroom.depleted).toBe(true)
})


test('not depleted', () => {
    const shroom = new Shroom({stock: 1})
    expect(shroom.depleted).toBe(false)
})


test('emits spawn_spore after interval', () => {
    const shroom = new Shroom({sporeType: 'anger', stock: 2, spawnInterval: 1})
    shroom.spawnTimer = 1
    const handler = vi.fn()
    shroom.on('spawn_spore', handler)

    shroom.update(0.5)
    expect(handler).not.toHaveBeenCalled()

    shroom.update(0.6)
    expect(handler).toHaveBeenCalledWith({sporeType: 'anger', x: 0, y: 0})
    expect(shroom.stock).toBe(1)
})


test('emits depleted when stock reaches zero', () => {
    const shroom = new Shroom({sporeType: 'fear', stock: 1, spawnInterval: 1})
    shroom.spawnTimer = 0.1
    const depletedHandler = vi.fn()
    shroom.on('depleted', depletedHandler)

    shroom.update(0.2)

    expect(shroom.stock).toBe(0)
    expect(shroom.depleted).toBe(true)
    expect(depletedHandler).toHaveBeenCalled()
})


test('stops spawning when depleted', () => {
    const shroom = new Shroom({stock: 0, spawnInterval: 1})
    shroom.spawnTimer = 0
    const handler = vi.fn()
    shroom.on('spawn_spore', handler)

    shroom.update(2)

    expect(handler).not.toHaveBeenCalled()
})


test('spawns multiple spores over time', () => {
    const shroom = new Shroom({sporeType: 'naive', stock: 2, spawnInterval: 1})
    shroom.spawnTimer = 1
    const handler = vi.fn()
    shroom.on('spawn_spore', handler)

    shroom.update(1.1)
    expect(handler).toHaveBeenCalledTimes(1)
    expect(shroom.stock).toBe(1)

    shroom.update(1)
    expect(handler).toHaveBeenCalledTimes(2)
    expect(shroom.stock).toBe(0)
    expect(shroom.depleted).toBe(true)
})
