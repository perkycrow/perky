import {test, expect} from 'vitest'
import FencerView from './fencer_view.js'
import EntityView from '../../game/entity_view.js'
import Fencer from '../entities/fencer.js'


function createMockFencer (id = 'fencer1') {
    const fencer = new Fencer()
    fencer.$id = id
    return fencer
}


function createContext () {
    return {}
}


test('extends EntityView', () => {
    expect(FencerView.prototype).toBeInstanceOf(EntityView)
})


test('creates root group', () => {
    const fencer = createMockFencer()
    const view = new FencerView(fencer, createContext())

    expect(view.root).toBeDefined()
    expect(view.root.x).toBe(fencer.x)
    expect(view.root.y).toBe(fencer.y)
})


test('creates body circle', () => {
    const fencer = createMockFencer()
    const view = new FencerView(fencer, createContext())

    expect(view.body).toBeDefined()
    expect(view.body.radius).toBe(fencer.bodyRadius)
})


test('creates sword rectangle', () => {
    const fencer = createMockFencer()
    const view = new FencerView(fencer, createContext())

    expect(view.sword).toBeDefined()
})


test('player 1 uses blue color', () => {
    const fencer = createMockFencer('fencer1')
    const view = new FencerView(fencer, createContext())

    expect(view.playerColor).toBe('#4488ff')
})


test('player 2 uses red color', () => {
    const fencer = createMockFencer('fencer2')
    const view = new FencerView(fencer, createContext())

    expect(view.playerColor).toBe('#ff4444')
})


test('sync updates sword position', () => {
    const fencer = createMockFencer()
    const view = new FencerView(fencer, createContext())

    fencer.facing = -1
    view.sync()

    expect(view.sword.x).toBe(-fencer.bodyRadius)
})


test('sync updates body color when stunned', () => {
    const fencer = createMockFencer()
    const view = new FencerView(fencer, createContext())

    fencer.stunned = true
    view.sync()

    expect(view.body.color).toBe('#666666')
})


test('sync scales body when lunging', () => {
    const fencer = createMockFencer()
    const view = new FencerView(fencer, createContext())

    fencer.lunging = true
    view.sync()

    expect(view.body.scaleX).toBe(1.15)
    expect(view.body.scaleY).toBe(0.9)
})
