import InputObserver from './input_observer'
import PerkyModule from '../core/perky_module'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'

describe(InputObserver, () => {
    let inputObserver
    let mockContainer
    let disposeListeners = []

    beforeEach(() => {
        mockContainer = {
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        }

        const originalOn = PerkyModule.prototype.on
        const originalEmit = PerkyModule.prototype.emit
        
        vi.spyOn(PerkyModule.prototype, 'on').mockImplementation(function (event, callback) {
            if (event === 'dispose') {
                disposeListeners.push(callback)
            }
            return originalOn.call(this, event, callback)
        })
        
        vi.spyOn(PerkyModule.prototype, 'emit').mockImplementation(function (event, ...args) {
            return originalEmit.call(this, event, ...args)
        })
        
        inputObserver = new InputObserver(mockContainer)
    })

    afterEach(() => {
        vi.restoreAllMocks()
        disposeListeners = []
    })

    test('initialization', () => {
        expect(inputObserver.container).toBe(mockContainer)
        expect(inputObserver.keyStates).toEqual({})
        expect(inputObserver.mousePosition).toEqual({x: 0, y: 0})
        expect(inputObserver.mouseButtons).toEqual({})
        expect(mockContainer.addEventListener).toHaveBeenCalledTimes(5)
    })

    test('getKeyState', () => {
        expect(inputObserver.getKeyState('KeyA')).toBe(false)

        inputObserver.keyStates.KeyA = true
        expect(inputObserver.getKeyState('KeyA')).toBe(true)
    })

    test('getMousePosition', () => {
        expect(inputObserver.getMousePosition()).toEqual({x: 0, y: 0})

        inputObserver.mousePosition = {x: 100, y: 200}
        expect(inputObserver.getMousePosition()).toEqual({x: 100, y: 200})

        const position = inputObserver.getMousePosition()
        position.x = 300
        expect(inputObserver.mousePosition.x).toBe(100)
    })

    test('getMouseButtonState', () => {
        expect(inputObserver.getMouseButtonState(0)).toBe(false)

        inputObserver.mouseButtons[0] = true
        expect(inputObserver.getMouseButtonState(0)).toBe(true)
    })

    test('keydown event', () => {
        const keydownHandler = findEventHandler(mockContainer.addEventListener.mock.calls, 'keydown')

        const event = {code: 'KeyA', key: 'a'}
        keydownHandler(event)

        expect(inputObserver.keyStates.KeyA).toBe(true)
        expect(inputObserver.emit).toHaveBeenCalledWith('keydown', {
            code: 'KeyA',
            key: 'a',
            event
        })
    })

    test('keyup event', () => {
        inputObserver.keyStates.KeyA = true

        const keyupHandler = findEventHandler(mockContainer.addEventListener.mock.calls, 'keyup')

        const event = {code: 'KeyA', key: 'a'}
        keyupHandler(event)

        expect(inputObserver.keyStates.KeyA).toBe(false)
        expect(inputObserver.emit).toHaveBeenCalledWith('keyup', {
            code: 'KeyA',
            key: 'a',
            event
        })
    })

    test('mousemove event', () => {
        const mousemoveHandler = findEventHandler(mockContainer.addEventListener.mock.calls, 'mousemove')

        const event = {clientX: 150, clientY: 250}
        mousemoveHandler(event)

        expect(inputObserver.mousePosition).toEqual({x: 150, y: 250})
        expect(inputObserver.emit).toHaveBeenCalledWith('mousemove', {
            x: 150,
            y: 250,
            position: {x: 150, y: 250},
            event
        })
    })

    test('mousedown event', () => {
        const mousedownHandler = findEventHandler(mockContainer.addEventListener.mock.calls, 'mousedown')

        const event = {button: 0, clientX: 150, clientY: 250}
        mousedownHandler(event)

        expect(inputObserver.mouseButtons[0]).toBe(true)
        expect(inputObserver.emit).toHaveBeenCalledWith('mousedown', {
            button: 0,
            x: 150,
            y: 250,
            position: {x: 150, y: 250},
            event
        })
    })

    test('mouseup event', () => {
        inputObserver.mouseButtons[0] = true

        const mouseupHandler = findEventHandler(mockContainer.addEventListener.mock.calls, 'mouseup')

        const event = {button: 0, clientX: 150, clientY: 250}
        mouseupHandler(event)

        expect(inputObserver.mouseButtons[0]).toBe(false)
        expect(inputObserver.emit).toHaveBeenCalledWith('mouseup', {
            button: 0,
            x: 150,
            y: 250,
            position: {x: 150, y: 250}
        })
    })

    test('dispose', () => {
        inputObserver.emit('dispose')

        expect(mockContainer.removeEventListener).toHaveBeenCalledTimes(5)
    })
})


function findEventHandler (calls, eventName) {
    for (let i = 0; i < calls.length; i++) {
        if (calls[i][0] === eventName) {
            return calls[i][1]
        }
    }
    return null
}
