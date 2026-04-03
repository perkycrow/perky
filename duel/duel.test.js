import {test, expect} from 'vitest'
import Duel from './duel.js'
import Game from '../game/game.js'
import ArenaStage from './stages/arena_stage.js'


test('extends Game', () => {
    expect(Duel.prototype).toBeInstanceOf(Game)
})


test('$name', () => {
    expect(Duel.$name).toBe('duel')
})


test('has manifest', () => {
    expect(Duel.manifest).toBeDefined()
})


test('camera configuration', () => {
    expect(Duel.camera.unitsInView.width).toBe(16)
    expect(Duel.camera.unitsInView.height).toBe(9)
})


test('layers configuration', () => {
    expect(Duel.layers).toHaveLength(1)
    expect(Duel.layers[0].name).toBe('game')
    expect(Duel.layers[0].type).toBe('webgl')
})


test('stages configuration', () => {
    expect(Duel.stages.arena).toBe(ArenaStage)
})
