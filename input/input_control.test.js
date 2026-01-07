import InputControl from './input_control.js'
import {vi} from 'vitest'

const {VALUE, OLD_VALUE} = InputControl

describe(InputControl, () => {
    let control

    beforeEach(() => {
        control = new InputControl({
            device: null,
            name: 'testControl'
        })
    })


    test('constructor', () => {
        expect(control.name).toBe('testControl')
        expect(control.device).toBeNull()
        expect(control.value).toBe(0)
    })


    test('constructor with value', () => {
        const customControl = new InputControl({
            device: null,
            name: 'custom',
            value: 42
        })

        expect(customControl.value).toBe(42)
    })


    test('getDefaultValue', () => {
        expect(control.getDefaultValue()).toBe(0)
    })


    test('value property access', () => {
        expect(control.value).toBe(0)

        control.value = 123
        expect(control.value).toBe(123)

        control.value = 'test'
        expect(control.value).toBe('test')
    })


    test('oldValue property access', () => {
        expect(control.oldValue).toBeNull()

        control.value = 123
        expect(control.oldValue).toBe(0)

        control.value = 456
        expect(control.oldValue).toBe(123)

        control.value = 'test'
        expect(control.oldValue).toBe(456)
    })


    test('value change notification', () => {
        const listener = vi.fn()
        control.on('updated', listener)

        control.value = 456
        expect(listener).toHaveBeenCalledWith(456, 0, null)

        control.value = 789
        expect(listener).toHaveBeenCalledWith(789, 456, null)
    })


    test('no notification when value unchanged', () => {
        const listener = vi.fn()
        control.on('updated', listener)

        control.value = 123
        expect(listener).toHaveBeenCalledTimes(1)

        control.value = 123
        expect(listener).toHaveBeenCalledTimes(1)
    })


    test('reset', () => {
        control.value = 456
        expect(control.value).toBe(456)

        control.reset()
        expect(control.value).toBe(0)
    })


    test('direct symbol access', () => {
        expect(control[VALUE]).toBe(0)
        expect(control[OLD_VALUE]).toBeNull()

        control.value = 123
        expect(control[VALUE]).toBe(123)
        expect(control[OLD_VALUE]).toBe(0)

        control.value = 456
        expect(control[VALUE]).toBe(456)
        expect(control[OLD_VALUE]).toBe(123)
    })


    test('symbols are shared across instances', () => {
        const control1 = new InputControl({device: null, name: 'control1'})
        const control2 = new InputControl({device: null, name: 'control2'})

        expect(VALUE).toBe(VALUE)
        expect(OLD_VALUE).toBe(OLD_VALUE)

        control1.value = 123
        control2.value = 456

        expect(control1[VALUE]).toBe(123)
        expect(control2[VALUE]).toBe(456)
    })


    test('setValue updates value and returns true', () => {
        const result = control.setValue(100)

        expect(result).toBe(true)
        expect(control.value).toBe(100)
    })


    test('setValue returns false when value unchanged', () => {
        control.setValue(50)

        const result = control.setValue(50)

        expect(result).toBe(false)
    })


    test('setValue passes event to updated notification', () => {
        const listener = vi.fn()
        control.on('updated', listener)

        const mockEvent = {type: 'keydown'}
        control.setValue(200, mockEvent)

        expect(listener).toHaveBeenCalledWith(200, 0, mockEvent)
    })

})
