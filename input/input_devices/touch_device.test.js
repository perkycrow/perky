import TouchDevice from './touch_device'
import {vi} from 'vitest'


describe(TouchDevice, () => {

    let touchDevice

    beforeEach(() => {
        if (typeof window.TouchEvent !== 'function') {
            window.TouchEvent = class TouchEvent extends Event {
                constructor (type, options = {}) {
                    super(type, options)
                    this.touches = options.touches || []
                    this.targetTouches = options.targetTouches || []
                    this.changedTouches = options.changedTouches || []
                    this.getModifierState = options.getModifierState || (() => false)
                }
            }
        }
        
        if (typeof window.Touch !== 'function') {
            window.Touch = class Touch {
                constructor (options = {}) {
                    Object.assign(this, options)
                }
            }
        }

        touchDevice = new TouchDevice()
        touchDevice.start()
    })

    afterEach(() => {
        touchDevice.stop()
    })


    test('constructor', () => {
        expect(touchDevice.activeTouches).toEqual({})
        expect(touchDevice.previousTouches).toEqual({})
        expect(touchDevice.gestureStartDistance).toBe(0)
        expect(touchDevice.gestureCurrentScale).toBe(1)
        expect(touchDevice.name).toBe('TouchDevice')
    })


    test('static properties', () => {
        expect(TouchDevice.methods).toContain('getTouches')
        expect(TouchDevice.methods).toContain('getActiveTouches')
        expect(TouchDevice.methods).toContain('getTouchById')
        expect(TouchDevice.methods).toContain('getAveragePosition')
        expect(TouchDevice.methods).toContain('getDistance')
        expect(TouchDevice.methods).toContain('getScale')
        expect(TouchDevice.events).toContain('touchstart')
        expect(TouchDevice.events).toContain('touchmove')
        expect(TouchDevice.events).toContain('touchend')
        expect(TouchDevice.events).toContain('touchcancel')
    })


    test('observe and unobserve', () => {
        const testTouchDevice = new TouchDevice()
        
        expect(testTouchDevice.touchListeners).toBeUndefined()
        
        testTouchDevice.observe()
        expect(testTouchDevice.touchListeners).toBeDefined()
        expect(typeof testTouchDevice.touchListeners.touchstart).toBe('function')
        expect(typeof testTouchDevice.touchListeners.touchmove).toBe('function')
        expect(typeof testTouchDevice.touchListeners.touchend).toBe('function')
        expect(typeof testTouchDevice.touchListeners.touchcancel).toBe('function')
        
        testTouchDevice.unobserve()
        expect(testTouchDevice.touchListeners).toBeUndefined()
    })


    test('touchstart event', () => {
        const listener = vi.fn()
        touchDevice.on('touchstart', listener)

        const touchEvent = createTouchEvent('touchstart', [
            createTouch(0, 100, 200)
        ])
        
        window.dispatchEvent(touchEvent)

        expect(listener).toHaveBeenCalled()
        expect(touchDevice.isPressed(0)).toBe(true)
        
        const touchInfo = touchDevice.getTouchById(0)
        expect(touchInfo.identifier).toBe(0)
        expect(touchInfo.position.x).toBe(100)
        expect(touchInfo.position.y).toBe(200)
    })


    test('touchmove event', () => {
        const moveListener = vi.fn()
        touchDevice.on('touchmove', moveListener)

        window.dispatchEvent(createTouchEvent('touchstart', [
            createTouch(0, 100, 200)
        ]))

        window.dispatchEvent(createTouchEvent('touchmove', [
            createTouch(0, 150, 250)
        ]))

        expect(moveListener).toHaveBeenCalled()
        
        const touchInfo = touchDevice.getTouchById(0)
        expect(touchInfo.identifier).toBe(0)
        expect(touchInfo.position.x).toBe(150)
        expect(touchInfo.position.y).toBe(250)
    })


    test('touchend event', () => {
        const endListener = vi.fn()
        touchDevice.on('touchend', endListener)

        window.dispatchEvent(createTouchEvent('touchstart', [
            createTouch(0, 100, 200)
        ]))

        window.dispatchEvent(createTouchEvent('touchend', [
            createTouch(0, 100, 200)
        ]))

        expect(endListener).toHaveBeenCalled()
        expect(touchDevice.isPressed(0)).toBe(false)
        expect(touchDevice.getActiveTouches().length).toBe(0)
    })


    test('multi-touch tracking', () => {
        // Add two simultaneous touches
        window.dispatchEvent(createTouchEvent('touchstart', [
            createTouch(0, 100, 100),
            createTouch(1, 200, 200)
        ]))
        
        expect(touchDevice.getActiveTouches().length).toBe(2)
        expect(touchDevice.getActiveTouches()).toContain('0')
        expect(touchDevice.getActiveTouches()).toContain('1')
        
        expect(touchDevice.isPressed(0)).toBe(true)
        expect(touchDevice.isPressed(1)).toBe(true)
    })


    test('getAveragePosition', () => {
        // Add two simultaneous touches
        window.dispatchEvent(createTouchEvent('touchstart', [
            createTouch(0, 100, 100),
            createTouch(1, 300, 300)
        ]))
        
        const position = touchDevice.getAveragePosition()
        expect(position.x).toBe(200)
        expect(position.y).toBe(200)
    })


    test('getDistance', () => {
        // Add two simultaneous touches
        window.dispatchEvent(createTouchEvent('touchstart', [
            createTouch(0, 100, 100),
            createTouch(1, 300, 100) // 200px apart horizontally
        ]))
        
        const distance = touchDevice.getDistance()
        expect(distance).toBe(200)
    })


    test('getScale gesture', () => {
        // Start with two touches
        window.dispatchEvent(createTouchEvent('touchstart', [
            createTouch(0, 100, 100),
            createTouch(1, 200, 100) // 100px apart
        ]))
        
        // Initial scale should be 1
        expect(touchDevice.getScale()).toBe(1)
        
        // Move the touches to increase distance to 200px
        window.dispatchEvent(createTouchEvent('touchmove', [
            createTouch(0, 50, 100),
            createTouch(1, 250, 100) // 200px apart now
        ]))

        // Scale should now be 2 (200/100)
        expect(touchDevice.getScale()).toBe(2)
    })


    test('touchcancel event', () => {
        const cancelListener = vi.fn()
        touchDevice.on('touchcancel', cancelListener)

        window.dispatchEvent(createTouchEvent('touchstart', [
            createTouch(0, 100, 200)
        ]))

        window.dispatchEvent(createTouchEvent('touchcancel', [
            createTouch(0, 100, 200)
        ]))

        expect(cancelListener).toHaveBeenCalled()
        expect(touchDevice.isPressed(0)).toBe(false)
        expect(touchDevice.getActiveTouches().length).toBe(0)
    })

})


function createTouch (identifier, clientX, clientY) {
    return new window.Touch({
        identifier,
        target: window,
        clientX,
        clientY,
        screenX: clientX,
        screenY: clientY,
        pageX: clientX,
        pageY: clientY,
        radiusX: 10,
        radiusY: 10,
        rotationAngle: 0,
        force: 1
    })
}

function createTouchEvent (type, touches) {
    const touchEvent = new window.TouchEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        touches,
        targetTouches: touches,
        changedTouches: touches
    })

    if (!touchEvent.preventDefault || typeof touchEvent.preventDefault !== 'function') {
        touchEvent.preventDefault = vi.fn()
    }
    
    return touchEvent
}
