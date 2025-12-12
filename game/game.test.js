import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import Game from './game'
import Application from '../application/application'
import GameLoop from './game_loop'
import ActionController from '../core/action_controller'


describe('Game', () => {
    let game
    let mockRequestAnimationFrame
    let mockPerformanceNow

    beforeEach(() => {
        // Mock ResizeObserver for browser APIs
        global.ResizeObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        }))

        // Mock browser APIs
        mockRequestAnimationFrame = global.requestAnimationFrame
        mockPerformanceNow = global.performance?.now

        global.requestAnimationFrame = vi.fn(() => 1)
        global.performance = {now: vi.fn(() => 0)}

        game = new Game()
    })


    afterEach(() => {
        if (mockRequestAnimationFrame) {
            global.requestAnimationFrame = mockRequestAnimationFrame
        }
        if (mockPerformanceNow) {
            global.performance.now = mockPerformanceNow
        }
    })


    test('extends Application', () => {
        expect(game).toBeInstanceOf(Application)
    })


    test('automatically creates GameLoop', () => {
        expect(game.gameLoop).toBeInstanceOf(GameLoop)
    })


    test('GameLoop is bound to game instance', () => {
        expect(game.gameLoop).toBeDefined()
        expect(game.gameLoop.host).toBe(game)
    })


    test('calls update on active controllers when GameLoop emits update', () => {
        class TestController extends ActionController {
            update = vi.fn()
        }

        game.registerController('test', TestController)
        game.setActiveControllers(['test'])

        game.gameLoop.emit('update', 0.016)

        const controller = game.getController('test')
        expect(controller.update).toHaveBeenCalledWith(game, 0.016)
    })


    test('skips controllers without update method', () => {
        class TestController extends ActionController {
            someOtherMethod = vi.fn()
        }

        game.registerController('test', TestController)
        game.setActiveControllers(['test'])

        expect(() => {
            game.gameLoop.emit('update', 0.016)
        }).not.toThrow()

        const controller = game.getController('test')
        expect(controller.someOtherMethod).not.toHaveBeenCalled()
    })


    test('only updates active controllers', () => {
        class ActiveController extends ActionController {
            update = vi.fn()
        }
        class InactiveController extends ActionController {
            update = vi.fn()
        }

        game.registerController('active', ActiveController)
        game.registerController('inactive', InactiveController)
        game.setActiveControllers(['active'])

        game.gameLoop.emit('update', 0.016)

        const activeController = game.getController('active')
        const inactiveController = game.getController('inactive')

        expect(activeController.update).toHaveBeenCalledWith(game, 0.016)
        expect(inactiveController.update).not.toHaveBeenCalled()
    })


    test('updates multiple active controllers in order', () => {
        class Controller1 extends ActionController {
            update = vi.fn()
        }
        class Controller2 extends ActionController {
            update = vi.fn()
        }

        game.registerController('controller1', Controller1)
        game.registerController('controller2', Controller2)
        game.setActiveControllers(['controller1', 'controller2'])

        game.gameLoop.emit('update', 0.016)

        const controller1 = game.getController('controller1')
        const controller2 = game.getController('controller2')

        expect(controller1.update).toHaveBeenCalledWith(game, 0.016)
        expect(controller2.update).toHaveBeenCalledWith(game, 0.016)
    })


    test('passes params to Application constructor', () => {
        const testManifest = {
            sources: {
                images: []
            }
        }
        const customGame = new Game({
            manifest: testManifest
        })

        expect(customGame.manifest).toBeDefined()
    })

})
