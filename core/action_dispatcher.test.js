import ActionDispatcher from './action_dispatcher'
import ActionController from './action_controller'
import PerkyModule from './perky_module'
import InputManager from '../input/input_manager'
import KeyboardDevice from '../input/input_devices/keyboard_device'
import ButtonControl from '../input/input_controls/button_control'
import {vi} from 'vitest'


describe(ActionDispatcher, () => {

    let dispatcher

    beforeEach(() => {
        dispatcher = new ActionDispatcher()
    })


    test('constructor', () => {
        expect(dispatcher.getController('any')).toBeUndefined()
        expect(dispatcher.getActiveName()).toBeNull()
        expect(dispatcher.getAllBindings()).toHaveLength(0)
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


    test('bind', () => {
        const binding = dispatcher.bind({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        })
        
        expect(binding).toBeDefined()
        expect(binding.actionName).toBe('jump')
        expect(dispatcher.getAllBindings()).toHaveLength(1)
    })


    test('unbind', () => {
        dispatcher.bind({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        })
        
        const result = dispatcher.unbind({actionName: 'jump'})
        
        expect(result).toBe(true)
        expect(dispatcher.getAllBindings()).toHaveLength(0)
    })


    test('getBinding', () => {
        dispatcher.bind({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        })
        
        const binding = dispatcher.getBinding({actionName: 'jump'})
        
        expect(binding).toBeDefined()
        expect(binding.actionName).toBe('jump')
    })


    test('hasBinding', () => {
        dispatcher.bind({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        })
        
        expect(dispatcher.hasBinding({actionName: 'jump'})).toBe(true)
        expect(dispatcher.hasBinding({actionName: 'nonExistent'})).toBe(false)
    })


    test('getBindingsForInput', () => {
        dispatcher.bind({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        })
        
        const bindings = dispatcher.getBindingsForInput({
            deviceName: 'keyboard',
            controlName: 'Space',
            eventType: 'pressed'
        })
        
        expect(bindings).toHaveLength(1)
        expect(bindings[0].actionName).toBe('jump')
    })


    test('clearBindings', () => {
        dispatcher.bind({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        })
        
        dispatcher.clearBindings()
        
        expect(dispatcher.getAllBindings()).toHaveLength(0)
    })


    test('connectInputManager', () => {
        const inputManager = new InputManager()
        
        const result = dispatcher.connectInputManager(inputManager)
        
        expect(result).toBe(dispatcher)
    })


    test('disconnectInputManager', () => {
        const inputManager = new InputManager()
        
        dispatcher.connectInputManager(inputManager)
        const result = dispatcher.disconnectInputManager()
        
        expect(result).toBe(dispatcher)
    })


    test('dispatchAction with specific controller', () => {
        class TestController extends PerkyModule {
            jump = vi.fn()
        }
        
        const controller = new TestController()
        dispatcher.register('game', controller)
        
        const binding = dispatcher.bind({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump',
            controllerName: 'game'
        })
        
        const control = new ButtonControl({name: 'Space'})
        
        const result = dispatcher.dispatchAction(binding, control, 'event', 'device')
        
        expect(result).toBe(true)
        expect(controller.jump).toHaveBeenCalledWith(control, 'event', 'device')
    })


    test('dispatchAction with active controller fallback', () => {
        class TestController extends PerkyModule {
            jump = vi.fn()
        }
        
        const controller = new TestController()
        dispatcher.register('main', controller)
        dispatcher.setActive('main')
        
        const binding = dispatcher.bind({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump'
        })
        
        const control = new ButtonControl({name: 'Space'})
        
        const result = dispatcher.dispatchAction(binding, control, 'event', 'device')
        
        expect(result).toBe(true)
        expect(controller.jump).toHaveBeenCalledWith(control, 'event', 'device')
    })


    test('input event dispatching integration', async () => {
        class TestController extends PerkyModule {
            jump = vi.fn()
        }
        
        const inputManager = new InputManager()
        const keyboardDevice = new KeyboardDevice({container: {}})
        const controller = new TestController()
        
        // Setup
        inputManager.registerDevice('keyboard', keyboardDevice)
        dispatcher.register('game', controller)
        dispatcher.connectInputManager(inputManager)
        
        dispatcher.bind({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump',
            controllerName: 'game'
        })
        
        // Simulate key press
        const control = new ButtonControl({device: keyboardDevice, name: 'Space'})
        keyboardDevice.registerControl(control)
        
        // Trigger the event manually since we don't have real DOM events
        control.press({code: 'Space'})
        
        // Small delay to allow event processing
        await new Promise(resolve => setTimeout(resolve, 0))
        
        expect(controller.jump).toHaveBeenCalled()
    })

})
