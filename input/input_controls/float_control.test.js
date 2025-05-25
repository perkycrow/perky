import FloatControl from './float_control'
import InputControl from '../input_control'


describe(FloatControl, () => {

    let control

    beforeEach(() => {
        control = new FloatControl({
            device: null,
            name: 'testFloat',
            displayName: 'Test Float'
        })
    })


    test('constructor', () => {
        expect(control).toBeInstanceOf(InputControl)
        expect(control.name).toBe('testFloat')
        expect(control.displayName).toBe('Test Float')
        expect(control.getValue()).toBe(0.0)
        expect(control.normalize).toBe(false)
        expect(control.range).toEqual({min: 0, max: 1})
    })


    test('constructor with custom options', () => {
        const customControl = new FloatControl({
            device: null,
            name: 'custom',
            normalize: true,
            range: {min: -10, max: 10}
        })

        expect(customControl.normalize).toBe(true)
        expect(customControl.range).toEqual({min: -10, max: 10})
    })


    test('getDefaultValue', () => {
        expect(control.getDefaultValue()).toBe(0.0)
    })


    test('setValue without normalization', () => {
        control.setValue(5.5)
        expect(control.getValue()).toBe(5.5)

        control.setValue(-3.2)
        expect(control.getValue()).toBe(-3.2)

        control.setValue(100)
        expect(control.getValue()).toBe(100)
    })


    test('setValue with normalization', () => {
        control.normalize = true
        control.range = {min: 0, max: 1}

        control.setValue(0.5)
        expect(control.getValue()).toBe(0.5)

        control.setValue(-0.5)
        expect(control.getValue()).toBe(0)

        control.setValue(1.5)
        expect(control.getValue()).toBe(1)
    })


    test('setValue with custom range normalization', () => {
        control.normalize = true
        control.range = {min: -10, max: 10}

        control.setValue(5)
        expect(control.getValue()).toBe(5)

        control.setValue(-15)
        expect(control.getValue()).toBe(-10)

        control.setValue(15)
        expect(control.getValue()).toBe(10)
    })


    test('setValue with invalid values', () => {
        control.setValue('invalid')
        expect(control.getValue()).toBe(0)

        control.setValue(null)
        expect(control.getValue()).toBe(0)

        control.setValue(undefined)
        expect(control.getValue()).toBe(0)
    })


    test('reset', () => {
        control.setValue(42)
        expect(control.getValue()).toBe(42)

        control.reset()
        expect(control.getValue()).toBe(0.0)
    })

})

