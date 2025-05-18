import InputDevice from './input_device'
import {vi} from 'vitest'


describe(InputDevice, () => {

    let device

    beforeEach(() => {
        InputDevice.cache = {}
        device = new InputDevice({name: 'TestDevice'})
    })


    test('static properties initialization', () => {
        expect(InputDevice.methods).toEqual([])
        expect(InputDevice.controls).toEqual([])
        expect(InputDevice.events).toEqual([])
    })


    test('constructor', () => {
        expect(device.container).toBe(window)
        expect(device.name).toBe('TestDevice')
        
        const customContainer = {}
        const customDevice = new InputDevice({container: customContainer})
        
        expect(customDevice.container).toBe(customContainer)
        expect(customDevice.name).toBe('InputDevice')
    })


    test('controls getter', () => {
        class TestDevice extends InputDevice {
            static controls = ['button1', 'button2']
        }

        TestDevice.cache = {}

        const testDevice = new TestDevice()
        expect(testDevice.controls).toEqual(['button1', 'button2'])

        const controls = testDevice.controls
        expect(controls).toBe(testDevice.controls)
        expect(TestDevice.cache.controls).toBe(controls)
    })


    test('methods getter', () => {
        class TestDevice extends InputDevice {
            static methods = ['method1', 'method2']
        }

        TestDevice.cache = {}

        const testDevice = new TestDevice()
        expect(testDevice.methods).toEqual(['method1', 'method2'])

        const methods = testDevice.methods
        expect(methods).toBe(testDevice.methods)
        expect(TestDevice.cache.methods).toBe(methods)
    })


    test('events getter', () => {
        class TestDevice extends InputDevice {
            static events = ['event1', 'event2']
        }

        TestDevice.cache = {}

        const testDevice = new TestDevice()
        expect(testDevice.events).toEqual(['event1', 'event2'])

        const events = testDevice.events
        expect(events).toBe(testDevice.events)
        expect(TestDevice.cache.events).toBe(events)
    })


    test('inheritance in getters', () => {
        class BaseDevice extends InputDevice {
            static controls = ['baseControl']
            static methods = ['baseMethod']
            static events = ['baseEvent']
        }

        class ChildDevice extends BaseDevice {
            static controls = ['childControl']
            static methods = ['childMethod']
            static events = ['childEvent']
        }

        BaseDevice.cache = {}
        ChildDevice.cache = {}

        const childDevice = new ChildDevice()
        
        expect(childDevice.controls).toEqual(['childControl', 'baseControl'])
        expect(childDevice.methods).toEqual(['childMethod', 'baseMethod'])
        expect(childDevice.events).toEqual(['childEvent', 'baseEvent'])
    })


    test('start', () => {
        const spy = vi.spyOn(device, 'observe')
        const superStartSpy = vi.spyOn(Object.getPrototypeOf(InputDevice.prototype), 'start')
        
        superStartSpy.mockReturnValue(true)
        spy.mockReturnValue(true)
        
        expect(device.start()).toBe(true)
        expect(superStartSpy).toHaveBeenCalled()
        expect(spy).toHaveBeenCalled()
        
        superStartSpy.mockReturnValue(false)
        expect(device.start()).toBe(false)
    })


    test('stop', () => {
        const spy = vi.spyOn(device, 'unobserve')
        const superStopSpy = vi.spyOn(Object.getPrototypeOf(InputDevice.prototype), 'stop')
        
        superStopSpy.mockReturnValue(true)
        spy.mockReturnValue(true)
        
        expect(device.stop()).toBe(true)
        expect(superStopSpy).toHaveBeenCalled()
        expect(spy).toHaveBeenCalled()
        
        superStopSpy.mockReturnValue(false)
        expect(device.stop()).toBe(false)
    })


    test('observe', () => {
        expect(device.observe()).toBe(true)
    })


    test('unobserve', () => {
        expect(device.unobserve()).toBe(true)
    })

})
