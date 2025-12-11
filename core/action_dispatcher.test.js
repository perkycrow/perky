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
        expect(dispatcher.getActiveNames()).toEqual([])
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
        expect(newDispatcher.getActiveNames()).toEqual(['main'])
        expect(newDispatcher.mainController).toBeInstanceOf(ActionController)
    })


    test('onInstall creates main controller with custom name', () => {
        const host = new PerkyModule()
        const newDispatcher = new ActionDispatcher()

        newDispatcher.install(host, {main: 'base'})

        expect(newDispatcher.mainControllerName).toBe('base')
        expect(newDispatcher.getController('base')).toBeInstanceOf(ActionController)
        expect(newDispatcher.getActiveNames()).toEqual(['base'])
        expect(newDispatcher.mainController).toBeInstanceOf(ActionController)
    })


    test('onInstall skips main controller when main is false', () => {
        const host = new PerkyModule()
        const newDispatcher = new ActionDispatcher()

        newDispatcher.install(host, {main: false})

        expect(newDispatcher.mainControllerName).toBeNull()
        expect(newDispatcher.getActiveNames()).toEqual([])
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

        expect(dispatcher.getActiveNames()).toEqual([])
    })


    test('unregister controller in stack', () => {
        const controller = new ActionController()

        dispatcher.register('main', controller)
        dispatcher.pushActive('main')

        expect(dispatcher.getActive()).toContain('main')

        dispatcher.unregister('main')

        expect(dispatcher.getActive()).not.toContain('main')
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
        expect(dispatcher.getActiveNames()).toEqual(['main'])
    })


    test('setActive invalid controller', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

        const result = dispatcher.setActive('nonExistent')

        expect(result).toBe(false)
        expect(dispatcher.getActiveNames()).toEqual([])
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
    })


    test('setActive with array', () => {
        const controller1 = new ActionController()
        const controller2 = new ActionController()

        dispatcher.register('main', controller1)
        dispatcher.register('pause', controller2)

        const result = dispatcher.setActive(['main', 'pause'])

        expect(result).toBe(true)
        expect(dispatcher.getActive()).toEqual(['main', 'pause'])
    })


    test('getActive returns array', () => {
        const controller = new ActionController()

        dispatcher.register('main', controller)
        dispatcher.setActive('main')

        const active = dispatcher.getActive()
        expect(active).toEqual(['main'])
        expect(Array.isArray(active)).toBe(true)
    })


    test('dispatch - single mode (default)', () => {
        class TestController extends ActionController {
            someAction = vi.fn()
        }
        const controller = new TestController()

        dispatcher.register('main', controller)
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

        const controller = new TestController()

        dispatcher.register('main', controller)
        dispatcher.setActive('main')

        dispatcher.executeTo('main', 'someAction', 'arg1', 'arg2')

        expect(controller.someAction).toHaveBeenCalledWith('arg1', 'arg2')
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

        dispatcher.dispatchAction(binding, 'event', 'device')

        expect(controller.jump).toHaveBeenCalledWith('event', 'device')
    })


    test('dispatchAction - inactive controller does not call action', () => {
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

        dispatcher.dispatchAction(binding, 'event', 'device')

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

        const controller = new TestController()
        dispatcher.register('main', controller)
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
        const controller = new ActionController()
        dispatcher.register('main', controller)

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


    test('pushActive - prevents duplicate controller on top', () => {
        const controller = new ActionController()
        dispatcher.register('main', controller)

        dispatcher.pushActive('main')
        expect(dispatcher.getActive()).toEqual(['main'])

        const result = dispatcher.pushActive('main')

        expect(result).toBe(false)
        expect(dispatcher.getActive()).toEqual(['main'])
    })


    test('pushActive - allows same controller if not on top', () => {
        const controller1 = new ActionController()
        const controller2 = new ActionController()
        dispatcher.register('main', controller1)
        dispatcher.register('other', controller2)

        dispatcher.pushActive('main')
        dispatcher.pushActive('other')
        dispatcher.pushActive('main')

        expect(dispatcher.getActive()).toEqual(['main', 'other', 'main'])
    })


    test('popActive - returns popped controller', () => {
        const controller = new ActionController()
        dispatcher.register('main', controller)

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
        const controller = new ActionController()
        dispatcher.register('main', controller)

        dispatcher.pushActive('main')
        const stack = dispatcher.getActive()

        stack.push('other')

        expect(dispatcher.getActive()).toEqual(['main'])
    })


    test('getActive - returns empty array when no active controllers', () => {
        expect(dispatcher.getActive()).toEqual([])
    })


    test('clearActive', () => {
        const controller1 = new ActionController()
        const controller2 = new ActionController()

        dispatcher.register('main', controller1)
        dispatcher.register('pause', controller2)

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

        const gameController = new GameController()
        const pauseController = new PauseController()

        dispatcher.register('game', gameController)
        dispatcher.register('pause', pauseController)

        dispatcher.pushActive('game')
        dispatcher.pushActive('pause')

        dispatcher.execute('move')
        expect(gameController.move).toHaveBeenCalled()

        dispatcher.execute('shoot')
        expect(gameController.shoot).not.toHaveBeenCalled()

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

        const gameController = new GameController()
        const pauseController = new PauseController()

        dispatcher.register('game', gameController)
        dispatcher.register('pause', pauseController)

        dispatcher.pushActive('game')
        dispatcher.pushActive('pause')

        dispatcher.execute('move')

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


    test('setContext updates main controller context with string key', () => {
        const host = new PerkyModule()
        const newDispatcher = new ActionDispatcher()
        newDispatcher.install(host, {main: true})

        const result = newDispatcher.setContext('playerName', 'Alice')

        expect(newDispatcher.mainController.context.playerName).toBe('Alice')
        expect(result).toBe(newDispatcher.mainController.context)
    })


    test('setContext updates main controller context with object', () => {
        const host = new PerkyModule()
        const newDispatcher = new ActionDispatcher()
        newDispatcher.install(host, {main: true})

        const result = newDispatcher.setContext({
            playerName: 'Bob',
            score: 100
        })

        expect(newDispatcher.mainController.context.playerName).toBe('Bob')
        expect(newDispatcher.mainController.context.score).toBe(100)
        expect(result).toBe(newDispatcher.mainController.context)
    })


    test('setContext returns undefined when no main controller', () => {
        const host = new PerkyModule()
        const newDispatcher = new ActionDispatcher()
        newDispatcher.install(host, {main: false})

        const result = newDispatcher.setContext('key', 'value')

        expect(result).toBeUndefined()
    })


    test('clearContext clears specific key from main controller', () => {
        const host = new PerkyModule()
        const newDispatcher = new ActionDispatcher()
        newDispatcher.install(host, {main: true})

        newDispatcher.mainController.context.key1 = 'value1'
        newDispatcher.mainController.context.key2 = 'value2'

        const result = newDispatcher.clearContext('key1')

        expect(newDispatcher.mainController.context.key1).toBeUndefined()
        expect(newDispatcher.mainController.context.key2).toBe('value2')
        expect(result).toBe(newDispatcher.mainController.context)
    })


    test('clearContext clears all keys from main controller', () => {
        const host = new PerkyModule()
        const newDispatcher = new ActionDispatcher()
        newDispatcher.install(host, {main: true})

        newDispatcher.mainController.context.key1 = 'value1'
        newDispatcher.mainController.context.key2 = 'value2'

        const result = newDispatcher.clearContext()

        expect(Object.keys(newDispatcher.mainController.context).length).toBe(0)
        expect(result).toBe(newDispatcher.mainController.context)
    })


    test('clearContext returns undefined when no main controller', () => {
        const host = new PerkyModule()
        const newDispatcher = new ActionDispatcher()
        newDispatcher.install(host, {main: false})

        const result = newDispatcher.clearContext()

        expect(result).toBeUndefined()
    })


    test('setContextFor updates specific controller context with string key', () => {
        const controller = new ActionController()
        dispatcher.register('game', controller)

        const result = dispatcher.setContextFor('game', 'level', 5)

        expect(controller.context.level).toBe(5)
        expect(result).toBe(controller.context)
    })


    test('setContextFor updates specific controller context with object', () => {
        const controller = new ActionController()
        dispatcher.register('game', controller)

        const result = dispatcher.setContextFor('game', {
            level: 5,
            lives: 3
        })

        expect(controller.context.level).toBe(5)
        expect(controller.context.lives).toBe(3)
        expect(result).toBe(controller.context)
    })


    test('setContextFor returns null for non-existent controller', () => {
        const result = dispatcher.setContextFor('nonExistent', 'key', 'value')

        expect(result).toBeNull()
    })


    test('clearContextFor clears specific key from controller', () => {
        const controller = new ActionController()
        dispatcher.register('game', controller)

        controller.context.key1 = 'value1'
        controller.context.key2 = 'value2'

        const result = dispatcher.clearContextFor('game', 'key1')

        expect(controller.context.key1).toBeUndefined()
        expect(controller.context.key2).toBe('value2')
        expect(result).toBe(controller.context)
    })


    test('clearContextFor clears all keys from controller', () => {
        const controller = new ActionController()
        dispatcher.register('game', controller)

        controller.context.key1 = 'value1'
        controller.context.key2 = 'value2'

        const result = dispatcher.clearContextFor('game')

        expect(Object.keys(controller.context).length).toBe(0)
        expect(result).toBe(controller.context)
    })


    test('clearContextFor returns null for non-existent controller', () => {
        const result = dispatcher.clearContextFor('nonExistent', 'key')

        expect(result).toBeNull()
    })

})
