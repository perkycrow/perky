import InputControl from './input_control'


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
        expect(control.getValue()).toBe(0)
    })


    test('constructor with value', () => {
        const customControl = new InputControl({
            device: null,
            name: 'custom',
            value: 42
        })

        expect(customControl.getValue()).toBe(42)
    })


    test('getDefaultValue', () => {
        expect(control.getDefaultValue()).toBe(0)
    })


    test('getValue and setValue', () => {
        expect(control.getValue()).toBe(0)

        control.setValue(123)
        expect(control.getValue()).toBe(123)

        control.setValue('test')
        expect(control.getValue()).toBe('test')
    })


    test('reset', () => {
        control.setValue(456)
        expect(control.getValue()).toBe(456)

        control.reset()
        expect(control.getValue()).toBe(0)
    })


    test('value property access', () => {
        control.value = 789
        expect(control.getValue()).toBe(789)
        expect(control.value).toBe(789)
    })

})
