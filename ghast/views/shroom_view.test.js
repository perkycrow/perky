import {test, expect} from 'vitest'
import ShroomView from './shroom_view.js'


test('is a class', () => {
    expect(typeof ShroomView).toBe('function')
})


test('sync does nothing when root is null', () => {
    const entity = {x: 0, y: 0, depleted: false}
    const view = Object.create(ShroomView.prototype)
    view.entity = entity
    view.root = null

    expect(() => view.sync()).not.toThrow()
})


test('sync updates root position from entity', () => {
    const entity = {x: 5, y: 10, depleted: false}
    const root = {x: 0, y: 0, opacity: 1, setDepth: () => {}}
    const view = Object.create(ShroomView.prototype)
    view.entity = entity
    view.root = root

    view.sync()

    expect(root.x).toBe(5)
    expect(root.y).toBe(10)
})


test('sync sets depth based on y position', () => {
    const entity = {x: 0, y: 7, depleted: false}
    let depthValue = null
    const root = {x: 0,
        y: 0,
        opacity: 1,
        setDepth: (v) => {
            depthValue = v
        }}
    const view = Object.create(ShroomView.prototype)
    view.entity = entity
    view.root = root

    view.sync()

    expect(depthValue).toBe(-7)
})


test('sync sets full opacity when not depleted', () => {
    const entity = {x: 0, y: 0, depleted: false}
    const root = {x: 0, y: 0, opacity: 0, setDepth: () => {}}
    const view = Object.create(ShroomView.prototype)
    view.entity = entity
    view.root = root

    view.sync()

    expect(root.opacity).toBe(1)
})


test('sync sets reduced opacity when depleted', () => {
    const entity = {x: 0, y: 0, depleted: true}
    const root = {x: 0, y: 0, opacity: 1, setDepth: () => {}}
    const view = Object.create(ShroomView.prototype)
    view.entity = entity
    view.root = root

    view.sync()

    expect(root.opacity).toBe(0.3)
})
