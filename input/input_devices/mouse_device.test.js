import MouseDevice from './mouse_device'
import InputDevice from '../input_device'
import ButtonControl from '../input_controls/button_control'
import Vec2Control from '../input_controls/vec2_control'
import NavigationControl from '../input_controls/navigation_control'
import {vi} from 'vitest'

function createMockEvent (props = {}) {
    return {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        ...props
    }
}

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
            $id: 'testMouse'
        })
    })


    test('constructor', () => {
        expect(device).toBeInstanceOf(InputDevice)
        expect(device.$id).toBe('testMouse')
        expect(device.container).toBe(mockContainer)
    })


    test('constructor with default params', () => {
        const defaultDevice = new MouseDevice()
        expect(defaultDevice.$id).toBe('mouse')
        expect(defaultDevice.container).toBe(window)
    })


    test('creates all mouse controls', () => {
        expect(device.getControl('leftButton')).toBeInstanceOf(ButtonControl)
        expect(device.getControl('rightButton')).toBeInstanceOf(ButtonControl)
        expect(device.getControl('middleButton')).toBeInstanceOf(ButtonControl)
        expect(device.getControl('backButton')).toBeInstanceOf(ButtonControl)
        expect(device.getControl('forwardButton')).toBeInstanceOf(ButtonControl)
        expect(device.getControl('position')).toBeInstanceOf(Vec2Control)
        expect(device.getControl('navigation')).toBeInstanceOf(NavigationControl)
    })


    test('start attaches event listeners', () => {
        device.start()

        expect(mockContainer.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function))
        expect(mockContainer.addEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function))
        expect(mockContainer.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function))
        expect(mockContainer.addEventListener).toHaveBeenCalledWith('contextmenu', expect.any(Function))
        expect(mockContainer.addEventListener).toHaveBeenCalledWith('wheel', expect.any(Function), {passive: false})
        expect(mockContainer.addEventListener).toHaveBeenCalledTimes(5)
    })


    test('stop removes event listeners', () => {
        device.start()
        device.stop()

        expect(mockContainer.removeEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function))
        expect(mockContainer.removeEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function))
        expect(mockContainer.removeEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function))
        expect(mockContainer.removeEventListener).toHaveBeenCalledWith('contextmenu', expect.any(Function))
        expect(mockContainer.removeEventListener).toHaveBeenCalledWith('wheel', expect.any(Function), {passive: false})
        expect(mockContainer.removeEventListener).toHaveBeenCalledTimes(5)
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

        mousedownListener(createMockEvent({button: 0}))
        expect(device.isPressed('leftButton')).toBe(true)

        mousedownListener(createMockEvent({button: 2}))
        expect(device.isPressed('rightButton')).toBe(true)

        mousedownListener(createMockEvent({button: 1}))
        expect(device.isPressed('middleButton')).toBe(true)
    })


    test('mouseup event releases correct button', () => {
        device.start()

        const mousedownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'mousedown')[1]
        const mouseupListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'mouseup')[1]

        mousedownListener(createMockEvent({button: 0}))
        expect(device.isPressed('leftButton')).toBe(true)

        mouseupListener(createMockEvent({button: 0}))
        expect(device.isPressed('leftButton')).toBe(false)
    })


    test('side buttons work correctly', () => {
        device.start()

        const mousedownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'mousedown')[1]

        mousedownListener(createMockEvent({button: 3}))
        expect(device.isPressed('backButton')).toBe(true)

        mousedownListener(createMockEvent({button: 4}))
        expect(device.isPressed('forwardButton')).toBe(true)
    })


    test('mousemove updates position', () => {
        device.start()

        const mousemoveListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'mousemove')[1]

        const positionControl = device.getControl('position')
        expect(positionControl.value.x).toBe(0)
        expect(positionControl.value.y).toBe(0)

        mousemoveListener(createMockEvent({clientX: 100, clientY: 200}))
        expect(positionControl.value.x).toBe(100)
        expect(positionControl.value.y).toBe(200)

        mousemoveListener(createMockEvent({clientX: 300, clientY: 400}))
        expect(positionControl.value.x).toBe(300)
        expect(positionControl.value.y).toBe(400)
    })


    test('mousedown does not press already pressed button', () => {
        device.start()

        const mousedownListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'mousedown')[1]

        mousedownListener(createMockEvent({button: 0}))
        const leftButton = device.getControl('leftButton')
        const pressSpy = vi.spyOn(leftButton, 'press')

        mousedownListener(createMockEvent({button: 0}))
        expect(pressSpy).not.toHaveBeenCalled()
    })


    test('wheel event updates navigation control', () => {
        device.start()

        const wheelListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'wheel')[1]

        const navigationControl = device.getControl('navigation')
        expect(navigationControl.value).toEqual({deltaX: 0, deltaY: 0, deltaZ: 0, event: null})

        const mockEvent = createMockEvent({deltaX: 10, deltaY: -50, deltaZ: 0})
        wheelListener(mockEvent)
        expect(navigationControl.value).toEqual({deltaX: 10, deltaY: -50, deltaZ: 0, event: mockEvent})
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

        mousemoveListener(createMockEvent({clientX: 50, clientY: 75}))
        expect(controlUpdatedListener).toHaveBeenCalledTimes(1)

        mousedownListener(createMockEvent({button: 0}))
        expect(controlPressedListener).toHaveBeenCalledTimes(1)
        expect(device.isPressed('leftButton')).toBe(true)

        mouseupListener(createMockEvent({button: 0}))
        expect(controlReleasedListener).toHaveBeenCalledTimes(1)
        expect(device.isPressed('leftButton')).toBe(false)
    })

})
