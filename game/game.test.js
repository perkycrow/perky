import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import Game from './game.js'
import Application from '../application/application.js'
import GameLoop from './game_loop.js'
import ActionController from '../core/action_controller.js'
import RenderSystem from '../render/render_system.js'
import Stage from './stage.js'
import World from './world.js'



describe('Game', () => {
    let game
    let mockRequestAnimationFrame
    let mockPerformanceNow

    beforeEach(() => {
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


    test('automatically creates RenderSystem', () => {
        expect(game.renderSystem).toBeInstanceOf(RenderSystem)
    })


    test('RenderSystem is bound to game instance', () => {
        expect(game.renderSystem).toBeDefined()
        expect(game.renderSystem.host).toBe(game)
    })


    test('passes renderSystem options through to RenderSystem', () => {
        const customGame = new Game({
            renderSystem: {
                width: 1024,
                height: 768
            }
        })

        expect(customGame.renderSystem.layerWidth).toBe(1024)
        expect(customGame.renderSystem.layerHeight).toBe(768)
    })


    test('delegates createLayer method to host', () => {
        const container = document.createElement('div')
        game.mount(container)

        const layer = game.createLayer('test', 'canvas')

        expect(layer).toBeDefined()
        expect(game.renderSystem.getLayer('test')).toBe(layer)
    })


    test('delegates getLayer method to host', () => {
        const container = document.createElement('div')
        game.mount(container)

        const layer = game.getLayer('game')

        expect(layer).toBeDefined()
        expect(layer.$id).toBe('game')
    })


    test('setStage creates stage as child', () => {
        class TestStage extends Stage {
            static World = World
        }

        game.setStage(TestStage)

        expect(game.stage).toBeInstanceOf(TestStage)
    })


    test('setStage delegates world from stage', () => {
        class TestStage extends Stage {
            static World = World
        }

        game.setStage(TestStage)

        expect(game.world).toBeInstanceOf(World)
        expect(game.world).toBe(game.stage.world)
    })


    test('setStage passes game to stage', () => {
        class TestStage extends Stage {
            static World = World
        }

        game.setStage(TestStage)

        expect(game.stage.game).toBe(game)
    })


    test('setStage passes options to stage', () => {
        class TestStage extends Stage {
            static World = World
        }

        game.setStage(TestStage, {foo: 'bar'})

        expect(game.stage.options.foo).toBe('bar')
    })


    test('setStage disposes previous stage', () => {
        class StageA extends Stage {
            static World = World
        }
        class StageB extends Stage {
            static World = World
        }

        game.setStage(StageA)
        const stageA = game.stage
        const worldA = game.world

        game.setStage(StageB)

        expect(stageA.disposed).toBe(true)
        expect(worldA.disposed).toBe(true)
        expect(game.stage).toBeInstanceOf(StageB)
    })


    test('setStage clears world when switching', () => {
        class StageWithWorld extends Stage {
            static World = World
        }
        class StageWithoutWorld extends Stage {}

        game.setStage(StageWithWorld)
        expect(game.world).toBeInstanceOf(World)

        game.setStage(StageWithoutWorld)
        expect(game.world).toBeNull()
    })


    test('stage update is called on game loop update', () => {
        class TestStage extends Stage {
            update = vi.fn()
        }

        game.setStage(TestStage)

        game.gameLoop.emit('update', 0.016)

        expect(game.stage.update).toHaveBeenCalledWith(0.016)
    })


    test('stage render is called on game loop render', () => {
        class TestStage extends Stage {
            render = vi.fn()
        }

        game.setStage(TestStage)

        game.gameLoop.emit('render')

        expect(game.stage.render).toHaveBeenCalled()
    })


    test('no error when no stage is set during update', () => {
        expect(() => {
            game.gameLoop.emit('update', 0.016)
        }).not.toThrow()
    })


    test('no error when no stage is set during render', () => {
        expect(() => {
            game.gameLoop.emit('render')
        }).not.toThrow()
    })


    test('setStage registers stage controller', () => {
        class FooController extends ActionController {}
        class TestStage extends Stage {
            static ActionController = FooController
        }

        game.setStage(TestStage)

        expect(game.getController('foo')).toBeDefined()
    })


    test('setStage activates stage controller', () => {
        class FooController extends ActionController {}
        class TestStage extends Stage {
            static ActionController = FooController
        }

        game.setStage(TestStage)

        const active = game.getActiveControllers()
        expect(active).toContain('foo')
    })


    test('setStage unregisters previous stage controller', () => {
        class FooController extends ActionController {}
        class BarController extends ActionController {}
        class StageA extends Stage {
            static ActionController = FooController
        }
        class StageB extends Stage {
            static ActionController = BarController
        }

        game.setStage(StageA)
        expect(game.getController('foo')).toBeDefined()

        game.setStage(StageB)
        expect(game.getController('foo')).toBeNull()
        expect(game.getController('bar')).toBeDefined()
    })


    test('setStage works without stage controller', () => {
        class TestStage extends Stage {}

        game.setStage(TestStage)

        expect(game.stage).toBeInstanceOf(TestStage)
    })


    test('registerStage registers a stage class by name', () => {
        class TestStage extends Stage {}

        game.registerStage('test', TestStage)

        expect(game.getStageClass('test')).toBe(TestStage)
    })


    test('registerStage deduces name from class name', () => {
        class PreviewStage extends Stage {}

        game.registerStage(PreviewStage)

        expect(game.getStageClass('preview')).toBe(PreviewStage)
    })


    test('registerStage deduces name from static $name', () => {
        class TestStage extends Stage {
            static $name = 'custom'
        }

        game.registerStage(TestStage)

        expect(game.getStageClass('custom')).toBe(TestStage)
    })


    test('registerStage returns the resolved name', () => {
        class GameplayStage extends Stage {}

        const name = game.registerStage(GameplayStage)

        expect(name).toBe('gameplay')
    })


    test('stages getter returns array of registered stage names', () => {
        class StageA extends Stage {}
        class StageB extends Stage {}

        game.registerStage('a', StageA)
        game.registerStage('b', StageB)

        expect(game.stages).toContain('a')
        expect(game.stages).toContain('b')
    })


    test('getStageClass returns null for unregistered stage', () => {
        expect(game.getStageClass('nonexistent')).toBeNull()
    })


    test('setStage accepts stage name string', () => {
        class TestStage extends Stage {}

        game.registerStage('test', TestStage)
        game.setStage('test')

        expect(game.stage).toBeInstanceOf(TestStage)
    })


    test('setStage throws for unregistered stage name', () => {
        expect(() => game.setStage('nonexistent')).toThrow("Stage 'nonexistent' not registered")
    })


    test('setStage passes options when using stage name', () => {
        class TestStage extends Stage {}

        game.registerStage('test', TestStage)
        game.setStage('test', {foo: 'bar'})

        expect(game.stage.options.foo).toBe('bar')
    })


    test('currentStageName returns the current stage name', () => {
        class TestStage extends Stage {}

        game.registerStage('test', TestStage)
        game.setStage('test')

        expect(game.currentStageName).toBe('test')
    })


    test('currentStageName updates when switching stages', () => {
        class StageA extends Stage {}
        class StageB extends Stage {}

        game.registerStage('a', StageA)
        game.registerStage('b', StageB)

        game.setStage('a')
        expect(game.currentStageName).toBe('a')

        game.setStage('b')
        expect(game.currentStageName).toBe('b')
    })


    test('currentStageName is set when using class directly', () => {
        class GameplayStage extends Stage {}

        game.setStage(GameplayStage)

        expect(game.currentStageName).toBe('gameplay')
    })


    test('static stages object registers stages automatically', () => {
        class StageA extends Stage {}
        class StageB extends Stage {}

        class GameWithStages extends Game {
            static stages = {
                alpha: StageA,
                beta: StageB
            }
        }

        const gameWithStages = new GameWithStages()

        expect(gameWithStages.getStageClass('alpha')).toBe(StageA)
        expect(gameWithStages.getStageClass('beta')).toBe(StageB)
    })


    test('static stages array registers stages with deduced names', () => {
        class PreviewStage extends Stage {}
        class GameplayStage extends Stage {}

        class GameWithStages extends Game {
            static stages = [PreviewStage, GameplayStage]
        }

        const gameWithStages = new GameWithStages()

        expect(gameWithStages.getStageClass('preview')).toBe(PreviewStage)
        expect(gameWithStages.getStageClass('gameplay')).toBe(GameplayStage)
    })


    test('static camera = null skips 2D camera', () => {
        class Game3D extends Game {
            static camera = null
        }

        const game3d = new Game3D()

        expect(game3d.camera).toBeNull()
        expect(game3d.renderSystem).toBeInstanceOf(RenderSystem)
    })


    test('static camera = null with static layer does not inject camera into layer', () => {
        class Game3D extends Game {
            static camera = null
            static layer = {type: 'webgl', backgroundColor: '#000'}
        }

        const game3d = new Game3D()
        const layer = game3d.getLayer('game')

        expect(game3d.camera).toBeNull()
        expect(layer).toBeDefined()
    })


    describe('stage render config', () => {

        test('applies stage camera config on setStage', () => {
            class TestStage extends Stage {
                static camera = {unitsInView: {width: 16, height: 9}}
            }

            game.setStage(TestStage)

            expect(game.camera.unitsInView).toEqual({width: 16, height: 9})
        })


        test('falls back to game camera when stage camera is null', () => {
            class TestStage extends Stage {
                static camera = null
            }

            game.setStage(TestStage)

            expect(game.camera.unitsInView).toEqual({width: 10, height: 10})
        })


        test('applies stage postPasses on setStage', () => {
            const container = document.createElement('div')
            game.mount(container)
            game.start()

            const renderer = game.getRenderer('game')
            const mockPass = {$id: 'mockPass'}
            const addPostPassSpy = vi.spyOn(renderer, 'addPostPass').mockReturnValue(mockPass)

            class MockPass {}
            class TestStage extends Stage {
                static postPasses = [MockPass]
            }

            game.setStage(TestStage)

            expect(addPostPassSpy).toHaveBeenCalledWith(MockPass)
        })


        test('clears stage postPasses on stage change', () => {
            const container = document.createElement('div')
            game.mount(container)
            game.start()

            const renderer = game.getRenderer('game')
            const mockPassA = {$id: 'mockPassA'}
            const mockPassB = {$id: 'mockPassB'}
            let callCount = 0
            vi.spyOn(renderer, 'addPostPass').mockImplementation(() => {
                callCount++
                return callCount === 1 ? mockPassA : mockPassB
            })
            const removePostPassSpy = vi.spyOn(renderer, 'removePostPass')

            class MockPassA {}
            class MockPassB {}
            class StageA extends Stage {
                static postPasses = [MockPassA]
            }
            class StageB extends Stage {
                static postPasses = [MockPassB]
            }

            game.setStage(StageA)
            game.setStage(StageB)

            expect(removePostPassSpy).toHaveBeenCalledWith(mockPassA)
        })


        test('camera config is applied before stage onStart', () => {
            let cameraConfigInOnStart = null

            class TestStage extends Stage {
                static camera = {unitsInView: {width: 20, height: 15}}

                onStart () {
                    cameraConfigInOnStart = this.game.camera.unitsInView
                }
            }

            game.start()
            game.setStage(TestStage)

            expect(cameraConfigInOnStart).toEqual({width: 20, height: 15})
        })

    })

})
