import {describe, beforeEach, vi} from 'vitest'
import InputSystem from './input_system'
import InputManager from './input_manager'
import InputBinder from './input_binder'
import KeyboardDevice from './input_devices/keyboard_device'
import MouseDevice from './input_devices/mouse_device'
import ButtonControl from './input_controls/button_control'
import PerkyModule from '../core/perky_module'


describe(InputSystem, () => {

    let inputSystem
    let mockHost

    beforeEach(() => {
        mockHost = new PerkyModule({name: 'mockHost'})
        mockHost.actionDispatcher = {
            dispatchAction: vi.fn()
        }

        inputSystem = new InputSystem()
        inputSystem.install(mockHost)
    })


    test('constructor creates InputManager and InputBinder', () => {
        expect(inputSystem.inputManager).toBeInstanceOf(InputManager)
        expect(inputSystem.inputBinder).toBeInstanceOf(InputBinder)
    })


    test('constructor creates keyboard and mouse devices', () => {
        expect(inputSystem.keyboard).toBeInstanceOf(KeyboardDevice)
        expect(inputSystem.mouse).toBeInstanceOf(MouseDevice)
    })


    test('constructor registers devices with InputManager', () => {
        expect(inputSystem.inputManager.getDevice('keyboard')).toBe(inputSystem.keyboard)
        expect(inputSystem.inputManager.getDevice('mouse')).toBe(inputSystem.mouse)
    })


    test('onInstall delegates InputManager methods to host', () => {
        expect(typeof mockHost.registerDevice).toBe('function')
        expect(typeof mockHost.getDevice).toBe('function')
        expect(typeof mockHost.isPressed).toBe('function')
        expect(typeof mockHost.getControl).toBe('function')
    })


    test('onInstall delegates InputBinder methods to host', () => {
        expect(typeof mockHost.bind).toBe('function')
        expect(typeof mockHost.unbind).toBe('function')
        expect(typeof mockHost.getBinding).toBe('function')
        expect(typeof mockHost.hasBinding).toBe('function')
    })


    test('onInstall adds convenience methods to host', () => {
        expect(typeof mockHost.bindKey).toBe('function')
        expect(typeof mockHost.bindMouse).toBe('function')
        expect(typeof mockHost.isKeyPressed).toBe('function')
        expect(typeof mockHost.isMousePressed).toBe('function')
        expect(typeof mockHost.isActionPressed).toBe('function')
        expect(typeof mockHost.getActionControls).toBe('function')
    })


    test('bindKey creates keyboard binding', () => {
        const binding = inputSystem.bindKey('Space', 'jump')

        expect(binding).toBeDefined()
        expect(binding.deviceName).toBe('keyboard')
        expect(binding.controlName).toBe('Space')
        expect(binding.actionName).toBe('jump')
    })


    test('bindMouse creates mouse binding', () => {
        const binding = inputSystem.bindMouse('leftButton', 'fire')

        expect(binding).toBeDefined()
        expect(binding.deviceName).toBe('mouse')
        expect(binding.controlName).toBe('leftButton')
        expect(binding.actionName).toBe('fire')
    })


    test('isKeyPressed returns correct state', () => {
        const spaceControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'Space'})

        expect(inputSystem.isKeyPressed('Space')).toBe(false)

        spaceControl.press()
        expect(inputSystem.isKeyPressed('Space')).toBe(true)

        spaceControl.release()
        expect(inputSystem.isKeyPressed('Space')).toBe(false)
    })


    test('isMousePressed returns correct state', () => {
        const leftButtonControl = inputSystem.mouse.findOrCreateControl(ButtonControl, {name: 'leftButton'})

        expect(inputSystem.isMousePressed('leftButton')).toBe(false)

        leftButtonControl.press()
        expect(inputSystem.isMousePressed('leftButton')).toBe(true)

        leftButtonControl.release()
        expect(inputSystem.isMousePressed('leftButton')).toBe(false)
    })


    test('isActionPressed returns false when action not bound', () => {
        expect(inputSystem.isActionPressed('jump')).toBe(false)
    })


    test('isActionPressed returns true when action is pressed', () => {
        inputSystem.bindKey('Space', 'jump')

        const spaceControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'Space'})
        spaceControl.press()

        expect(inputSystem.isActionPressed('jump')).toBe(true)
    })


    test('isActionPressed works with multiple bindings', () => {
        inputSystem.bindKey('Space', 'jump', 'pressed', 'player1')
        inputSystem.bindKey('KeyW', 'jump', 'pressed', 'player2')

        const wControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'KeyW'})
        wControl.press()

        expect(inputSystem.isActionPressed('jump')).toBe(true)
        expect(inputSystem.isActionPressed('jump', 'player2')).toBe(true)
        expect(inputSystem.isActionPressed('jump', 'player1')).toBe(false)
    })


    test('getActionControls returns empty array when action not bound', () => {
        const controls = inputSystem.getActionControls('jump')
        expect(controls).toEqual([])
    })


    test('getActionControls returns controls for action', () => {
        inputSystem.bindKey('Space', 'jump')

        const spaceControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'Space'})

        const controls = inputSystem.getActionControls('jump')
        expect(controls).toHaveLength(1)
        expect(controls[0]).toBe(spaceControl)
    })


    test('dispatches action when control is pressed', async () => {
        inputSystem.bindKey('Space', 'jump')

        const spaceControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'Space'})

        spaceControl.press({code: 'Space'})

        await new Promise(resolve => setTimeout(resolve, 0))

        expect(mockHost.actionDispatcher.dispatchAction).toHaveBeenCalled()
    })


    test('emits control events', async () => {
        const pressedListener = vi.fn()
        const releasedListener = vi.fn()

        inputSystem.inputManager.on('control:pressed', pressedListener)
        inputSystem.inputManager.on('control:released', releasedListener)

        const spaceControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'Space'})

        spaceControl.press({code: 'Space'})
        await new Promise(resolve => setTimeout(resolve, 0))
        expect(pressedListener).toHaveBeenCalled()

        spaceControl.release({code: 'Space'})
        await new Promise(resolve => setTimeout(resolve, 0))
        expect(releasedListener).toHaveBeenCalled()
    })


    test('getInputValue returns control value', () => {
        const spaceControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'Space'})
        spaceControl.press()

        expect(inputSystem.getInputValue('keyboard', 'Space')).toBe(1)
    })


    test('getKeyValue returns keyboard control value', () => {
        const spaceControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'Space'})
        spaceControl.press()

        expect(inputSystem.getKeyValue('Space')).toBe(1)
    })


    test('getMouseValue returns mouse control value', () => {
        const leftButtonControl = inputSystem.mouse.findOrCreateControl(ButtonControl, {name: 'leftButton'})
        leftButtonControl.press()

        expect(inputSystem.getMouseValue('leftButton')).toBe(1)
    })


    test('constructor accepts custom keyboard options', () => {
        const customInputSystem = new InputSystem({
            keyboard: {
                customOption: 'value'
            }
        })

        expect(customInputSystem.keyboard).toBeInstanceOf(KeyboardDevice)
    })


    test('constructor accepts custom mouse options', () => {
        const customInputSystem = new InputSystem({
            mouse: {
                customOption: 'value'
            }
        })

        expect(customInputSystem.mouse).toBeInstanceOf(MouseDevice)
    })


    test('constructor accepts inputBinder data', () => {
        const bindings = [
            {
                deviceName: 'keyboard',
                controlName: 'Space',
                actionName: 'jump'
            }
        ]

        const customInputSystem = new InputSystem({
            inputBinder: {bindings}
        })

        expect(customInputSystem.inputBinder.hasBinding({actionName: 'jump'})).toBe(true)
    })

})
