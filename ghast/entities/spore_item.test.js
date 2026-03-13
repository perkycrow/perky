import {test, expect} from 'vitest'
import World from '../../game/world.js'
import SporeItem from './spore_item.js'


test('constructor defaults', () => {
    const item = new SporeItem()
    expect(item.sporeType).toBe('fear')
    expect(item.hitRadius).toBe(0.5)
    expect(item.maxSpeed).toBe(0.3)
})


test('constructor custom params', () => {
    const item = new SporeItem({sporeType: 'anger', x: 3, y: 4})
    expect(item.sporeType).toBe('anger')
    expect(item.originX).toBe(3)
    expect(item.originY).toBe(4)
})


test('sporeColor', () => {
    const item = new SporeItem({sporeType: 'anger'})
    expect(item.sporeColor).toBe('#ef5350')
})


test('drifts around origin', () => {
    const world = new World()
    world.start()
    const item = world.create(SporeItem, {x: 0, y: 0, sporeType: 'fear'})

    for (let i = 0; i < 60; i++) {
        item.update(1 / 60)
    }

    const dist = Math.sqrt(item.x * item.x + item.y * item.y)
    expect(dist).toBeLessThan(2)
})


test('move sets direction', () => {
    const item = new SporeItem()
    const direction = {x: 1, y: 0}
    item.move(direction)
    expect(item.direction).toBe(direction)
})
