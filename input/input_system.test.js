import {describe, beforeEach, vi} from 'vitest'
import InputSystem from './input_system'
import InputBinder from './input_binder'
import InputDevice from './input_device'
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


    test('constructor creates InputBinder', () => {
        expect(inputSystem.inputBinder).toBeInstanceOf(InputBinder)
    })


    test('onInstall creates keyboard and mouse devices', () => {
        expect(inputSystem.getDevice('keyboard')).toBeInstanceOf(KeyboardDevice)
        expect(inputSystem.getDevice('mouse')).toBeInstanceOf(MouseDevice)
    })


    test('onInstall registers devices with $bind', () => {
        expect(inputSystem.getDevice('keyboard')).toBe(inputSystem.keyboard)
        expect(inputSystem.getDevice('mouse')).toBe(inputSystem.mouse)
    })


    test('onInstall delegates device management methods to host', () => {
        expect(typeof mockHost.registerDevice).toBe('function')
        expect(typeof mockHost.getDevice).toBe('function')
        expect(typeof mockHost.isPressed).toBe('function')
        expect(typeof mockHost.getControl).toBe('function')
    })


    test('onInstall delegates InputBinder methods to host', () => {
        expect(typeof mockHost.bindInput).toBe('function')
        expect(typeof mockHost.unbind).toBe('function')
        expect(typeof mockHost.getBinding).toBe('function')
        expect(typeof mockHost.hasBinding).toBe('function')
    })


    test('onInstall adds convenience methods to host', () => {
        expect(typeof mockHost.isKeyPressed).toBe('function')
        expect(typeof mockHost.isMousePressed).toBe('function')
        expect(typeof mockHost.isActionPressed).toBe('function')
        expect(typeof mockHost.getActionControls).toBe('function')
    })


    // ===== Device Management Tests (ex-InputManager) =====

    test('registerDevice', () => {
        const device = inputSystem.registerDevice(InputDevice, {$id: 'gamepad', $bind: 'gamepad'})

        expect(inputSystem.getDevice('gamepad')).toBe(device)
        expect(device.host).toBe(inputSystem)
        expect(inputSystem.gamepad).toBe(device)
    })


    test('registerDevice with duplicate name replaces device', () => {
        inputSystem.registerDevice(InputDevice, {$id: 'test', $bind: 'test'})
        const device2 = inputSystem.registerDevice(InputDevice, {$id: 'test', $bind: 'test'})

        expect(inputSystem.getDevice('test')).toBe(device2)
        expect(inputSystem.test).toBe(device2)
    })


    test('isPressed', () => {
        const button = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'TestButton'})

        expect(inputSystem.isPressed('keyboard', 'TestButton')).toBe(false)
        expect(inputSystem.isPressed('nonExistent', 'TestButton')).toBe(false)
        expect(inputSystem.isPressed('keyboard', 'nonExistent')).toBe(false)

        button.press()
        expect(inputSystem.isPressed('keyboard', 'TestButton')).toBe(true)

        button.release()
        expect(inputSystem.isPressed('keyboard', 'TestButton')).toBe(false)
    })


    test('getValueFor', () => {
        const button = inputSystem.mouse.findOrCreateControl(ButtonControl, {name: 'TestButton'})
        button.value = 0.5

        expect(inputSystem.getValueFor('mouse', 'TestButton')).toBe(0.5)
        expect(inputSystem.getValueFor('nonExistent', 'TestButton')).toBeUndefined()
        expect(inputSystem.getValueFor('mouse', 'nonExistent')).toBeUndefined()
    })


    test('getControl', () => {
        const device = inputSystem.registerDevice(InputDevice, {$id: 'gamepad', $bind: 'gamepad'})
        const button = device.findOrCreateControl(ButtonControl, {name: 'TestButton'})

        expect(inputSystem.getControl('gamepad', 'TestButton')).toBe(button)
        expect(inputSystem.getControl('nonExistent', 'TestButton')).toBeNull()
        expect(inputSystem.getControl('gamepad', 'nonExistent')).toBeNull()
    })


    test('automatic lifecycle management', () => {
        inputSystem.start()
        const device = inputSystem.registerDevice(InputDevice, {$id: 'auto', $bind: 'auto'})

        expect(device.started).toBe(true)
    })


    test('event forwarding', () => {
        const device = inputSystem.registerDevice(InputDevice, {$id: 'test', $bind: 'test'})

        const pressedListener = vi.fn()
        const releasedListener = vi.fn()
        const updatedListener = vi.fn()

        inputSystem.on('control:pressed', pressedListener)
        inputSystem.on('control:released', releasedListener)
        inputSystem.on('control:updated', updatedListener)

        const button = device.findOrCreateControl(ButtonControl, {name: 'TestButton'})

        button.press()
        expect(pressedListener).toHaveBeenCalledWith(button, null, device)

        button.release()
        expect(releasedListener).toHaveBeenCalledWith(button, null, device)

        button.setValue(0.5)
        expect(updatedListener).toHaveBeenCalled()
    })


    test('isPressedAny', () => {
        const gamepad = inputSystem.registerDevice(InputDevice, {$id: 'gamepad', $bind: 'gamepad'})

        const keyW = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'KeyW'})
        const buttonA = gamepad.findOrCreateControl(ButtonControl, {name: 'ButtonA'})

        expect(inputSystem.isPressedAny('KeyW')).toBe(false)
        expect(inputSystem.isPressedAny('ButtonA')).toBe(false)
        expect(inputSystem.isPressedAny('NonExistent')).toBe(false)

        keyW.press()
        expect(inputSystem.isPressedAny('KeyW')).toBe(true)
        expect(inputSystem.isPressedAny('ButtonA')).toBe(false)

        buttonA.press()
        expect(inputSystem.isPressedAny('ButtonA')).toBe(true)
    })


    test('getValueAny', () => {
        const keyW = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'KeyW'})
        const leftButton = inputSystem.mouse.findOrCreateControl(ButtonControl, {name: 'leftButton'})

        keyW.setValue(0.8)
        leftButton.setValue(0.5)

        expect(inputSystem.getValueAny('KeyW')).toBe(0.8)
        expect(inputSystem.getValueAny('leftButton')).toBe(0.5)
        expect(inputSystem.getValueAny('NonExistent')).toBeUndefined()
    })


    test('getControlAny', () => {
        const keyW = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'KeyW'})
        const leftButton = inputSystem.mouse.findOrCreateControl(ButtonControl, {name: 'leftButton'})

        expect(inputSystem.getControlAny('KeyW')).toBe(keyW)
        expect(inputSystem.getControlAny('leftButton')).toBe(leftButton)
        expect(inputSystem.getControlAny('NonExistent')).toBeNull()
    })


    test('getAllPressed', () => {
        const gamepad = inputSystem.registerDevice(InputDevice, {$id: 'gamepad', $bind: 'gamepad'})

        const keyEnter = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'Enter'})
        const gamepadEnter = gamepad.findOrCreateControl(ButtonControl, {name: 'Enter'})

        expect(inputSystem.getAllPressed('Enter')).toEqual([])

        keyEnter.press()
        expect(inputSystem.getAllPressed('Enter')).toEqual([inputSystem.keyboard])

        gamepadEnter.press()
        expect(inputSystem.getAllPressed('Enter')).toEqual([inputSystem.keyboard, gamepad])

        keyEnter.release()
        expect(inputSystem.getAllPressed('Enter')).toEqual([gamepad])
    })


    test('getAllValues', () => {
        const device1 = inputSystem.registerDevice(InputDevice, {$id: 'device1', $bind: 'device1'})
        const device2 = inputSystem.registerDevice(InputDevice, {$id: 'device2', $bind: 'device2'})

        const control1 = device1.findOrCreateControl(ButtonControl, {name: 'SharedControl'})
        const control2 = device2.findOrCreateControl(ButtonControl, {name: 'SharedControl'})

        control1.setValue(0.3)
        control2.setValue(0.7)

        const values = inputSystem.getAllValues('SharedControl')
        expect(values).toHaveLength(2)
        expect(values[0]).toEqual({device: device1, value: 0.3})
        expect(values[1]).toEqual({device: device2, value: 0.7})
    })


    test('addControl - explicit form', () => {
        const control = inputSystem.addControl('keyboard', ButtonControl, {
            name: 'TestKey',
            pressThreshold: 0.8
        })

        expect(control).toBeInstanceOf(ButtonControl)
        expect(control.name).toBe('TestKey')
        expect(control.pressThreshold).toBe(0.8)
        expect(inputSystem.keyboard.getControl('TestKey')).toBe(control)
    })


    test('addControl - shortcut form', () => {
        const control = inputSystem.addControl(ButtonControl, {
            name: 'ShortcutKey',
            pressThreshold: 0.6
        })

        expect(control).toBeInstanceOf(ButtonControl)
        expect(control.name).toBe('ShortcutKey')
        expect(control.pressThreshold).toBe(0.6)

        expect(inputSystem.keyboard.getControl('ShortcutKey')).toBe(control)
        expect(inputSystem.mouse.getControl('ShortcutKey')).toBeUndefined()
    })


    test('addControl with nonexistent device', () => {
        expect(() => {
            inputSystem.addControl('nonexistent', ButtonControl, {name: 'test'})
        }).toThrow("Device 'nonexistent' not found")
    })


    test('addControlToFirst', () => {
        const control = inputSystem.addControlToFirst(ButtonControl, {
            name: 'FirstDeviceControl'
        })

        expect(control).toBeInstanceOf(ButtonControl)
        expect(control.name).toBe('FirstDeviceControl')

        expect(inputSystem.keyboard.getControl('FirstDeviceControl')).toBe(control)
        expect(inputSystem.mouse.getControl('FirstDeviceControl')).toBeUndefined()
    })


    test('addControlToAll', () => {
        const results = inputSystem.addControlToAll(ButtonControl, {
            name: 'SharedControl'
        })

        expect(results).toHaveLength(2)
        expect(results[0].device).toBe(inputSystem.keyboard)
        expect(results[0].control).toBeInstanceOf(ButtonControl)
        expect(results[0].control.name).toBe('SharedControl')
        expect(results[1].device).toBe(inputSystem.mouse)
        expect(results[1].control).toBeInstanceOf(ButtonControl)
        expect(results[1].control.name).toBe('SharedControl')

        expect(inputSystem.keyboard.getControl('SharedControl')).toBe(results[0].control)
        expect(inputSystem.mouse.getControl('SharedControl')).toBe(results[1].control)
    })


    test('deviceKeyFor', () => {
        expect(inputSystem.deviceKeyFor(inputSystem.keyboard)).toBe('keyboard')
        expect(inputSystem.deviceKeyFor(inputSystem.mouse)).toBe('mouse')

        const unknownDevice = new InputDevice({name: 'Unknown'})
        expect(inputSystem.deviceKeyFor(unknownDevice)).toBeUndefined()
    })


    // ===== Binding Tests =====

    test('bindInput creates keyboard binding (auto-detected)', () => {
        const binding = inputSystem.bindInput({controlName: 'Space', actionName: 'jump'})

        expect(binding).toBeDefined()
        expect(binding.deviceName).toBe('keyboard')
        expect(binding.controlName).toBe('Space')
        expect(binding.actionName).toBe('jump')
    })


    test('bindInput creates mouse binding (auto-detected)', () => {
        const binding = inputSystem.bindInput({controlName: 'leftButton', actionName: 'fire'})

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
        inputSystem.bindInput({controlName: 'Space', actionName: 'jump'})

        const spaceControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'Space'})
        spaceControl.press()

        expect(inputSystem.isActionPressed('jump')).toBe(true)
    })


    test('isActionPressed works with multiple bindings', () => {
        inputSystem.bindInput({controlName: 'Space', actionName: 'jump', controllerName: 'player1'})
        inputSystem.bindInput({controlName: 'KeyW', actionName: 'jump', controllerName: 'player2'})

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
        inputSystem.bindInput({controlName: 'Space', actionName: 'jump'})

        const spaceControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'Space'})

        const controls = inputSystem.getActionControls('jump')
        expect(controls).toHaveLength(1)
        expect(controls[0]).toBe(spaceControl)
    })


    test('emits input:triggered event when control is pressed', async () => {
        inputSystem.bindInput({controlName: 'Space', actionName: 'jump'})

        const triggeredListener = vi.fn()
        mockHost.on('input:triggered', triggeredListener)

        const spaceControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'Space'})

        spaceControl.press({code: 'Space'})

        await new Promise(resolve => setTimeout(resolve, 0))

        expect(triggeredListener).toHaveBeenCalled()
        expect(triggeredListener).toHaveBeenCalledWith(
            expect.objectContaining({actionName: 'jump'}),
            expect.anything(),
            expect.anything()
        )
    })


    test('emits control events', async () => {
        const pressedListener = vi.fn()
        const releasedListener = vi.fn()

        inputSystem.on('control:pressed', pressedListener)
        inputSystem.on('control:released', releasedListener)

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





    test('constructor accepts inputBinder data', () => {
        const bindings = [
            {
                deviceName: 'keyboard',
                controlName: 'Space',
                actionName: 'jump'
            }
        ]

        const customInputSystem = new InputSystem({
            bindings
        })

        expect(customInputSystem.inputBinder.hasBinding({actionName: 'jump'})).toBe(true)
    })


    describe('getDirection', () => {

        beforeEach(() => {
            // Setup WASD bindings
            inputSystem.bindInput({controlName: 'KeyW', actionName: 'moveUp'})
            inputSystem.bindInput({controlName: 'KeyA', actionName: 'moveLeft'})
            inputSystem.bindInput({controlName: 'KeyS', actionName: 'moveDown'})
            inputSystem.bindInput({controlName: 'KeyD', actionName: 'moveRight'})
        })


        test('returns zero vector when no keys pressed', () => {
            const dir = inputSystem.getDirection()

            expect(dir.x).toBe(0)
            expect(dir.y).toBe(0)
        })


        test('returns up vector when W pressed', () => {
            const wControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'KeyW'})
            wControl.press()

            const dir = inputSystem.getDirection()

            expect(dir.x).toBe(0)
            expect(dir.y).toBe(1)
        })


        test('returns normalized diagonal when W+D pressed', () => {
            const wControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'KeyW'})
            const dControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'KeyD'})
            wControl.press()
            dControl.press()

            const dir = inputSystem.getDirection()

            // Diagonal should be normalized (≈0.707, 0.707)
            expect(dir.x).toBeCloseTo(Math.SQRT1_2, 5)
            expect(dir.y).toBeCloseTo(Math.SQRT1_2, 5)
            expect(dir.length()).toBeCloseTo(1, 5)
        })


        test('returns left vector when A pressed', () => {
            const aControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'KeyA'})
            aControl.press()

            const dir = inputSystem.getDirection()

            expect(dir.x).toBe(-1)
            expect(dir.y).toBe(0)
        })


        test('cancels opposite directions', () => {
            const wControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'KeyW'})
            const sControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'KeyS'})
            wControl.press()
            sControl.press()

            const dir = inputSystem.getDirection()

            expect(dir.x).toBe(0)
            expect(dir.y).toBe(0)
        })


        test('works with custom direction name', () => {
            inputSystem.bindInput({controlName: 'ArrowUp', actionName: 'aimUp'})
            inputSystem.bindInput({controlName: 'ArrowDown', actionName: 'aimDown'})
            inputSystem.bindInput({controlName: 'ArrowLeft', actionName: 'aimLeft'})
            inputSystem.bindInput({controlName: 'ArrowRight', actionName: 'aimRight'})

            const upControl = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: 'ArrowUp'})
            upControl.press()

            const dir = inputSystem.getDirection('aim')

            expect(dir.x).toBe(0)
            expect(dir.y).toBe(1)
        })


        test('returns correct vector for all 8 directions', () => {
            const testDirections = [
                {keys: ['KeyW'], expected: {x: 0, y: 1}},
                {keys: ['KeyD'], expected: {x: 1, y: 0}},
                {keys: ['KeyS'], expected: {x: 0, y: -1}},
                {keys: ['KeyA'], expected: {x: -1, y: 0}},
                {keys: ['KeyW', 'KeyD'], expected: {x: Math.SQRT1_2, y: Math.SQRT1_2}},
                {keys: ['KeyS', 'KeyD'], expected: {x: Math.SQRT1_2, y: -Math.SQRT1_2}},
                {keys: ['KeyS', 'KeyA'], expected: {x: -Math.SQRT1_2, y: -Math.SQRT1_2}},
                {keys: ['KeyW', 'KeyA'], expected: {x: -Math.SQRT1_2, y: Math.SQRT1_2}}
            ]

            testDirections.forEach(({keys, expected}) => {
                ['KeyW', 'KeyA', 'KeyS', 'KeyD'].forEach(key => { // eslint-disable-line max-nested-callbacks
                    const control = inputSystem.keyboard.getControl(key)
                    if (control) {
                        control.release()
                    }
                })

                keys.forEach(key => { // eslint-disable-line max-nested-callbacks
                    const control = inputSystem.keyboard.findOrCreateControl(ButtonControl, {name: key})
                    control.press()
                })

                const dir = inputSystem.getDirection()
                expect(dir.x).toBeCloseTo(expected.x, 5)
                expect(dir.y).toBeCloseTo(expected.y, 5)
            })
        })

    })

})
