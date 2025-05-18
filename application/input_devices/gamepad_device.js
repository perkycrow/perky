import InputDevice from '../input_device'


export default class GamepadDevice extends InputDevice {

    static controls = [
        'gamepadButton',
        'gamepadAxis'
    ]

    static methods = [
        'isGamepadConnected',
        'getConnectedGamepads',
        'getGamepadInfo',
        'isButtonPressed',
        'getButtonValue',
        'getAxisValue',
        'getGamepadType'
    ]

    static events = [
        'gamepadconnected',
        'gamepaddisconnected',
        'buttonpress',
        'buttonrelease',
        'axischange'
    ]


    constructor (params = {}) {
        super(params)

        this.gamepads = {}
        this.previousButtonStates = {}
        this.previousAxisValues = {}
        this.deadzone = params.deadzone || 0.1
        this.throttleInterval = params.throttleInterval || 100
        this.lastAxisEvent = 0
    }


    observe () {
        return observe(this)
    }


    unobserve () {
        return unobserve(this)
    }


    isPressed (button, gamepadIndex = 0) {
        return this.isButtonPressed(button, gamepadIndex)
    }


    isGamepadConnected (gamepadIndex) {
        return gamepadIndex in this.gamepads && this.gamepads[gamepadIndex] !== null
    }


    getConnectedGamepads () {
        return Object.keys(this.gamepads).filter(index => this.gamepads[index] !== null)
    }


    getGamepadInfo (gamepadIndex) {
        if (!this.isGamepadConnected(gamepadIndex)) {
            return null
        }

        const gamepad = this.gamepads[gamepadIndex]
        return {
            id: gamepad.id,
            index: gamepad.index,
            mapping: gamepad.mapping,
            connected: gamepad.connected,
            timestamp: gamepad.timestamp,
            buttons: gamepad.buttons.length,
            axes: gamepad.axes.length
        }
    }


    isButtonPressed (buttonIndex, gamepadIndex = 0) {
        if (!this.isGamepadConnected(gamepadIndex)) {
            return false
        }

        const gamepad = this.gamepads[gamepadIndex]
        return buttonIndex < gamepad.buttons.length && gamepad.buttons[buttonIndex].pressed
    }


    getButtonValue (buttonIndex, gamepadIndex = 0) {
        if (!this.isGamepadConnected(gamepadIndex)) {
            return 0
        }

        const gamepad = this.gamepads[gamepadIndex]
        return buttonIndex < gamepad.buttons.length ? gamepad.buttons[buttonIndex].value : 0
    }


    getAxisValue (axisIndex, gamepadIndex = 0) {
        if (!this.isGamepadConnected(gamepadIndex)) {
            return 0
        }

        const gamepad = this.gamepads[gamepadIndex]
        if (axisIndex < gamepad.axes.length) {
            const value = gamepad.axes[axisIndex]
            return Math.abs(value) < this.deadzone ? 0 : value
        }
        
        return 0
    }


    getGamepadType (gamepadIndex = 0) {
        if (!this.isGamepadConnected(gamepadIndex)) {
            return 'unknown'
        }

        return detectGamepadType(this.gamepads[gamepadIndex])
    }

}


const GAMEPAD_TYPES = {
    ps5: {
        ids: ['054c'],
        models: ['dualsense']
    },

    ps4: {
        ids: ['054c'],
        models: ['dualshock 4', 'wireless controller']
    },

    ps3: {
        ids: ['054c'],
        models: ['dualshock 3']
    },

    xbox_one: {
        ids: ['xbox'],
        models: ['one']
    },

    xbox: {
        ids: ['xbox'],
        models: []
    },

    switch: {
        ids: ['057e', 'switch'],
        models: []
    }
}


function detectGamepadType (gamepad) {
    const id = gamepad.id.toLowerCase()
    
    for (const [type, config] of Object.entries(GAMEPAD_TYPES)) {
        if (!config.ids.some(vendorId => id.includes(vendorId))) {
            continue
        }

        if (config.models.length === 0 || 
            config.models.some(model => id.includes(model))) {
            return type
        }
    }
    
    return 'generic'
}


function observe (device) {
    if (device.gamepadListeners) {
        return false
    }

    const listeners = {
        gamepadconnected (event) {
            handleGamepadConnected(device, event.gamepad)
        },
        gamepaddisconnected (event) {
            handleGamepadDisconnected(device, event.gamepad)
        }
    }

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : []
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            handleGamepadConnected(device, gamepads[i])
        }
    }

    window.addEventListener('gamepadconnected', listeners.gamepadconnected)
    window.addEventListener('gamepaddisconnected', listeners.gamepaddisconnected)

    device.gamepadListeners = listeners
    device.pollingInterval = setInterval(() => pollGamepads(device), 16)

    return true
}


function unobserve (device) {
    const listeners = device.gamepadListeners

    if (listeners) {
        window.removeEventListener('gamepadconnected', listeners.gamepadconnected)
        window.removeEventListener('gamepaddisconnected', listeners.gamepaddisconnected)

        clearInterval(device.pollingInterval)

        delete device.gamepadListeners
        delete device.pollingInterval

        return true
    }

    return false
}


function handleGamepadConnected (device, gamepad) {
    device.gamepads[gamepad.index] = gamepad
    device.previousButtonStates[gamepad.index] = createInitialButtonState(gamepad)
    device.previousAxisValues[gamepad.index] = createInitialAxisState(gamepad)
    
    device.emit('gamepadconnected', {
        gamepad: {
            index: gamepad.index,
            id: gamepad.id,
            buttons: gamepad.buttons.length,
            axes: gamepad.axes.length
        }
    })
}


function handleGamepadDisconnected (device, gamepad) {
    delete device.gamepads[gamepad.index]
    delete device.previousButtonStates[gamepad.index]
    delete device.previousAxisValues[gamepad.index]
    
    device.emit('gamepaddisconnected', {
        gamepad: {
            index: gamepad.index,
            id: gamepad.id
        }
    })
}


function pollGamepads (device) {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : []
    
    for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i]
        
        if (gamepad) {
            device.gamepads[gamepad.index] = gamepad
            checkButtonChanges(device, gamepad)
            checkAxisChanges(device, gamepad)
        }
    }
}


function emitButtonEvent (buttonData, isPressed) {
    const {device, gamepadIndex, buttonIndex, value} = buttonData
    const eventType = isPressed ? 'buttonpress' : 'buttonrelease'
    
    device.emit(eventType, {
        gamepadIndex,
        buttonIndex,
        value
    })
}


function processButtonState (buttonData, button, prevState) {
    if (button.pressed && !prevState.pressed) {
        emitButtonEvent(buttonData, true)
    }

    if (!button.pressed && prevState.pressed) {
        emitButtonEvent(buttonData, false)
    }
    
    return {pressed: button.pressed, value: button.value}
}


function checkButtonChanges (device, gamepad) {
    const index = gamepad.index
    const previousStates = device.previousButtonStates[index] || createInitialButtonState(gamepad)
    
    for (let i = 0; i < gamepad.buttons.length; i++) {
        const button = gamepad.buttons[i]
        const previousState = previousStates[i] || {pressed: false, value: 0}
        
        const buttonData = {
            device,
            gamepadIndex: gamepad.index,
            buttonIndex: i,
            value: button.value
        }
        
        previousStates[i] = processButtonState(buttonData, button, previousState)
    }
    
    device.previousButtonStates[index] = previousStates
}


function checkAxisChanges (device, gamepad) {
    const now = Date.now()
    const index = gamepad.index
    const previousValues = device.previousAxisValues[index] || createInitialAxisState(gamepad)
    const throttle = now - device.lastAxisEvent < device.throttleInterval
    
    let hasSignificantChange = detectAxisChanges(gamepad, previousValues, device.deadzone)
    updatePreviousAxisValues(previousValues, gamepad)

    if (!throttle && hasSignificantChange) {
        device.emit('axischange', {
            gamepadIndex: index,
            axes: [...gamepad.axes]
        })
        
        device.lastAxisEvent = now
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


function updatePreviousAxisValues (previousValues, gamepad) {
    for (let i = 0; i < gamepad.axes.length; i++) {
        previousValues[i] = gamepad.axes[i]
    }
}


function createInitialButtonState (gamepad) {
    const initialState = []
    
    for (let i = 0; i < gamepad.buttons.length; i++) {
        initialState[i] = {
            pressed: false,
            value: 0
        }
    }
    
    return initialState
}


function createInitialAxisState (gamepad) {
    const initialState = []
    
    for (let i = 0; i < gamepad.axes.length; i++) {
        initialState[i] = 0
    }
    
    return initialState
}
