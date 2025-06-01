import FloatControl from './float_control'
import InputControl from '../input_control'


describe(FloatControl, () => {

    let control

    beforeEach(() => {
        control = new FloatControl({
            device: null,
            name: 'testFloat'
        })
    })


    test('constructor', () => {
        expect(control).toBeInstanceOf(InputControl)
        expect(control.name).toBe('testFloat')
        expect(control.getValue()).toBe(0.0)
    })


    test('reset', () => {
        control.setValue(42)
        expect(control.getValue()).toBe(42)

        control.reset()
        expect(control.getValue()).toBe(0.0)
    })

})

