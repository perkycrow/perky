import ButtonControl from './button_control'
import InputControl from '../input_control'
import {vi} from 'vitest'


describe(ButtonControl, () => {
    let control


    beforeEach(() => {
        control = new ButtonControl({
            device: null,
            name: 'testButton'
        })
    })


    test('static defaultPressThreshold', () => {
        expect(ButtonControl.defaultPressThreshold).toBe(0.1)
    })


    test('constructor', () => {
        expect(control).toBeInstanceOf(InputControl)
        expect(control.name).toBe('testButton')
        expect(control.value).toBe(0)
        expect(control.pressThreshold).toBe(0.1)
    })


    test('constructor with custom pressThreshold', () => {
        const customControl = new ButtonControl({
            device: null,
            name: 'custom',
            pressThreshold: 0.2
        })

        expect(customControl.pressThreshold).toBe(0.2)
    })


    test('isPressed getter', () => {
        expect(control.isPressed).toBe(false)

        control.value = 0.05
        expect(control.isPressed).toBe(false)

        control.value = 0.1
        expect(control.isPressed).toBe(true)

        control.value = 0.8
        expect(control.isPressed).toBe(true)
    })


    test('wasPressed getter', () => {
        expect(control.wasPressed).toBe(false)

        control.value = 0.15
        expect(control.wasPressed).toBe(false)

        control.value = 0.05
        expect(control.wasPressed).toBe(true)
    })


    test('pressed event emission', () => {
        const pressedListener = vi.fn()
        control.on('pressed', pressedListener)

        control.value = 0.15
        expect(pressedListener).toHaveBeenCalledTimes(1)

        control.value = 0.5
        expect(pressedListener).toHaveBeenCalledTimes(1)
    })


    test('released event emission', () => {
        const releasedListener = vi.fn()
        control.on('released', releasedListener)

        control.value = 0.15
        control.value = 0.05
        expect(releasedListener).toHaveBeenCalledTimes(1)

        control.value = 0.02
        expect(releasedListener).toHaveBeenCalledTimes(1)
    })


    test('press and release cycle', () => {
        const pressedListener = vi.fn()
        const releasedListener = vi.fn()
        
        control.on('pressed', pressedListener)
        control.on('released', releasedListener)

        control.value = 0.2
        expect(pressedListener).toHaveBeenCalledTimes(1)
        expect(releasedListener).toHaveBeenCalledTimes(0)

        control.value = 0.05
        expect(pressedListener).toHaveBeenCalledTimes(1)
        expect(releasedListener).toHaveBeenCalledTimes(1)
    })


    test('setValue return value', () => {
        expect(control.setValue(0.5)).toBe(true)
        expect(control.setValue(0.5)).toBe(false)
        expect(control.setValue(0.3)).toBe(true)
    })


    test('no events when value unchanged', () => {
        const pressedListener = vi.fn()
        const releasedListener = vi.fn()
        
        control.on('pressed', pressedListener)
        control.on('released', releasedListener)

        control.value = 0.5
        control.value = 0.5

        expect(pressedListener).toHaveBeenCalledTimes(1)
        expect(releasedListener).toHaveBeenCalledTimes(0)
    })


    test('custom threshold behavior', () => {
        const customControl = new ButtonControl({
            device: null,
            name: 'custom',
            pressThreshold: 0.1
        })

        expect(customControl.isPressed).toBe(false)

        customControl.value = 0.05
        expect(customControl.isPressed).toBe(false)

        customControl.value = 0.15
        expect(customControl.isPressed).toBe(true)
    })


    test('press method', () => {
        const pressedListener = vi.fn()
        control.on('pressed', pressedListener)

        control.press()
        expect(control.value).toBe(1)
        expect(control.isPressed).toBe(true)
        expect(pressedListener).toHaveBeenCalledTimes(1)
    })


    test('release method', () => {
        const releasedListener = vi.fn()
        control.on('released', releasedListener)

        control.value = 0.8
        expect(control.isPressed).toBe(true)

        control.release()
        expect(control.value).toBe(0)
        expect(control.isPressed).toBe(false)
        expect(releasedListener).toHaveBeenCalledTimes(1)
    })


    test('press and release methods cycle', () => {
        const pressedListener = vi.fn()
        const releasedListener = vi.fn()
        
        control.on('pressed', pressedListener)
        control.on('released', releasedListener)

        control.press()
        expect(pressedListener).toHaveBeenCalledTimes(1)
        expect(releasedListener).toHaveBeenCalledTimes(0)

        control.release()
        expect(pressedListener).toHaveBeenCalledTimes(1)
        expect(releasedListener).toHaveBeenCalledTimes(1)
    })

})
