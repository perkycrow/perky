import KeyboardDevice from './keyboard_device'
import KeyControl from '../input_controls/key_control'
import {vi} from 'vitest'


describe(KeyboardDevice, () => {

    let keyboardDevice

    beforeEach(() => {
        keyboardDevice = new KeyboardDevice()
        keyboardDevice.start()
    })

    afterEach(() => {
        keyboardDevice.stop()
    })


    test('constructor', () => {
        expect(keyboardDevice.pressedKeys).toEqual({})
        expect(keyboardDevice.pressedModifiers).toEqual({})
        expect(keyboardDevice.name).toBe('KeyboardDevice')
        expect(keyboardDevice.controls).toBeInstanceOf(Map)
    })


    test('static properties', () => {
        expect(KeyboardDevice.methods).toContain('isKeyPressed')
        expect(KeyboardDevice.methods).toContain('isKeyModifierPressed')
        expect(KeyboardDevice.methods).toContain('getPressedKeys')
        expect(KeyboardDevice.methods).toContain('getPressedKeyModifiers')
        expect(KeyboardDevice.events).toContain('keydown')
        expect(KeyboardDevice.events).toContain('keyup')
    })


    test('getOrCreateKeyControl creates new control', () => {
        const control = keyboardDevice.getOrCreateKeyControl('KeyA', 'a')
        
        expect(control).toBeInstanceOf(KeyControl)
        expect(control.name).toBe('KeyA')
        expect(control.displayName).toBe('A')
        expect(control.device).toBe(keyboardDevice)
        expect(keyboardDevice.getControl('KeyA')).toBe(control)
    })


    test('getOrCreateKeyControl returns existing control', () => {
        const control1 = keyboardDevice.getOrCreateKeyControl('KeyB', 'b')
        const control2 = keyboardDevice.getOrCreateKeyControl('KeyB', 'b')
        
        expect(control1).toBe(control2)
        expect(keyboardDevice.controls.size).toBe(1)
    })


    test('getOrCreateKeyControl with special keys', () => {
        const spaceControl = keyboardDevice.getOrCreateKeyControl('Space', ' ')
        const enterControl = keyboardDevice.getOrCreateKeyControl('Enter', 'Enter')
        const arrowControl = keyboardDevice.getOrCreateKeyControl('ArrowUp', 'ArrowUp')
        
        expect(spaceControl.displayName).toBe('Space')
        expect(enterControl.displayName).toBe('Enter')
        expect(arrowControl.displayName).toBe('↑')
    })


    test('observe and unobserve', () => {
        const testKeyboardDevice = new KeyboardDevice()
        
        expect(testKeyboardDevice.keyboardListeners).toBeUndefined()
        
        testKeyboardDevice.observe()
        expect(testKeyboardDevice.keyboardListeners).toBeDefined()
        expect(typeof testKeyboardDevice.keyboardListeners.keydown).toBe('function')
        expect(typeof testKeyboardDevice.keyboardListeners.keyup).toBe('function')
        
        testKeyboardDevice.unobserve()
        expect(testKeyboardDevice.keyboardListeners).toBeUndefined()
    })


    test('keydown event creates and updates control', () => {
        const listener = vi.fn()
        keyboardDevice.on('keydown', listener)

        const event = new KeyboardEvent('keydown', {
            code: 'KeyA',
            key: 'a'
        })
        window.dispatchEvent(event)

        expect(listener).toHaveBeenCalled()
        const keyState = listener.mock.calls[0][0]
        expect(keyState.code).toBe('KeyA')
        expect(keyState.key).toBe('a')
        expect(keyState.repeat).toBe(false)
        
        expect(keyboardDevice.isKeyPressed('KeyA')).toBe(true)
        
        const control = keyboardDevice.getControl('KeyA')
        expect(control).toBeInstanceOf(KeyControl)
        expect(control.isPressed()).toBe(true)
        expect(control.getValue()).toBe(1)
    })


    test('keyup event updates control', () => {
        const listener = vi.fn()
        keyboardDevice.on('keyup', listener)

        window.dispatchEvent(new KeyboardEvent('keydown', {
            code: 'KeyB',
            key: 'b'
        }))
        
        window.dispatchEvent(new KeyboardEvent('keyup', {
            code: 'KeyB',
            key: 'b'
        }))

        expect(listener).toHaveBeenCalled()
        const keyState = listener.mock.calls[0][0]
        expect(keyState.code).toBe('KeyB')
        expect(keyState.key).toBe('b')
        
        expect(keyboardDevice.isKeyPressed('KeyB')).toBe(false)
        
        const control = keyboardDevice.getControl('KeyB')
        expect(control).toBeInstanceOf(KeyControl)
        expect(control.isPressed()).toBe(false)
        expect(control.getValue()).toBe(0)
    })


    test('blur event releases all controls', () => {
        window.dispatchEvent(new KeyboardEvent('keydown', {code: 'KeyA', key: 'a'}))
        window.dispatchEvent(new KeyboardEvent('keydown', {code: 'KeyB', key: 'b'}))
        
        const controlA = keyboardDevice.getControl('KeyA')
        const controlB = keyboardDevice.getControl('KeyB')
        
        expect(controlA.isPressed()).toBe(true)
        expect(controlB.isPressed()).toBe(true)
        
        window.dispatchEvent(new Event('blur'))

        expect(controlA.isPressed()).toBe(false)
        expect(controlB.isPressed()).toBe(false)
        expect(keyboardDevice.pressedKeys).toEqual({})
    })


    test('key modifiers', () => {
        const listener = vi.fn()
        keyboardDevice.on('keydown', listener)

        const event = new KeyboardEvent('keydown', {
            code: 'ShiftLeft',
            key: 'Shift',
            shiftKey: true
        })

        Object.defineProperty(event, 'getModifierState', {
            value: (key) => key === 'Shift'
        })
        
        window.dispatchEvent(event)

        expect(listener).toHaveBeenCalled()
        const keyState = listener.mock.calls[0][0]
        expect(keyState.modifiers.Shift).toBe(true)
        
        expect(keyboardDevice.isKeyModifierPressed('Shift')).toBe(true)
        expect(keyboardDevice.getPressedKeyModifiers()).toContain('Shift')
        
        const shiftControl = keyboardDevice.getControl('ShiftLeft')
        expect(shiftControl.displayName).toBe('Left Shift')
        expect(shiftControl.isPressed()).toBe(true)
    })


    test('getPressedKeys', () => {
        window.dispatchEvent(new KeyboardEvent('keydown', {
            code: 'KeyA',
            key: 'a'
        }))
        
        window.dispatchEvent(new KeyboardEvent('keydown', {
            code: 'KeyB',
            key: 'b'
        }))

        const pressedKeys = keyboardDevice.getPressedKeys()
        expect(pressedKeys).toContain('KeyA')
        expect(pressedKeys).toContain('KeyB')
        expect(pressedKeys.length).toBe(2)
    })


    test('repeat flag', () => {
        const listener = vi.fn()
        keyboardDevice.on('keydown', listener)

        window.dispatchEvent(new KeyboardEvent('keydown', {
            code: 'KeyC',
            key: 'c',
            repeat: false
        }))

        window.dispatchEvent(new KeyboardEvent('keydown', {
            code: 'KeyC',
            key: 'c',
            repeat: true
        }))

        expect(listener).toHaveBeenCalledTimes(2)
        expect(listener.mock.calls[0][0].repeat).toBe(false)
        expect(listener.mock.calls[1][0].repeat).toBe(true)
        
        const control = keyboardDevice.getControl('KeyC')
        expect(control.isPressed()).toBe(true)
    })


    test('multiple modifiers', () => {
        const keydownListener = vi.fn()
        keyboardDevice.on('keydown', keydownListener)

        const event = new KeyboardEvent('keydown', {
            code: 'ControlLeft',
            key: 'Control',
            ctrlKey: true
        })

        Object.defineProperty(event, 'getModifierState', {
            value: (key) => key === 'Control' || key === 'Shift'
        })
        
        window.dispatchEvent(event)

        expect(keydownListener).toHaveBeenCalled()
        const keyState = keydownListener.mock.calls[0][0]
        expect(keyState.modifiers.Control).toBe(true)
        expect(keyState.modifiers.Shift).toBe(true)
        
        expect(keyboardDevice.isKeyModifierPressed('Control')).toBe(true)
        expect(keyboardDevice.isKeyModifierPressed('Shift')).toBe(true)
    })


    test('isKeyPressed returns boolean', () => {
        expect(typeof keyboardDevice.isKeyPressed('NonExistentKey')).toBe('boolean')
        
        window.dispatchEvent(new KeyboardEvent('keydown', {
            code: 'KeyD',
            key: 'd'
        }))
        
        expect(typeof keyboardDevice.isKeyPressed('KeyD')).toBe('boolean')
    })


    test('isKeyModifierPressed returns boolean', () => {
        expect(typeof keyboardDevice.isKeyModifierPressed('NonExistentModifier')).toBe('boolean')
    })

})
