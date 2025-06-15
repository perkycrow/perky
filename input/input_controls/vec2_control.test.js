import Vec2Control from './vec2_control'
import InputControl from '../input_control'
import Vec2 from '../../math/vec2'
import {vi} from 'vitest'

const {VALUE, OLD_VALUE} = InputControl

describe(Vec2Control, () => {

    let control

    beforeEach(() => {
        control = new Vec2Control({
            device: null,
            name: 'testVec2'
        })
    })


    test('constructor', () => {
        expect(control).toBeInstanceOf(InputControl)
        expect(control.name).toBe('testVec2')
        expect(control.value).toBeInstanceOf(Vec2)
        expect(control.value.x).toBe(0)
        expect(control.value.y).toBe(0)
    })


    test('constructor with Vec2 value', () => {
        const customControl = new Vec2Control({
            device: null,
            name: 'custom',
            value: new Vec2(3, 4)
        })

        expect(customControl.value).toBeInstanceOf(Vec2)
        expect(customControl.value.x).toBe(3)
        expect(customControl.value.y).toBe(4)
    })

    test('getDefaultValue', () => {
        const defaultValue = control.getDefaultValue()
        expect(defaultValue).toBeInstanceOf(Vec2)
        expect(defaultValue.x).toBe(0)
        expect(defaultValue.y).toBe(0)
    })


    test('setValue with Vec2', () => {
        const newVec = new Vec2(5, 6)
        expect(control.setValue(newVec)).toBe(true)
        expect(control.value.x).toBe(5)
        expect(control.value.y).toBe(6)
        expect(control.value).not.toBe(newVec) // Should be a new instance
    })

    test('setValue with object', () => {
        expect(control.setValue({x: 7, y: 8})).toBe(true)
        expect(control.value).toBeInstanceOf(Vec2)
        expect(control.value.x).toBe(7)
        expect(control.value.y).toBe(8)
    })


    test('setValue with array', () => {
        expect(control.setValue([9, 10])).toBe(true)
        expect(control.value).toBeInstanceOf(Vec2)
        expect(control.value.x).toBe(9)
        expect(control.value.y).toBe(10)
    })


    test('setValue with single number', () => {
        expect(control.setValue(11)).toBe(true)
        expect(control.value).toBeInstanceOf(Vec2)
        expect(control.value.x).toBe(11)
        expect(control.value.y).toBe(0)
    })


    test('setValue return value', () => {
        expect(control.setValue(new Vec2(1, 2))).toBe(true)
        expect(control.setValue(new Vec2(1, 2))).toBe(false) // Same value
        expect(control.setValue(new Vec2(3, 4))).toBe(true)
    })


    test('value change notification', () => {
        const listener = vi.fn()
        control.on('updated', listener)

        const newVec = new Vec2(13, 14)
        control.setValue(newVec)
        
        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({x: 13, y: 14}),
            expect.objectContaining({x: 0, y: 0})
        )
    })


    test('no notification when value unchanged', () => {
        const listener = vi.fn()
        control.on('updated', listener)

        control.setValue(new Vec2(15, 16))
        expect(listener).toHaveBeenCalledTimes(1)

        control.setValue(new Vec2(15, 16))
        expect(listener).toHaveBeenCalledTimes(1) // No additional call
    })


    test('oldValue tracking', () => {
        control.setValue(new Vec2(17, 18))
        expect(control.oldValue.x).toBe(0)
        expect(control.oldValue.y).toBe(0)

        control.setValue(new Vec2(19, 20))
        expect(control.oldValue.x).toBe(17)
        expect(control.oldValue.y).toBe(18)
    })


    test('value property setter', () => {
        control.value = new Vec2(21, 22)
        expect(control.value.x).toBe(21)
        expect(control.value.y).toBe(22)
    })


    test('reset', () => {
        control.setValue(new Vec2(23, 24))
        expect(control.value.x).toBe(23)
        expect(control.value.y).toBe(24)

        control.reset()
        expect(control.value.x).toBe(0)
        expect(control.value.y).toBe(0)
    })


    test('direct symbol access', () => {
        expect(control[VALUE]).toBeInstanceOf(Vec2)
        expect(control[OLD_VALUE]).toBeNull()

        control.setValue(new Vec2(25, 26))
        expect(control[VALUE].x).toBe(25)
        expect(control[VALUE].y).toBe(26)
        expect(control[OLD_VALUE].x).toBe(0)
        expect(control[OLD_VALUE].y).toBe(0)
    })

})
