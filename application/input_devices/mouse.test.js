import Mouse from './mouse'
import {vi} from 'vitest'


describe(Mouse, () => {

    let mouse

    beforeEach(() => {
        mouse = new Mouse()
        mouse.start()
    })

    afterEach(() => {
        mouse.stop()
    })


    test('constructor', () => {
        expect(mouse.pressedButtons).toEqual({})
        expect(mouse.position).toEqual({x: 0, y: 0})
        expect(mouse.previousPosition).toEqual({x: 0, y: 0})
        expect(mouse.velocity).toEqual({x: 0, y: 0})
        expect(mouse.timestamp).toBe(0)
        expect(mouse.name).toBe('Mouse')
    })


    test('static properties', () => {
        expect(Mouse.controls).toContain('position')
        expect(Mouse.controls).toContain('mouseButton')
        expect(Mouse.methods).toContain('isButtonPressed')
        expect(Mouse.methods).toContain('getPosition')
        expect(Mouse.methods).toContain('getPressedButtons')
        expect(Mouse.methods).toContain('getVelocity')
        expect(Mouse.events).toContain('mousedown')
        expect(Mouse.events).toContain('mouseup')
        expect(Mouse.events).toContain('mousemove')
    })


    test('observe and unobserve', () => {
        const testMouse = new Mouse()
        
        expect(testMouse.mouseListeners).toBeUndefined()
        
        testMouse.observe()
        expect(testMouse.mouseListeners).toBeDefined()
        expect(typeof testMouse.mouseListeners.mousedown).toBe('function')
        expect(typeof testMouse.mouseListeners.mouseup).toBe('function')
        expect(typeof testMouse.mouseListeners.mousemove).toBe('function')
        
        testMouse.unobserve()
        expect(testMouse.mouseListeners).toBeUndefined()
    })


    test('mousedown event', () => {
        const listener = vi.fn()
        mouse.on('mousedown', listener)

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
        
        expect(mouse.isButtonPressed(0)).toBe(true)
    })


    test('mouseup event', () => {
        const listener = vi.fn()
        mouse.on('mouseup', listener)

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
        
        expect(mouse.isButtonPressed(0)).toBe(false)
    })


    test('mousemove event', () => {
        const listener = vi.fn()
        mouse.on('mousemove', listener)

        const event = new MouseEvent('mousemove', {
            clientX: 150,
            clientY: 250
        })
        
        window.dispatchEvent(event)

        expect(listener).toHaveBeenCalled()
        const mouseState = listener.mock.calls[0][0]
        expect(mouseState.position.x).toBe(150)
        expect(mouseState.position.y).toBe(250)
        
        const position = mouse.getPosition()
        expect(position.x).toBe(150)
        expect(position.y).toBe(250)
    })


    test('mouse modifiers', () => {
        const listener = vi.fn()
        mouse.on('mousedown', listener)

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

        const pressedButtons = mouse.getPressedButtons()
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

        mouse.timestamp = 1000

        const secondEvent = new MouseEvent('mousemove', {
            clientX: 150,
            clientY: 120,
            timeStamp: 1100
        })
        
        Object.defineProperty(secondEvent, 'timeStamp', {
            value: 1100
        })
        
        window.dispatchEvent(secondEvent)
        
        const velocity = mouse.getVelocity()

        expect(velocity.x).toBeCloseTo(0.5)
        expect(velocity.y).toBeCloseTo(0.2)
    })


    test('different button types', () => {
        window.dispatchEvent(new MouseEvent('mousedown', {
            clientX: 100,
            clientY: 200,
            button: 0
        }))
        
        expect(mouse.isButtonPressed(0)).toBe(true)
        
        window.dispatchEvent(new MouseEvent('mousedown', {
            clientX: 100,
            clientY: 200,
            button: 2
        }))
        
        expect(mouse.isButtonPressed(0)).toBe(true)
        expect(mouse.isButtonPressed(2)).toBe(true)
        
        window.dispatchEvent(new MouseEvent('mouseup', {
            clientX: 100,
            clientY: 200,
            button: 0
        }))
        
        expect(mouse.isButtonPressed(0)).toBe(false)
        expect(mouse.isButtonPressed(2)).toBe(true)
    })


    test('different coordinate systems', () => {
        const listener = vi.fn()
        mouse.on('mousedown', listener)

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
