import InputDevice from './input_device'
import InputControl from './input_control'
import {vi} from 'vitest'


describe(InputDevice, () => {

    let device

    beforeEach(() => {
        InputDevice.clearCache()
        device = new InputDevice({name: 'TestDevice'})
    })


    test('constructor', () => {
        expect(device.container).toBe(window)
        expect(device.name).toBe('TestDevice')
        expect(device.controls).toBeInstanceOf(Map)
        expect(device.controls.size).toBe(0)
        
        const customContainer = {}
        const customDevice = new InputDevice({container: customContainer})
        
        expect(customDevice.container).toBe(customContainer)
        expect(customDevice.name).toBe('InputDevice')
        expect(customDevice.controls).toBeInstanceOf(Map)
    })


    test('controls getter returns control names', () => {
        const control1 = new InputControl({device: device, name: 'control1'})
        const control2 = new InputControl({device: device, name: 'control2'})

        device.addControl('control1', control1)
        device.addControl('control2', control2)

        const controlNames = Array.from(device.controls.keys())
        
        expect(controlNames).toHaveLength(2)
        expect(controlNames).toContain('control1')
        expect(controlNames).toContain('control2')
        expect(Array.isArray(controlNames)).toBe(true)
    })


    test('methods getter', () => {
        class TestDevice extends InputDevice {
            static methods = ['method1', 'method2']
        }

        const testDevice = new TestDevice()
        expect(testDevice.methods).toEqual(['method1', 'method2'])

        const methods = testDevice.methods
        expect(methods).toBe(testDevice.methods)
    })


    test('events getter', () => {
        class TestDevice extends InputDevice {
            static events = ['event1', 'event2']
        }

        const testDevice = new TestDevice()
        expect(testDevice.events).toEqual(['event1', 'event2'])

        const events = testDevice.events
        expect(events).toBe(testDevice.events)
    })


    test('inheritance in getters', () => {
        class BaseDevice extends InputDevice {
            static methods = ['baseMethod']
            static events = ['baseEvent']
        }

        class ChildDevice extends BaseDevice {
            static methods = ['childMethod']
            static events = ['childEvent']
        }

        const childDevice = new ChildDevice()
        
        expect(childDevice.methods).toEqual(['childMethod', 'baseMethod'])
        expect(childDevice.events).toEqual(['childEvent', 'baseEvent'])
    })


    test('addControl', () => {
        const control = new InputControl({
            device: device,
            name: 'testControl',
            displayName: 'Test Control'
        })

        const result = device.addControl('testControl', control)
        
        expect(result).toBe(control)
        expect(device.controls.get('testControl')).toBe(control)
        expect(device.controls.size).toBe(1)
    })


    test('getControl', () => {
        const control = new InputControl({
            device: device,
            name: 'testControl'
        })

        device.addControl('testControl', control)
        
        expect(device.getControl('testControl')).toBe(control)
        expect(device.getControl('nonExistent')).toBeUndefined()
    })


    test('getAllControls', () => {
        const control1 = new InputControl({device: device, name: 'control1'})
        const control2 = new InputControl({device: device, name: 'control2'})

        device.addControl('control1', control1)
        device.addControl('control2', control2)

        const allControls = device.getAllControls()
        
        expect(allControls).toHaveLength(2)
        expect(allControls).toContain(control1)
        expect(allControls).toContain(control2)
        expect(Array.isArray(allControls)).toBe(true)
    })


    test('removeControl', () => {
        const control = new InputControl({device: device, name: 'testControl'})

        device.addControl('testControl', control)
        expect(device.controls.size).toBe(1)

        const removed = device.removeControl('testControl')
        
        expect(removed).toBe(control)
        expect(device.controls.size).toBe(0)
        expect(device.getControl('testControl')).toBeUndefined()
    })


    test('removeControl with non-existent control', () => {
        const removed = device.removeControl('nonExistent')
        
        expect(removed).toBeUndefined()
        expect(device.controls.size).toBe(0)
    })


    test('createControls is called in constructor', () => {
        class TestDevice extends InputDevice {
            createControls () {
                this.addControl('autoCreated', new InputControl({
                    device: this,
                    name: 'autoCreated'
                }))
            }
        }

        const testDevice = new TestDevice()
        
        expect(testDevice.getControl('autoCreated')).toBeDefined()
        expect(testDevice.controls.size).toBe(1)
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
