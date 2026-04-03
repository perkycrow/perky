import {test, expect} from 'vitest'
import ArenaStage from './arena_stage.js'
import Stage from '../../game/stage.js'
import DuelWorld from '../worlds/duel_world.js'
import DuelController from '../controllers/duel_controller.js'


test('extends Stage', () => {
    expect(ArenaStage.prototype).toBeInstanceOf(Stage)
})


test('$name', () => {
    expect(ArenaStage.$name).toBe('arena')
})


test('World', () => {
    expect(ArenaStage.World).toBe(DuelWorld)
})


test('ActionController', () => {
    expect(ArenaStage.ActionController).toBe(DuelController)
})
