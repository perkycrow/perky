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
        expect(dispatcher.getController('any')).toBeUndefined()
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
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        dispatcher.register('main', controller1)
        dispatcher.register('main', controller2)
        
        expect(consoleSpy).toHaveBeenCalled()
        expect(dispatcher.getController('main')).toBe(controller2)
        
        consoleSpy.mockRestore()
    })


    test('unregister', () => {
        const controller = new ActionController()
        
        dispatcher.register('main', controller)
        const result = dispatcher.unregister('main')
        
        expect(result).toBe(true)
        expect(dispatcher.getController('main')).toBeUndefined()
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
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
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


    test('dispatch', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        const result = dispatcher.dispatch('someAction')
        
        expect(result).toBe(false)
        expect(consoleSpy).toHaveBeenCalled()
        
        consoleSpy.mockRestore()
    })


    test('dispatch - to controller with execute method', () => {
        const controller = new ActionController()
        const executeSpy = vi.spyOn(controller, 'execute').mockImplementation(() => true)
        
        dispatcher.register('main', controller)
        dispatcher.setActive('main')
        
        const result = dispatcher.dispatch('someAction', 'arg1', 'arg2')
        
        expect(result).toBe(true)
        expect(executeSpy).toHaveBeenCalledWith('someAction', 'arg1', 'arg2')
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

})
