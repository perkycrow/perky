import MouseDevice from './mouse_device'
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
    })


    test('static properties', () => {
        expect(MouseDevice.controls).toContain('position')
        expect(MouseDevice.controls).toContain('mouseButton')
        expect(MouseDevice.methods).toContain('isButtonPressed')
        expect(MouseDevice.methods).toContain('getPosition')
        expect(MouseDevice.methods).toContain('getPressedButtons')
        expect(MouseDevice.methods).toContain('getVelocity')
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


    test('mousedown event', () => {
        const listener = vi.fn()
        mouseDevice.on('mousedown', listener)

        const event = new MouseEvent('mousedown', {
            clientX: 100,
            clientY: 200,
            button: 0
        })
        window.dispatchEvent(event)

        expect(listener).toHaveBeenCalled()
        const mouseState = listener.mock.calls[0][0]
        expect(mouseState.button).toBe(0)
        expect(mouseState.position.x).toBe(100)
        expect(mouseState.position.y).toBe(200)
        
        expect(mouseDevice.isButtonPressed(0)).toBe(true)
    })


    test('mouseup event', () => {
        const listener = vi.fn()
        mouseDevice.on('mouseup', listener)

        window.dispatchEvent(new MouseEvent('mousedown', {
            clientX: 100,
            clientY: 200,
            button: 0
        }))
        
        window.dispatchEvent(new MouseEvent('mouseup', {
            clientX: 100,
            clientY: 200,
            button: 0
        }))

        expect(listener).toHaveBeenCalled()
        const mouseState = listener.mock.calls[0][0]
        expect(mouseState.button).toBe(0)
        
        expect(mouseDevice.isButtonPressed(0)).toBe(false)
    })


    test('mousemove event', () => {
        const listener = vi.fn()
        mouseDevice.on('mousemove', listener)

        const event = new MouseEvent('mousemove', {
            clientX: 150,
            clientY: 250
        })
        
        window.dispatchEvent(event)

        expect(listener).toHaveBeenCalled()
        const mouseState = listener.mock.calls[0][0]
        expect(mouseState.position.x).toBe(150)
        expect(mouseState.position.y).toBe(250)
        
        const position = mouseDevice.getPosition()
        expect(position.x).toBe(150)
        expect(position.y).toBe(250)
    })


    test('mouse modifiers', () => {
        const listener = vi.fn()
        mouseDevice.on('mousedown', listener)

        const event = new MouseEvent('mousedown', {
            clientX: 100,
            clientY: 200,
            button: 0,
            shiftKey: true
        })

        Object.defineProperty(event, 'getModifierState', {
            value: (key) => key === 'Shift'
        })
        
        window.dispatchEvent(event)

        expect(listener).toHaveBeenCalled()
        const mouseState = listener.mock.calls[0][0]
        expect(mouseState.modifiers.Shift).toBe(true)
    })


    test('getPressedButtons', () => {
        window.dispatchEvent(new MouseEvent('mousedown', {
            clientX: 100,
            clientY: 200,
            button: 0
        }))
        
        window.dispatchEvent(new MouseEvent('mousedown', {
            clientX: 100,
            clientY: 200,
            button: 2
        }))

        const pressedButtons = mouseDevice.getPressedButtons()
        expect(pressedButtons).toContain('0')
        expect(pressedButtons).toContain('2')
        expect(pressedButtons.length).toBe(2)
    })


    test('velocity calculation', () => {
        const firstEvent = new MouseEvent('mousemove', {
            clientX: 100,
            clientY: 100,
            timeStamp: 1000
        })
        
        window.dispatchEvent(firstEvent)

        mouseDevice.timestamp = 1000

        const secondEvent = new MouseEvent('mousemove', {
            clientX: 150,
            clientY: 120,
            timeStamp: 1100
        })
        
        Object.defineProperty(secondEvent, 'timeStamp', {
            value: 1100
        })
        
        window.dispatchEvent(secondEvent)
        
        const velocity = mouseDevice.getVelocity()

        expect(velocity.x).toBeCloseTo(0.5)
        expect(velocity.y).toBeCloseTo(0.2)
    })


    test('different button types', () => {
        window.dispatchEvent(new MouseEvent('mousedown', {
            clientX: 100,
            clientY: 200,
            button: 0
        }))
        
        expect(mouseDevice.isButtonPressed(0)).toBe(true)
        
        window.dispatchEvent(new MouseEvent('mousedown', {
            clientX: 100,
            clientY: 200,
            button: 2
        }))
        
        expect(mouseDevice.isButtonPressed(0)).toBe(true)
        expect(mouseDevice.isButtonPressed(2)).toBe(true)
        
        window.dispatchEvent(new MouseEvent('mouseup', {
            clientX: 100,
            clientY: 200,
            button: 0
        }))
        
        expect(mouseDevice.isButtonPressed(0)).toBe(false)
        expect(mouseDevice.isButtonPressed(2)).toBe(true)
    })


    test('different coordinate systems', () => {
        const listener = vi.fn()
        mouseDevice.on('mousedown', listener)

        const event = new MouseEvent('mousedown', {
            clientX: 100,
            clientY: 200,
            screenX: 500,
            screenY: 600,
            button: 0
        })

        Object.defineProperty(event, 'pageX', {value: 120})
        Object.defineProperty(event, 'pageY', {value: 220})
        Object.defineProperty(event, 'offsetX', {value: 50})
        Object.defineProperty(event, 'offsetY', {value: 60})
        
        window.dispatchEvent(event)

        expect(listener).toHaveBeenCalled()
        const mouseState = listener.mock.calls[0][0]
        
        expect(mouseState.position.x).toBe(100)
        expect(mouseState.position.y).toBe(200)
        
        expect(mouseState.screen.x).toBe(500)
        expect(mouseState.screen.y).toBe(600)
        
        expect(mouseState.page.x).toBe(120)
        expect(mouseState.page.y).toBe(220)
        
        expect(mouseState.offset.x).toBe(50)
        expect(mouseState.offset.y).toBe(60)
    })

})
