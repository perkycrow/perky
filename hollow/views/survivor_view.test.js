import {test, expect} from 'vitest'
import SurvivorView from './survivor_view.js'
import EntityView from '../../game/entity_view.js'
import Survivor from '../entities/survivor.js'


test('extends EntityView', () => {
    const entity = new Survivor()
    const view = new SurvivorView(entity, {})
    expect(view).toBeInstanceOf(EntityView)
})


test('creates root group', () => {
    const entity = new Survivor()
    const view = new SurvivorView(entity, {})
    expect(view.root).toBeDefined()
})


test('creates body circle', () => {
    const entity = new Survivor()
    const view = new SurvivorView(entity, {})
    expect(view.body).toBeDefined()
    expect(view.body.radius).toBe(entity.bodyRadius)
})


test('creates direction indicator', () => {
    const entity = new Survivor()
    const view = new SurvivorView(entity, {})
    expect(view.direction).toBeDefined()
})


test('sync hides direction when not moving', () => {
    const entity = new Survivor()
    const view = new SurvivorView(entity, {})
    view.sync()
    expect(view.direction.visible).toBe(false)
})


test('sync shows direction when moving', () => {
    const entity = new Survivor()
    entity.move(1, 0)
    const view = new SurvivorView(entity, {})
    view.sync()
    expect(view.direction.visible).toBe(true)
})


test('uses colorIndex for player color', () => {
    const entity1 = new Survivor({colorIndex: 0})
    const entity2 = new Survivor({colorIndex: 1})
    const view1 = new SurvivorView(entity1, {})
    const view2 = new SurvivorView(entity2, {})
    expect(view1.body.color).not.toBe(view2.body.color)
})
