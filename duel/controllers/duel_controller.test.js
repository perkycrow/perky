import {describe, test, expect, vi} from 'vitest'
import DuelController from './duel_controller.js'
import GameController from '../../game/game_controller.js'


describe('DuelController', () => {

    test('extends GameController', () => {
        const controller = new DuelController()
        expect(controller).toBeInstanceOf(GameController)
    })


    test('has P1 bindings', () => {
        expect(DuelController.bindings.p1MoveLeft).toContain('KeyA')
        expect(DuelController.bindings.p1MoveRight).toContain('KeyD')
        expect(DuelController.bindings.p1Jump).toContain('KeyW')
        expect(DuelController.bindings.p1Lunge).toContain('Space')
        expect(DuelController.bindings.p1SwordUp).toContain('KeyE')
        expect(DuelController.bindings.p1SwordDown).toContain('KeyQ')
    })


    test('has P2 bindings', () => {
        expect(DuelController.bindings.p2MoveLeft).toContain('ArrowLeft')
        expect(DuelController.bindings.p2MoveRight).toContain('ArrowRight')
        expect(DuelController.bindings.p2Jump).toContain('ArrowUp')
        expect(DuelController.bindings.p2Lunge).toContain('Enter')
        expect(DuelController.bindings.p2SwordUp).toContain('Period')
        expect(DuelController.bindings.p2SwordDown).toContain('Comma')
    })


    test('resources include world', () => {
        expect(DuelController.resources).toContain('world')
    })


    test('p1Jump calls fencer1.jump', () => {
        const controller = new DuelController()
        controller.world = {fencer1: {jump: vi.fn()}}
        controller.p1Jump()
        expect(controller.world.fencer1.jump).toHaveBeenCalled()
    })


    test('p1Lunge calls fencer1.lunge', () => {
        const controller = new DuelController()
        controller.world = {fencer1: {lunge: vi.fn()}}
        controller.p1Lunge()
        expect(controller.world.fencer1.lunge).toHaveBeenCalled()
    })


    test('p1SwordUp calls fencer1.cycleSwordUp', () => {
        const controller = new DuelController()
        controller.world = {fencer1: {cycleSwordUp: vi.fn()}}
        controller.p1SwordUp()
        expect(controller.world.fencer1.cycleSwordUp).toHaveBeenCalled()
    })


    test('p1SwordDown calls fencer1.cycleSwordDown', () => {
        const controller = new DuelController()
        controller.world = {fencer1: {cycleSwordDown: vi.fn()}}
        controller.p1SwordDown()
        expect(controller.world.fencer1.cycleSwordDown).toHaveBeenCalled()
    })


    test('p2Jump calls fencer2.jump', () => {
        const controller = new DuelController()
        controller.world = {fencer2: {jump: vi.fn()}}
        controller.p2Jump()
        expect(controller.world.fencer2.jump).toHaveBeenCalled()
    })


    test('p2Lunge calls fencer2.lunge', () => {
        const controller = new DuelController()
        controller.world = {fencer2: {lunge: vi.fn()}}
        controller.p2Lunge()
        expect(controller.world.fencer2.lunge).toHaveBeenCalled()
    })


    test('p2SwordUp calls fencer2.cycleSwordUp', () => {
        const controller = new DuelController()
        controller.world = {fencer2: {cycleSwordUp: vi.fn()}}
        controller.p2SwordUp()
        expect(controller.world.fencer2.cycleSwordUp).toHaveBeenCalled()
    })


    test('p2SwordDown calls fencer2.cycleSwordDown', () => {
        const controller = new DuelController()
        controller.world = {fencer2: {cycleSwordDown: vi.fn()}}
        controller.p2SwordDown()
        expect(controller.world.fencer2.cycleSwordDown).toHaveBeenCalled()
    })


    test('spawnFencer1 delegates to world', () => {
        const controller = new DuelController()
        controller.world = {spawnFencer1: vi.fn(() => 'f1')}

        const result = controller.spawnFencer1({x: -3})

        expect(controller.world.spawnFencer1).toHaveBeenCalledWith({x: -3})
        expect(result).toBe('f1')
    })


    test('spawnFencer2 delegates to world', () => {
        const controller = new DuelController()
        controller.world = {spawnFencer2: vi.fn(() => 'f2')}

        const result = controller.spawnFencer2({x: 3})

        expect(controller.world.spawnFencer2).toHaveBeenCalledWith({x: 3})
        expect(result).toBe('f2')
    })

})
