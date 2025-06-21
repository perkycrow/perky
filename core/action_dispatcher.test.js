import ActionDispatcher from './action_dispatcher'
import ActionController from './action_controller'
import PerkyModule from './perky_module'
import InputManager from '../input/input_manager'
import KeyboardDevice from '../input/input_devices/keyboard_device'
import ButtonControl from '../input/input_controls/button_control'
import {vi} from 'vitest'
import InputBinder from '../input/input_binder'


describe(ActionDispatcher, () => {

    let dispatcher

    beforeEach(() => {
        dispatcher = new ActionDispatcher({inputManager: false})
    })


    test('constructor', () => {
        expect(dispatcher.getController('any')).toBeUndefined()
        expect(dispatcher.getActiveName()).toBeNull()
        expect(dispatcher.getAllBindings()).toHaveLength(0)
    })


    test('constructor - default inputManager creation', () => {
        const defaultDispatcher = new ActionDispatcher()
        
        expect(defaultDispatcher.inputManager).toBeDefined()
        expect(defaultDispatcher.inputManager.devices.size).toBe(2) // keyboard + mouse
        expect(defaultDispatcher.inputManager.getDevice('keyboard')).toBeDefined()
        expect(defaultDispatcher.inputManager.getDevice('mouse')).toBeDefined()
    })


    test('constructor - with custom inputManager', () => {
        const customInputManager = new InputManager()
        const customDispatcher = new ActionDispatcher({inputManager: customInputManager})
        
        expect(customDispatcher.inputManager).toBe(customInputManager)
    })


    test('constructor - with inputManager disabled', () => {
        const noInputDispatcher = new ActionDispatcher({inputManager: false})
        
        expect(noInputDispatcher.inputManager).toBeNull()
    })


    test('constructor - with inputManager options', () => {
        const optionsDispatcher = new ActionDispatcher({inputManager: {mouse: false}})
        
        expect(optionsDispatcher.inputManager).toBeDefined()
        expect(optionsDispatcher.inputManager.devices.size).toBe(1) // only keyboard
        expect(optionsDispatcher.inputManager.getDevice('keyboard')).toBeDefined()
        expect(optionsDispatcher.inputManager.getDevice('mouse')).toBeUndefined()
    })


    test('constructor - with inputManager options keyboard only', () => {
        const keyboardOnlyDispatcher = new ActionDispatcher({inputManager: {keyboard: false}})
        
        expect(keyboardOnlyDispatcher.inputManager).toBeDefined()
        expect(keyboardOnlyDispatcher.inputManager.devices.size).toBe(1) // only mouse
        expect(keyboardOnlyDispatcher.inputManager.getDevice('mouse')).toBeDefined()
        expect(keyboardOnlyDispatcher.inputManager.getDevice('keyboard')).toBeUndefined()
    })


    test('constructor - with inputManager options both disabled', () => {
        const emptyDispatcher = new ActionDispatcher({inputManager: {mouse: false, keyboard: false}})
        
        expect(emptyDispatcher.inputManager).toBeDefined()
        expect(emptyDispatcher.inputManager.devices.size).toBe(0)
        expect(emptyDispatcher.inputManager.getDevice('keyboard')).toBeUndefined()
        expect(emptyDispatcher.inputManager.getDevice('mouse')).toBeUndefined()
    })


    test('constructor - with inputBinder instance', () => {
        const existingInputBinder = new InputBinder()
        existingInputBinder.bind({deviceName: 'keyboard', controlName: 'Space', actionName: 'jump'})
        
        const customDispatcher = new ActionDispatcher({inputBinder: existingInputBinder})
        
        expect(customDispatcher.inputBinder).toBe(existingInputBinder)
        expect(customDispatcher.inputBinder.getAllBindings().length).toBe(1)
    })


    test('constructor - with inputBinder bindings array', () => {
        const bindings = [
            {deviceName: 'keyboard', controlName: 'Space', actionName: 'jump'},
            {deviceName: 'mouse', controlName: 'leftButton', actionName: 'fire'}
        ]
        
        const bindingsDispatcher = new ActionDispatcher({inputBinder: bindings})
        
        expect(bindingsDispatcher.inputBinder).toBeDefined()
        expect(bindingsDispatcher.inputBinder.getAllBindings().length).toBe(2)
    })


    test('constructor - default inputBinder', () => {
        const defaultDispatcher = new ActionDispatcher()
        
        expect(defaultDispatcher.inputBinder).toBeDefined()
        expect(defaultDispatcher.inputBinder.getAllBindings().length).toBe(0)
    })


    test('inputManager getter', () => {
        const inputManager = new InputManager()
        dispatcher.connectInputManager(inputManager)
        
        expect(dispatcher.inputManager).toBe(inputManager)
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


    test('deviceKeyFor', () => {
        const inputManager = new InputManager()
        const keyboardDevice = new KeyboardDevice({container: {}})
        
        inputManager.registerDevice('keyboard', keyboardDevice)
        dispatcher.connectInputManager(inputManager)
        
        const deviceKey = dispatcher.deviceKeyFor(keyboardDevice)
        
        expect(deviceKey).toBe('keyboard')
    })


    test('deviceKeyFor - without inputManager', () => {
        const keyboardDevice = new KeyboardDevice({container: {}})
        
        const deviceKey = dispatcher.deviceKeyFor(keyboardDevice)
        
        expect(deviceKey).toBeUndefined()
    })


    test('registerDevice', () => {
        const inputManager = new InputManager({mouse: false, keyboard: false})
        const keyboardDevice = new KeyboardDevice({container: {}})
        
        dispatcher.connectInputManager(inputManager)
        
        const result = dispatcher.registerDevice('keyboard', keyboardDevice)
        
        expect(result).not.toBe(false)
        expect(dispatcher.getDevice('keyboard')).toBe(keyboardDevice)
    })


    test('registerDevice - without inputManager', () => {
        const keyboardDevice = new KeyboardDevice({container: {}})
        
        const result = dispatcher.registerDevice('keyboard', keyboardDevice)
        
        expect(result).toBe(false)
    })


    test('getDevice', () => {
        const inputManager = new InputManager({mouse: false, keyboard: false})
        const keyboardDevice = new KeyboardDevice({container: {}})
        
        dispatcher.connectInputManager(inputManager)
        inputManager.registerDevice('keyboard', keyboardDevice)
        
        expect(dispatcher.getDevice('keyboard')).toBe(keyboardDevice)
        expect(dispatcher.getDevice('nonexistent')).toBeUndefined()
    })


    test('getDevice - without inputManager', () => {
        expect(dispatcher.getDevice('keyboard')).toBeUndefined()
    })


    test('dispatchAction', () => {
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


    test('dispatchAction - active controller fallback', () => {
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
        
        inputManager.registerDevice('keyboard', keyboardDevice)
        dispatcher.register('game', controller)
        dispatcher.connectInputManager(inputManager)
        
        dispatcher.bind({
            deviceName: 'keyboard',
            controlName: 'Space',
            actionName: 'jump',
            controllerName: 'game'
        })
        
        const control = new ButtonControl({device: keyboardDevice, name: 'Space'})
        keyboardDevice.registerControl(control)
        
        control.press({code: 'Space'})
        
        await new Promise(resolve => setTimeout(resolve, 0))
        
        expect(controller.jump).toHaveBeenCalled()
    })


    test('dispose', () => {
        const inputManager = new InputManager()
        dispatcher.connectInputManager(inputManager)
        
        expect(dispatcher.inputManager).toBe(inputManager)
        
        dispatcher.dispose()
        
        expect(dispatcher.inputManager).toBeNull()
    })


    test('inputBinder getter', () => {
        const inputBinder = new InputBinder()
        inputBinder.bind({deviceName: 'keyboard', controlName: 'Space', actionName: 'jump'})
        
        const testDispatcher = new ActionDispatcher({inputBinder: inputBinder})
        
        expect(testDispatcher.inputBinder).toBe(inputBinder)
        expect(testDispatcher.inputBinder.getAllBindings().length).toBe(1)
    })

})
