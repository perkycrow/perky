import InputManager from './input_manager'
import InputDevice from './input_device'
import ButtonControl from './input_controls/button_control'
import {vi} from 'vitest'


describe(InputManager, () => {

    test('registerDevice', () => {
        const manager = new InputManager()
        const device = manager.registerDevice(InputDevice, {$name: 'keyboard', $bind: 'keyboard', name: 'TestDevice'})

        expect(manager.getDevice('keyboard')).toBe(device)
        expect(device.host).toBe(manager)
        expect(manager.keyboard).toBe(device)
    })


    test('registerDevice with duplicate name replaces device', () => {
        const manager = new InputManager()
        manager.registerDevice(InputDevice, {$name: 'test', $bind: 'test', name: 'Device1'})
        const device2 = manager.registerDevice(InputDevice, {$name: 'test', $bind: 'test', name: 'Device2'})

        expect(manager.getDevice('test')).toBe(device2)
        expect(manager.test).toBe(device2)
    })


    test('registerDevice creates device properly', () => {
        const manager = new InputManager()
        const device = manager.registerDevice(InputDevice, {$name: 'test', $bind: 'test', name: 'TestDevice'})

        expect(device).toBeDefined()
        expect(device.name).toBe('TestDevice')
        expect(manager.getDevice('test')).toBe(device)
    })


    test('isPressed', () => {
        const manager = new InputManager()
        const device = manager.registerDevice(InputDevice, {$name: 'keyboard', $bind: 'keyboard', name: 'TestDevice'})

        const button = device.findOrCreateControl(ButtonControl, {name: 'TestButton'})

        expect(manager.isPressed('keyboard', 'TestButton')).toBe(false)
        expect(manager.isPressed('nonExistent', 'TestButton')).toBe(false)
        expect(manager.isPressed('keyboard', 'nonExistent')).toBe(false)

        button.press()
        expect(manager.isPressed('keyboard', 'TestButton')).toBe(true)

        button.release()
        expect(manager.isPressed('keyboard', 'TestButton')).toBe(false)
    })


    test('getValueFor', () => {
        const manager = new InputManager()
        const device = manager.registerDevice(InputDevice, {$name: 'mouse', $bind: 'mouse', name: 'TestDevice'})

        const button = device.findOrCreateControl(ButtonControl, {name: 'TestButton'})
        button.value = 0.5

        expect(manager.getValueFor('mouse', 'TestButton')).toBe(0.5)
        expect(manager.getValueFor('nonExistent', 'TestButton')).toBeUndefined()
        expect(manager.getValueFor('mouse', 'nonExistent')).toBeUndefined()
    })


    test('getControl', () => {
        const manager = new InputManager()
        const device = manager.registerDevice(InputDevice, {$name: 'gamepad', $bind: 'gamepad', name: 'TestDevice'})

        const button = device.findOrCreateControl(ButtonControl, {name: 'TestButton'})

        expect(manager.getControl('gamepad', 'TestButton')).toBe(button)
        expect(manager.getControl('nonExistent', 'TestButton')).toBeNull()
        expect(manager.getControl('gamepad', 'nonExistent')).toBeUndefined()
    })


    test('automatic lifecycle management', () => {
        const manager = new InputManager()

        manager.lifecycle.start()
        const device = manager.registerDevice(InputDevice, {$name: 'auto', $bind: 'auto', name: 'TestDevice'})

        expect(device.started).toBe(true)
    })


    test('event forwarding', () => {
        const manager = new InputManager()
        const device = manager.registerDevice(InputDevice, {$name: 'test', $bind: 'test', name: 'TestDevice'})

        const pressedListener = vi.fn()
        const releasedListener = vi.fn()
        const updatedListener = vi.fn()

        manager.on('control:pressed', pressedListener)
        manager.on('control:released', releasedListener)
        manager.on('control:updated', updatedListener)

        const button = device.findOrCreateControl(ButtonControl, {name: 'TestButton'})

        button.press()
        expect(pressedListener).toHaveBeenCalledWith(button, null, device)

        button.release()
        expect(releasedListener).toHaveBeenCalledWith(button, null, device)

        button.setValue(0.5)
        expect(updatedListener).toHaveBeenCalled()
    })


    test('device events', () => {
        const manager = new InputManager()

        const deviceSetListener = vi.fn()
        manager.on('device:set', deviceSetListener)

        const device = manager.registerDevice(InputDevice, {$name: 'test', $bind: 'test', name: 'TestDevice'})

        expect(deviceSetListener).toHaveBeenCalledWith('test', device)
    })


    test('automatic device binding', () => {
        const manager = new InputManager()
        const keyboard = manager.registerDevice(InputDevice, {$name: 'keyboard', $bind: 'keyboard', name: 'KeyboardDevice'})
        const mouse = manager.registerDevice(InputDevice, {$name: 'mouse', $bind: 'mouse', name: 'MouseDevice'})


        expect(manager.keyboard).toBe(keyboard)
        expect(manager.mouse).toBe(mouse)
        expect(keyboard.host).toBe(manager)
        expect(mouse.host).toBe(manager)
    })


    test('isPressedAny', () => {
        const manager = new InputManager()
        const keyboard = manager.registerDevice(InputDevice, {$name: 'keyboard', $bind: 'keyboard', name: 'KeyboardDevice'})
        const gamepad = manager.registerDevice(InputDevice, {$name: 'gamepad', $bind: 'gamepad', name: 'GamepadDevice'})


        const keyW = keyboard.findOrCreateControl(ButtonControl, {name: 'KeyW'})
        const buttonA = gamepad.findOrCreateControl(ButtonControl, {name: 'ButtonA'})

        expect(manager.isPressedAny('KeyW')).toBe(false)
        expect(manager.isPressedAny('ButtonA')).toBe(false)
        expect(manager.isPressedAny('NonExistent')).toBe(false)

        keyW.press()
        expect(manager.isPressedAny('KeyW')).toBe(true)
        expect(manager.isPressedAny('ButtonA')).toBe(false)

        buttonA.press()
        expect(manager.isPressedAny('ButtonA')).toBe(true)
    })


    test('getValueAny', () => {
        const manager = new InputManager()
        const keyboard = manager.registerDevice(InputDevice, {$name: 'keyboard', $bind: 'keyboard', name: 'KeyboardDevice'})
        const mouse = manager.registerDevice(InputDevice, {$name: 'mouse', $bind: 'mouse', name: 'MouseDevice'})


        const keyW = keyboard.findOrCreateControl(ButtonControl, {name: 'KeyW'})
        const leftButton = mouse.findOrCreateControl(ButtonControl, {name: 'leftButton'})

        keyW.setValue(0.8)
        leftButton.setValue(0.5)

        expect(manager.getValueAny('KeyW')).toBe(0.8)
        expect(manager.getValueAny('leftButton')).toBe(0.5)
        expect(manager.getValueAny('NonExistent')).toBeUndefined()
    })


    test('getControlAny', () => {
        const manager = new InputManager()
        const keyboard = manager.registerDevice(InputDevice, {$name: 'keyboard', $bind: 'keyboard', name: 'KeyboardDevice'})
        const mouse = manager.registerDevice(InputDevice, {$name: 'mouse', $bind: 'mouse', name: 'MouseDevice'})


        const keyW = keyboard.findOrCreateControl(ButtonControl, {name: 'KeyW'})
        const leftButton = mouse.findOrCreateControl(ButtonControl, {name: 'leftButton'})

        expect(manager.getControlAny('KeyW')).toBe(keyW)
        expect(manager.getControlAny('leftButton')).toBe(leftButton)
        expect(manager.getControlAny('NonExistent')).toBeNull()
    })


    test('getAllPressed', () => {
        const manager = new InputManager()
        const keyboard = manager.registerDevice(InputDevice, {$name: 'keyboard', $bind: 'keyboard', name: 'KeyboardDevice'})
        const gamepad = manager.registerDevice(InputDevice, {$name: 'gamepad', $bind: 'gamepad', name: 'GamepadDevice'})


        const keyEnter = keyboard.findOrCreateControl(ButtonControl, {name: 'Enter'})
        const gamepadEnter = gamepad.findOrCreateControl(ButtonControl, {name: 'Enter'})

        expect(manager.getAllPressed('Enter')).toEqual([])

        keyEnter.press()
        expect(manager.getAllPressed('Enter')).toEqual([keyboard])

        gamepadEnter.press()
        expect(manager.getAllPressed('Enter')).toEqual([keyboard, gamepad])

        keyEnter.release()
        expect(manager.getAllPressed('Enter')).toEqual([gamepad])
    })


    test('getAllValues', () => {
        const manager = new InputManager()
        const device1 = manager.registerDevice(InputDevice, {$name: 'device1', $bind: 'device1', name: 'Device1'})
        const device2 = manager.registerDevice(InputDevice, {$name: 'device2', $bind: 'device2', name: 'Device2'})

        const control1 = device1.findOrCreateControl(ButtonControl, {name: 'SharedControl'})
        const control2 = device2.findOrCreateControl(ButtonControl, {name: 'SharedControl'})

        control1.setValue(0.3)
        control2.setValue(0.7)

        const values = manager.getAllValues('SharedControl')
        expect(values).toHaveLength(2)
        expect(values[0]).toEqual({device: device1, value: 0.3})
        expect(values[1]).toEqual({device: device2, value: 0.7})
    })


    test('addControl - explicit form', () => {
        const manager = new InputManager()
        const keyboard = manager.registerDevice(InputDevice, {$name: 'keyboard', $bind: 'keyboard', name: 'KeyboardDevice'})

        const control = manager.addControl('keyboard', ButtonControl, {
            name: 'TestKey',
            pressThreshold: 0.8
        })

        expect(control).toBeInstanceOf(ButtonControl)
        expect(control.name).toBe('TestKey')
        expect(control.pressThreshold).toBe(0.8)
        expect(keyboard.getControl('TestKey')).toBe(control)
    })


    test('addControl - shortcut form', () => {
        const manager = new InputManager()
        const keyboard = manager.registerDevice(InputDevice, {$name: 'keyboard', $bind: 'keyboard', name: 'KeyboardDevice'})
        const mouse = manager.registerDevice(InputDevice, {$name: 'mouse', $bind: 'mouse', name: 'MouseDevice'})


        const control = manager.addControl(ButtonControl, {
            name: 'ShortcutKey',
            pressThreshold: 0.6
        })

        expect(control).toBeInstanceOf(ButtonControl)
        expect(control.name).toBe('ShortcutKey')
        expect(control.pressThreshold).toBe(0.6)

        expect(keyboard.getControl('ShortcutKey')).toBe(control)
        expect(mouse.getControl('ShortcutKey')).toBeUndefined()
    })


    test('addControl - shortcut form with no devices', () => {
        const manager = new InputManager()

        expect(() => {
            manager.addControl(ButtonControl, {name: 'test'})
        }).toThrow('No devices available')
    })


    test('addControl with nonexistent device', () => {
        const manager = new InputManager()

        expect(() => {
            manager.addControl('nonexistent', ButtonControl, {name: 'test'})
        }).toThrow("Device 'nonexistent' not found")
    })


    test('addControlToFirst', () => {
        const manager = new InputManager()
        const keyboard = manager.registerDevice(InputDevice, {$name: 'keyboard', $bind: 'keyboard', name: 'KeyboardDevice'})
        const mouse = manager.registerDevice(InputDevice, {$name: 'mouse', $bind: 'mouse', name: 'MouseDevice'})


        const control = manager.addControlToFirst(ButtonControl, {
            name: 'FirstDeviceControl'
        })

        expect(control).toBeInstanceOf(ButtonControl)
        expect(control.name).toBe('FirstDeviceControl')

        expect(keyboard.getControl('FirstDeviceControl')).toBe(control)
        expect(mouse.getControl('FirstDeviceControl')).toBeUndefined()
    })


    test('addControlToFirst with no devices', () => {
        const manager = new InputManager()

        expect(() => {
            manager.addControlToFirst(ButtonControl, {name: 'test'})
        }).toThrow('No devices available')
    })


    test('addControlToAll', () => {
        const manager = new InputManager()
        const keyboard = manager.registerDevice(InputDevice, {$name: 'keyboard', $bind: 'keyboard', name: 'KeyboardDevice'})
        const mouse = manager.registerDevice(InputDevice, {$name: 'mouse', $bind: 'mouse', name: 'MouseDevice'})


        const results = manager.addControlToAll(ButtonControl, {
            name: 'SharedControl'
        })

        expect(results).toHaveLength(2)
        expect(results[0].device).toBe(keyboard)
        expect(results[0].control).toBeInstanceOf(ButtonControl)
        expect(results[0].control.name).toBe('SharedControl')
        expect(results[1].device).toBe(mouse)
        expect(results[1].control).toBeInstanceOf(ButtonControl)
        expect(results[1].control.name).toBe('SharedControl')

        expect(keyboard.getControl('SharedControl')).toBe(results[0].control)
        expect(mouse.getControl('SharedControl')).toBe(results[1].control)
    })


    test('deviceKeyFor', () => {
        const manager = new InputManager()
        const keyboard = manager.registerDevice(InputDevice, {$name: 'keyboard', $bind: 'keyboard', name: 'KeyboardDevice'})
        const mouse = manager.registerDevice(InputDevice, {$name: 'mouse', $bind: 'mouse', name: 'MouseDevice'})


        expect(manager.deviceKeyFor(keyboard)).toBe('keyboard')
        expect(manager.deviceKeyFor(mouse)).toBe('mouse')

        const unknownDevice = new InputDevice({name: 'Unknown'})
        expect(manager.deviceKeyFor(unknownDevice)).toBeUndefined()
    })


    test('constructor - no default devices', () => {
        const manager = new InputManager()

        expect(manager.getDevice('keyboard')).toBeNull()
        expect(manager.getDevice('mouse')).toBeNull()
    })

})
