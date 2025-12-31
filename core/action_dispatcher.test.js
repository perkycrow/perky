import ActionDispatcher from './action_dispatcher'
import ActionController from './action_controller'
import PerkyModule from './perky_module'
import {describe, test, expect, beforeEach, vi} from 'vitest'


describe(ActionDispatcher, () => {

    let dispatcher

    beforeEach(() => {
        dispatcher = new ActionDispatcher()
    })


    test('constructor', () => {
        expect(dispatcher.getController('any')).toBeNull()
        expect(dispatcher.getActive()).toEqual([])
    })


    test('register', () => {
        const controller = dispatcher.register('main', ActionController)

        expect(dispatcher.getController('main')).toBe(controller)
    })


    test('register with existing name', () => {
        dispatcher.register('main', ActionController)
        const controller2 = dispatcher.register('main', ActionController)
        expect(dispatcher.getController('main')).toBe(controller2)
    })


    test('onInstall creates main controller by default', () => {
        const host = new PerkyModule()
        const newDispatcher = new ActionDispatcher()

        newDispatcher.install(host, {main: true})

        expect(newDispatcher.mainControllerName).toBe('main')
        expect(newDispatcher.getController('main')).toBeInstanceOf(ActionController)
        expect(newDispatcher.getActive()).toEqual(['main'])
        expect(newDispatcher.mainController).toBeInstanceOf(ActionController)
    })


    test('onInstall creates main controller with custom name', () => {
        const host = new PerkyModule()
        const newDispatcher = new ActionDispatcher()

        newDispatcher.install(host, {main: 'base'})

        expect(newDispatcher.mainControllerName).toBe('base')
        expect(newDispatcher.getController('base')).toBeInstanceOf(ActionController)
        expect(newDispatcher.getActive()).toEqual(['base'])
        expect(newDispatcher.mainController).toBeInstanceOf(ActionController)
    })


    test('onInstall skips main controller when main is false', () => {
        const host = new PerkyModule()
        const newDispatcher = new ActionDispatcher()

        newDispatcher.install(host, {main: false})

        expect(newDispatcher.mainControllerName).toBeNull()
        expect(newDispatcher.getActive()).toEqual([])
        expect(newDispatcher.mainController).toBeNull()
    })


    test('unregister', () => {
        dispatcher.register('main', ActionController)
        const result = dispatcher.unregister('main')

        expect(result).toBe(true)
        expect(dispatcher.getController('main')).toBeNull()
    })


    test('unregister non-existent controller', () => {
        const result = dispatcher.unregister('nonExistent')

        expect(result).toBe(false)
    })


    test('unregister active controller', () => {
        dispatcher.register('main', ActionController)
        dispatcher.setActive('main')
        dispatcher.unregister('main')

        expect(dispatcher.getActive()).toEqual([])
    })


    test('unregister controller in stack', () => {
        dispatcher.register('main', ActionController)
        dispatcher.pushActive('main')

        expect(dispatcher.getActive()).toContain('main')

        dispatcher.unregister('main')

        expect(dispatcher.getActive()).not.toContain('main')
    })


    test('getController', () => {
        const controller = dispatcher.register('main', ActionController)

        expect(dispatcher.getController('main')).toBe(controller)
    })


    test('setActive valid controller', () => {
        dispatcher.register('main', ActionController)
        const result = dispatcher.setActive('main')

        expect(result).toBe(true)
        expect(dispatcher.getActive()).toEqual(['main'])
    })


    test('setActive invalid controller', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

        const result = dispatcher.setActive('nonExistent')

        expect(result).toBe(false)
        expect(dispatcher.getActive()).toEqual([])
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
    })


    test('setActive with array', () => {
        dispatcher.register('main', ActionController)
        dispatcher.register('pause', ActionController)

        const result = dispatcher.setActive(['main', 'pause'])

        expect(result).toBe(true)
        expect(dispatcher.getActive()).toEqual(['main', 'pause'])
    })


    test('getActive returns array', () => {
        dispatcher.register('main', ActionController)
        dispatcher.setActive('main')

        const active = dispatcher.getActive()
        expect(active).toEqual(['main'])
        expect(Array.isArray(active)).toBe(true)
    })


    test('dispatch - single mode (default)', () => {
        class TestController extends ActionController {
            someAction = vi.fn()
        }
        const controller = dispatcher.register('main', TestController)
        dispatcher.setActive('main')

        dispatcher.execute('someAction', 'arg1', 'arg2')

        expect(controller.someAction).toHaveBeenCalledWith('arg1', 'arg2')
    })


    test('dispatch - no active controller', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

        dispatcher.execute('someAction')

        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
    })


    test('executeTo', () => {
        class TestController extends PerkyModule {
            someAction = vi.fn()
        }
        const controller = dispatcher.register('main', TestController)
        dispatcher.setActive('main')

        dispatcher.executeTo('main', 'someAction', 'arg1', 'arg2')

        expect(controller.someAction).toHaveBeenCalledWith('arg1', 'arg2')
    })


    test('dispatchAction', () => {
        class TestController extends PerkyModule {
            jump = vi.fn()
        }
        const controller = dispatcher.register('game', TestController)
        dispatcher.setActive('game')

        const binding = {
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump',
            controllerName: 'game'
        }

        dispatcher.dispatchAction(binding, 'event', 'device')

        expect(controller.jump).toHaveBeenCalledWith('event', 'device')
    })


    test('dispatchAction - inactive controller does not call action', () => {
        class TestController extends PerkyModule {
            jump = vi.fn()
        }

        const gameController = dispatcher.register('game', TestController)
        dispatcher.register('other', ActionController)
        dispatcher.register('game', TestController)
        dispatcher.register('other', ActionController)
        dispatcher.setActive('other')

        const binding = {
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump',
            controllerName: 'game'
        }

        dispatcher.dispatchAction(binding, 'event', 'device')

        expect(gameController.jump).not.toHaveBeenCalled()
    })


    test('dispatchAction - controller in stack works', () => {
        class TestController extends PerkyModule {
            jump = vi.fn()
        }

        const gameController = dispatcher.register('game', TestController)
        dispatcher.register('pause', ActionController)
        dispatcher.pushActive('game')
        dispatcher.pushActive('pause')

        const binding = {
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump',
            controllerName: 'game'
        }

        dispatcher.dispatchAction(binding, 'event', 'device')

        expect(gameController.jump).toHaveBeenCalledWith('event', 'device')
    })


    test('dispatchAction - active controller fallback', () => {
        class TestController extends ActionController {
            jump = vi.fn()
        }

        const controller = dispatcher.register('main', TestController)
        dispatcher.setActive('main')

        const binding = {
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        }

        dispatcher.dispatchAction(binding, 'event', 'device')

        expect(controller.jump).toHaveBeenCalledWith('event', 'device')
    })


    test('pushActive', () => {
        dispatcher.register('main', ActionController)

        dispatcher.pushActive('main')

        expect(dispatcher.getActive()).toEqual(['main'])
    })


    test('pushActive - non-existent controller', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

        const result = dispatcher.pushActive('nonExistent')

        expect(result).toBe(false)
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
    })


    test('pushActive - prevents duplicate controller', () => {
        dispatcher.register('main', ActionController)

        dispatcher.pushActive('main')
        expect(dispatcher.getActive()).toEqual(['main'])

        const result = dispatcher.pushActive('main')

        expect(result).toBe(false)
        expect(dispatcher.getActive()).toEqual(['main'])
    })


    test('pushActive - prevents duplicate even if not on top', () => {
        dispatcher.register('main', ActionController)
        dispatcher.register('other', ActionController)

        dispatcher.pushActive('main')
        dispatcher.pushActive('other')
        const result = dispatcher.pushActive('main')

        expect(result).toBe(false)
        expect(dispatcher.getActive()).toEqual(['main', 'other'])
    })


    test('popActive - returns popped controller', () => {
        dispatcher.register('main', ActionController)

        dispatcher.pushActive('main')
        const popped = dispatcher.popActive()

        expect(popped).toBe('main')
        expect(dispatcher.getActive()).toEqual([])
    })


    test('popActive - empty stack', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

        const result = dispatcher.popActive()

        expect(result).toBeNull()
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
    })


    test('getActive - returns copy', () => {
        dispatcher.register('main', ActionController)

        dispatcher.pushActive('main')
        const stack = dispatcher.getActive()

        stack.push('other')

        expect(dispatcher.getActive()).toEqual(['main'])
    })


    test('getActive - returns empty array when no active controllers', () => {
        expect(dispatcher.getActive()).toEqual([])
    })


    test('clearActive', () => {
        dispatcher.register('main', ActionController)
        dispatcher.register('pause', ActionController)

        dispatcher.pushActive('main')
        dispatcher.pushActive('pause')

        dispatcher.clearActive()

        expect(dispatcher.getActive()).toEqual([])
    })


    test('dispatch - stack mode with propagation', () => {
        class GameController extends ActionController {
            static propagable = ['move']

            move = vi.fn()
            shoot = vi.fn()
        }

        class PauseController extends ActionController {
            resume = vi.fn()
        }

        const gameController = dispatcher.register('game', GameController)
        const pauseController = dispatcher.register('pause', PauseController)

        dispatcher.pushActive('game')
        dispatcher.pushActive('pause')

        dispatcher.execute('move')
        expect(gameController.move).toHaveBeenCalled()

        dispatcher.execute('shoot')
        expect(gameController.shoot).toHaveBeenCalled()

        dispatcher.execute('resume')
        expect(pauseController.resume).toHaveBeenCalled()
    })


    test('dispatch - stack mode propagates to lower controller', () => {
        class GameController extends ActionController {
            static propagable = ['move']

            move = vi.fn()
        }

        class PauseController extends ActionController {
            resume = vi.fn()
        }

        const gameController = dispatcher.register('game', GameController)
        dispatcher.register('pause', PauseController)

        dispatcher.pushActive('game')
        dispatcher.pushActive('pause')

        dispatcher.execute('move')

        expect(gameController.move).toHaveBeenCalled()
    })


    test('listControllers', () => {
        dispatcher.register('main', ActionController)
        dispatcher.register('pause', ActionController)

        const controllers = dispatcher.listControllers()

        expect(controllers).toContain('main')
        expect(controllers).toContain('pause')
    })


    test('listAllActions', () => {
        class GameController extends ActionController {
            jump () { }
            move () { }
        }

        const gameController = dispatcher.register('game', GameController)
        gameController.addAction('shoot', vi.fn())

        const allActions = dispatcher.listAllActions()

        expect(allActions.get('game')).toContain('jump')
        expect(allActions.get('game')).toContain('move')
        expect(allActions.get('game')).toContain('shoot')
    })


})
