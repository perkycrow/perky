import InputManager from './input_manager'
import InputDevice from './input_device'
import ButtonControl from './input_controls/button_control'
import {vi} from 'vitest'


describe(InputManager, () => {

    test('InputManager', () => {
        const manager = new InputManager()

        expect(manager.devices).toBeDefined()
        expect(manager.devices.size).toBe(0)
    })


    test('registerDevice', () => {
        const manager = new InputManager()
        const device = new InputDevice({name: 'TestDevice'})

        manager.registerDevice('keyboard', device)
        expect(manager.getDevice('keyboard')).toBe(device)
        expect(device.host).toBe(manager)
        expect(manager.keyboard).toBe(device)
    })


    test('registerDevice with duplicate name replaces device', () => {
        const manager = new InputManager()
        const device1 = new InputDevice({name: 'Device1'})
        const device2 = new InputDevice({name: 'Device2'})

        manager.registerDevice('test', device1)
        manager.registerDevice('test', device2)

        expect(manager.getDevice('test')).toBe(device2)
        expect(manager.test).toBe(device2)
    })


    test('registerDevice with invalid device', () => {
        const manager = new InputManager()

        expect(() => manager.registerDevice('test', null)).toThrow('Device must have a name')
        expect(() => manager.registerDevice('test', {})).toThrow('Device must have a name')
    })


    test('isPressed', () => {
        const manager = new InputManager()
        const device = new InputDevice({name: 'TestDevice'})
        manager.registerDevice('keyboard', device)

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
        const device = new InputDevice({name: 'TestDevice'})
        manager.registerDevice('mouse', device)

        const button = device.findOrCreateControl(ButtonControl, {name: 'TestButton'})
        button.value = 0.5

        expect(manager.getValueFor('mouse', 'TestButton')).toBe(0.5)
        expect(manager.getValueFor('nonExistent', 'TestButton')).toBeUndefined()
        expect(manager.getValueFor('mouse', 'nonExistent')).toBeUndefined()
    })


    test('getControl', () => {
        const manager = new InputManager()
        const device = new InputDevice({name: 'TestDevice'})
        manager.registerDevice('gamepad', device)

        const button = device.findOrCreateControl(ButtonControl, {name: 'TestButton'})

        expect(manager.getControl('gamepad', 'TestButton')).toBe(button)
        expect(manager.getControl('nonExistent', 'TestButton')).toBeNull()
        expect(manager.getControl('gamepad', 'nonExistent')).toBeUndefined()
    })


    test('automatic lifecycle management', () => {
        const manager = new InputManager()
        const device = new InputDevice({name: 'TestDevice'})

        const lifecycleStartSpy = vi.spyOn(device.lifecycle, 'start')

        manager.lifecycle.start()  // Start the manager first

        manager.registerDevice('auto', device)  // Then register the device

        expect(lifecycleStartSpy).toHaveBeenCalled()
    })


    test('event forwarding', () => {
        const manager = new InputManager()
        const device = new InputDevice({name: 'TestDevice'})
        manager.registerDevice('test', device)

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
        expect(updatedListener).toHaveBeenCalledWith(button, 0.5, 0, undefined, device)
    })


    test('device events', () => {
        const manager = new InputManager()
        const device = new InputDevice({name: 'TestDevice'})

        const deviceSetListener = vi.fn()
        const registeredListener = vi.fn()

        manager.on('device:set', deviceSetListener)
        device.on('registered', registeredListener)

        manager.registerDevice('eventTest', device)

        expect(deviceSetListener).toHaveBeenCalledWith('eventTest', device)
        expect(registeredListener).toHaveBeenCalledWith(manager, 'eventTest')
    })


    test('automatic device binding', () => {
        const manager = new InputManager()
        const keyboard = new InputDevice({name: 'KeyboardDevice'})
        const mouse = new InputDevice({name: 'MouseDevice'})

        manager.registerDevice('keyboard', keyboard)
        manager.registerDevice('mouse', mouse)

        expect(manager.keyboard).toBe(keyboard)
        expect(manager.mouse).toBe(mouse)
        expect(keyboard.host).toBe(manager)
        expect(mouse.host).toBe(manager)
    })


    test('isPressedAny', () => {
        const manager = new InputManager()
        const keyboard = new InputDevice({name: 'KeyboardDevice'})
        const gamepad = new InputDevice({name: 'GamepadDevice'})

        manager.registerDevice('keyboard', keyboard)
        manager.registerDevice('gamepad', gamepad)

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
        const keyboard = new InputDevice({name: 'KeyboardDevice'})
        const mouse = new InputDevice({name: 'MouseDevice'})

        manager.registerDevice('keyboard', keyboard)
        manager.registerDevice('mouse', mouse)

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
        const keyboard = new InputDevice({name: 'KeyboardDevice'})
        const mouse = new InputDevice({name: 'MouseDevice'})

        manager.registerDevice('keyboard', keyboard)
        manager.registerDevice('mouse', mouse)

        const keyW = keyboard.findOrCreateControl(ButtonControl, {name: 'KeyW'})
        const leftButton = mouse.findOrCreateControl(ButtonControl, {name: 'leftButton'})

        expect(manager.getControlAny('KeyW')).toBe(keyW)
        expect(manager.getControlAny('leftButton')).toBe(leftButton)
        expect(manager.getControlAny('NonExistent')).toBeNull()
    })


    test('getAllPressed', () => {
        const manager = new InputManager()
        const keyboard = new InputDevice({name: 'KeyboardDevice'})
        const gamepad = new InputDevice({name: 'GamepadDevice'})

        manager.registerDevice('keyboard', keyboard)
        manager.registerDevice('gamepad', gamepad)

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
        const device1 = new InputDevice({name: 'Device1'})
        const device2 = new InputDevice({name: 'Device2'})

        manager.registerDevice('device1', device1)
        manager.registerDevice('device2', device2)

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
        const keyboard = new InputDevice({name: 'KeyboardDevice'})
        manager.registerDevice('keyboard', keyboard)

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
        const keyboard = new InputDevice({name: 'KeyboardDevice'})
        const mouse = new InputDevice({name: 'MouseDevice'})

        manager.registerDevice('keyboard', keyboard)
        manager.registerDevice('mouse', mouse)

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
        const keyboard = new InputDevice({name: 'KeyboardDevice'})
        const mouse = new InputDevice({name: 'MouseDevice'})

        manager.registerDevice('keyboard', keyboard)
        manager.registerDevice('mouse', mouse)

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
        const keyboard = new InputDevice({name: 'KeyboardDevice'})
        const mouse = new InputDevice({name: 'MouseDevice'})

        manager.registerDevice('keyboard', keyboard)
        manager.registerDevice('mouse', mouse)

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
        const keyboard = new InputDevice({name: 'KeyboardDevice'})
        const mouse = new InputDevice({name: 'MouseDevice'})

        manager.registerDevice('keyboard', keyboard)
        manager.registerDevice('mouse', mouse)

        expect(manager.deviceKeyFor(keyboard)).toBe('keyboard')
        expect(manager.deviceKeyFor(mouse)).toBe('mouse')

        const unknownDevice = new InputDevice({name: 'Unknown'})
        expect(manager.deviceKeyFor(unknownDevice)).toBeUndefined()
    })


    test('constructor - no default devices', () => {
        const manager = new InputManager()

        expect(manager.devices.size).toBe(0)
        expect(manager.getDevice('keyboard')).toBeUndefined()
        expect(manager.getDevice('mouse')).toBeUndefined()
    })

})
