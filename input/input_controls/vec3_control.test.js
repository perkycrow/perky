import Vec3Control from './vec3_control'
import InputControl from '../input_control'
import Vec3 from '../../math/vec3'
import {vi} from 'vitest'

const {VALUE, OLD_VALUE} = InputControl


describe(Vec3Control, () => {
    let control

    beforeEach(() => {
        control = new Vec3Control({
            device: null,
            name: 'testVec3'
        })
    })


    test('constructor', () => {
        expect(control).toBeInstanceOf(InputControl)
        expect(control.name).toBe('testVec3')
        expect(control.value).toBeInstanceOf(Vec3)
        expect(control.value.x).toBe(0)
        expect(control.value.y).toBe(0)
        expect(control.value.z).toBe(0)
    })


    test('constructor with Vec3 value', () => {
        const customControl = new Vec3Control({
            device: null,
            name: 'custom',
            value: new Vec3(3, 4, 5)
        })

        expect(customControl.value).toBeInstanceOf(Vec3)
        expect(customControl.value.x).toBe(3)
        expect(customControl.value.y).toBe(4)
        expect(customControl.value.z).toBe(5)
    })


    test('getDefaultValue', () => {
        const defaultValue = control.getDefaultValue()
        expect(defaultValue).toBeInstanceOf(Vec3)
        expect(defaultValue.x).toBe(0)
        expect(defaultValue.y).toBe(0)
        expect(defaultValue.z).toBe(0)
    })


    test('setValue with Vec3', () => {
        const newVec = new Vec3(5, 6, 7)
        expect(control.setValue(newVec)).toBe(true)
        expect(control.value.x).toBe(5)
        expect(control.value.y).toBe(6)
        expect(control.value.z).toBe(7)
        expect(control.value).not.toBe(newVec)
    })


    test('setValue with object', () => {
        expect(control.setValue({x: 7, y: 8, z: 9})).toBe(true)
        expect(control.value).toBeInstanceOf(Vec3)
        expect(control.value.x).toBe(7)
        expect(control.value.y).toBe(8)
        expect(control.value.z).toBe(9)
    })


    test('setValue with array', () => {
        expect(control.setValue([9, 10, 11])).toBe(true)
        expect(control.value).toBeInstanceOf(Vec3)
        expect(control.value.x).toBe(9)
        expect(control.value.y).toBe(10)
        expect(control.value.z).toBe(11)
    })

    test('setValue with single number', () => {
        expect(control.setValue(12)).toBe(true)
        expect(control.value).toBeInstanceOf(Vec3)
        expect(control.value.x).toBe(12)
        expect(control.value.y).toBe(0)
        expect(control.value.z).toBe(0)
    })


    test('setValue return value', () => {
        expect(control.setValue(new Vec3(1, 2, 3))).toBe(true)
        expect(control.setValue(new Vec3(1, 2, 3))).toBe(false)
        expect(control.setValue(new Vec3(4, 5, 6))).toBe(true)
    })


    test('value change notification', () => {
        const listener = vi.fn()
        control.on('updated', listener)

        const newVec = new Vec3(13, 14, 15)
        control.setValue(newVec)
        
        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({x: 13, y: 14, z: 15}),
            expect.objectContaining({x: 0, y: 0, z: 0})
        )
    })


    test('no notification when value unchanged', () => {
        const listener = vi.fn()
        control.on('updated', listener)

        control.setValue(new Vec3(16, 17, 18))
        expect(listener).toHaveBeenCalledTimes(1)

        control.setValue(new Vec3(16, 17, 18))
        expect(listener).toHaveBeenCalledTimes(1)
    })


    test('oldValue tracking', () => {
        control.setValue(new Vec3(19, 20, 21))
        expect(control.oldValue.x).toBe(0)
        expect(control.oldValue.y).toBe(0)
        expect(control.oldValue.z).toBe(0)

        control.setValue(new Vec3(22, 23, 24))
        expect(control.oldValue.x).toBe(19)
        expect(control.oldValue.y).toBe(20)
        expect(control.oldValue.z).toBe(21)
    })


    test('value property setter', () => {
        control.value = new Vec3(25, 26, 27)
        expect(control.value.x).toBe(25)
        expect(control.value.y).toBe(26)
        expect(control.value.z).toBe(27)
    })


    test('reset', () => {
        control.setValue(new Vec3(28, 29, 30))
        expect(control.value.x).toBe(28)
        expect(control.value.y).toBe(29)
        expect(control.value.z).toBe(30)

        control.reset()
        expect(control.value.x).toBe(0)
        expect(control.value.y).toBe(0)
        expect(control.value.z).toBe(0)
    })


    test('direct symbol access', () => {
        expect(control[VALUE]).toBeInstanceOf(Vec3)
        expect(control[OLD_VALUE]).toBeNull()

        control.setValue(new Vec3(31, 32, 33))
        expect(control[VALUE].x).toBe(31)
        expect(control[VALUE].y).toBe(32)
        expect(control[VALUE].z).toBe(33)
        expect(control[OLD_VALUE].x).toBe(0)
        expect(control[OLD_VALUE].y).toBe(0)
        expect(control[OLD_VALUE].z).toBe(0)
    })

})
