import GamepadHandler from './gamepad_handler'
import {vi} from 'vitest'


describe(GamepadHandler, () => {

    let gamepadHandler
    let mockGamepad

    beforeEach(() => {
        mockGamepad = createMockGamepad(0)
        gamepadHandler = new GamepadHandler(mockGamepad)
        
        vi.spyOn(gamepadHandler, 'emit')
    })

    afterEach(() => {
        vi.clearAllMocks()
    })


    test('constructor initializes correctly', () => {
        expect(gamepadHandler.gamepad).toBe(mockGamepad)
        expect(gamepadHandler.index).toBe(0)
        expect(gamepadHandler.id).toBe('Gamepad 0')
        expect(gamepadHandler.previousButtonStates.length).toBe(2)
        expect(gamepadHandler.previousAxisValues.length).toBe(2)
        expect(gamepadHandler.deadzone).toBe(0.1)
    })


    test('update updates gamepad and checks changes', () => {
        const buttonSpy = vi.spyOn(gamepadHandler, 'checkButtonChanges')
        const axisSpy = vi.spyOn(gamepadHandler, 'checkAxisChanges')

        const updatedGamepad = createMockGamepad(0)
        updatedGamepad.buttons[0].pressed = true
        updatedGamepad.axes[0] = 0.5

        gamepadHandler.update(updatedGamepad)

        expect(gamepadHandler.gamepad).toBe(updatedGamepad)

        expect(buttonSpy).toHaveBeenCalled()
        expect(axisSpy).toHaveBeenCalled()
    })


    test('checkButtonChanges detects button press', () => {
        gamepadHandler.previousButtonStates = [
            {pressed: false, value: 0},
            {pressed: false, value: 0}
        ]

        gamepadHandler.gamepad.buttons[0].pressed = true
        gamepadHandler.gamepad.buttons[0].value = 1

        gamepadHandler.checkButtonChanges()

        expect(gamepadHandler.emit).toHaveBeenCalledWith('buttonpress', {
            buttonIndex: 0,
            value: 1
        })

        expect(gamepadHandler.previousButtonStates[0].pressed).toBe(true)
        expect(gamepadHandler.previousButtonStates[0].value).toBe(1)
    })


    test('checkButtonChanges detects button release', () => {
        gamepadHandler.previousButtonStates = [
            {pressed: true, value: 1},
            {pressed: false, value: 0}
        ]

        gamepadHandler.gamepad.buttons[0].pressed = false
        gamepadHandler.gamepad.buttons[0].value = 0

        gamepadHandler.checkButtonChanges()

        expect(gamepadHandler.emit).toHaveBeenCalledWith('buttonrelease', {
            buttonIndex: 0,
            value: 0
        })

        expect(gamepadHandler.previousButtonStates[0].pressed).toBe(false)
        expect(gamepadHandler.previousButtonStates[0].value).toBe(0)
    })


    test('checkAxisChanges detects significant axis changes', () => {
        gamepadHandler.previousAxisValues = [0, 0]
        gamepadHandler.lastAxisEvent = 0

        gamepadHandler.gamepad.axes = [0.5, 0]

        vi.spyOn(Date, 'now').mockReturnValue(1000)

        gamepadHandler.checkAxisChanges()

        expect(gamepadHandler.emit).toHaveBeenCalledWith('axischange', {
            axes: [0.5, 0]
        })

        expect(gamepadHandler.previousAxisValues).toEqual([0.5, 0])
        expect(gamepadHandler.lastAxisEvent).toBe(1000)
    })


    test('checkAxisChanges ignores changes below deadzone', () => {
        gamepadHandler.previousAxisValues = [0, 0]

        gamepadHandler.gamepad.axes = [0.05, 0.05]

        gamepadHandler.checkAxisChanges()

        expect(gamepadHandler.emit).not.toHaveBeenCalledWith('axischange', expect.anything())
    })


    test('isButtonPressed checks if button is pressed', () => {
        gamepadHandler.gamepad.buttons[0].pressed = false
        gamepadHandler.gamepad.buttons[1].pressed = true
        
        expect(gamepadHandler.isButtonPressed(0)).toBe(false)
        expect(gamepadHandler.isButtonPressed(1)).toBe(true)
        expect(gamepadHandler.isButtonPressed(2)).toBe(false)
    })


    test('getButtonValue returns button value', () => {
        gamepadHandler.gamepad.buttons[0].value = 0.5
        gamepadHandler.gamepad.buttons[1].value = 1
        
        expect(gamepadHandler.getButtonValue(0)).toBe(0.5)
        expect(gamepadHandler.getButtonValue(1)).toBe(1)
        expect(gamepadHandler.getButtonValue(2)).toBe(0)
    })


    test('getAxisValue returns axis value with deadzone applied', () => {
        gamepadHandler.gamepad.axes[0] = 0.05
        gamepadHandler.gamepad.axes[1] = 0.5

        expect(gamepadHandler.getAxisValue(0)).toBe(0)
        expect(gamepadHandler.getAxisValue(1)).toBe(0.5)
        expect(gamepadHandler.getAxisValue(2)).toBe(0)
    })


    test('getInfo returns complete gamepad info', () => {
        const testGamepad = createMockGamepad(0)
        testGamepad.mapping = 'standard'
        testGamepad.timestamp = 1000
        gamepadHandler.gamepad = testGamepad

        vi.spyOn(gamepadHandler, 'getType').mockReturnValue('xbox')
        
        const info = gamepadHandler.getInfo()

        expect(info.id).toBe('Gamepad 0')
        expect(info.index).toBe(0)
        expect(info.mapping).toBe('standard')
        expect(info.connected).toBe(true)
        expect(info.timestamp).toBe(1000)
        expect(info.buttons).toBe(2)
        expect(info.axes).toBe(2)
        expect(info.type).toBe('xbox')
    })


    test('getType identifies gamepad type', () => {
        const ps5Id = 'Sony DualSense (054c:0ce6) (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)'
        gamepadHandler.gamepad.id = ps5Id
        expect(gamepadHandler.getType()).toBe('ps5')
        
        const xboxId = 'Xbox 360 Controller (STANDARD GAMEPAD Vendor: 045e Product: 028e)'
        gamepadHandler.gamepad.id = xboxId
        expect(gamepadHandler.getType()).toBe('xbox')
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