import TouchDevice from './touch_device.js'
import InputDevice from '../input_device.js'
import ButtonControl from '../input_controls/button_control.js'
import Vec2Control from '../input_controls/vec2_control.js'
import {vi} from 'vitest'


function createTouchEvent (type, touches, changedTouches = touches) {
    return {
        type,
        touches: touches.map((t, i) => ({
            identifier: t.identifier ?? i,
            clientX: t.clientX ?? 0,
            clientY: t.clientY ?? 0
        })),
        changedTouches: changedTouches.map((t, i) => ({
            identifier: t.identifier ?? i,
            clientX: t.clientX ?? 0,
            clientY: t.clientY ?? 0
        })),
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
    }
}


describe(TouchDevice, () => {
    let device
    let mockContainer


    beforeEach(() => {
        mockContainer = {
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        }

        device = new TouchDevice({
            container: mockContainer,
            $id: 'testTouch',
            swipeThreshold: 30
        })
    })


    test('constructor', () => {
        expect(device).toBeInstanceOf(InputDevice)
        expect(device.$id).toBe('testTouch')
        expect(device.container).toBe(mockContainer)
        expect(device.swipeThreshold).toBe(30)
    })


    test('constructor with default params', () => {
        const defaultDevice = new TouchDevice()
        expect(defaultDevice.$id).toBe('touch')
        expect(defaultDevice.container).toBe(window)
        expect(defaultDevice.swipeThreshold).toBe(30)
    })


    test('creates controls on construction', () => {
        expect(device.getControl('swipeUp')).toBeInstanceOf(ButtonControl)
        expect(device.getControl('swipeDown')).toBeInstanceOf(ButtonControl)
        expect(device.getControl('swipeLeft')).toBeInstanceOf(ButtonControl)
        expect(device.getControl('swipeRight')).toBeInstanceOf(ButtonControl)
        expect(device.getControl('position')).toBeInstanceOf(Vec2Control)
        expect(device.getControl('delta')).toBeInstanceOf(Vec2Control)
        expect(device.getControl('tap')).toBeInstanceOf(ButtonControl)
    })


    test('start attaches event listeners', () => {
        device.start()

        expect(mockContainer.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function), {passive: false})
        expect(mockContainer.addEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function), {passive: false})
        expect(mockContainer.addEventListener).toHaveBeenCalledWith('touchend', expect.any(Function))
        expect(mockContainer.addEventListener).toHaveBeenCalledWith('touchcancel', expect.any(Function))
        expect(mockContainer.addEventListener).toHaveBeenCalledTimes(4)
    })


    test('stop removes event listeners', () => {
        device.start()
        device.stop()

        expect(mockContainer.removeEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function))
        expect(mockContainer.removeEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function))
        expect(mockContainer.removeEventListener).toHaveBeenCalledWith('touchend', expect.any(Function))
        expect(mockContainer.removeEventListener).toHaveBeenCalledWith('touchcancel', expect.any(Function))
        expect(mockContainer.removeEventListener).toHaveBeenCalledTimes(4)
    })


    test('touchstart updates position', () => {
        device.start()

        const touchstartListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchstart')[1]

        const event = createTouchEvent('touchstart', [{clientX: 100, clientY: 200}])
        touchstartListener(event)

        const position = device.getControl('position')
        expect(position.value.x).toBe(100)
        expect(position.value.y).toBe(200)
    })


    test('touchmove triggers swipeUp when moving up past threshold', () => {
        device.start()

        const touchstartListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchstart')[1]
        const touchmoveListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchmove')[1]

        touchstartListener(createTouchEvent('touchstart', [{clientY: 200}]))
        touchmoveListener(createTouchEvent('touchmove', [{clientY: 150}]))

        expect(device.isPressed('swipeUp')).toBe(true)
        expect(device.isPressed('swipeDown')).toBe(false)
    })


    test('touchmove triggers swipeDown when moving down past threshold', () => {
        device.start()

        const touchstartListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchstart')[1]
        const touchmoveListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchmove')[1]

        touchstartListener(createTouchEvent('touchstart', [{clientY: 200}]))
        touchmoveListener(createTouchEvent('touchmove', [{clientY: 250}]))

        expect(device.isPressed('swipeDown')).toBe(true)
        expect(device.isPressed('swipeUp')).toBe(false)
    })


    test('touchmove does not trigger swipe when below threshold', () => {
        device.start()

        const touchstartListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchstart')[1]
        const touchmoveListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchmove')[1]

        touchstartListener(createTouchEvent('touchstart', [{clientX: 200, clientY: 200}]))
        touchmoveListener(createTouchEvent('touchmove', [{clientX: 210, clientY: 210}]))

        expect(device.isPressed('swipeUp')).toBe(false)
        expect(device.isPressed('swipeDown')).toBe(false)
        expect(device.isPressed('swipeLeft')).toBe(false)
        expect(device.isPressed('swipeRight')).toBe(false)
    })


    test('touchmove triggers swipeLeft when moving left past threshold', () => {
        device.start()

        const touchstartListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchstart')[1]
        const touchmoveListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchmove')[1]

        touchstartListener(createTouchEvent('touchstart', [{clientX: 200, clientY: 200}]))
        touchmoveListener(createTouchEvent('touchmove', [{clientX: 150, clientY: 200}]))

        expect(device.isPressed('swipeLeft')).toBe(true)
        expect(device.isPressed('swipeRight')).toBe(false)
    })


    test('touchmove triggers swipeRight when moving right past threshold', () => {
        device.start()

        const touchstartListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchstart')[1]
        const touchmoveListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchmove')[1]

        touchstartListener(createTouchEvent('touchstart', [{clientX: 200, clientY: 200}]))
        touchmoveListener(createTouchEvent('touchmove', [{clientX: 250, clientY: 200}]))

        expect(device.isPressed('swipeRight')).toBe(true)
        expect(device.isPressed('swipeLeft')).toBe(false)
    })


    test('switching from swipeLeft to swipeRight releases swipeLeft', () => {
        device.start()

        const touchstartListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchstart')[1]
        const touchmoveListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchmove')[1]

        touchstartListener(createTouchEvent('touchstart', [{clientX: 200, clientY: 200}]))
        touchmoveListener(createTouchEvent('touchmove', [{clientX: 150, clientY: 200}]))
        expect(device.isPressed('swipeLeft')).toBe(true)

        touchmoveListener(createTouchEvent('touchmove', [{clientX: 250, clientY: 200}]))
        expect(device.isPressed('swipeLeft')).toBe(false)
        expect(device.isPressed('swipeRight')).toBe(true)
    })


    test('touchend releases all swipes', () => {
        device.start()

        const touchstartListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchstart')[1]
        const touchmoveListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchmove')[1]
        const touchendListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchend')[1]

        touchstartListener(createTouchEvent('touchstart', [{identifier: 0, clientY: 200}]))
        touchmoveListener(createTouchEvent('touchmove', [{identifier: 0, clientY: 150}]))
        expect(device.isPressed('swipeUp')).toBe(true)

        touchendListener(createTouchEvent('touchend', [], [{identifier: 0, clientY: 150}]))
        expect(device.isPressed('swipeUp')).toBe(false)
    })


    test('touchcancel releases all swipes', () => {
        device.start()

        const touchstartListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchstart')[1]
        const touchmoveListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchmove')[1]
        const touchcancelListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchcancel')[1]

        touchstartListener(createTouchEvent('touchstart', [{identifier: 0, clientY: 200}]))
        touchmoveListener(createTouchEvent('touchmove', [{identifier: 0, clientY: 150}]))
        expect(device.isPressed('swipeUp')).toBe(true)

        touchcancelListener(createTouchEvent('touchcancel', [], [{identifier: 0}]))
        expect(device.isPressed('swipeUp')).toBe(false)
    })


    test('ignores second touch when first is active', () => {
        device.start()

        const touchstartListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchstart')[1]

        touchstartListener(createTouchEvent('touchstart', [{identifier: 0, clientX: 100, clientY: 200}]))

        const position = device.getControl('position')
        expect(position.value.x).toBe(100)

        touchstartListener(createTouchEvent('touchstart', [
            {identifier: 0, clientX: 100, clientY: 200},
            {identifier: 1, clientX: 300, clientY: 400}
        ]))

        expect(position.value.x).toBe(100)
    })


    test('updates delta on touchmove', () => {
        device.start()

        const touchstartListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchstart')[1]
        const touchmoveListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchmove')[1]

        touchstartListener(createTouchEvent('touchstart', [{clientY: 200}]))
        touchmoveListener(createTouchEvent('touchmove', [{clientY: 180}]))

        const delta = device.getControl('delta')
        expect(delta.value.y).toBe(-20)
    })


    test('switching from swipeUp to swipeDown releases swipeUp', () => {
        device.start()

        const touchstartListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchstart')[1]
        const touchmoveListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchmove')[1]

        touchstartListener(createTouchEvent('touchstart', [{clientY: 200}]))
        touchmoveListener(createTouchEvent('touchmove', [{clientY: 150}]))
        expect(device.isPressed('swipeUp')).toBe(true)

        touchmoveListener(createTouchEvent('touchmove', [{clientY: 250}]))
        expect(device.isPressed('swipeUp')).toBe(false)
        expect(device.isPressed('swipeDown')).toBe(true)
    })


    test('integration test - full swipe cycle with events', () => {
        const controlPressedListener = vi.fn()
        const controlReleasedListener = vi.fn()

        device.on('control:pressed', controlPressedListener)
        device.on('control:released', controlReleasedListener)

        device.start()

        const touchstartListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchstart')[1]
        const touchmoveListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchmove')[1]
        const touchendListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchend')[1]

        touchstartListener(createTouchEvent('touchstart', [{identifier: 0, clientY: 200}]))
        touchmoveListener(createTouchEvent('touchmove', [{identifier: 0, clientY: 150}]))

        expect(controlPressedListener).toHaveBeenCalledTimes(1)
        expect(controlPressedListener).toHaveBeenCalledWith(
            expect.objectContaining({name: 'swipeUp'}),
            expect.anything(),
            device
        )

        touchendListener(createTouchEvent('touchend', [], [{identifier: 0}]))

        expect(controlReleasedListener).toHaveBeenCalledWith(
            expect.objectContaining({name: 'swipeUp'}),
            expect.anything(),
            device
        )
    })


    test('tap triggers on quick touch without movement', () => {
        const controlPressedListener = vi.fn()
        const controlReleasedListener = vi.fn()

        device.on('control:pressed', controlPressedListener)
        device.on('control:released', controlReleasedListener)

        device.start()

        const touchstartListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchstart')[1]
        const touchendListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchend')[1]

        touchstartListener(createTouchEvent('touchstart', [{identifier: 0, clientX: 100, clientY: 200}]))
        touchendListener(createTouchEvent('touchend', [], [{identifier: 0, clientX: 100, clientY: 200}]))

        expect(controlPressedListener).toHaveBeenCalledWith(
            expect.objectContaining({name: 'tap'}),
            expect.anything(),
            device
        )
        expect(controlReleasedListener).toHaveBeenCalledWith(
            expect.objectContaining({name: 'tap'}),
            expect.anything(),
            device
        )
    })


    test('tap does not trigger when movement exceeds threshold', () => {
        const controlPressedListener = vi.fn()

        device.on('control:pressed', controlPressedListener)

        device.start()

        const touchstartListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchstart')[1]
        const touchendListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchend')[1]

        touchstartListener(createTouchEvent('touchstart', [{identifier: 0, clientX: 100, clientY: 200}]))
        touchendListener(createTouchEvent('touchend', [], [{identifier: 0, clientX: 100, clientY: 250}]))

        const tapCalls = controlPressedListener.mock.calls.filter(
            call => call[0].name === 'tap'
        )
        expect(tapCalls).toHaveLength(0)
    })


    test('tap does not trigger on touchcancel', () => {
        const controlPressedListener = vi.fn()

        device.on('control:pressed', controlPressedListener)

        device.start()

        const touchstartListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchstart')[1]
        const touchcancelListener = mockContainer.addEventListener.mock.calls
            .find(call => call[0] === 'touchcancel')[1]

        touchstartListener(createTouchEvent('touchstart', [{identifier: 0, clientX: 100, clientY: 200}]))
        touchcancelListener(createTouchEvent('touchcancel', [], [{identifier: 0}]))

        const tapCalls = controlPressedListener.mock.calls.filter(
            call => call[0].name === 'tap'
        )
        expect(tapCalls).toHaveLength(0)
    })

})
