import StickControl from './stick_control'
import Vec2Control from './vec2_control'
import Vec2 from '../../math/vec2'


describe(StickControl, () => {

    let control

    beforeEach(() => {
        control = new StickControl({
            device: null,
            name: 'testStick',
            displayName: 'Test Stick'
        })
    })


    test('constructor', () => {
        expect(control).toBeInstanceOf(Vec2Control)
        expect(control.name).toBe('testStick')
        expect(control.displayName).toBe('Test Stick')
        expect(control.getValue()).toBeInstanceOf(Vec2)
        expect(control.getValue().x).toBe(0)
        expect(control.getValue().y).toBe(0)
        expect(control.normalize).toBe(true)
        expect(control.range).toEqual({min: -1, max: 1})
        expect(control.deadzone).toBe(0.1)
        expect(control.noiseThreshold).toBe(0.01)
        expect(control.enableDenoising).toBe(true)
    })


    test('constructor with custom options', () => {
        const customControl = new StickControl({
            device: null,
            name: 'custom',
            deadzone: 0.2,
            noiseThreshold: 0.005,
            enableDenoising: false
        })

        expect(customControl.deadzone).toBe(0.2)
        expect(customControl.noiseThreshold).toBe(0.005)
        expect(customControl.enableDenoising).toBe(false)
    })


    test('setValue with normalization', () => {
        control.setValue({x: 2, y: -2})
        expect(control.getValue().x).toBe(1)
        expect(control.getValue().y).toBe(-1)

        control.setValue({x: 0.5, y: -0.3})
        expect(control.getValue().x).toBe(0.5)
        expect(control.getValue().y).toBe(-0.3)
    })


    test('deadzone application', () => {
        control.deadzone = 0.2

        control.setValue({x: 0.1, y: 0.1})
        expect(control.getValue().x).toBe(0)
        expect(control.getValue().y).toBe(0)

        control.setValue({x: 0.15, y: 0.15})
        expect(control.getValue().x).toBe(0.15)
        expect(control.getValue().y).toBe(0.15)

        control.setValue({x: 0.3, y: 0.4})
        expect(control.getValue().x).toBe(0.3)
        expect(control.getValue().y).toBe(0.4)
    })


    test('deadzone with magnitude calculation', () => {
        control.deadzone = 0.2

        control.setValue({x: 0.1, y: 0.1})
        expect(control.magnitude).toBe(0)

        control.setValue({x: 0.2, y: 0.2})
        expect(control.magnitude).toBeGreaterThan(0.2)
    })


    test('denoising', () => {
        control.noiseThreshold = 0.05

        control.setValue({x: 0.03, y: -0.02})
        expect(control.getValue().x).toBe(0)
        expect(control.getValue().y).toBe(0)

        control.setValue({x: 0.07, y: -0.08})
        expect(control.getValue().x).toBe(0.07)
        expect(control.getValue().y).toBe(-0.08)
    })


    test('denoising disabled', () => {
        control.enableDenoising = false
        control.noiseThreshold = 0.05
        control.deadzone = 0

        control.setValue({x: 0.03, y: -0.02})
        expect(control.getValue().x).toBe(0.03)
        expect(control.getValue().y).toBe(-0.02)
    })


    test('denoising and deadzone interaction', () => {
        control.noiseThreshold = 0.02
        control.deadzone = 0.1

        control.setValue({x: 0.01, y: 0.01})
        expect(control.getValue().x).toBe(0)
        expect(control.getValue().y).toBe(0)

        control.setValue({x: 0.05, y: 0.05})
        expect(control.getValue().x).toBe(0)
        expect(control.getValue().y).toBe(0)

        control.setValue({x: 0.15, y: 0.15})
        expect(control.getValue().x).toBe(0.15)
        expect(control.getValue().y).toBe(0.15)
    })


    test('denoise method', () => {
        control.noiseThreshold = 0.05
        control.setValue({x: 0.3, y: 0.02})

        expect(control.getValue().x).toBe(0.3)
        expect(control.getValue().y).toBe(0)
    })


    test('applyDeadzone method', () => {
        control.deadzone = 0.2
        control.enableDenoising = false

        control.setValue({x: 0.1, y: 0.1})
        expect(control.getValue().x).toBe(0)
        expect(control.getValue().y).toBe(0)

        control.setValue({x: 0.3, y: 0.4})
        expect(control.getValue().x).toBe(0.3)
        expect(control.getValue().y).toBe(0.4)
    })


    test('realistic gamepad input simulation', () => {
        control.deadzone = 0.1
        control.noiseThreshold = 0.01

        control.setValue({x: 0.005, y: -0.003})
        expect(control.getValue().x).toBe(0)
        expect(control.getValue().y).toBe(0)

        control.setValue({x: 0.05, y: 0.05})
        expect(control.getValue().x).toBe(0)
        expect(control.getValue().y).toBe(0)

        control.setValue({x: 0.8, y: -0.6})
        expect(control.getValue().x).toBe(0.8)
        expect(control.getValue().y).toBe(-0.6)
        expect(control.magnitude).toBe(1.0)
    })


    test('inherited Vec2Control functionality', () => {
        control.setValue({x: 0.6, y: 0.8})
        
        expect(control.x).toBe(0.6)
        expect(control.y).toBe(0.8)
        expect(control.magnitude).toBe(1.0)
        
        const normalized = control.normalized
        expect(normalized.x).toBeCloseTo(0.6)
        expect(normalized.y).toBeCloseTo(0.8)
    })

})
