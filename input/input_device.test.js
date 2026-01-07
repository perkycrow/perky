import InputDevice from './input_device.js'
import InputControl from './input_control.js'
import ButtonControl from './input_controls/button_control.js'
import {vi} from 'vitest'


describe(InputDevice, () => {
    let device

    beforeEach(() => {
        device = new InputDevice({
            $id: 'testDevice'
        })
    })


    test('constructor', () => {
        expect(device.$id).toBe('testDevice')
        expect(device.container).toBe(window)
        expect(device.controls).toBeDefined()
        expect(device.pressedNames).toBeInstanceOf(Set)
        expect(device.pressedNames.size).toBe(0)
    })


    test('constructor with custom container', () => {
        const customContainer = document.createElement('div')
        const customDevice = new InputDevice({
            container: customContainer,
            $id: 'custom'
        })

        expect(customDevice.container).toBe(customContainer)
        expect(customDevice.$id).toBe('custom')
    })


    test('constructor with default name', () => {
        const defaultDevice = new InputDevice()
        expect(defaultDevice.$id).toBe('InputDevice')
    })


    test('registerControl', () => {
        const control = new InputControl({
            device: device,
            name: 'testControl'
        })

        expect(device.registerControl(control)).toBe(true)
        expect(device.controls.has('testControl')).toBe(true)
        expect(device.getControl('testControl')).toBe(control)
    })


    test('registerControl with duplicate name', () => {
        const control1 = new InputControl({
            device: device,
            name: 'duplicate'
        })
        const control2 = new InputControl({
            device: device,
            name: 'duplicate'
        })

        expect(device.registerControl(control1)).toBe(true)
        expect(device.registerControl(control2)).toBe(false)
        expect(device.getControl('duplicate')).toBe(control1)
    })


    test('registerControl with invalid control', () => {
        expect(() => device.registerControl(null)).toThrow('Control must have a name')
        expect(() => device.registerControl({})).toThrow('Control must have a name')
        expect(() => device.registerControl({name: ''})).toThrow('Control must have a name')
    })


    test('getControl', () => {
        const control = new InputControl({
            device: device,
            name: 'getTest'
        })

        device.registerControl(control)
        expect(device.getControl('getTest')).toBe(control)
        expect(device.getControl('nonexistent')).toBeUndefined()
    })


    test('getValueFor', () => {
        const control = device.findOrCreateControl(InputControl, {
            name: 'valueTest'
        })

        control.value = 123
        expect(device.getValueFor('valueTest')).toBe(123)

        control.value = 'hello'
        expect(device.getValueFor('valueTest')).toBe('hello')

        expect(device.getValueFor('nonexistent')).toBeUndefined()
    })


    test('isPressed', () => {
        const button = device.findOrCreateControl(ButtonControl, {
            name: 'pressTest'
        })

        expect(device.isPressed('pressTest')).toBe(false)
        expect(device.isPressed('nonexistent')).toBe(false)

        button.press()
        expect(device.isPressed('pressTest')).toBe(true)

        button.release()
        expect(device.isPressed('pressTest')).toBe(false)
    })


    test('findOrCreateControl creates new control', () => {
        const control = device.findOrCreateControl(InputControl, {
            name: 'newControl'
        })

        expect(control).toBeInstanceOf(InputControl)
        expect(control.name).toBe('newControl')
        expect(control.device).toBe(device)
        expect(device.getControl('newControl')).toBe(control)
    })


    test('findOrCreateControl returns existing control', () => {
        const existingControl = new InputControl({
            device: device,
            name: 'existing'
        })
        device.registerControl(existingControl)

        const foundControl = device.findOrCreateControl(InputControl, {
            name: 'existing'
        })

        expect(foundControl).toBe(existingControl)
    })


    test('findOrCreateControl with additional params', () => {
        const control = device.findOrCreateControl(ButtonControl, {
            name: 'buttonTest',
            pressThreshold: 0.5
        })

        expect(control).toBeInstanceOf(ButtonControl)
        expect(control.name).toBe('buttonTest')
        expect(control.pressThreshold).toBe(0.5)
        expect(control.device).toBe(device)
    })


    test('findOrCreateControl without name throws error', () => {
        expect(() => {
            device.findOrCreateControl(InputControl, {})
        }).toThrow('Control must have a name')

        expect(() => {
            device.findOrCreateControl(InputControl, {name: ''})
        }).toThrow('Control must have a name')
    })


    test('control event propagation - pressed', () => {
        const controlPressedListener = vi.fn()
        device.on('control:pressed', controlPressedListener)

        const button = device.findOrCreateControl(ButtonControl, {
            name: 'testButton'
        })

        button.press()

        expect(controlPressedListener).toHaveBeenCalledWith(button, null, device)
        expect(device.pressedNames.has('testButton')).toBe(true)
    })


    test('control event propagation - released', () => {
        const controlReleasedListener = vi.fn()
        device.on('control:released', controlReleasedListener)

        const button = device.findOrCreateControl(ButtonControl, {
            name: 'testButton'
        })

        button.press()
        expect(device.pressedNames.has('testButton')).toBe(true)

        button.release()
        expect(controlReleasedListener).toHaveBeenCalledWith(button, null, device)
        expect(device.pressedNames.has('testButton')).toBe(false)
    })


    test('control event propagation - updated', () => {
        const controlUpdatedListener = vi.fn()
        device.on('control:updated', controlUpdatedListener)

        const control = device.findOrCreateControl(InputControl, {
            name: 'testControl'
        })

        control.value = 42

        expect(controlUpdatedListener).toHaveBeenCalledWith(control, 42, 0, null, device)
    })

    test('control event propagation - updated forwards event for ButtonControl', () => {
        const controlUpdatedListener = vi.fn()
        device.on('control:updated', controlUpdatedListener)

        const button = device.findOrCreateControl(ButtonControl, {
            name: 'testButton'
        })

        const mockEvent = {type: 'mock'}
        button.setValue(0.5, mockEvent)

        expect(controlUpdatedListener).toHaveBeenCalledWith(button, 0.5, 0, mockEvent, device)
    })


    test('multiple pressed controls tracking', () => {
        const button1 = device.findOrCreateControl(ButtonControl, {name: 'button1'})
        const button2 = device.findOrCreateControl(ButtonControl, {name: 'button2'})

        button1.press()
        expect(device.pressedNames.size).toBe(1)
        expect(device.pressedNames.has('button1')).toBe(true)

        button2.press()
        expect(device.pressedNames.size).toBe(2)
        expect(device.pressedNames.has('button1')).toBe(true)
        expect(device.pressedNames.has('button2')).toBe(true)

        button1.release()
        expect(device.pressedNames.size).toBe(1)
        expect(device.pressedNames.has('button1')).toBe(false)
        expect(device.pressedNames.has('button2')).toBe(true)
    })


    test('control removal cleans up event listeners', () => {
        const button = device.findOrCreateControl(ButtonControl, {name: 'removeTest'})

        button.press()
        expect(device.pressedNames.has('removeTest')).toBe(true)

        device.controls.delete('removeTest')

        expect(device.pressedNames.has('removeTest')).toBe(false)
    })


    test('shouldPreventDefaultFor with undefined/false', () => {
        const event = {preventDefault: vi.fn()}
        const control = {name: 'test'}

        expect(device.shouldPreventDefaultFor(event, control)).toBe(false)

        device.shouldPreventDefault = false
        expect(device.shouldPreventDefaultFor(event, control)).toBe(false)
    })


    test('shouldPreventDefaultFor with true', () => {
        const event = {preventDefault: vi.fn()}
        const control = {name: 'test'}

        device.shouldPreventDefault = true
        expect(device.shouldPreventDefaultFor(event, control)).toBe(true)
    })


    test('shouldPreventDefaultFor with function', () => {
        const event = {preventDefault: vi.fn(), ctrlKey: true}
        const control = {name: 'KeyR'}

        device.shouldPreventDefault = (evt, ctrl, dev) => {
            expect(dev).toBe(device)
            return ctrl.name === 'KeyR' && evt.ctrlKey
        }

        expect(device.shouldPreventDefaultFor(event, control)).toBe(true)

        const anotherEvent = {preventDefault: vi.fn(), ctrlKey: false}
        expect(device.shouldPreventDefaultFor(anotherEvent, control)).toBe(false)
    })


    test('preventDefault when shouldPreventDefaultFor returns true', () => {
        const event = {preventDefault: vi.fn(), stopPropagation: vi.fn()}
        const control = {name: 'test'}

        device.shouldPreventDefault = true
        device.preventDefault(event, control)

        expect(event.preventDefault).toHaveBeenCalledTimes(1)
        expect(event.stopPropagation).toHaveBeenCalledTimes(1)
    })


    test('preventDefault when shouldPreventDefaultFor returns false', () => {
        const event = {preventDefault: vi.fn(), stopPropagation: vi.fn()}
        const control = {name: 'test'}

        device.shouldPreventDefault = false
        device.preventDefault(event, control)

        expect(event.preventDefault).not.toHaveBeenCalled()
        expect(event.stopPropagation).not.toHaveBeenCalled()
    })


    test('preventDefault with null control', () => {
        const event = {preventDefault: vi.fn(), stopPropagation: vi.fn()}

        device.shouldPreventDefault = true
        device.preventDefault(event, null)

        expect(event.preventDefault).not.toHaveBeenCalled()
        expect(event.stopPropagation).not.toHaveBeenCalled()
    })


    test('preventDefault with function condition', () => {
        const event = {preventDefault: vi.fn(), stopPropagation: vi.fn(), ctrlKey: true}
        const control = {name: 'KeyR'}

        device.shouldPreventDefault = (evt, ctrl) => ctrl.name === 'KeyR' && evt.ctrlKey
        device.preventDefault(event, control)

        expect(event.preventDefault).toHaveBeenCalledTimes(1)
        expect(event.stopPropagation).toHaveBeenCalledTimes(1)
    })


    test('event listeners are properly removed when control is deleted from registry', () => {
        const button = new ButtonControl({device: device, name: 'listenerTest'})

        const onSpy = vi.spyOn(button, 'on')
        const offSpy = vi.spyOn(button, 'off')

        device.registerControl(button)

        expect(onSpy).toHaveBeenCalledTimes(3)
        expect(onSpy).toHaveBeenCalledWith('pressed', expect.any(Function))
        expect(onSpy).toHaveBeenCalledWith('released', expect.any(Function))
        expect(onSpy).toHaveBeenCalledWith('updated', expect.any(Function))

        const pressedListener = onSpy.mock.calls.find(call => call[0] === 'pressed')[1]
        const releasedListener = onSpy.mock.calls.find(call => call[0] === 'released')[1]
        const updatedListener = onSpy.mock.calls.find(call => call[0] === 'updated')[1]

        device.controls.delete('listenerTest')

        expect(offSpy).toHaveBeenCalledTimes(3)
        expect(offSpy).toHaveBeenCalledWith('pressed', pressedListener)
        expect(offSpy).toHaveBeenCalledWith('released', releasedListener)
        expect(offSpy).toHaveBeenCalledWith('updated', updatedListener)
    })


    test('onDispose clears all controls', () => {
        const button1 = device.findOrCreateControl(ButtonControl, {name: 'button1'})
        const button2 = device.findOrCreateControl(ButtonControl, {name: 'button2'})

        button1.press()
        button2.press()

        expect(device.controls.size).toBe(2)
        expect(device.pressedNames.size).toBe(2)

        device.dispose()

        expect(device.controls.size).toBe(0)
        expect(device.pressedNames.size).toBe(0)
    })


    test('getPressedControls returns array of pressed control objects', () => {
        const button1 = device.findOrCreateControl(ButtonControl, {name: 'button1'})
        const button2 = device.findOrCreateControl(ButtonControl, {name: 'button2'})
        device.findOrCreateControl(ButtonControl, {name: 'button3'})

        expect(device.getPressedControls()).toEqual([])

        button1.press()
        expect(device.getPressedControls()).toEqual([button1])

        button2.press()
        const pressed = device.getPressedControls()
        expect(pressed).toHaveLength(2)
        expect(pressed).toContain(button1)
        expect(pressed).toContain(button2)

        button1.release()
        expect(device.getPressedControls()).toEqual([button2])
    })

})
