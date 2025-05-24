import GamepadManager from './gamepad_manager'
import GamepadHandler from './gamepad_handler'
import {vi} from 'vitest'


describe(GamepadManager, () => {

    let gamepadManager

    beforeEach(() => {
        vi.useFakeTimers()

        if (typeof navigator.getGamepads === 'undefined') {
            navigator.getGamepads = vi.fn(() => [])
        } else {
            vi.spyOn(navigator, 'getGamepads').mockImplementation(() => [])
        }

        if (typeof window.GamepadEvent !== 'function') {
            window.GamepadEvent = class GamepadEvent extends Event {
                constructor (type, options = {}) {
                    super(type, options)
                    this.gamepad = options.gamepad || null
                }
            }
        }

        const mockRAF = callback => {
            setTimeout(callback, 16)
            return Math.floor(Math.random() * 1000)
        }
        
        if (typeof window.requestAnimationFrame === 'function') {
            vi.spyOn(window, 'requestAnimationFrame').mockImplementation(mockRAF)
        } else {
            window.requestAnimationFrame = vi.fn(mockRAF)
        }

        if (typeof window.cancelAnimationFrame === 'function') {
            vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
        } else {
            window.cancelAnimationFrame = vi.fn()
        }

        gamepadManager = new GamepadManager()

        vi.spyOn(gamepadManager, 'emit')
    })

    afterEach(() => {
        if (gamepadManager.isRunning) {
            gamepadManager.stop()
        }

        vi.useRealTimers()
        vi.clearAllMocks()
    })


    test('constructor initializes correctly', () => {
        expect(gamepadManager.handlers).toEqual({})
        expect(gamepadManager.isRunning).toBe(false)
        expect(gamepadManager.animationFrameId).toBeNull()
    })


    test('start begins animation loop', () => {
        const animLoopSpy = vi.spyOn(gamepadManager, 'animationLoop')

        expect(gamepadManager.start()).toBe(true)
        expect(gamepadManager.isRunning).toBe(true)
        expect(window.requestAnimationFrame).toHaveBeenCalled()

        vi.advanceTimersByTime(20)
        expect(animLoopSpy).toHaveBeenCalled()
    })


    test('stop ends animation loop', () => {
        gamepadManager.start()
        
        expect(gamepadManager.stop()).toBe(true)
        expect(gamepadManager.isRunning).toBe(false)
        expect(window.cancelAnimationFrame).toHaveBeenCalled()
    })


    test('animationLoop calls poll and continues loop', () => {
        const pollSpy = vi.spyOn(gamepadManager, 'poll')

        gamepadManager.isRunning = true

        gamepadManager.animationLoop()

        expect(pollSpy).toHaveBeenCalled()

        expect(window.requestAnimationFrame).toHaveBeenCalled()
    })


    test('poll updates connected gamepads', () => {
        const mockGamepad = createMockGamepad(0)

        navigator.getGamepads.mockReturnValue([mockGamepad])

        const handler = new GamepadHandler(mockGamepad)
        gamepadManager.handlers[0] = handler

        const updateSpy = vi.spyOn(handler, 'update')

        gamepadManager.poll()

        expect(updateSpy).toHaveBeenCalledWith(mockGamepad)
    })


    test('createHandler adds new handler', () => {
        const mockGamepad = createMockGamepad(0)

        const setupSpy = vi.spyOn(gamepadManager, 'setupHandlerEvents')

        gamepadManager.createHandler(mockGamepad)

        expect(gamepadManager.handlers[0]).toBeDefined()
        expect(gamepadManager.handlers[0].index).toBe(0)

        expect(setupSpy).toHaveBeenCalled()

        expect(gamepadManager.emit).toHaveBeenCalledWith('gamepadconnected', expect.objectContaining({
            index: 0
        }))
    })


    test('handleGamepadConnected processes connection event', () => {
        const mockGamepad = createMockGamepad(0)
        const connectEvent = new window.GamepadEvent('gamepadconnected', {
            gamepad: mockGamepad
        })

        const createSpy = vi.spyOn(gamepadManager, 'createHandler')

        gamepadManager.handleGamepadConnected(connectEvent)

        expect(createSpy).toHaveBeenCalledWith(mockGamepad)
    })


    test('handleGamepadDisconnected removes handler', () => {
        const mockGamepad = createMockGamepad(0)
        const disconnectEvent = new window.GamepadEvent('gamepaddisconnected', {
            gamepad: mockGamepad
        })

        gamepadManager.handlers[0] = new GamepadHandler(mockGamepad)

        gamepadManager.handleGamepadDisconnected(disconnectEvent)

        expect(gamepadManager.handlers[0]).toBeUndefined()

        expect(gamepadManager.emit).toHaveBeenCalledWith('gamepaddisconnected', expect.objectContaining({
            index: 0
        }))
    })


    test('setupHandlerEvents forwards handler events', () => {
        const mockGamepad = createMockGamepad(0)
        const handler = new GamepadHandler(mockGamepad)

        gamepadManager.setupHandlerEvents(handler)

        handler.emit('buttonpress', {buttonIndex: 1, value: 1})
        handler.emit('buttonrelease', {buttonIndex: 2, value: 0})
        handler.emit('axischange', {axes: [0.5, -0.2]})

        expect(gamepadManager.emit).toHaveBeenCalledTimes(3)

        expect(gamepadManager.emit).toHaveBeenCalledWith('buttonpress', expect.objectContaining({
            gamepadIndex: 0
        }))
    })


    test('getHandler returns correct handler', () => {
        const mockGamepad = createMockGamepad(0)
        gamepadManager.handlers[0] = new GamepadHandler(mockGamepad)
        
        expect(gamepadManager.getHandler(0)).toBe(gamepadManager.handlers[0])
        expect(gamepadManager.getHandler(1)).toBeNull()
    })


    test('getConnectedGamepads returns all connected gamepads', () => {
        gamepadManager.handlers[0] = new GamepadHandler(createMockGamepad(0))
        gamepadManager.handlers[1] = new GamepadHandler(createMockGamepad(1))
        
        const connectedGamepads = gamepadManager.getConnectedGamepads()
        expect(connectedGamepads).toEqual(['0', '1'])
        expect(connectedGamepads.length).toBe(2)
    })


    test('isGamepadConnected checks if gamepad is connected', () => {
        gamepadManager.handlers[0] = new GamepadHandler(createMockGamepad(0))
        
        expect(gamepadManager.isGamepadConnected(0)).toBe(true)
        expect(gamepadManager.isGamepadConnected(1)).toBe(false)
    })


    test('syncExistingGamepads imports already connected gamepads', () => {
        const mockGamepad1 = createMockGamepad(0)
        const mockGamepad2 = createMockGamepad(1)

        navigator.getGamepads.mockReturnValue([mockGamepad1, mockGamepad2])

        const createSpy = vi.spyOn(gamepadManager, 'createHandler')

        gamepadManager.syncExistingGamepads()

        expect(createSpy).toHaveBeenCalledWith(mockGamepad1)
        expect(createSpy).toHaveBeenCalledWith(mockGamepad2)
    })

})


function createMockGamepad (index) {
    return {
        id: `Gamepad ${index}`,
        index,
        buttons: [
            {pressed: false, value: 0},
            {pressed: false, value: 0}
        ],
        axes: [0, 0],
        mapping: 'standard',
        connected: true,
        timestamp: Date.now()
    }
}
