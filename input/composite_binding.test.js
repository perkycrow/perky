import CompositeBinding from './composite_binding'
import InputManager from './input_manager'
import KeyboardDevice from './input_devices/keyboard_device'
import ButtonControl from './input_controls/button_control'
import {vi} from 'vitest'


describe(CompositeBinding, () => {
    let inputManager
    let keyboardDevice
    let compositeBinding


    beforeEach(() => {
        global.ResizeObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        }))

        inputManager = new InputManager()
        keyboardDevice = inputManager.registerDevice(KeyboardDevice, {$name: 'keyboard', $bind: 'keyboard', name: 'KeyboardDevice'})

        compositeBinding = new CompositeBinding({
            controls: [
                {deviceName: 'keyboard', controlName: 'ControlLeft'},
                {deviceName: 'keyboard', controlName: 'KeyS'}
            ],
            actionName: 'save',
            controllerName: 'editor'
        })
    })


    afterEach(() => {
        vi.restoreAllMocks()
    })


    test('constructor', () => {
        expect(compositeBinding).toBeInstanceOf(CompositeBinding)
        expect(compositeBinding.controls).toHaveLength(2)

        expect(compositeBinding.actionName).toBe('save')
        expect(compositeBinding.controllerName).toBe('editor')
        expect(compositeBinding.deviceName).toBe('composite')
    })


    test('generateControlName', () => {
        const controls = [
            {deviceName: 'keyboard', controlName: 'ControlLeft'},
            {deviceName: 'keyboard', controlName: 'KeyS'}
        ]

        const controlName = CompositeBinding.generateControlName(controls)
        expect(controlName).toBe('combo(keyboard:ControlLeft+keyboard:KeyS)')
    })


    test('matches composite device', () => {
        const result = compositeBinding.matches({
            deviceName: 'composite',
            controlName: compositeBinding.controlName,
            eventType: 'pressed'
        })

        expect(result).toBe(true)
    })


    test('matches constituent control', () => {
        const result = compositeBinding.matches({
            deviceName: 'keyboard',
            controlName: 'ControlLeft',
            eventType: 'pressed'
        })

        expect(result).toBe(true)

        const result2 = compositeBinding.matches({
            deviceName: 'keyboard',
            controlName: 'KeyS',
            eventType: 'pressed'
        })

        expect(result2).toBe(true)
    })


    test('does not match unrelated control', () => {
        const result = compositeBinding.matches({
            deviceName: 'keyboard',
            controlName: 'KeyA',
            eventType: 'pressed'
        })

        expect(result).toBe(false)
    })


    test('shouldTrigger with AND operator', () => {
        const ctrlControl = keyboardDevice.findOrCreateControl(ButtonControl, {name: 'ControlLeft'})
        const sControl = keyboardDevice.findOrCreateControl(ButtonControl, {name: 'KeyS'})

        expect(compositeBinding.shouldTrigger(inputManager)).toBe(false)

        ctrlControl.press()
        expect(compositeBinding.shouldTrigger(inputManager)).toBe(false)

        sControl.press()
        expect(compositeBinding.shouldTrigger(inputManager)).toBe(true)
    })


    test('key generation', () => {
        expect(compositeBinding.key).toBe('composite:combo(keyboard:ControlLeft+keyboard:KeyS):pressed:save:editor')
    })

})
