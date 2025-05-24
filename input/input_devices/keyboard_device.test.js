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


    test('modifiers are properly reset on keyup', () => {
        const keydownEvent = new KeyboardEvent('keydown', {
            code: 'KeyA',
            key: 'a',
            ctrlKey: true,
            shiftKey: true
        })
        
        Object.defineProperty(keydownEvent, 'getModifierState', {
            value: (key) => key === 'Control' || key === 'Shift'
        })
        
        window.dispatchEvent(keydownEvent)
        
        expect(keyboardDevice.isKeyModifierPressed('Control')).toBe(true)
        expect(keyboardDevice.isKeyModifierPressed('Shift')).toBe(true)
        expect(keyboardDevice.getPressedKeyModifiers()).toContain('Control')
        expect(keyboardDevice.getPressedKeyModifiers()).toContain('Shift')

        const keyupEventA = new KeyboardEvent('keyup', {
            code: 'KeyA',
            key: 'a',
            ctrlKey: true,
            shiftKey: true
        })
        
        Object.defineProperty(keyupEventA, 'getModifierState', {
            value: (key) => key === 'Control' || key === 'Shift'
        })
        
        window.dispatchEvent(keyupEventA)
        
        expect(keyboardDevice.isKeyModifierPressed('Control')).toBe(true)
        expect(keyboardDevice.isKeyModifierPressed('Shift')).toBe(true)
        
        const keyupEventShift = new KeyboardEvent('keyup', {
            code: 'ShiftLeft',
            key: 'Shift',
            ctrlKey: true,
            shiftKey: false
        })
        
        Object.defineProperty(keyupEventShift, 'getModifierState', {
            value: (key) => key === 'Control'
        })
        
        window.dispatchEvent(keyupEventShift)
        
        expect(keyboardDevice.isKeyModifierPressed('Control')).toBe(true)
        expect(keyboardDevice.isKeyModifierPressed('Shift')).toBe(false)
        expect(keyboardDevice.getPressedKeyModifiers()).toContain('Control')
        expect(keyboardDevice.getPressedKeyModifiers()).not.toContain('Shift')
        
        const keyupEventCtrl = new KeyboardEvent('keyup', {
            code: 'ControlLeft',
            key: 'Control',
            ctrlKey: false,
            shiftKey: false
        })
        
        Object.defineProperty(keyupEventCtrl, 'getModifierState', {
            value: () => false
        })
        
        window.dispatchEvent(keyupEventCtrl)
        
        expect(keyboardDevice.isKeyModifierPressed('Control')).toBe(false)
        expect(keyboardDevice.isKeyModifierPressed('Shift')).toBe(false)
        expect(keyboardDevice.getPressedKeyModifiers()).toEqual([])
    })


    test('Meta key release clears non-modifier keys (macOS behavior)', () => {
        const keydownMeta = new KeyboardEvent('keydown', {
            code: 'MetaLeft',
            key: 'Meta',
            metaKey: true
        })
        
        Object.defineProperty(keydownMeta, 'getModifierState', {
            value: (key) => key === 'Meta'
        })
        
        window.dispatchEvent(keydownMeta)
        
        const keydownC = new KeyboardEvent('keydown', {
            code: 'KeyC',
            key: 'c',
            metaKey: true
        })
        
        Object.defineProperty(keydownC, 'getModifierState', {
            value: (key) => key === 'Meta'
        })
        
        window.dispatchEvent(keydownC)
        
        expect(keyboardDevice.isKeyPressed('MetaLeft')).toBe(true)
        expect(keyboardDevice.isKeyPressed('KeyC')).toBe(true)
        expect(keyboardDevice.isKeyModifierPressed('Meta')).toBe(true)
        
        const keyupMeta = new KeyboardEvent('keyup', {
            code: 'MetaLeft',
            key: 'Meta',
            metaKey: false
        })
        
        Object.defineProperty(keyupMeta, 'getModifierState', {
            value: () => false
        })
        
        window.dispatchEvent(keyupMeta)
        
        expect(keyboardDevice.isKeyPressed('MetaLeft')).toBe(false)
        expect(keyboardDevice.isKeyPressed('KeyC')).toBe(false)
        expect(keyboardDevice.isKeyModifierPressed('Meta')).toBe(false)
        expect(keyboardDevice.getPressedKeys()).toEqual([])
    })


    test('blur event clears all keys', () => {
        const blurListener = vi.fn()
        keyboardDevice.on('blur', blurListener)
        
        window.dispatchEvent(new KeyboardEvent('keydown', {
            code: 'KeyA',
            key: 'a'
        }))
        
        window.dispatchEvent(new KeyboardEvent('keydown', {
            code: 'KeyB',
            key: 'b'
        }))
        
        const shiftEvent = new KeyboardEvent('keydown', {
            code: 'ShiftLeft',
            key: 'Shift'
        })
        
        Object.defineProperty(shiftEvent, 'getModifierState', {
            value: (key) => key === 'Shift'
        })
        
        window.dispatchEvent(shiftEvent)
        
        expect(keyboardDevice.getPressedKeys()).toContain('KeyA')
        expect(keyboardDevice.getPressedKeys()).toContain('KeyB')
        expect(keyboardDevice.getPressedKeys()).toContain('ShiftLeft')
        expect(keyboardDevice.isKeyModifierPressed('Shift')).toBe(true)
        
        window.dispatchEvent(new Event('blur'))

        expect(blurListener).toHaveBeenCalled()

        expect(keyboardDevice.getPressedKeys()).toEqual([])
        expect(keyboardDevice.getPressedKeyModifiers()).toEqual([])
        expect(keyboardDevice.isKeyPressed('KeyA')).toBe(false)
        expect(keyboardDevice.isKeyPressed('KeyB')).toBe(false) 
        expect(keyboardDevice.isKeyPressed('ShiftLeft')).toBe(false)
        expect(keyboardDevice.isKeyModifierPressed('Shift')).toBe(false)
    })

})
