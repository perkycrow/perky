import ActionDispatcher from './action_dispatcher.js'
import ActionController from './action_controller.js'
import PerkyModule from './perky_module.js'
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


    test('register with controller class (auto-naming)', () => {
        class GameController extends ActionController {}
        const controller = dispatcher.register(GameController)

        expect(dispatcher.getController('game')).toBe(controller)
    })


    test('register with controller class and options', () => {
        class GameController extends ActionController {}
        const controller = dispatcher.register(GameController, {name: 'customName'})

        expect(dispatcher.getController('customName')).toBe(controller)
    })


    test('register with controller class uses $name if available', () => {
        class GameController extends ActionController {
            static $name = 'myGame'
        }
        const controller = dispatcher.register(GameController)

        expect(dispatcher.getController('myGame')).toBe(controller)
    })


    test('register returns null for invalid input', () => {
        const result = dispatcher.register(123)

        expect(result).toBeNull()
    })


    test('register emits controller:set event', () => {
        let emittedData = null
        dispatcher.on('controller:set', (name, ctrl) => {
            emittedData = {name, controller: ctrl}
        })

        const controller = dispatcher.register('main', ActionController)

        expect(emittedData).not.toBeNull()
        expect(emittedData.name).toBe('main')
        expect(emittedData.controller).toBe(controller)
    })


    test('register auto-pushes second controller when first is active', () => {
        dispatcher.register('first', ActionController)
        dispatcher.pushActive('first')

        dispatcher.register('second', ActionController)

        expect(dispatcher.getActive()).toContain('second')
    })


    test('register does not auto-push when active option is false', () => {
        dispatcher.register('first', ActionController)
        dispatcher.pushActive('first')

        dispatcher.register('second', ActionController, {active: false})

        expect(dispatcher.getActive()).not.toContain('second')
    })


    test('mainController returns null when no controllers registered', () => {
        expect(dispatcher.mainController).toBeNull()
    })


    test('mainController returns first registered controller', () => {
        dispatcher.register('game', ActionController)
        dispatcher.register('ui', ActionController)

        expect(dispatcher.mainController).toBeInstanceOf(ActionController)
        expect(dispatcher.mainController.$id).toBe('game')
    })


    test('engine getter returns host', () => {
        const host = new PerkyModule()
        const newDispatcher = new ActionDispatcher()
        newDispatcher.install(host)

        expect(newDispatcher.engine).toBe(host)
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


    test('unregister emits controller:unregistered event', () => {
        const controller = dispatcher.register('main', ActionController)

        let emittedData = null
        dispatcher.on('controller:unregistered', (name, ctrl) => {
            emittedData = {name, controller: ctrl}
        })

        dispatcher.unregister('main')

        expect(emittedData).not.toBeNull()
        expect(emittedData.name).toBe('main')
        expect(emittedData.controller).toBe(controller)
    })


    test('unregister does not emit event for non-existent controller', () => {
        let emitted = false
        dispatcher.on('controller:unregistered', () => {
            emitted = true
        })

        dispatcher.unregister('nonExistent')

        expect(emitted).toBe(false)
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


    test('setActive emits controllers:activated event', () => {
        dispatcher.register('main', ActionController)

        let emittedNames = null
        dispatcher.on('controllers:activated', (names) => {
            emittedNames = names
        })

        dispatcher.setActive('main')

        expect(emittedNames).toEqual(['main'])
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


    test('executeTo does nothing for inactive controller', () => {
        class TestController extends PerkyModule {
            someAction = vi.fn()
        }
        const controller = dispatcher.register('main', TestController)

        dispatcher.executeTo('main', 'someAction', 'arg1')

        expect(controller.someAction).not.toHaveBeenCalled()
    })


    test('executeTo uses execute method when available', () => {
        class TestController extends ActionController {
            customAction = vi.fn()
        }
        const controller = dispatcher.register('main', TestController)
        dispatcher.setActive('main')

        const executeSpy = vi.spyOn(controller, 'execute')

        dispatcher.executeTo('main', 'customAction', 'arg1')

        expect(executeSpy).toHaveBeenCalledWith('customAction', 'arg1')
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


    test('dispatchAction calls preventDefault by default', () => {
        dispatcher.register('main', ActionController)
        dispatcher.setActive('main')

        const mockEvent = {preventDefault: vi.fn()}
        const binding = {actionName: 'someAction'}

        dispatcher.dispatchAction(binding, mockEvent)

        expect(mockEvent.preventDefault).toHaveBeenCalled()
    })


    test('dispatchAction does not call preventDefault when binding.preventDefault is false', () => {
        dispatcher.register('main', ActionController)
        dispatcher.setActive('main')

        const mockEvent = {preventDefault: vi.fn()}
        const binding = {actionName: 'someAction', preventDefault: false}

        dispatcher.dispatchAction(binding, mockEvent)

        expect(mockEvent.preventDefault).not.toHaveBeenCalled()
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


    test('pushActive emits controller:pushed event', () => {
        dispatcher.register('main', ActionController)

        let emittedData = null
        dispatcher.on('controller:pushed', (name, stackLength) => {
            emittedData = {name, stackLength}
        })

        dispatcher.pushActive('main')

        expect(emittedData).toEqual({name: 'main', stackLength: 1})
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


    test('popActive emits controller:popped event', () => {
        dispatcher.register('main', ActionController)
        dispatcher.pushActive('main')

        let emittedData = null
        dispatcher.on('controller:popped', (name, stackLength) => {
            emittedData = {name, stackLength}
        })

        dispatcher.popActive()

        expect(emittedData).toEqual({name: 'main', stackLength: 0})
    })


    test('removeActive', () => {
        dispatcher.register('main', ActionController)
        dispatcher.register('pause', ActionController)

        dispatcher.pushActive('main')
        dispatcher.pushActive('pause')

        const result = dispatcher.removeActive('main')

        expect(result).toBe(true)
        expect(dispatcher.getActive()).toEqual(['pause'])
    })


    test('removeActive - non-existent returns false', () => {
        const result = dispatcher.removeActive('nonExistent')

        expect(result).toBe(false)
    })


    test('removeActive - from middle of stack', () => {
        dispatcher.register('game', ActionController)
        dispatcher.register('pause', ActionController)
        dispatcher.register('dialog', ActionController)

        dispatcher.pushActive('game')
        dispatcher.pushActive('pause')
        dispatcher.pushActive('dialog')

        dispatcher.removeActive('pause')

        expect(dispatcher.getActive()).toEqual(['game', 'dialog'])
    })


    test('removeActive emits controller:removed event', () => {
        dispatcher.register('main', ActionController)
        dispatcher.pushActive('main')

        let emittedData = null
        dispatcher.on('controller:removed', (name, stackLength) => {
            emittedData = {name, stackLength}
        })

        dispatcher.removeActive('main')

        expect(emittedData).toEqual({name: 'main', stackLength: 0})
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


    test('clearActive emits controllers:cleared event', () => {
        dispatcher.register('main', ActionController)
        dispatcher.pushActive('main')

        let emitted = false
        dispatcher.on('controllers:cleared', () => {
            emitted = true
        })

        dispatcher.clearActive()

        expect(emitted).toBe(true)
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
        const actionNames = allActions.get('game').map(a => a.name)

        expect(actionNames).toContain('jump')
        expect(actionNames).toContain('move')
        expect(actionNames).toContain('shoot')
    })


    test('addAction delegates to main controller', () => {
        const host = new PerkyModule()
        const newDispatcher = new ActionDispatcher()
        newDispatcher.install(host)
        newDispatcher.register('main', ActionController)

        const action = vi.fn()
        newDispatcher.addAction('customAction', action)

        expect(newDispatcher.mainController.getAction('customAction')).toBe(action)
    })


    test('addAction returns false without main controller', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        const result = dispatcher.addAction('customAction', vi.fn())

        expect(result).toBe(false)
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
    })


    test('removeAction delegates to main controller', () => {
        const host = new PerkyModule()
        const newDispatcher = new ActionDispatcher()
        newDispatcher.install(host)
        newDispatcher.register('main', ActionController)

        const action = vi.fn()
        newDispatcher.addAction('customAction', action)
        newDispatcher.removeAction('customAction')

        expect(newDispatcher.mainController.getAction('customAction')).toBeUndefined()
    })


    test('removeAction returns false without main controller', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        const result = dispatcher.removeAction('customAction')

        expect(result).toBe(false)
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
    })


    test('onInstall sets up input:triggered listener', () => {
        const host = new PerkyModule()
        const newDispatcher = new ActionDispatcher()
        newDispatcher.install(host)

        class TestController extends ActionController {
            jump = vi.fn()
        }
        newDispatcher.register('main', TestController)
        newDispatcher.setActive('main')

        const binding = {actionName: 'jump'}
        host.emit('input:triggered', binding)

        expect(newDispatcher.getController('main').jump).toHaveBeenCalled()
    })


    test('onInstall delegates methods to host', () => {
        const host = new PerkyModule()
        const newDispatcher = new ActionDispatcher()
        newDispatcher.install(host)
        newDispatcher.register('main', ActionController)

        expect(host.registerController).toBeDefined()
        expect(host.getController('main')).toBe(newDispatcher.getController('main'))
    })


    test('listAllActions falls back to listActions when listActionsWithParams not available', () => {
        class SimpleController extends PerkyModule {
            listActions () {
                return ['action1', 'action2']
            }
        }

        dispatcher.register('simple', SimpleController)

        const allActions = dispatcher.listAllActions()
        const actions = allActions.get('simple')

        expect(actions).toEqual([
            {name: 'action1', params: []},
            {name: 'action2', params: []}
        ])
    })

})
