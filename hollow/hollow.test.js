import {test, expect} from 'vitest'
import Hollow from './hollow.js'
import Game from '../game/game.js'


test('extends Game', () => {
    expect(Hollow.prototype).toBeInstanceOf(Game)
})


test('has name hollow', () => {
    expect(Hollow.$name).toBe('hollow')
})


test('has survival stage registered', () => {
    expect(Hollow.stages.survival).toBeDefined()
})


test('has square camera', () => {
    expect(Hollow.camera.unitsInView.width).toBe(16)
    expect(Hollow.camera.unitsInView.height).toBe(16)
})


test('has webgl game layer', () => {
    expect(Hollow.layers[0].type).toBe('webgl')
    expect(Hollow.layers[0].name).toBe('game')
})
