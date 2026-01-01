import NavigationControl from './navigation_control.js'
import InputControl from '../input_control.js'
import {vi} from 'vitest'


describe(NavigationControl, () => {

    let control
    let mockDevice


    beforeEach(() => {
        mockDevice = {name: 'testDevice'}
        control = new NavigationControl({
            device: mockDevice,
            name: 'navigation'
        })
    })


    test('constructor', () => {
        expect(control).toBeInstanceOf(InputControl)
        expect(control.device).toBe(mockDevice)
        expect(control.name).toBe('navigation')
    })


    test('getDefaultValue returns zero deltas', () => {
        const defaultValue = control.getDefaultValue()
        expect(defaultValue).toEqual({deltaX: 0, deltaY: 0, deltaZ: 0, event: null})
    })


    test('initial value is zero deltas', () => {
        expect(control.value).toEqual({deltaX: 0, deltaY: 0, deltaZ: 0, event: null})
        expect(control.deltaX).toBe(0)
        expect(control.deltaY).toBe(0)
        expect(control.deltaZ).toBe(0)
    })


    test('setValue with wheel event updates deltas', () => {
        const wheelEvent = {deltaX: 10, deltaY: -5, deltaZ: 2}
        
        control.setValue(wheelEvent)
        
        expect(control.value).toEqual({deltaX: 10, deltaY: -5, deltaZ: 2, event: wheelEvent})
        expect(control.deltaX).toBe(10)
        expect(control.deltaY).toBe(-5)
        expect(control.deltaZ).toBe(2)
    })


    test('setValue with partial wheel event fills missing deltas with zero', () => {
        const wheelEvent = {deltaY: 100}
        
        control.setValue(wheelEvent)
        
        expect(control.value).toEqual({deltaX: 0, deltaY: 100, deltaZ: 0, event: wheelEvent})
        expect(control.deltaY).toBe(100)
    })


    test('setValue emits updated event', () => {
        const listener = vi.fn()
        control.on('updated', listener)
        
        const wheelEvent = {deltaY: 50}
        const mockEvent = {type: 'wheel'}
        
        control.setValue(wheelEvent, mockEvent)
        
        expect(listener).toHaveBeenCalledWith(
            {deltaX: 0, deltaY: 50, deltaZ: 0, event: wheelEvent},
            {deltaX: 0, deltaY: 0, deltaZ: 0, event: null},
            mockEvent
        )
    })


    test('setValue always returns true and emits even for identical deltas', () => {
        const listener = vi.fn()
        control.on('updated', listener)
        
        const wheelEvent = {deltaY: 25}
        
        const result1 = control.setValue(wheelEvent)
        const result2 = control.setValue(wheelEvent)
        
        expect(result1).toBe(true)
        expect(result2).toBe(true)
        expect(listener).toHaveBeenCalledTimes(2)
    })


    test('setValue preserves value until next setValue', () => {
        const wheelEvent1 = {deltaY: 75}
        control.setValue(wheelEvent1)
        
        expect(control.value).toEqual({deltaX: 0, deltaY: 75, deltaZ: 0, event: wheelEvent1})
        
        const wheelEvent2 = {deltaY: 100}
        control.setValue(wheelEvent2)
        
        expect(control.value).toEqual({deltaX: 0, deltaY: 100, deltaZ: 0, event: wheelEvent2})
    })


    test('oldValue tracking works correctly', () => {
        const wheelEvent1 = {deltaY: 10}
        const wheelEvent2 = {deltaY: 20}
        
        control.setValue(wheelEvent1)
        expect(control.oldValue).toEqual({deltaX: 0, deltaY: 0, deltaZ: 0, event: null})
        
        control.setValue(wheelEvent2)
        expect(control.oldValue).toEqual({deltaX: 0, deltaY: 10, deltaZ: 0, event: wheelEvent1})
    })

})
