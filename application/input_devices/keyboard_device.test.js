import KeyboardDevice from './keyboard_device'
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
    })


    test('static properties', () => {
        expect(KeyboardDevice.controls).toContain('key')
        expect(KeyboardDevice.methods).toContain('isKeyPressed')
        expect(KeyboardDevice.methods).toContain('isKeyModifierPressed')
        expect(KeyboardDevice.methods).toContain('getPressedKeys')
        expect(KeyboardDevice.methods).toContain('getPressedKeyModifiers')
        expect(KeyboardDevice.events).toContain('keydown')
        expect(KeyboardDevice.events).toContain('keyup')
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


    test('keydown event', () => {
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
    })


    test('keyup event', () => {
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
        
        const event = new KeyboardEvent('keydown', {
            code: 'AltLeft',
            key: 'Alt'
        })
        
        Object.defineProperty(event, 'getModifierState', {
            value: (key) => key === 'Alt'
        })
        
        window.dispatchEvent(event)
        
        expect(typeof keyboardDevice.isKeyModifierPressed('Alt')).toBe('boolean')
    })

})
