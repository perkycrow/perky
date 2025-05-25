import ButtonControl from './button_control'
import FloatControl from './float_control'


describe(ButtonControl, () => {

    let control

    beforeEach(() => {
        control = new ButtonControl({
            device: null,
            name: 'testButton',
            displayName: 'Test Button'
        })
    })


    test('constructor', () => {
        expect(control).toBeInstanceOf(FloatControl)
        expect(control.name).toBe('testButton')
        expect(control.displayName).toBe('Test Button')
        expect(control.getValue()).toBe(0.0)
        expect(control.pressThreshold).toBe(0.5)
        expect(control.normalize).toBe(true)
        expect(control.range).toEqual({min: 0, max: 1})
    })


    test('constructor with custom pressThreshold', () => {
        const customControl = new ButtonControl({
            device: null,
            name: 'custom',
            pressThreshold: 0.2
        })

        expect(customControl.pressThreshold).toBe(0.2)
    })


    test('isPressed with default threshold', () => {
        expect(control.isPressed()).toBe(false)

        control.setValue(0.3)
        expect(control.isPressed()).toBe(false)

        control.setValue(0.5)
        expect(control.isPressed()).toBe(false)

        control.setValue(0.6)
        expect(control.isPressed()).toBe(true)

        control.setValue(1.0)
        expect(control.isPressed()).toBe(true)
    })


    test('isPressed with custom threshold', () => {
        control.pressThreshold = 0.2

        expect(control.isPressed()).toBe(false)

        control.setValue(0.1)
        expect(control.isPressed()).toBe(false)

        control.setValue(0.2)
        expect(control.isPressed()).toBe(false)

        control.setValue(0.3)
        expect(control.isPressed()).toBe(true)
    })


    test('press', () => {
        control.press()
        expect(control.getValue()).toBe(1.0)
        expect(control.isPressed()).toBe(true)
    })


    test('release', () => {
        control.setValue(0.8)
        expect(control.isPressed()).toBe(true)

        control.release()
        expect(control.getValue()).toBe(0.0)
        expect(control.isPressed()).toBe(false)
    })


    test('setValue with normalization', () => {
        control.setValue(-0.5)
        expect(control.getValue()).toBe(0.0)

        control.setValue(1.5)
        expect(control.getValue()).toBe(1.0)

        control.setValue(0.7)
        expect(control.getValue()).toBe(0.7)
    })


    test('analog trigger behavior', () => {
        control.pressThreshold = 0.1

        control.setValue(0.05)
        expect(control.isPressed()).toBe(false)

        control.setValue(0.15)
        expect(control.isPressed()).toBe(true)
        expect(control.getValue()).toBe(0.15)

        control.setValue(0.8)
        expect(control.isPressed()).toBe(true)
        expect(control.getValue()).toBe(0.8)
    })

})

