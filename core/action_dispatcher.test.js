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
        expect(dispatcher.controllers).toBeDefined()
        expect(dispatcher.activeControllerName).toBeNull()
    })


    test('register', () => {
        const controller = new ActionController()
        
        dispatcher.register('main', controller)
        
        expect(dispatcher.controllers.get('main')).toBe(controller)
    })


    test('register with existing name', () => {
        const controller1 = new ActionController()
        const controller2 = new ActionController()
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        dispatcher.register('main', controller1)
        dispatcher.register('main', controller2)
        
        expect(consoleSpy).toHaveBeenCalled()
        expect(dispatcher.controllers.get('main')).toBe(controller2)
        
        consoleSpy.mockRestore()
    })


    test('unregister', () => {
        const controller = new ActionController()
        
        dispatcher.register('main', controller)
        const result = dispatcher.unregister('main')
        
        expect(result).toBe(true)
        expect(dispatcher.controllers.has('main')).toBe(false)
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
        
        expect(dispatcher.activeControllerName).toBeNull()
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
        expect(dispatcher.activeControllerName).toBe('main')
    })


    test('setActive invalid controller', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        const result = dispatcher.setActive('nonExistent')
        
        expect(result).toBe(false)
        expect(dispatcher.activeControllerName).toBeNull()
        expect(consoleSpy).toHaveBeenCalled()
        
        consoleSpy.mockRestore()
    })


    test('getActive', () => {
        const controller = new ActionController()
        
        dispatcher.register('main', controller)
        dispatcher.setActive('main')
        
        expect(dispatcher.getActive()).toBe(controller)
    })


    test('dispatch with no active controller', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        const result = dispatcher.dispatch('someAction')
        
        expect(result).toBe(false)
        expect(consoleSpy).toHaveBeenCalled()
        
        consoleSpy.mockRestore()
    })


    test('dispatch to controller with execute method', () => {
        const controller = new ActionController()
        const executeSpy = vi.spyOn(controller, 'execute').mockImplementation(() => true)
        
        dispatcher.register('main', controller)
        dispatcher.setActive('main')
        
        const result = dispatcher.dispatch('someAction', 'arg1', 'arg2')
        
        expect(result).toBe(true)
        expect(executeSpy).toHaveBeenCalledWith('someAction', 'arg1', 'arg2')
    })


    test('dispatchTo with method on controller', () => {
        class TestController extends PerkyModule {
            someAction = vi.fn()
        }
        
        const controller = new TestController()

        dispatcher.register('main', controller)
        
        const result = dispatcher.dispatchTo('main', 'someAction', 'arg1', 'arg2')
        
        expect(result).toBe(true)
        expect(controller.someAction).toHaveBeenCalledWith('arg1', 'arg2')
    })


    test('dispatchTo with non-existent method', () => {
        const controller = new PerkyModule()
        
        dispatcher.register('main', controller)
        
        const result = dispatcher.dispatchTo('main', 'nonExistentAction')
        
        expect(result).toBe(false)
    })


    test('dispatchTo with non-existent controller', () => {
        const result = dispatcher.dispatchTo('nonExistent', 'someAction')
        
        expect(result).toBe(false)
    })


    test('controller dispose on unregister', () => {
        class TestController extends PerkyModule {
            dispose = vi.fn()
        }
        
        const controller = new TestController()
        
        dispatcher.register('main', controller)
        dispatcher.unregister('main')
        
        expect(controller.dispose).toHaveBeenCalled()
    })

})
