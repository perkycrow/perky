import KeyControl from './key_control'
import InputControl from '../input_control'


describe(KeyControl, () => {

    let control

    beforeEach(() => {
        control = new KeyControl({
            device: null,
            name: 'testKey',
            displayName: 'Test Key'
        })
    })


    test('constructor', () => {
        expect(control).toBeInstanceOf(InputControl)
        expect(control.name).toBe('testKey')
        expect(control.displayName).toBe('Test Key')
        expect(control.getValue()).toBe(0)
    })


    test('getDefaultValue', () => {
        expect(control.getDefaultValue()).toBe(0)
    })


    test('setValue with truthy values', () => {
        control.setValue(true)
        expect(control.getValue()).toBe(1)

        control.setValue(1)
        expect(control.getValue()).toBe(1)

        control.setValue('any string')
        expect(control.getValue()).toBe(1)

        control.setValue(42)
        expect(control.getValue()).toBe(1)

        control.setValue({})
        expect(control.getValue()).toBe(1)
    })


    test('setValue with falsy values', () => {
        control.setValue(false)
        expect(control.getValue()).toBe(0)

        control.setValue(0)
        expect(control.getValue()).toBe(0)

        control.setValue('')
        expect(control.getValue()).toBe(0)

        control.setValue(null)
        expect(control.getValue()).toBe(0)

        control.setValue(undefined)
        expect(control.getValue()).toBe(0)
    })


    test('isPressed', () => {
        expect(control.isPressed()).toBe(false)

        control.setValue(0)
        expect(control.isPressed()).toBe(false)

        control.setValue(1)
        expect(control.isPressed()).toBe(true)
    })


    test('press', () => {
        control.press()
        expect(control.getValue()).toBe(1)
        expect(control.isPressed()).toBe(true)
    })


    test('release', () => {
        control.setValue(1)
        expect(control.isPressed()).toBe(true)

        control.release()
        expect(control.getValue()).toBe(0)
        expect(control.isPressed()).toBe(false)
    })


    test('reset', () => {
        control.setValue(1)
        expect(control.getValue()).toBe(1)

        control.reset()
        expect(control.getValue()).toBe(0)
    })


    test('binary behavior consistency', () => {
        control.setValue(0.5)
        expect(control.getValue()).toBe(1)

        control.setValue(-1)
        expect(control.getValue()).toBe(1)

        control.setValue(0)
        expect(control.getValue()).toBe(0)
    })

})

