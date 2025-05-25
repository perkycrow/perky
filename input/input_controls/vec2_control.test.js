import Vec2Control from './vec2_control'
import InputControl from '../input_control'
import Vec2 from '../../math/vec2'


describe(Vec2Control, () => {

    let control

    beforeEach(() => {
        control = new Vec2Control({
            device: null,
            name: 'testVec2',
            displayName: 'Test Vec2'
        })
    })


    test('constructor', () => {
        expect(control).toBeInstanceOf(InputControl)
        expect(control.name).toBe('testVec2')
        expect(control.displayName).toBe('Test Vec2')
        expect(control.getValue()).toBeInstanceOf(Vec2)
        expect(control.getValue().x).toBe(0)
        expect(control.getValue().y).toBe(0)
        expect(control.normalize).toBe(false)
        expect(control.range).toEqual({min: -1, max: 1})
    })


    test('constructor with custom options', () => {
        const customControl = new Vec2Control({
            device: null,
            name: 'custom',
            normalize: true,
            range: {min: -10, max: 10}
        })

        expect(customControl.normalize).toBe(true)
        expect(customControl.range).toEqual({min: -10, max: 10})
    })


    test('getDefaultValue', () => {
        const defaultValue = control.getDefaultValue()
        expect(defaultValue).toBeInstanceOf(Vec2)
        expect(defaultValue.x).toBe(0)
        expect(defaultValue.y).toBe(0)
    })


    test('setValue with Vec2 instance', () => {
        const vec = new Vec2(3, 4)
        control.setValue(vec)
        
        expect(control.getValue()).toBeInstanceOf(Vec2)
        expect(control.getValue().x).toBe(3)
        expect(control.getValue().y).toBe(4)
        expect(control.getValue()).not.toBe(vec)
    })


    test('setValue with array', () => {
        control.setValue([5, -2])
        
        expect(control.getValue().x).toBe(5)
        expect(control.getValue().y).toBe(-2)
    })


    test('setValue with object', () => {
        control.setValue({x: -1, y: 7})
        
        expect(control.getValue().x).toBe(-1)
        expect(control.getValue().y).toBe(7)
    })


    test('setValue with normalization', () => {
        control.normalize = true
        control.range = {min: -1, max: 1}

        control.setValue({x: 0.5, y: -0.3})
        expect(control.getValue().x).toBe(0.5)
        expect(control.getValue().y).toBe(-0.3)

        control.setValue({x: 2, y: -2})
        expect(control.getValue().x).toBe(1)
        expect(control.getValue().y).toBe(-1)

        control.setValue({x: -1.5, y: 1.5})
        expect(control.getValue().x).toBe(-1)
        expect(control.getValue().y).toBe(1)
    })


    test('setValue with custom range normalization', () => {
        control.normalize = true
        control.range = {min: 0, max: 100}

        control.setValue({x: 50, y: 75})
        expect(control.getValue().x).toBe(50)
        expect(control.getValue().y).toBe(75)

        control.setValue({x: -10, y: 150})
        expect(control.getValue().x).toBe(0)
        expect(control.getValue().y).toBe(100)
    })


    test('x getter', () => {
        control.setValue({x: 10, y: 20})
        expect(control.x).toBe(10)
    })


    test('y getter', () => {
        control.setValue({x: 10, y: 20})
        expect(control.y).toBe(20)
    })


    test('magnitude getter', () => {
        control.setValue({x: 3, y: 4})
        expect(control.magnitude).toBe(5)

        control.setValue({x: 0, y: 0})
        expect(control.magnitude).toBe(0)
    })


    test('normalized getter', () => {
        control.setValue({x: 3, y: 4})
        const normalized = control.normalized
        
        expect(normalized).toBeInstanceOf(Vec2)
        expect(normalized.x).toBeCloseTo(0.6)
        expect(normalized.y).toBeCloseTo(0.8)

        control.setValue({x: 0, y: 0})
        const zeroNormalized = control.normalized
        expect(zeroNormalized.x).toBe(0)
        expect(zeroNormalized.y).toBe(0)
    })


    test('reset', () => {
        control.setValue({x: 10, y: 20})
        expect(control.getValue().x).toBe(10)
        expect(control.getValue().y).toBe(20)

        control.reset()
        expect(control.getValue().x).toBe(0)
        expect(control.getValue().y).toBe(0)
    })

})
