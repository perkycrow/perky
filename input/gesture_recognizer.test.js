import GestureRecognizer from './gesture_recognizer.js'
import Notifier from '../core/notifier.js'
import {vi} from 'vitest'


function createPointerEvent (type, overrides = {}) {
    return {
        type,
        pointerId: overrides.pointerId ?? 1,
        clientX: overrides.clientX ?? 0,
        clientY: overrides.clientY ?? 0,
        button: overrides.button ?? 0,
        deltaX: overrides.deltaX ?? 0,
        deltaY: overrides.deltaY ?? 0,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
    }
}


function createMockElement () {
    return {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        setPointerCapture: vi.fn(),
        style: {}
    }
}


function getListener (element, eventName) {
    return element.addEventListener.mock.calls
        .find(call => call[0] === eventName)[1]
}


describe(GestureRecognizer, () => {
    let recognizer
    let element


    beforeEach(() => {
        element = createMockElement()
        recognizer = new GestureRecognizer(element, {
            tapThreshold: 10,
            tapMaxDuration: 300,
            longPressDelay: 500,
            pinchThreshold: 10,
            dragThreshold: 5,
            doubleTapDelay: 300,
            multiTouchWindow: 100
        })
    })


    afterEach(() => {
        vi.restoreAllMocks()
    })


    test('constructor', () => {
        expect(recognizer).toBeInstanceOf(Notifier)
        expect(recognizer.element).toBe(element)
        expect(recognizer.tapThreshold).toBe(10)
        expect(recognizer.tapMaxDuration).toBe(300)
        expect(recognizer.longPressDelay).toBe(500)
        expect(recognizer.pinchThreshold).toBe(10)
        expect(recognizer.dragThreshold).toBe(5)
        expect(recognizer.doubleTapDelay).toBe(300)
    })


    test('constructor with default params', () => {
        const defaultRecognizer = new GestureRecognizer(element)
        expect(defaultRecognizer.tapThreshold).toBe(10)
        expect(defaultRecognizer.tapMaxDuration).toBe(300)
        expect(defaultRecognizer.longPressDelay).toBe(500)
        expect(defaultRecognizer.pinchThreshold).toBe(10)
        expect(defaultRecognizer.dragThreshold).toBe(5)
        expect(defaultRecognizer.doubleTapDelay).toBe(300)
        expect(defaultRecognizer.multiTouchWindow).toBe(100)
        expect(defaultRecognizer.preventDefaultEvents).toBe(true)
    })


    test('start attaches event listeners', () => {
        recognizer.start()

        expect(element.addEventListener).toHaveBeenCalledWith('pointerdown', expect.any(Function))
        expect(element.addEventListener).toHaveBeenCalledWith('pointermove', expect.any(Function))
        expect(element.addEventListener).toHaveBeenCalledWith('pointerup', expect.any(Function))
        expect(element.addEventListener).toHaveBeenCalledWith('pointercancel', expect.any(Function))
        expect(element.addEventListener).toHaveBeenCalledWith('wheel', expect.any(Function), {passive: false})
        expect(element.addEventListener).toHaveBeenCalledWith('contextmenu', expect.any(Function))
        expect(element.style.touchAction).toBe('none')
    })


    test('stop removes event listeners', () => {
        recognizer.start()
        recognizer.stop()

        expect(element.removeEventListener).toHaveBeenCalledWith('pointerdown', expect.any(Function))
        expect(element.removeEventListener).toHaveBeenCalledWith('pointermove', expect.any(Function))
        expect(element.removeEventListener).toHaveBeenCalledWith('pointerup', expect.any(Function))
        expect(element.removeEventListener).toHaveBeenCalledWith('pointercancel', expect.any(Function))
        expect(element.removeEventListener).toHaveBeenCalledWith('wheel', expect.any(Function))
        expect(element.removeEventListener).toHaveBeenCalledWith('contextmenu', expect.any(Function))
    })


    test('dispose stops and removes all listeners', () => {
        const listener = vi.fn()
        recognizer.on('tap', listener)
        recognizer.start()
        recognizer.dispose()

        expect(element.removeEventListener).toHaveBeenCalled()
    })


    test('pointerCount', () => {
        recognizer.start()
        expect(recognizer.pointerCount).toBe(0)

        const pointerdown = getListener(element, 'pointerdown')
        pointerdown(createPointerEvent('pointerdown', {pointerId: 1}))

        expect(recognizer.pointerCount).toBe(1)
    })


    test('gestureState starts idle', () => {
        expect(recognizer.gestureState).toBe('idle')
    })


    test('tap on quick press and release', () => {
        const tapListener = vi.fn()
        recognizer.on('tap', tapListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointerup = getListener(element, 'pointerup')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        pointerup(createPointerEvent('pointerup', {pointerId: 1, clientX: 100, clientY: 200}))

        expect(tapListener).toHaveBeenCalledWith({x: 100, y: 200, pointerCount: 1})
    })


    test('tap does not trigger when movement exceeds threshold', () => {
        const tapListener = vi.fn()
        recognizer.on('tap', tapListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointermove = getListener(element, 'pointermove')
        const pointerup = getListener(element, 'pointerup')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        pointermove(createPointerEvent('pointermove', {pointerId: 1, clientX: 120, clientY: 200}))
        pointerup(createPointerEvent('pointerup', {pointerId: 1, clientX: 120, clientY: 200}))

        expect(tapListener).not.toHaveBeenCalled()
    })


    test('tap does not trigger when duration exceeds max', () => {
        vi.useFakeTimers()
        const tapListener = vi.fn()
        recognizer.on('tap', tapListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointerup = getListener(element, 'pointerup')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        vi.advanceTimersByTime(400)
        pointerup(createPointerEvent('pointerup', {pointerId: 1, clientX: 100, clientY: 200}))

        expect(tapListener).not.toHaveBeenCalled()
        vi.useRealTimers()
    })


    test('drag start after moving past threshold', () => {
        const dragStartListener = vi.fn()
        recognizer.on('drag:start', dragStartListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointermove = getListener(element, 'pointermove')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        pointermove(createPointerEvent('pointermove', {pointerId: 1, clientX: 110, clientY: 200}))

        expect(dragStartListener).toHaveBeenCalledWith({
            x: 100,
            y: 200,
            pointerId: 1
        })
        expect(recognizer.gestureState).toBe('dragging')
    })


    test('drag move emits position and delta', () => {
        const dragMoveListener = vi.fn()
        recognizer.on('drag:move', dragMoveListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointermove = getListener(element, 'pointermove')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        pointermove(createPointerEvent('pointermove', {pointerId: 1, clientX: 110, clientY: 200}))
        pointermove(createPointerEvent('pointermove', {pointerId: 1, clientX: 120, clientY: 210}))

        expect(dragMoveListener).toHaveBeenLastCalledWith({
            x: 120,
            y: 210,
            dx: 20,
            dy: 10,
            startX: 100,
            startY: 200
        })
    })


    test('drag end on pointer up', () => {
        const dragEndListener = vi.fn()
        recognizer.on('drag:end', dragEndListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointermove = getListener(element, 'pointermove')
        const pointerup = getListener(element, 'pointerup')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        pointermove(createPointerEvent('pointermove', {pointerId: 1, clientX: 120, clientY: 200}))
        pointerup(createPointerEvent('pointerup', {pointerId: 1, clientX: 120, clientY: 200}))

        expect(dragEndListener).toHaveBeenCalledWith({
            x: 120,
            y: 200,
            startX: 100,
            startY: 200
        })
        expect(recognizer.gestureState).toBe('idle')
    })


    test('drag does not start below threshold', () => {
        const dragStartListener = vi.fn()
        recognizer.on('drag:start', dragStartListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointermove = getListener(element, 'pointermove')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        pointermove(createPointerEvent('pointermove', {pointerId: 1, clientX: 103, clientY: 202}))

        expect(dragStartListener).not.toHaveBeenCalled()
        expect(recognizer.gestureState).toBe('tap-candidate')
    })


    test('middle button starts pan', () => {
        const panStartListener = vi.fn()
        recognizer.on('pan:start', panStartListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, button: 1, clientX: 50, clientY: 60}))

        expect(panStartListener).toHaveBeenCalledWith({x: 50, y: 60})
        expect(recognizer.gestureState).toBe('panning')
    })


    test('right button starts pan', () => {
        const panStartListener = vi.fn()
        recognizer.on('pan:start', panStartListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, button: 2, clientX: 50, clientY: 60}))

        expect(panStartListener).toHaveBeenCalledWith({x: 50, y: 60})
    })


    test('pan move emits delta', () => {
        const panMoveListener = vi.fn()
        recognizer.on('pan:move', panMoveListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointermove = getListener(element, 'pointermove')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, button: 1, clientX: 50, clientY: 60}))
        pointermove(createPointerEvent('pointermove', {pointerId: 1, clientX: 70, clientY: 80}))

        expect(panMoveListener).toHaveBeenCalledWith({dx: 20, dy: 20})
    })


    test('pan end on pointer up', () => {
        const panEndListener = vi.fn()
        recognizer.on('pan:end', panEndListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointerup = getListener(element, 'pointerup')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, button: 1, clientX: 50, clientY: 60}))
        pointerup(createPointerEvent('pointerup', {pointerId: 1, clientX: 50, clientY: 60}))

        expect(panEndListener).toHaveBeenCalled()
        expect(recognizer.gestureState).toBe('idle')
    })


    test('wheel emits delta and position', () => {
        const wheelListener = vi.fn()
        recognizer.on('wheel', wheelListener)
        recognizer.start()

        const wheel = getListener(element, 'wheel')
        const event = createPointerEvent('wheel', {deltaX: 0, deltaY: -100, clientX: 200, clientY: 300})
        wheel(event)

        expect(wheelListener).toHaveBeenCalledWith({
            deltaX: 0,
            deltaY: -100,
            x: 200,
            y: 300
        })
        expect(event.preventDefault).toHaveBeenCalled()
    })


    test('wheel does not prevent default when disabled', () => {
        recognizer.preventDefaultEvents = false
        recognizer.start()

        const wheel = getListener(element, 'wheel')
        const event = createPointerEvent('wheel', {deltaY: -100})
        wheel(event)

        expect(event.preventDefault).not.toHaveBeenCalled()
    })


    test('contextmenu is prevented by default', () => {
        recognizer.start()

        const contextmenu = getListener(element, 'contextmenu')
        const event = {preventDefault: vi.fn()}
        contextmenu(event)

        expect(event.preventDefault).toHaveBeenCalled()
    })


    test('pinch start with two pointers', () => {
        vi.useFakeTimers()
        const pinchStartListener = vi.fn()
        recognizer.on('pinch:start', pinchStartListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        vi.advanceTimersByTime(200)
        pointerdown(createPointerEvent('pointerdown', {pointerId: 2, clientX: 200, clientY: 200}))

        expect(pinchStartListener).toHaveBeenCalledWith({
            centerX: 150,
            centerY: 200,
            distance: 100
        })
        vi.useRealTimers()
    })


    test('pinch move emits scale and center', () => {
        vi.useFakeTimers()
        const pinchMoveListener = vi.fn()
        recognizer.on('pinch:move', pinchMoveListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointermove = getListener(element, 'pointermove')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        vi.advanceTimersByTime(200)
        pointerdown(createPointerEvent('pointerdown', {pointerId: 2, clientX: 200, clientY: 200}))
        pointermove(createPointerEvent('pointermove', {pointerId: 1, clientX: 50, clientY: 200}))

        expect(pinchMoveListener).toHaveBeenCalledWith(expect.objectContaining({
            scale: expect.any(Number),
            centerX: expect.any(Number),
            centerY: expect.any(Number),
            distance: expect.any(Number),
            dx: expect.any(Number),
            dy: expect.any(Number)
        }))
        vi.useRealTimers()
    })


    test('pinch scale increases when pointers spread apart', () => {
        vi.useFakeTimers()
        const pinchMoveListener = vi.fn()
        recognizer.on('pinch:move', pinchMoveListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointermove = getListener(element, 'pointermove')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        vi.advanceTimersByTime(200)
        pointerdown(createPointerEvent('pointerdown', {pointerId: 2, clientX: 200, clientY: 200}))
        pointermove(createPointerEvent('pointermove', {pointerId: 1, clientX: 50, clientY: 200}))

        const {scale} = pinchMoveListener.mock.calls[0][0]
        expect(scale).toBeGreaterThan(1)
        vi.useRealTimers()
    })


    test('pinch scale decreases when pointers come closer', () => {
        vi.useFakeTimers()
        const pinchMoveListener = vi.fn()
        recognizer.on('pinch:move', pinchMoveListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointermove = getListener(element, 'pointermove')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        vi.advanceTimersByTime(200)
        pointerdown(createPointerEvent('pointerdown', {pointerId: 2, clientX: 200, clientY: 200}))
        pointermove(createPointerEvent('pointermove', {pointerId: 1, clientX: 140, clientY: 200}))

        const {scale} = pinchMoveListener.mock.calls[0][0]
        expect(scale).toBeLessThan(1)
        vi.useRealTimers()
    })


    test('pinch end when pointer released', () => {
        vi.useFakeTimers()
        const pinchEndListener = vi.fn()
        recognizer.on('pinch:end', pinchEndListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointerup = getListener(element, 'pointerup')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        vi.advanceTimersByTime(200)
        pointerdown(createPointerEvent('pointerdown', {pointerId: 2, clientX: 200, clientY: 200}))

        const pointermove = getListener(element, 'pointermove')
        pointermove(createPointerEvent('pointermove', {pointerId: 1, clientX: 50, clientY: 200}))

        pointerup(createPointerEvent('pointerup', {pointerId: 2, clientX: 200, clientY: 200}))

        expect(pinchEndListener).toHaveBeenCalled()
        expect(recognizer.gestureState).toBe('idle')
        vi.useRealTimers()
    })


    test('second pointer cancels active drag and starts pinch', () => {
        const dragEndListener = vi.fn()
        const pinchStartListener = vi.fn()
        recognizer.on('drag:end', dragEndListener)
        recognizer.on('pinch:start', pinchStartListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointermove = getListener(element, 'pointermove')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        pointermove(createPointerEvent('pointermove', {pointerId: 1, clientX: 120, clientY: 200}))
        expect(recognizer.gestureState).toBe('dragging')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 2, clientX: 200, clientY: 200}))

        expect(dragEndListener).toHaveBeenCalled()
        expect(pinchStartListener).toHaveBeenCalled()
        expect(recognizer.gestureState).toBe('pinching')
    })


    test('longpress emits after delay without movement', () => {
        vi.useFakeTimers()
        const longpressListener = vi.fn()
        recognizer.on('longpress', longpressListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))

        vi.advanceTimersByTime(500)

        expect(longpressListener).toHaveBeenCalledWith({x: 100, y: 200})
        expect(recognizer.gestureState).toBe('idle')
        vi.useRealTimers()
    })


    test('longpress cancelled by movement', () => {
        vi.useFakeTimers()
        const longpressListener = vi.fn()
        recognizer.on('longpress', longpressListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointermove = getListener(element, 'pointermove')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        pointermove(createPointerEvent('pointermove', {pointerId: 1, clientX: 120, clientY: 200}))

        vi.advanceTimersByTime(500)

        expect(longpressListener).not.toHaveBeenCalled()
        vi.useRealTimers()
    })


    test('longpress on slow release without timer', () => {
        vi.useFakeTimers()
        const longpressListener = vi.fn()
        const tapListener = vi.fn()
        recognizer.on('longpress', longpressListener)
        recognizer.on('tap', tapListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointerup = getListener(element, 'pointerup')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))

        vi.advanceTimersByTime(250)

        longpressListener.mockClear()

        vi.advanceTimersByTime(350)
        pointerup(createPointerEvent('pointerup', {pointerId: 1, clientX: 100, clientY: 200}))

        expect(tapListener).not.toHaveBeenCalled()
        vi.useRealTimers()
    })


    test('doubletap on two quick taps', () => {
        const doubletapListener = vi.fn()
        const tapListener = vi.fn()
        recognizer.on('doubletap', doubletapListener)
        recognizer.on('tap', tapListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointerup = getListener(element, 'pointerup')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        pointerup(createPointerEvent('pointerup', {pointerId: 1, clientX: 100, clientY: 200}))

        expect(tapListener).toHaveBeenCalledTimes(1)

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        pointerup(createPointerEvent('pointerup', {pointerId: 1, clientX: 100, clientY: 200}))

        expect(doubletapListener).toHaveBeenCalledWith({x: 100, y: 200})
        expect(tapListener).toHaveBeenCalledTimes(1)
    })


    test('doubletap does not trigger when taps are far apart', () => {
        const doubletapListener = vi.fn()
        recognizer.on('doubletap', doubletapListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointerup = getListener(element, 'pointerup')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        pointerup(createPointerEvent('pointerup', {pointerId: 1, clientX: 100, clientY: 200}))

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 200, clientY: 200}))
        pointerup(createPointerEvent('pointerup', {pointerId: 1, clientX: 200, clientY: 200}))

        expect(doubletapListener).not.toHaveBeenCalled()
    })


    test('doubletap does not trigger when taps are too slow', () => {
        vi.useFakeTimers()
        const doubletapListener = vi.fn()
        recognizer.on('doubletap', doubletapListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointerup = getListener(element, 'pointerup')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        pointerup(createPointerEvent('pointerup', {pointerId: 1, clientX: 100, clientY: 200}))

        vi.advanceTimersByTime(400)

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        pointerup(createPointerEvent('pointerup', {pointerId: 1, clientX: 100, clientY: 200}))

        expect(doubletapListener).not.toHaveBeenCalled()
        vi.useRealTimers()
    })


    test('multi-finger tap with 2 pointers', () => {
        const tapListener = vi.fn()
        recognizer.on('tap', tapListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointerup = getListener(element, 'pointerup')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        pointerdown(createPointerEvent('pointerdown', {pointerId: 2, clientX: 150, clientY: 200}))

        pointerup(createPointerEvent('pointerup', {pointerId: 2, clientX: 150, clientY: 200}))
        pointerup(createPointerEvent('pointerup', {pointerId: 1, clientX: 100, clientY: 200}))

        expect(tapListener).toHaveBeenCalledWith(expect.objectContaining({
            pointerCount: 2
        }))
    })


    test('multi-finger tap with 3 pointers', () => {
        const tapListener = vi.fn()
        recognizer.on('tap', tapListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointerup = getListener(element, 'pointerup')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        pointerdown(createPointerEvent('pointerdown', {pointerId: 2, clientX: 150, clientY: 200}))
        pointerdown(createPointerEvent('pointerdown', {pointerId: 3, clientX: 200, clientY: 200}))

        pointerup(createPointerEvent('pointerup', {pointerId: 3, clientX: 200, clientY: 200}))
        pointerup(createPointerEvent('pointerup', {pointerId: 2, clientX: 150, clientY: 200}))
        pointerup(createPointerEvent('pointerup', {pointerId: 1, clientX: 100, clientY: 200}))

        expect(tapListener).toHaveBeenCalledWith(expect.objectContaining({
            pointerCount: 3
        }))
    })


    test('multi-finger tap does not trigger with movement', () => {
        const tapListener = vi.fn()
        recognizer.on('tap', tapListener)
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointermove = getListener(element, 'pointermove')
        const pointerup = getListener(element, 'pointerup')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        pointerdown(createPointerEvent('pointerdown', {pointerId: 2, clientX: 150, clientY: 200}))

        pointermove(createPointerEvent('pointermove', {pointerId: 1, clientX: 100, clientY: 250}))

        pointerup(createPointerEvent('pointerup', {pointerId: 2, clientX: 150, clientY: 200}))
        pointerup(createPointerEvent('pointerup', {pointerId: 1, clientX: 100, clientY: 250}))

        const multiFingerTaps = tapListener.mock.calls.filter(
            call => call[0].pointerCount > 1
        )
        expect(multiFingerTaps).toHaveLength(0)
    })


    test('pointer cancel resets state', () => {
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointercancel = getListener(element, 'pointercancel')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        pointercancel(createPointerEvent('pointercancel', {pointerId: 1}))

        expect(recognizer.pointerCount).toBe(0)
    })


    test('ignores pointermove for unknown pointers', () => {
        const dragStartListener = vi.fn()
        recognizer.on('drag:start', dragStartListener)
        recognizer.start()

        const pointermove = getListener(element, 'pointermove')
        pointermove(createPointerEvent('pointermove', {pointerId: 99, clientX: 200, clientY: 200}))

        expect(dragStartListener).not.toHaveBeenCalled()
    })


    test('ignores pointerup for unknown pointers', () => {
        const tapListener = vi.fn()
        recognizer.on('tap', tapListener)
        recognizer.start()

        const pointerup = getListener(element, 'pointerup')
        pointerup(createPointerEvent('pointerup', {pointerId: 99}))

        expect(tapListener).not.toHaveBeenCalled()
    })


    test('setPointerCapture called on pointerdown', () => {
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        pointerdown(createPointerEvent('pointerdown', {pointerId: 42}))

        expect(element.setPointerCapture).toHaveBeenCalledWith(42)
    })


    test('preventDefault called on pointerdown when enabled', () => {
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const event = createPointerEvent('pointerdown', {pointerId: 1})
        pointerdown(event)

        expect(event.preventDefault).toHaveBeenCalled()
    })


    test('preventDefault not called when disabled', () => {
        recognizer.preventDefaultEvents = false
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const event = createPointerEvent('pointerdown', {pointerId: 1})
        pointerdown(event)

        expect(event.preventDefault).not.toHaveBeenCalled()
    })


    test('full drag cycle integration', () => {
        const events = []
        recognizer.on('drag:start', (data) => events.push({type: 'drag:start', ...data}))
        recognizer.on('drag:move', (data) => events.push({type: 'drag:move', ...data}))
        recognizer.on('drag:end', (data) => events.push({type: 'drag:end', ...data}))
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointermove = getListener(element, 'pointermove')
        const pointerup = getListener(element, 'pointerup')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        pointermove(createPointerEvent('pointermove', {pointerId: 1, clientX: 110, clientY: 200}))
        pointermove(createPointerEvent('pointermove', {pointerId: 1, clientX: 130, clientY: 220}))
        pointerup(createPointerEvent('pointerup', {pointerId: 1, clientX: 130, clientY: 220}))

        expect(events[0].type).toBe('drag:start')
        expect(events[1].type).toBe('drag:move')
        expect(events[2].type).toBe('drag:move')
        expect(events[3].type).toBe('drag:end')
        expect(events[3].startX).toBe(100)
        expect(events[3].startY).toBe(200)
    })


    test('full pinch cycle integration', () => {
        vi.useFakeTimers()
        const events = []
        recognizer.on('pinch:start', (data) => events.push({type: 'pinch:start', ...data}))
        recognizer.on('pinch:move', (data) => events.push({type: 'pinch:move', ...data}))
        recognizer.on('pinch:end', () => events.push({type: 'pinch:end'}))
        recognizer.start()

        const pointerdown = getListener(element, 'pointerdown')
        const pointermove = getListener(element, 'pointermove')
        const pointerup = getListener(element, 'pointerup')

        pointerdown(createPointerEvent('pointerdown', {pointerId: 1, clientX: 100, clientY: 200}))
        vi.advanceTimersByTime(200)
        pointerdown(createPointerEvent('pointerdown', {pointerId: 2, clientX: 200, clientY: 200}))
        pointermove(createPointerEvent('pointermove', {pointerId: 1, clientX: 80, clientY: 200}))
        pointermove(createPointerEvent('pointermove', {pointerId: 2, clientX: 220, clientY: 200}))

        pointerup(createPointerEvent('pointerup', {pointerId: 2, clientX: 220, clientY: 200}))

        expect(events[0].type).toBe('pinch:start')
        expect(events[1].type).toBe('pinch:move')
        expect(events[2].type).toBe('pinch:move')
        expect(events[3].type).toBe('pinch:end')
        vi.useRealTimers()
    })

})
