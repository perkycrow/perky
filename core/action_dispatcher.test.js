import ActionDispatcher from './action_dispatcher'
import ActionController from './action_controller'
import PerkyModule from './perky_module'
import {vi} from 'vitest'


describe(ActionDispatcher, () => {

    let dispatcher

    beforeEach(() => {
        dispatcher = new ActionDispatcher()
    })


    test('constructor', () => {
        expect(dispatcher.getController('any')).toBeNull()
        expect(dispatcher.getActiveName()).toBeNull()
    })


    test('register', () => {
        const controller = new ActionController()

        dispatcher.register('main', controller)

        expect(dispatcher.getController('main')).toBe(controller)
    })


    test('register with existing name', () => {
        const controller1 = new ActionController()
        const controller2 = new ActionController()
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

        dispatcher.register('main', controller1)
        dispatcher.register('main', controller2)

        expect(consoleSpy).toHaveBeenCalled()
        expect(dispatcher.getController('main')).toBe(controller2)

        consoleSpy.mockRestore()
    })


    test('onInstall creates main controller by default', () => {
        const host = new PerkyModule()
        const newDispatcher = new ActionDispatcher()

        newDispatcher.install(host, {main: true})

        expect(newDispatcher.mainControllerName).toBe('main')
        expect(newDispatcher.getController('main')).toBeInstanceOf(ActionController)
        expect(newDispatcher.getActiveName()).toBe('main')
        expect(newDispatcher.mainController).toBeInstanceOf(ActionController)
    })


    test('onInstall creates main controller with custom name', () => {
        const host = new PerkyModule()
        const newDispatcher = new ActionDispatcher()

        newDispatcher.install(host, {main: 'base'})

        expect(newDispatcher.mainControllerName).toBe('base')
        expect(newDispatcher.getController('base')).toBeInstanceOf(ActionController)
        expect(newDispatcher.getActiveName()).toBe('base')
        expect(newDispatcher.mainController).toBeInstanceOf(ActionController)
    })


    test('onInstall skips main controller when main is false', () => {
        const host = new PerkyModule()
        const newDispatcher = new ActionDispatcher()

        newDispatcher.install(host, {main: false})

        expect(newDispatcher.mainControllerName).toBeNull()
        expect(newDispatcher.getActiveName()).toBeNull()
        expect(newDispatcher.mainController).toBeNull()
    })



    test('unregister', () => {
        const controller = new ActionController()

        dispatcher.register('main', controller)
        const result = dispatcher.unregister('main')

        expect(result).toBe(true)
        expect(dispatcher.getController('main')).toBeNull()
    })


    test('unregister non-existent controller', () => {
        const result = dispatcher.unregister('nonExistent')

        expect(result).toBe(false)
    })


    test('unregister active controller', () => {
        const controller = new ActionController()

        dispatcher.register('main', controller)
        dispatcher.setActive('main')
        dispatcher.unregister('main')

        expect(dispatcher.getActiveName()).toBeNull()
    })


    test('unregister controller in stack', () => {
        const controller = new ActionController()

        dispatcher.register('main', controller)
        dispatcher.push('main')

        expect(dispatcher.getStack()).toContain('main')

        dispatcher.unregister('main')

        expect(dispatcher.getStack()).not.toContain('main')
    })


    test('getController', () => {
        const controller = new ActionController()

        dispatcher.register('main', controller)

        expect(dispatcher.getController('main')).toBe(controller)
    })


    test('getNameFor', () => {
        const controller = new ActionController()

        dispatcher.register('main', controller)

        expect(dispatcher.getNameFor(controller)).toBe('main')
    })


    test('setActive valid controller', () => {
        const controller = new ActionController()

        dispatcher.register('main', controller)
        const result = dispatcher.setActive('main')

        expect(result).toBe(true)
        expect(dispatcher.getActiveName()).toBe('main')
    })


    test('setActive invalid controller', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

        const result = dispatcher.setActive('nonExistent')

        expect(result).toBe(false)
        expect(dispatcher.getActiveName()).toBeNull()
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
    })


    test('getActive', () => {
        const controller = new ActionController()

        dispatcher.register('main', controller)
        dispatcher.setActive('main')

        expect(dispatcher.getActive()).toBe(controller)
    })


    test('dispatch - single mode (default)', () => {
        const controller = new ActionController()
        const executeSpy = vi.spyOn(controller, 'execute').mockImplementation(() => true)

        dispatcher.register('main', controller)
        dispatcher.setActive('main')

        const result = dispatcher.dispatch('someAction', 'arg1', 'arg2')

        expect(result).toBe(true)
        expect(executeSpy).toHaveBeenCalledWith('someAction', 'arg1', 'arg2')
    })


    test('dispatch - no active controller', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

        const result = dispatcher.dispatch('someAction')

        expect(result).toBe(false)
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
    })


    test('dispatchTo', () => {
        class TestController extends PerkyModule {
            someAction = vi.fn()
        }

        const controller = new TestController()

        dispatcher.register('main', controller)

        const result = dispatcher.dispatchTo('main', 'someAction', 'arg1', 'arg2')

        expect(result).toBe(true)
        expect(controller.someAction).toHaveBeenCalledWith('arg1', 'arg2')
    })


    test('dispatchTo - non-existent method', () => {
        const controller = new PerkyModule()

        dispatcher.register('main', controller)

        const result = dispatcher.dispatchTo('main', 'nonExistentAction')

        expect(result).toBe(false)
    })


    test('dispatchTo - non-existent controller', () => {
        const result = dispatcher.dispatchTo('nonExistent', 'someAction')

        expect(result).toBe(false)
    })


    test('dispatchAction', () => {
        class TestController extends PerkyModule {
            jump = vi.fn()
        }

        const controller = new TestController()
        dispatcher.register('game', controller)
        dispatcher.setActive('game')

        const binding = {
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump',
            controllerName: 'game'
        }

        const control = {name: 'Space'}

        const result = dispatcher.dispatchAction(binding, control, 'event', 'device')

        expect(result).toBe(true)
        expect(controller.jump).toHaveBeenCalledWith('event', 'device')
    })


    test('dispatchAction - inactive controller returns false', () => {
        class TestController extends PerkyModule {
            jump = vi.fn()
        }

        const gameController = new TestController()
        const otherController = new ActionController()
        dispatcher.register('game', gameController)
        dispatcher.register('other', otherController)
        dispatcher.setActive('other')

        const binding = {
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump',
            controllerName: 'game'
        }

        const control = {name: 'Space'}

        const result = dispatcher.dispatchAction(binding, control, 'event', 'device')

        expect(result).toBe(false)
        expect(gameController.jump).not.toHaveBeenCalled()
    })


    test('dispatchAction - controller in stack works', () => {
        class TestController extends PerkyModule {
            jump = vi.fn()
        }

        const gameController = new TestController()
        const pauseController = new ActionController()
        dispatcher.register('game', gameController)
        dispatcher.register('pause', pauseController)
        dispatcher.push('game')
        dispatcher.push('pause')

        const binding = {
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump',
            controllerName: 'game'
        }

        const control = {name: 'Space'}

        const result = dispatcher.dispatchAction(binding, control, 'event', 'device')

        expect(result).toBe(true)
        expect(gameController.jump).toHaveBeenCalledWith('event', 'device')
    })


    test('dispatchAction - active controller fallback', () => {
        class TestController extends PerkyModule {
            jump = vi.fn()
        }

        const controller = new TestController()
        dispatcher.register('main', controller)
        dispatcher.setActive('main')

        const binding = {
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        }

        const control = {name: 'Space'}

        const result = dispatcher.dispatchAction(binding, control, 'event', 'device')

        expect(result).toBe(true)
        expect(controller.jump).toHaveBeenCalledWith('event', 'device')
    })


    test('push - enables stack mode automatically', () => {
        const controller = new ActionController()
        dispatcher.register('main', controller)

        expect(dispatcher.isStackMode()).toBe(false)

        dispatcher.push('main')

        expect(dispatcher.isStackMode()).toBe(true)
        expect(dispatcher.getStack()).toEqual(['main'])
    })


    test('push - non-existent context', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

        const result = dispatcher.push('nonExistent')

        expect(result).toBe(false)
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
    })


    test('push - prevents duplicate context on top', () => {
        const controller = new ActionController()
        dispatcher.register('main', controller)

        dispatcher.push('main')
        expect(dispatcher.getStack()).toEqual(['main'])

        const result = dispatcher.push('main')

        expect(result).toBe(false)
        expect(dispatcher.getStack()).toEqual(['main'])
    })


    test('push - allows same context if not on top', () => {
        const controller1 = new ActionController()
        const controller2 = new ActionController()
        dispatcher.register('main', controller1)
        dispatcher.register('other', controller2)

        dispatcher.push('main')
        dispatcher.push('other')
        dispatcher.push('main')

        expect(dispatcher.getStack()).toEqual(['main', 'other', 'main'])
    })


    test('pop - returns popped context', () => {
        const controller = new ActionController()
        dispatcher.register('main', controller)

        dispatcher.push('main')
        const popped = dispatcher.pop()

        expect(popped).toBe('main')
        expect(dispatcher.getStack()).toEqual([])
    })


    test('pop - empty stack', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

        const result = dispatcher.pop()

        expect(result).toBeNull()
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
    })


    test('pop - disables stack mode when empty', () => {
        const controller = new ActionController()
        dispatcher.register('main', controller)

        dispatcher.push('main')
        expect(dispatcher.isStackMode()).toBe(true)

        dispatcher.pop()
        expect(dispatcher.isStackMode()).toBe(false)
    })


    test('getStack - returns copy', () => {
        const controller = new ActionController()
        dispatcher.register('main', controller)

        dispatcher.push('main')
        const stack = dispatcher.getStack()

        stack.push('other')

        expect(dispatcher.getStack()).toEqual(['main'])
    })


    test('getStack - returns active context in single mode', () => {
        const controller = new ActionController()
        dispatcher.register('main', controller)

        dispatcher.setActive('main')

        expect(dispatcher.isStackMode()).toBe(false)
        expect(dispatcher.getStack()).toEqual(['main'])
    })


    test('getStack - returns empty array when no active context', () => {
        expect(dispatcher.getStack()).toEqual([])
    })


    test('clearStack', () => {
        const controller1 = new ActionController()
        const controller2 = new ActionController()

        dispatcher.register('main', controller1)
        dispatcher.register('pause', controller2)

        dispatcher.push('main')
        dispatcher.push('pause')

        dispatcher.clearStack()

        expect(dispatcher.getStack()).toEqual([])
        expect(dispatcher.isStackMode()).toBe(false)
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

        const gameController = new GameController()
        const pauseController = new PauseController()

        dispatcher.register('game', gameController)
        dispatcher.register('pause', pauseController)

        dispatcher.push('game')
        dispatcher.push('pause')

        dispatcher.dispatch('move')
        expect(gameController.move).toHaveBeenCalled()

        dispatcher.dispatch('shoot')
        expect(gameController.shoot).not.toHaveBeenCalled()

        dispatcher.dispatch('resume')
        expect(pauseController.resume).toHaveBeenCalled()
    })


    test('dispatch - stack mode propagates to lower context', () => {
        class GameController extends ActionController {
            static propagable = ['move']

            move = vi.fn().mockReturnValue(true)
        }

        class PauseController extends ActionController {
            resume = vi.fn()
        }

        const gameController = new GameController()
        const pauseController = new PauseController()

        dispatcher.register('game', gameController)
        dispatcher.register('pause', pauseController)

        dispatcher.push('game')
        dispatcher.push('pause')

        dispatcher.dispatch('move')

        expect(gameController.move).toHaveBeenCalled()
    })


    test('listControllers', () => {
        const controller1 = new ActionController()
        const controller2 = new ActionController()

        dispatcher.register('main', controller1)
        dispatcher.register('pause', controller2)

        const controllers = dispatcher.listControllers()

        expect(controllers).toContain('main')
        expect(controllers).toContain('pause')
    })


    test('listAllActions', () => {
        class GameController extends ActionController {
            jump () { } // eslint-disable-line class-methods-use-this
            move () { } // eslint-disable-line class-methods-use-this
        }

        const gameController = new GameController()
        gameController.addAction('shoot', vi.fn())

        dispatcher.register('game', gameController)

        const allActions = dispatcher.listAllActions()

        expect(allActions.get('game')).toContain('jump')
        expect(allActions.get('game')).toContain('move')
        expect(allActions.get('game')).toContain('shoot')
    })

})
