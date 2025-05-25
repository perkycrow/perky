import GamepadDevice from './gamepad_device'
import {vi} from 'vitest'


describe(GamepadDevice, () => {

    let gamepadDevice

    beforeEach(() => {
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

        gamepadDevice = new GamepadDevice()
        gamepadDevice.start()
    })

    afterEach(() => {
        gamepadDevice.stop()
        vi.clearAllMocks()
    })


    test('constructor', () => {
        expect(gamepadDevice.gamepads).toEqual({})
        expect(gamepadDevice.previousButtonStates).toEqual({})
        expect(gamepadDevice.previousAxisValues).toEqual({})
        expect(gamepadDevice.deadzone).toBe(0.1)
        expect(gamepadDevice.throttleInterval).toBe(100)
        expect(gamepadDevice.name).toBe('GamepadDevice')
    })


    test('static properties', () => {
        expect(GamepadDevice.methods).toContain('isGamepadConnected')
        expect(GamepadDevice.methods).toContain('getConnectedGamepads')
        expect(GamepadDevice.methods).toContain('getGamepadInfo')
        expect(GamepadDevice.methods).toContain('isButtonPressed')
        expect(GamepadDevice.methods).toContain('getButtonValue')
        expect(GamepadDevice.methods).toContain('getAxisValue')
        expect(GamepadDevice.events).toContain('gamepadconnected')
        expect(GamepadDevice.events).toContain('gamepaddisconnected')
        expect(GamepadDevice.events).toContain('buttonpress')
        expect(GamepadDevice.events).toContain('buttonrelease')
        expect(GamepadDevice.events).toContain('axischange')
    })


    test('observe and unobserve', () => {
        const testGamepadDevice = new GamepadDevice()
        
        expect(testGamepadDevice.gamepadListeners).toBeUndefined()
        
        testGamepadDevice.observe()
        expect(testGamepadDevice.gamepadListeners).toBeDefined()
        expect(typeof testGamepadDevice.gamepadListeners.gamepadconnected).toBe('function')
        expect(typeof testGamepadDevice.gamepadListeners.gamepaddisconnected).toBe('function')
        
        testGamepadDevice.unobserve()
        expect(testGamepadDevice.gamepadListeners).toBeUndefined()
    })


    test('gamepadconnected event', () => {
        const listener = vi.fn()
        gamepadDevice.on('gamepadconnected', listener)

        const mockGamepad = createMockGamepad(0, 'Tester Gamepad', 4, 2)
        
        window.dispatchEvent(new window.GamepadEvent('gamepadconnected', {
            gamepad: mockGamepad
        }))

        expect(listener).toHaveBeenCalled()
        const eventData = listener.mock.calls[0][0]
        expect(eventData.gamepad.index).toBe(0)
        expect(eventData.gamepad.id).toBe('Tester Gamepad')
        expect(eventData.gamepad.buttons).toBe(4)
        expect(eventData.gamepad.axes).toBe(2)
        
        expect(gamepadDevice.isGamepadConnected(0)).toBe(true)
    })


    test('gamepaddisconnected event', () => {
        const listener = vi.fn()
        gamepadDevice.on('gamepaddisconnected', listener)

        const mockGamepad = createMockGamepad(0, 'Tester Gamepad', 4, 2)
        gamepadDevice.gamepads[0] = mockGamepad
        gamepadDevice.previousButtonStates[0] = []
        gamepadDevice.previousAxisValues[0] = []
        
        window.dispatchEvent(new window.GamepadEvent('gamepaddisconnected', {
            gamepad: mockGamepad
        }))

        expect(listener).toHaveBeenCalled()
        const eventData = listener.mock.calls[0][0]
        expect(eventData.gamepad.index).toBe(0)
        expect(eventData.gamepad.id).toBe('Tester Gamepad')
        
        expect(gamepadDevice.isGamepadConnected(0)).toBe(false)
        expect(gamepadDevice.previousButtonStates[0]).toBeUndefined()
        expect(gamepadDevice.previousAxisValues[0]).toBeUndefined()
    })


    test('buttonpress and buttonrelease events', () => {
        const pressListener = vi.fn()
        const releaseListener = vi.fn()
        gamepadDevice.on('buttonpress', pressListener)
        gamepadDevice.on('buttonrelease', releaseListener)

        const mockGamepad = createMockGamepad(0, 'Tester Gamepad', 4, 2)
        gamepadDevice.gamepads[0] = mockGamepad
        gamepadDevice.previousButtonStates[0] = createInitialButtonStates(4)
        
        mockGamepad.buttons[1].pressed = true
        mockGamepad.buttons[1].value = 1
        
        checkButtonChanges(gamepadDevice, mockGamepad)

        expect(pressListener).toHaveBeenCalled()
        let eventData = pressListener.mock.calls[0][0]
        expect(eventData.gamepadIndex).toBe(0)
        expect(eventData.buttonIndex).toBe(1)
        expect(eventData.value).toBe(1)
        
        mockGamepad.buttons[1].pressed = false
        mockGamepad.buttons[1].value = 0
        
        pressListener.mockReset()

        checkButtonChanges(gamepadDevice, mockGamepad)

        expect(releaseListener).toHaveBeenCalled()
        eventData = releaseListener.mock.calls[0][0]
        expect(eventData.gamepadIndex).toBe(0)
        expect(eventData.buttonIndex).toBe(1)
        expect(eventData.value).toBe(0)
        
        expect(pressListener).not.toHaveBeenCalled()
    })


    test('axis change events', () => {
        const axisListener = vi.fn()
        gamepadDevice.on('axischange', axisListener)

        const mockGamepad = createMockGamepad(0, 'Tester Gamepad', 2, 2)
        gamepadDevice.gamepads[0] = mockGamepad
        gamepadDevice.previousAxisValues[0] = [0, 0]
        
        mockGamepad.axes = [0.5, -0.7]

        checkAxisChanges(gamepadDevice, mockGamepad)

        expect(axisListener).toHaveBeenCalled()
        const eventData = axisListener.mock.calls[0][0]
        expect(eventData.gamepadIndex).toBe(0)
        expect(eventData.axes).toEqual([0.5, -0.7])
        
        expect(gamepadDevice.previousAxisValues[0]).toEqual([0.5, -0.7])
    })


    test('isGamepadConnected', () => {
        expect(gamepadDevice.isGamepadConnected(0)).toBe(false)
        
        gamepadDevice.gamepads[0] = createMockGamepad(0, 'Tester Gamepad', 2, 2)
        expect(gamepadDevice.isGamepadConnected(0)).toBe(true)
        
        gamepadDevice.gamepads[0] = null
        expect(gamepadDevice.isGamepadConnected(0)).toBe(false)
    })


    test('getConnectedGamepads', () => {
        expect(gamepadDevice.getConnectedGamepads()).toEqual([])
        
        gamepadDevice.gamepads[0] = createMockGamepad(0, 'Gamepad 1', 2, 2)
        gamepadDevice.gamepads[1] = createMockGamepad(1, 'Gamepad 2', 2, 2)
        gamepadDevice.gamepads[2] = null
        
        const connected = gamepadDevice.getConnectedGamepads()
        expect(connected).toContain('0')
        expect(connected).toContain('1')
        expect(connected).not.toContain('2')
        expect(connected.length).toBe(2)
    })


    test('getGamepadInfo', () => {
        expect(gamepadDevice.getGamepadInfo(0)).toBeNull()
        
        const mockGamepad = createMockGamepad(0, 'Tester Gamepad', 10, 4)
        mockGamepad.mapping = 'standard'
        mockGamepad.timestamp = 1000
        
        gamepadDevice.gamepads[0] = mockGamepad
        
        const info = gamepadDevice.getGamepadInfo(0)
        expect(info.id).toBe('Tester Gamepad')
        expect(info.index).toBe(0)
        expect(info.mapping).toBe('standard')
        expect(info.connected).toBe(true)
        expect(info.timestamp).toBe(1000)
        expect(info.buttons).toBe(10)
        expect(info.axes).toBe(4)
    })


    test('isButtonPressed', () => {
        expect(gamepadDevice.isButtonPressed(0, 0)).toBe(false)
        
        const mockGamepad = createMockGamepad(0, 'Tester Gamepad', 4, 2)
        gamepadDevice.gamepads[0] = mockGamepad

        expect(gamepadDevice.isButtonPressed(1, 0)).toBe(false)
        
        mockGamepad.buttons[1].pressed = true
        expect(gamepadDevice.isButtonPressed(1, 0)).toBe(true)
        
        expect(gamepadDevice.isButtonPressed(10, 0)).toBe(false)
    })


    test('getButtonValue', () => {
        expect(gamepadDevice.getButtonValue(0, 0)).toBe(0)
        
        const mockGamepad = createMockGamepad(0, 'Tester Gamepad', 4, 2)
        gamepadDevice.gamepads[0] = mockGamepad
        
        mockGamepad.buttons[2].value = 0.75
        expect(gamepadDevice.getButtonValue(2, 0)).toBe(0.75)
        
        expect(gamepadDevice.getButtonValue(10, 0)).toBe(0)
    })


    test('getAxisValue with deadzone', () => {
        expect(gamepadDevice.getAxisValue(0, 0)).toBe(0)
        
        const mockGamepad = createMockGamepad(0, 'Tester Gamepad', 2, 2)
        gamepadDevice.gamepads[0] = mockGamepad

        mockGamepad.axes[0] = 0.05
        expect(gamepadDevice.getAxisValue(0, 0)).toBe(0)
        
        mockGamepad.axes[1] = 0.2
        expect(gamepadDevice.getAxisValue(1, 0)).toBe(0.2)
        
        mockGamepad.axes[0] = -0.8
        expect(gamepadDevice.getAxisValue(0, 0)).toBe(-0.8)

        expect(gamepadDevice.getAxisValue(5, 0)).toBe(0)
    })

})


function createMockGamepad (index, id, numButtons, numAxes) {
    const buttons = []
    for (let i = 0; i < numButtons; i++) {
        buttons.push({
            pressed: false,
            touched: false,
            value: 0
        })
    }
    
    const axes = new Array(numAxes).fill(0)
    
    return {
        id,
        index,
        connected: true,
        timestamp: Date.now(),
        mapping: 'standard',
        axes,
        buttons
    }
}


function createInitialButtonStates (numButtons) {
    const states = []
    for (let i = 0; i < numButtons; i++) {
        states.push({
            pressed: false,
            value: 0
        })
    }
    return states
}


function createButtonState (button) {
    return {
        pressed: button.pressed,
        value: button.value
    }
}



function processButtonState (device, {gamepad, buttonIndex, button, previousState}) {
    if (button.pressed && !previousState.pressed) {
        device.emit('buttonpress', {
            gamepadIndex: gamepad.index,
            buttonIndex,
            value: button.value
        })
    }

    if (!button.pressed && previousState.pressed) {
        device.emit('buttonrelease', {
            gamepadIndex: gamepad.index,
            buttonIndex,
            value: button.value
        })
    }
    
    return createButtonState(button)
}


function checkButtonChanges (device, gamepad) {
    const index = gamepad.index
    const previousStates = device.previousButtonStates[index] || []
    
    for (let buttonIndex = 0; buttonIndex < gamepad.buttons.length; buttonIndex++) {
        const button = gamepad.buttons[buttonIndex]
        const previousState = previousStates[buttonIndex] || {pressed: false, value: 0}
        
        previousStates[buttonIndex] = processButtonState(device, {
            gamepad,
            buttonIndex,
            button,
            previousState
        })
    }
    
    device.previousButtonStates[index] = previousStates
}


function checkAxisChanges (device, gamepad) {
    const index = gamepad.index
    const previousValues = device.previousAxisValues[index] || []
    
    let hasSignificantChange = detectAxisChanges(gamepad, previousValues, device.deadzone)
    updateAxisValues(previousValues, gamepad)
    
    if (hasSignificantChange) {
        device.emit('axischange', {
            gamepadIndex: index,
            axes: [...gamepad.axes]
        })
    }
    
    device.previousAxisValues[index] = previousValues
}


function detectAxisChanges (gamepad, previousValues, deadzone) {
    for (let i = 0; i < gamepad.axes.length; i++) {
        const value = gamepad.axes[i]
        const previousValue = previousValues[i] || 0
        const delta = Math.abs(value - previousValue)
        
        if (delta > deadzone) {
            return true
        }
    }
    
    return false
}


function updateAxisValues (previousValues, gamepad) {
    for (let i = 0; i < gamepad.axes.length; i++) {
        previousValues[i] = gamepad.axes[i]
    }
}
