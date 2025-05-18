import Keyboard from './keyboard'
import {vi} from 'vitest'


describe(Keyboard, () => {

    let keyboard

    beforeEach(() => {
        keyboard = new Keyboard()
        keyboard.start()
    })

    afterEach(() => {
        keyboard.stop()
    })


    test('constructor', () => {
        expect(keyboard.pressedKeys).toEqual({})
        expect(keyboard.pressedModifiers).toEqual({})
        expect(keyboard.name).toBe('Keyboard')
    })


    test('static properties', () => {
        expect(Keyboard.controls).toContain('key')
        expect(Keyboard.methods).toContain('isKeyPressed')
        expect(Keyboard.methods).toContain('isKeyModifierPressed')
        expect(Keyboard.methods).toContain('getPressedKeys')
        expect(Keyboard.methods).toContain('getPressedKeyModifiers')
        expect(Keyboard.events).toContain('keydown')
        expect(Keyboard.events).toContain('keyup')
    })


    test('observe and unobserve', () => {
        const testKeyboard = new Keyboard()
        
        expect(testKeyboard.keyboardListeners).toBeUndefined()
        
        testKeyboard.observe()
        expect(testKeyboard.keyboardListeners).toBeDefined()
        expect(typeof testKeyboard.keyboardListeners.keydown).toBe('function')
        expect(typeof testKeyboard.keyboardListeners.keyup).toBe('function')
        
        testKeyboard.unobserve()
        expect(testKeyboard.keyboardListeners).toBeUndefined()
    })


    test('keydown event', () => {
        const listener = vi.fn()
        keyboard.on('keydown', listener)

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
        
        expect(keyboard.isKeyPressed('KeyA')).toBe(true)
    })


    test('keyup event', () => {
        const listener = vi.fn()
        keyboard.on('keyup', listener)

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
        
        expect(keyboard.isKeyPressed('KeyB')).toBe(false)
    })


    test('key modifiers', () => {
        const listener = vi.fn()
        keyboard.on('keydown', listener)

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
        
        expect(keyboard.isKeyModifierPressed('Shift')).toBe(true)
        expect(keyboard.getPressedKeyModifiers()).toContain('Shift')
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

        const pressedKeys = keyboard.getPressedKeys()
        expect(pressedKeys).toContain('KeyA')
        expect(pressedKeys).toContain('KeyB')
        expect(pressedKeys.length).toBe(2)
    })


    test('repeat flag', () => {
        const listener = vi.fn()
        keyboard.on('keydown', listener)

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
        keyboard.on('keydown', keydownListener)

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
        
        expect(keyboard.isKeyModifierPressed('Control')).toBe(true)
        expect(keyboard.isKeyModifierPressed('Shift')).toBe(true)
    })


    test('isKeyPressed returns boolean', () => {
        expect(typeof keyboard.isKeyPressed('NonExistentKey')).toBe('boolean')
        
        window.dispatchEvent(new KeyboardEvent('keydown', {
            code: 'KeyD',
            key: 'd'
        }))
        
        expect(typeof keyboard.isKeyPressed('KeyD')).toBe('boolean')
    })


    test('isKeyModifierPressed returns boolean', () => {
        expect(typeof keyboard.isKeyModifierPressed('NonExistentModifier')).toBe('boolean')
        
        const event = new KeyboardEvent('keydown', {
            code: 'AltLeft',
            key: 'Alt'
        })
        
        Object.defineProperty(event, 'getModifierState', {
            value: (key) => key === 'Alt'
        })
        
        window.dispatchEvent(event)
        
        expect(typeof keyboard.isKeyModifierPressed('Alt')).toBe('boolean')
    })

})
