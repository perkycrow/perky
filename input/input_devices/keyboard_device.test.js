import KeyboardDevice from './keyboard_device.js'
import InputDevice from '../input_device.js'
import ButtonControl from '../input_controls/button_control.js'
import {vi} from 'vitest'


function createKeyEvent (code, options = {}) {
    const {target = document.body, key = null, preventDefault = vi.fn(), stopPropagation = vi.fn()} = options
    return {
        code,
        key,
        target,
        preventDefault,
        stopPropagation,
        composedPath: () => [target, document.body, document, window]
    }
}


describe(KeyboardDevice, () => {
    let device
    let mockContainer


    beforeEach(() => {
        mockContainer = {
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        }

        device = new KeyboardDevice({
            container: mockContainer,
            $id: 'testKeyboard'
        })
    })


    test('constructor', () => {
        expect(device).toBeInstanceOf(InputDevice)
        expect(device.$id).toBe('testKeyboard')
        expect(device.container).toBe(mockContainer)
    })


    test('constructor with default params', () => {
        const defaultDevice = new KeyboardDevice()
        expect(defaultDevice.$id).toBe('keyboard')
        expect(defaultDevice.container).toBe(window)
    })


    test('start attaches event listeners', () => {
        device.start()

        expect(mockContainer.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function), true)
        expect(mockContainer.addEventListener).toHaveBeenCalledWith('keyup', expect.any(Function), true)
        expect(mockContainer.addEventListener).toHaveBeenCalledWith('blur', expect.any(Function))
        expect(mockContainer.addEventListener).toHaveBeenCalledTimes(3)
    })


    test('stop removes event listeners', () => {
        device.start()
        device.stop()

        expect(mockContainer.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function), true)
        expect(mockContainer.removeEventListener).toHaveBeenCalledWith('keyup', expect.any(Function), true)
        expect(mockContainer.removeEventListener).toHaveBeenCalledWith('blur', expect.any(Function))
        expect(mockContainer.removeEventListener).toHaveBeenCalledTimes(3)
    })


    test('dispose calls stop', () => {
        const stopSpy = vi.spyOn(device, 'stop')
        device.start()
        device.dispose()
        expect(stopSpy).toHaveBeenCalled()
    })



    test('keydown event creates and presses control', () => {
        device.start()

        const keydownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keydown')[1]

        const event = createKeyEvent('KeyA')
        keydownListener(event)

        const control = device.getControl('KeyA')
        expect(control).toBeInstanceOf(ButtonControl)
        expect(control.isPressed).toBe(true)
        expect(device.isPressed('KeyA')).toBe(true)
    })


    test('keydown event does not press already pressed control', () => {
        device.start()

        const keydownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keydown')[1]

        const event = createKeyEvent('KeyA')
        keydownListener(event)

        const control = device.getControl('KeyA')
        const pressSpy = vi.spyOn(control, 'press')

        keydownListener(event)
        expect(pressSpy).not.toHaveBeenCalled()
    })


    test('keyup event releases control', () => {
        device.start()

        const keydownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keydown')[1]
        const keyupListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keyup')[1]

        const event = createKeyEvent('KeyA')
        keydownListener(event)
        expect(device.isPressed('KeyA')).toBe(true)

        keyupListener(event)
        expect(device.isPressed('KeyA')).toBe(false)
    })


    test('keyup event does nothing for non-existent control', () => {
        device.start()

        const keyupListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keyup')[1]

        const event = createKeyEvent('KeyA')
        expect(() => keyupListener(event)).not.toThrow()
        expect(device.getControl('KeyA')).toBeUndefined()
    })


    test('blur event releases all pressed keys', () => {
        device.start()

        const keydownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keydown')[1]
        const blurListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'blur')[1]

        keydownListener(createKeyEvent('KeyA'))
        keydownListener(createKeyEvent('KeyB'))
        expect(device.isPressed('KeyA')).toBe(true)
        expect(device.isPressed('KeyB')).toBe(true)

        blurListener()
        expect(device.isPressed('KeyA')).toBe(false)
        expect(device.isPressed('KeyB')).toBe(false)
    })


    test('integration test - full key press cycle', () => {
        const controlPressedListener = vi.fn()
        const controlReleasedListener = vi.fn()

        device.on('control:pressed', controlPressedListener)
        device.on('control:released', controlReleasedListener)

        device.start()

        const keydownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keydown')[1]
        const keyupListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keyup')[1]

        const event = createKeyEvent('Space')

        keydownListener(event)
        expect(controlPressedListener).toHaveBeenCalledTimes(1)
        expect(device.isPressed('Space')).toBe(true)

        keyupListener(event)
        expect(controlReleasedListener).toHaveBeenCalledTimes(1)
        expect(device.isPressed('Space')).toBe(false)
    })


    test('shouldPreventDefault true calls preventDefault and stopPropagation', () => {
        const deviceWithPrevent = new KeyboardDevice({
            container: mockContainer,
            shouldPreventDefault: true
        })
        deviceWithPrevent.start()

        const keydownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keydown')[1]

        const event = createKeyEvent('KeyA')
        keydownListener(event)

        expect(event.preventDefault).toHaveBeenCalled()
        expect(event.stopPropagation).toHaveBeenCalled()
    })


    test('shouldPreventDefault false does not call preventDefault', () => {
        device.start()

        const keydownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keydown')[1]

        const event = createKeyEvent('KeyA')
        keydownListener(event)

        expect(event.preventDefault).not.toHaveBeenCalled()
        expect(event.stopPropagation).not.toHaveBeenCalled()
    })


    test('shouldPreventDefault as function receives event, control and device', () => {
        const shouldPreventDefault = vi.fn(() => true)
        const deviceWithFn = new KeyboardDevice({
            container: mockContainer,
            shouldPreventDefault
        })
        deviceWithFn.start()

        const keydownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keydown')[1]

        const event = createKeyEvent('KeyA')
        keydownListener(event)

        expect(shouldPreventDefault).toHaveBeenCalledWith(event, expect.any(ButtonControl), deviceWithFn)
        expect(event.preventDefault).toHaveBeenCalled()
    })


    test('keydown creates alias control for single character keys', () => {
        device.start()

        const keydownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keydown')[1]

        const event = createKeyEvent('KeyA', {key: 'a'})
        keydownListener(event)

        expect(device.getControl('KeyA')).toBeInstanceOf(ButtonControl)
        expect(device.getControl('a')).toBeInstanceOf(ButtonControl)
        expect(device.isPressed('a')).toBe(true)
    })


    test('keydown creates lowercase alias for uppercase letters', () => {
        device.start()

        const keydownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keydown')[1]

        const event = createKeyEvent('KeyA', {key: 'A'})
        keydownListener(event)

        expect(device.getControl('a')).toBeInstanceOf(ButtonControl)
        expect(device.isPressed('a')).toBe(true)
    })


    test('keyup releases alias control', () => {
        device.start()

        const keydownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keydown')[1]
        const keyupListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keyup')[1]

        const event = createKeyEvent('KeyA', {key: 'a'})
        keydownListener(event)
        expect(device.isPressed('a')).toBe(true)

        keyupListener(event)
        expect(device.isPressed('a')).toBe(false)
    })


    test('no alias created when key equals code', () => {
        device.start()

        const keydownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keydown')[1]

        const event = createKeyEvent('Space', {key: 'Space'})
        keydownListener(event)

        expect(device.getControl('Space')).toBeInstanceOf(ButtonControl)
        expect(device.getControl('space')).toBeUndefined()
    })


    test('no alias created for multi-character keys', () => {
        device.start()

        const keydownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keydown')[1]

        const event = createKeyEvent('ShiftLeft', {key: 'Shift'})
        keydownListener(event)

        expect(device.getControl('ShiftLeft')).toBeInstanceOf(ButtonControl)
        expect(device.getControl('shift')).toBeUndefined()
    })


    test('ignores keydown events from input elements', () => {
        device.start()

        const keydownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keydown')[1]

        const inputElement = document.createElement('input')
        const event = createKeyEvent('KeyA', {target: inputElement})
        keydownListener(event)

        expect(device.getControl('KeyA')).toBeUndefined()
    })


    test('ignores keydown events from textarea elements', () => {
        device.start()

        const keydownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keydown')[1]

        const textareaElement = document.createElement('textarea')
        const event = createKeyEvent('KeyA', {target: textareaElement})
        keydownListener(event)

        expect(device.getControl('KeyA')).toBeUndefined()
    })


    test('ignores keydown events from contenteditable elements', () => {
        device.start()

        const keydownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keydown')[1]

        const editableElement = {
            tagName: 'DIV',
            isContentEditable: true
        }
        const event = createKeyEvent('KeyA', {target: editableElement})
        keydownListener(event)

        expect(device.getControl('KeyA')).toBeUndefined()
    })


    test('ignores keyup events from input elements', () => {
        device.start()

        const keydownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keydown')[1]
        const keyupListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keyup')[1]

        keydownListener(createKeyEvent('KeyA'))
        expect(device.isPressed('KeyA')).toBe(true)

        const inputElement = document.createElement('input')
        const keyupEvent = createKeyEvent('KeyA', {target: inputElement})
        keyupListener(keyupEvent)

        expect(device.isPressed('KeyA')).toBe(true)
    })

})
