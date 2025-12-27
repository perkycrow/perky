import KeyboardDevice from './keyboard_device'
import InputDevice from '../input_device'
import ButtonControl from '../input_controls/button_control'
import {vi} from 'vitest'

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

        const event = {code: 'KeyA'}
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

        const event = {code: 'KeyA'}
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

        const event = {code: 'KeyA'}
        keydownListener(event)
        expect(device.isPressed('KeyA')).toBe(true)

        keyupListener(event)
        expect(device.isPressed('KeyA')).toBe(false)
    })


    test('keyup event does nothing for non-existent control', () => {
        device.start()

        const keyupListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keyup')[1]

        const event = {code: 'KeyA'}
        expect(() => keyupListener(event)).not.toThrow()
        expect(device.getControl('KeyA')).toBeUndefined()
    })


    test('blur event releases all pressed keys', () => {
        device.start()

        const keydownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'keydown')[1]
        const blurListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'blur')[1]

        keydownListener({code: 'KeyA'})
        keydownListener({code: 'KeyB'})
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

        const event = {code: 'Space'}

        keydownListener(event)
        expect(controlPressedListener).toHaveBeenCalledTimes(1)
        expect(device.isPressed('Space')).toBe(true)

        keyupListener(event)
        expect(controlReleasedListener).toHaveBeenCalledTimes(1)
        expect(device.isPressed('Space')).toBe(false)
    })

})
