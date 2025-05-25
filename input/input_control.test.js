import InputControl from './input_control'


describe(InputControl, () => {

    let control

    beforeEach(() => {
        control = new InputControl({
            device: null,
            name: 'testControl',
            displayName: 'Test Control'
        })
    })


    test('constructor', () => {
        expect(control.name).toBe('testControl')
        expect(control.displayName).toBe('Test Control')
        expect(control.device).toBeNull()
        expect(control.getValue()).toBeNull()
    })


    test('constructor with defaultValue', () => {
        const customControl = new InputControl({
            device: null,
            name: 'custom',
            defaultValue: 42
        })

        expect(customControl.getValue()).toBe(42)
    })


    test('constructor with displayName fallback', () => {
        const control2 = new InputControl({
            device: null,
            name: 'fallback'
        })

        expect(control2.displayName).toBe('fallback')
    })


    test('getDefaultValue', () => {
        expect(control.getDefaultValue()).toBeNull()
    })


    test('getValue and setValue', () => {
        expect(control.getValue()).toBeNull()

        control.setValue(123)
        expect(control.getValue()).toBe(123)

        control.setValue('test')
        expect(control.getValue()).toBe('test')
    })


    test('reset', () => {
        control.setValue(456)
        expect(control.getValue()).toBe(456)

        control.reset()
        expect(control.getValue()).toBeNull()
    })


    test('value property access', () => {
        control.value = 789
        expect(control.getValue()).toBe(789)
        expect(control.value).toBe(789)
    })

})

