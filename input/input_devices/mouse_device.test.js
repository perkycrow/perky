import MouseDevice from './mouse_device'
import KeyControl from '../input_controls/key_control'
import Vec2Control from '../input_controls/vec2_control'
import {vi} from 'vitest'


describe(MouseDevice, () => {

    let mouseDevice

    beforeEach(() => {
        mouseDevice = new MouseDevice()
        mouseDevice.start()
    })

    afterEach(() => {
        mouseDevice.stop()
    })


    test('constructor', () => {
        expect(mouseDevice.pressedButtons).toEqual({})
        expect(mouseDevice.position).toEqual({x: 0, y: 0})
        expect(mouseDevice.previousPosition).toEqual({x: 0, y: 0})
        expect(mouseDevice.velocity).toEqual({x: 0, y: 0})
        expect(mouseDevice.timestamp).toBe(0)
        expect(mouseDevice.name).toBe('MouseDevice')
        expect(mouseDevice.controls).toBeInstanceOf(Map)
    })


    test('controls are created in constructor', () => {
        expect(mouseDevice.getControl('leftButton')).toBeInstanceOf(KeyControl)
        expect(mouseDevice.getControl('rightButton')).toBeInstanceOf(KeyControl)
        expect(mouseDevice.getControl('middleButton')).toBeInstanceOf(KeyControl)
        expect(mouseDevice.getControl('position')).toBeInstanceOf(Vec2Control)
        expect(mouseDevice.getControl('velocity')).toBeInstanceOf(Vec2Control)
        
        expect(mouseDevice.controls.size).toBe(5)
    })


    test('button controls have correct names and display names', () => {
        const leftButton = mouseDevice.getControl('leftButton')
        const rightButton = mouseDevice.getControl('rightButton')
        const middleButton = mouseDevice.getControl('middleButton')
        
        expect(leftButton.name).toBe('leftButton')
        expect(leftButton.displayName).toBe('Left Click')
        expect(rightButton.name).toBe('rightButton')
        expect(rightButton.displayName).toBe('Right Click')
        expect(middleButton.name).toBe('middleButton')
        expect(middleButton.displayName).toBe('Middle Click')
    })


    test('position and velocity controls have correct properties', () => {
        const position = mouseDevice.getControl('position')
        const velocity = mouseDevice.getControl('velocity')
        
        expect(position.name).toBe('position')
        expect(position.displayName).toBe('Mouse Position')
        expect(position.normalize).toBe(false)
        
        expect(velocity.name).toBe('velocity')
        expect(velocity.displayName).toBe('Mouse Velocity')
        expect(velocity.normalize).toBe(false)
    })


    test('static properties', () => {
        expect(MouseDevice.methods).toContain('isMouseButtonPressed')
        expect(MouseDevice.methods).toContain('getMousePosition')
        expect(MouseDevice.methods).toContain('getMousePressedButtons')
        expect(MouseDevice.methods).toContain('getMouseVelocity')
        expect(MouseDevice.events).toContain('mousedown')
        expect(MouseDevice.events).toContain('mouseup')
        expect(MouseDevice.events).toContain('mousemove')
    })


    test('observe and unobserve', () => {
        const testMouseDevice = new MouseDevice()
        
        expect(testMouseDevice.mouseListeners).toBeUndefined()
        
        testMouseDevice.observe()
        expect(testMouseDevice.mouseListeners).toBeDefined()
        expect(typeof testMouseDevice.mouseListeners.mousedown).toBe('function')
        expect(typeof testMouseDevice.mouseListeners.mouseup).toBe('function')
        expect(typeof testMouseDevice.mouseListeners.mousemove).toBe('function')
        
        testMouseDevice.unobserve()
        expect(testMouseDevice.mouseListeners).toBeUndefined()
    })


    test('mousedown event updates button control', () => {
        const listener = vi.fn()
        mouseDevice.on('mousedown', listener)

        const event = new MouseEvent('mousedown', {
            button: 0,
            clientX: 100,
            clientY: 200
        })
        
        Object.defineProperty(event, 'offsetX', {value: 100, writable: false})
        Object.defineProperty(event, 'offsetY', {value: 200, writable: false})
        
        window.dispatchEvent(event)

        expect(listener).toHaveBeenCalled()
        const mouseState = listener.mock.calls[0][0]
        expect(mouseState.button).toBe(0)
        expect(mouseState.position.x).toBe(100)
        expect(mouseState.position.y).toBe(200)
        
        expect(mouseDevice.isMouseButtonPressed(0)).toBe(true)
        
        const leftButton = mouseDevice.getControl('leftButton')
        expect(leftButton.isPressed()).toBe(true)
        expect(leftButton.getValue()).toBe(1)
    })


    test('mouseup event updates button control', () => {
        const listener = vi.fn()
        mouseDevice.on('mouseup', listener)

        const mousedownEvent = new MouseEvent('mousedown', {
            button: 2,
            clientX: 50,
            clientY: 75
        })
        Object.defineProperty(mousedownEvent, 'offsetX', {value: 50, writable: false})
        Object.defineProperty(mousedownEvent, 'offsetY', {value: 75, writable: false})
        window.dispatchEvent(mousedownEvent)
        
        const mouseupEvent = new MouseEvent('mouseup', {
            button: 2,
            clientX: 50,
            clientY: 75
        })
        Object.defineProperty(mouseupEvent, 'offsetX', {value: 50, writable: false})
        Object.defineProperty(mouseupEvent, 'offsetY', {value: 75, writable: false})
        window.dispatchEvent(mouseupEvent)

        expect(listener).toHaveBeenCalled()
        const mouseState = listener.mock.calls[0][0]
        expect(mouseState.button).toBe(2)
        
        expect(mouseDevice.isMouseButtonPressed(2)).toBe(false)
        
        const rightButton = mouseDevice.getControl('rightButton')
        expect(rightButton.isPressed()).toBe(false)
        expect(rightButton.getValue()).toBe(0)
    })


    test('mousemove event updates position and velocity controls', () => {
        const listener = vi.fn()
        mouseDevice.on('mousemove', listener)

        const event = new MouseEvent('mousemove', {
            clientX: 150,
            clientY: 250
        })
        
        Object.defineProperty(event, 'offsetX', {value: 150, writable: false})
        Object.defineProperty(event, 'offsetY', {value: 250, writable: false})
        Object.defineProperty(event, 'timeStamp', {value: 1000, writable: false})
        
        window.dispatchEvent(event)

        expect(listener).toHaveBeenCalled()
        
        const positionControl = mouseDevice.getControl('position')
        const velocityControl = mouseDevice.getControl('velocity')
        
        const position = positionControl.getValue()
        expect(position.x).toBe(150)
        expect(position.y).toBe(250)
        
        expect(velocityControl.getValue()).toBeDefined()
    })


    test('middle button (button 1) updates correct control', () => {
        const mousedownEvent = new MouseEvent('mousedown', {button: 1})
        Object.defineProperty(mousedownEvent, 'offsetX', {value: 0, writable: false})
        Object.defineProperty(mousedownEvent, 'offsetY', {value: 0, writable: false})
        window.dispatchEvent(mousedownEvent)
        
        const middleButton = mouseDevice.getControl('middleButton')
        expect(middleButton.isPressed()).toBe(true)
        expect(mouseDevice.isMouseButtonPressed(1)).toBe(true)
        
        const mouseupEvent = new MouseEvent('mouseup', {button: 1})
        Object.defineProperty(mouseupEvent, 'offsetX', {value: 0, writable: false})
        Object.defineProperty(mouseupEvent, 'offsetY', {value: 0, writable: false})
        window.dispatchEvent(mouseupEvent)
        
        expect(middleButton.isPressed()).toBe(false)
        expect(mouseDevice.isMouseButtonPressed(1)).toBe(false)
    })


    test('blur event releases all button controls', () => {
        const event1 = new MouseEvent('mousedown', {button: 0})
        Object.defineProperty(event1, 'offsetX', {value: 0, writable: false})
        Object.defineProperty(event1, 'offsetY', {value: 0, writable: false})
        window.dispatchEvent(event1)
        
        const event2 = new MouseEvent('mousedown', {button: 2})
        Object.defineProperty(event2, 'offsetX', {value: 0, writable: false})
        Object.defineProperty(event2, 'offsetY', {value: 0, writable: false})
        window.dispatchEvent(event2)
        
        const leftButton = mouseDevice.getControl('leftButton')
        const rightButton = mouseDevice.getControl('rightButton')
        
        expect(leftButton.isPressed()).toBe(true)
        expect(rightButton.isPressed()).toBe(true)
        
        window.dispatchEvent(new Event('blur'))

        expect(leftButton.isPressed()).toBe(false)
        expect(rightButton.isPressed()).toBe(false)
        expect(mouseDevice.pressedButtons).toEqual({})
    })


    test('contextmenu event releases right button control', () => {
        const mousedownEvent = new MouseEvent('mousedown', {button: 2})
        Object.defineProperty(mousedownEvent, 'offsetX', {value: 0, writable: false})
        Object.defineProperty(mousedownEvent, 'offsetY', {value: 0, writable: false})
        window.dispatchEvent(mousedownEvent)
        
        const rightButton = mouseDevice.getControl('rightButton')
        expect(rightButton.isPressed()).toBe(true)
        
        const contextEvent = new MouseEvent('contextmenu', {button: 2})
        Object.defineProperty(contextEvent, 'offsetX', {value: 0, writable: false})
        Object.defineProperty(contextEvent, 'offsetY', {value: 0, writable: false})
        window.dispatchEvent(contextEvent)
        
        expect(rightButton.isPressed()).toBe(false)
        expect(mouseDevice.isMouseButtonPressed(2)).toBe(false)
    })


    test('getMousePosition', () => {
        const event = new MouseEvent('mousemove', {
            clientX: 300,
            clientY: 400
        })
        Object.defineProperty(event, 'offsetX', {value: 300, writable: false})
        Object.defineProperty(event, 'offsetY', {value: 400, writable: false})
        
        window.dispatchEvent(event)
        
        const position = mouseDevice.getMousePosition()
        expect(position.x).toBe(300)
        expect(position.y).toBe(400)
        
        position.x = 999
        expect(mouseDevice.getMousePosition().x).toBe(300)
    })


    test('getMousePressedButtons', () => {
        window.dispatchEvent(new MouseEvent('mousedown', {button: 0}))
        window.dispatchEvent(new MouseEvent('mousedown', {button: 1}))
        
        const pressedButtons = mouseDevice.getMousePressedButtons()
        expect(pressedButtons).toContain('0')
        expect(pressedButtons).toContain('1')
        expect(pressedButtons.length).toBe(2)
    })


    test('getMouseVelocity', () => {
        const velocity = mouseDevice.getMouseVelocity()
        expect(velocity).toEqual({x: 0, y: 0})

        velocity.x = 999
        expect(mouseDevice.getMouseVelocity().x).toBe(0)
    })


    test('isPressed method', () => {
        expect(mouseDevice.isPressed(0)).toBe(false)
        
        const mousedownEvent = new MouseEvent('mousedown', {button: 0})
        Object.defineProperty(mousedownEvent, 'offsetX', {value: 0, writable: false})
        Object.defineProperty(mousedownEvent, 'offsetY', {value: 0, writable: false})
        window.dispatchEvent(mousedownEvent)
        expect(mouseDevice.isPressed(0)).toBe(true)
        
        const mouseupEvent = new MouseEvent('mouseup', {button: 0})
        Object.defineProperty(mouseupEvent, 'offsetX', {value: 0, writable: false})
        Object.defineProperty(mouseupEvent, 'offsetY', {value: 0, writable: false})
        window.dispatchEvent(mouseupEvent)
        expect(mouseDevice.isPressed(0)).toBe(false)
    })

})
