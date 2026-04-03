import {test, expect} from 'vitest'
import SurvivalController from './survival_controller.js'
import GameController from '../../game/game_controller.js'


test('extends GameController', () => {
    expect(SurvivalController.prototype).toBeInstanceOf(GameController)
})


test('has WASD and arrow bindings', () => {
    const bindings = SurvivalController.bindings
    expect(bindings.moveLeft).toContain('KeyA')
    expect(bindings.moveRight).toContain('KeyD')
    expect(bindings.moveUp).toContain('KeyW')
    expect(bindings.moveDown).toContain('KeyS')
    expect(bindings.moveLeft).toContain('ArrowLeft')
    expect(bindings.moveRight).toContain('ArrowRight')
    expect(bindings.moveUp).toContain('ArrowUp')
    expect(bindings.moveDown).toContain('ArrowDown')
})
