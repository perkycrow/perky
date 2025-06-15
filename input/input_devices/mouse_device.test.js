import MouseDevice from './mouse_device'
import InputDevice from '../input_device'
import ButtonControl from '../input_controls/button_control'
import Vec2Control from '../input_controls/vec2_control'
import {vi} from 'vitest'


describe(MouseDevice, () => {

    let device
    let mockContainer

    beforeEach(() => {
        mockContainer = {
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        }

        device = new MouseDevice({
            container: mockContainer,
            name: 'testMouse'
        })
    })


    test('constructor', () => {
        expect(device).toBeInstanceOf(InputDevice)
        expect(device.name).toBe('testMouse')
        expect(device.container).toBe(mockContainer)
        expect(device.mousedownListener).toBeInstanceOf(Function)
        expect(device.mouseupListener).toBeInstanceOf(Function)
        expect(device.mousemoveListener).toBeInstanceOf(Function)
    })


    test('constructor with default params', () => {
        const defaultDevice = new MouseDevice()
        expect(defaultDevice.name).toBe('MouseDevice')
        expect(defaultDevice.container).toBe(window)
    })


    test('creates all mouse controls', () => {
        expect(device.getControl('leftButton')).toBeInstanceOf(ButtonControl)
        expect(device.getControl('rightButton')).toBeInstanceOf(ButtonControl)
        expect(device.getControl('middleButton')).toBeInstanceOf(ButtonControl)
        expect(device.getControl('backButton')).toBeInstanceOf(ButtonControl)
        expect(device.getControl('forwardButton')).toBeInstanceOf(ButtonControl)
        expect(device.getControl('position')).toBeInstanceOf(Vec2Control)
    })


    test('start attaches event listeners', () => {
        device.start()

        expect(mockContainer.addEventListener).toHaveBeenCalledWith('mousedown', device.mousedownListener)
        expect(mockContainer.addEventListener).toHaveBeenCalledWith('mouseup', device.mouseupListener)
        expect(mockContainer.addEventListener).toHaveBeenCalledWith('mousemove', device.mousemoveListener)
        expect(mockContainer.addEventListener).toHaveBeenCalledTimes(3)
    })


    test('stop removes event listeners', () => {
        device.start()
        device.stop()

        expect(mockContainer.removeEventListener).toHaveBeenCalledWith('mousedown', device.mousedownListener)
        expect(mockContainer.removeEventListener).toHaveBeenCalledWith('mouseup', device.mouseupListener)
        expect(mockContainer.removeEventListener).toHaveBeenCalledWith('mousemove', device.mousemoveListener)
        expect(mockContainer.removeEventListener).toHaveBeenCalledTimes(3)
    })


    test('dispose calls stop', () => {
        const stopSpy = vi.spyOn(device, 'stop')
        device.dispose()
        expect(stopSpy).toHaveBeenCalled()
    })


    test('mousedown event presses correct button', () => {
        device.start()

        const mousedownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'mousedown')[1]

        mousedownListener({button: 0})
        expect(device.isPressed('leftButton')).toBe(true)

        mousedownListener({button: 2})
        expect(device.isPressed('rightButton')).toBe(true)

        mousedownListener({button: 1})
        expect(device.isPressed('middleButton')).toBe(true)
    })


    test('mouseup event releases correct button', () => {
        device.start()

        const mousedownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'mousedown')[1]
        const mouseupListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'mouseup')[1]

        mousedownListener({button: 0})
        expect(device.isPressed('leftButton')).toBe(true)

        mouseupListener({button: 0})
        expect(device.isPressed('leftButton')).toBe(false)
    })


    test('side buttons work correctly', () => {
        device.start()

        const mousedownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'mousedown')[1]

        mousedownListener({button: 3})
        expect(device.isPressed('backButton')).toBe(true)

        mousedownListener({button: 4})
        expect(device.isPressed('forwardButton')).toBe(true)
    })


    test('mousemove updates position', () => {
        device.start()

        const mousemoveListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'mousemove')[1]

        const positionControl = device.getControl('position')
        expect(positionControl.value.x).toBe(0)
        expect(positionControl.value.y).toBe(0)

        mousemoveListener({clientX: 100, clientY: 200})
        expect(positionControl.value.x).toBe(100)
        expect(positionControl.value.y).toBe(200)

        mousemoveListener({clientX: 300, clientY: 400})
        expect(positionControl.value.x).toBe(300)
        expect(positionControl.value.y).toBe(400)
    })


    test('mousedown does not press already pressed button', () => {
        device.start()

        const mousedownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'mousedown')[1]

        mousedownListener({button: 0})
        const leftButton = device.getControl('leftButton')
        const pressSpy = vi.spyOn(leftButton, 'press')

        mousedownListener({button: 0})
        expect(pressSpy).not.toHaveBeenCalled()
    })


    test('integration test - full mouse interaction', () => {
        const controlPressedListener = vi.fn()
        const controlReleasedListener = vi.fn()
        const controlUpdatedListener = vi.fn()

        device.on('control:pressed', controlPressedListener)
        device.on('control:released', controlReleasedListener)
        device.on('control:updated', controlUpdatedListener)

        device.start()

        const mousedownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'mousedown')[1]
        const mouseupListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'mouseup')[1]
        const mousemoveListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'mousemove')[1]

        mousemoveListener({clientX: 50, clientY: 75})
        expect(controlUpdatedListener).toHaveBeenCalledTimes(1)

        mousedownListener({button: 0})
        expect(controlPressedListener).toHaveBeenCalledTimes(1)
        expect(device.isPressed('leftButton')).toBe(true)

        mouseupListener({button: 0})
        expect(controlReleasedListener).toHaveBeenCalledTimes(1)
        expect(device.isPressed('leftButton')).toBe(false)
    })

})
