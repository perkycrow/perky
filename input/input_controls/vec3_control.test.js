import Vec3Control from './vec3_control'
import InputControl from '../input_control'
import Vec3 from '../../math/vec3'


describe(Vec3Control, () => {

    let control

    beforeEach(() => {
        control = new Vec3Control({
            device: null,
            name: 'testVec3',
            displayName: 'Test Vec3'
        })
    })


    test('constructor', () => {
        expect(control).toBeInstanceOf(InputControl)
        expect(control.name).toBe('testVec3')
        expect(control.displayName).toBe('Test Vec3')
        expect(control.getValue()).toBeInstanceOf(Vec3)
        expect(control.getValue().x).toBe(0)
        expect(control.getValue().y).toBe(0)
        expect(control.getValue().z).toBe(0)
        expect(control.normalize).toBe(false)
        expect(control.range).toEqual({min: -1, max: 1})
    })


    test('constructor with custom options', () => {
        const customControl = new Vec3Control({
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
        expect(defaultValue).toBeInstanceOf(Vec3)
        expect(defaultValue.x).toBe(0)
        expect(defaultValue.y).toBe(0)
        expect(defaultValue.z).toBe(0)
    })


    test('setValue with Vec3 instance', () => {
        const vec = new Vec3(3, 4, 5)
        control.setValue(vec)
        
        expect(control.getValue()).toBeInstanceOf(Vec3)
        expect(control.getValue().x).toBe(3)
        expect(control.getValue().y).toBe(4)
        expect(control.getValue().z).toBe(5)
        expect(control.getValue()).not.toBe(vec)
    })


    test('setValue with array', () => {
        control.setValue([5, -2, 8])
        
        expect(control.getValue().x).toBe(5)
        expect(control.getValue().y).toBe(-2)
        expect(control.getValue().z).toBe(8)
    })


    test('setValue with object', () => {
        control.setValue({x: -1, y: 7, z: 3})
        
        expect(control.getValue().x).toBe(-1)
        expect(control.getValue().y).toBe(7)
        expect(control.getValue().z).toBe(3)
    })


    test('setValue with normalization', () => {
        control.normalize = true
        control.range = {min: -1, max: 1}

        control.setValue({x: 0.5, y: -0.3, z: 0.8})
        expect(control.getValue().x).toBe(0.5)
        expect(control.getValue().y).toBe(-0.3)
        expect(control.getValue().z).toBe(0.8)

        control.setValue({x: 2, y: -2, z: 1.5})
        expect(control.getValue().x).toBe(1)
        expect(control.getValue().y).toBe(-1)
        expect(control.getValue().z).toBe(1)

        control.setValue({x: -1.5, y: 1.5, z: -2})
        expect(control.getValue().x).toBe(-1)
        expect(control.getValue().y).toBe(1)
        expect(control.getValue().z).toBe(-1)
    })


    test('setValue with custom range normalization', () => {
        control.normalize = true
        control.range = {min: 0, max: 100}

        control.setValue({x: 50, y: 75, z: 25})
        expect(control.getValue().x).toBe(50)
        expect(control.getValue().y).toBe(75)
        expect(control.getValue().z).toBe(25)

        control.setValue({x: -10, y: 150, z: 200})
        expect(control.getValue().x).toBe(0)
        expect(control.getValue().y).toBe(100)
        expect(control.getValue().z).toBe(100)
    })


    test('x getter', () => {
        control.setValue({x: 10, y: 20, z: 30})
        expect(control.x).toBe(10)
    })


    test('y getter', () => {
        control.setValue({x: 10, y: 20, z: 30})
        expect(control.y).toBe(20)
    })


    test('z getter', () => {
        control.setValue({x: 10, y: 20, z: 30})
        expect(control.z).toBe(30)
    })


    test('magnitude getter', () => {
        control.setValue({x: 3, y: 4, z: 0})
        expect(control.magnitude).toBe(5)

        control.setValue({x: 1, y: 2, z: 2})
        expect(control.magnitude).toBe(3)

        control.setValue({x: 0, y: 0, z: 0})
        expect(control.magnitude).toBe(0)
    })


    test('normalized getter', () => {
        control.setValue({x: 3, y: 4, z: 0})
        const normalized = control.normalized
        
        expect(normalized).toBeInstanceOf(Vec3)
        expect(normalized.x).toBeCloseTo(0.6)
        expect(normalized.y).toBeCloseTo(0.8)
        expect(normalized.z).toBeCloseTo(0)

        control.setValue({x: 0, y: 0, z: 0})
        const zeroNormalized = control.normalized
        expect(zeroNormalized.x).toBe(0)
        expect(zeroNormalized.y).toBe(0)
        expect(zeroNormalized.z).toBe(0)
    })


    test('reset', () => {
        control.setValue({x: 10, y: 20, z: 30})
        expect(control.getValue().x).toBe(10)
        expect(control.getValue().y).toBe(20)
        expect(control.getValue().z).toBe(30)

        control.reset()
        expect(control.getValue().x).toBe(0)
        expect(control.getValue().y).toBe(0)
        expect(control.getValue().z).toBe(0)
    })

})
