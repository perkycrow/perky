import Notifier from '../core/notifier'
import {parseGamepadId} from './utils/gamepad_utils'


export default class GamepadHandler extends Notifier {

    constructor (gamepad) {
        super()
        
        this.gamepad = gamepad
        this.index = gamepad.index
        this.id = gamepad.id
        this.previousButtonStates = createInitialButtonStates(gamepad)
        this.previousAxisValues = new Array(gamepad.axes.length).fill(0)
        this.deadzone = 0.1
        this.throttleInterval = 100
        this.lastAxisEvent = 0
    }


    update (gamepad) {
        this.gamepad = gamepad
        this.checkButtonChanges()
        this.checkAxisChanges()
    }


    checkButtonChanges () {
        const processButton = (i, button, previousState) => {
            if (button.pressed && !previousState.pressed) {
                this.emit('buttonpress', {
                    buttonIndex: i,
                    value: button.value
                })
            }
            
            if (!button.pressed && previousState.pressed) {
                this.emit('buttonrelease', {
                    buttonIndex: i,
                    value: button.value
                })
            }
            
            return {pressed: button.pressed, value: button.value}
        }

        for (let i = 0; i < this.gamepad.buttons.length; i++) {
            const button = this.gamepad.buttons[i]
            const previousState = this.previousButtonStates[i] || {pressed: false, value: 0}

            this.previousButtonStates[i] = processButton(i, button, previousState)
        }
    }


    checkAxisChanges () {
        const now = Date.now()
        const throttle = now - this.lastAxisEvent < this.throttleInterval
        
        let hasSignificantChange = false
        
        for (let i = 0; i < this.gamepad.axes.length; i++) {
            const value = this.gamepad.axes[i]
            const previousValue = this.previousAxisValues[i] || 0
            const delta = Math.abs(value - previousValue)
            
            if (delta > this.deadzone) {
                hasSignificantChange = true
            }
            
            this.previousAxisValues[i] = value
        }
        
        if (!throttle && hasSignificantChange) {
            this.emit('axischange', {
                axes: [...this.gamepad.axes]
            })
            
            this.lastAxisEvent = now
        }
    }


    isPressed (buttonIndex) {
        return this.isButtonPressed(buttonIndex)
    }


    isButtonPressed (buttonIndex) {
        return buttonIndex < this.gamepad.buttons.length && this.gamepad.buttons[buttonIndex].pressed
    }


    getButtonValue (buttonIndex) {
        return buttonIndex < this.gamepad.buttons.length ? this.gamepad.buttons[buttonIndex].value : 0
    }


    getAxisValue (axisIndex) {
        if (axisIndex < this.gamepad.axes.length) {
            const value = this.gamepad.axes[axisIndex]
            return Math.abs(value) < this.deadzone ? 0 : value
        }
        
        return 0
    }


    getType () {
        return parseGamepadId(this.gamepad.id).type
    }


    getInfo () {
        const details = parseGamepadId(this.gamepad.id)
        
        return {
            id: this.gamepad.id,
            index: this.gamepad.index,
            mapping: this.gamepad.mapping,
            connected: this.gamepad.connected,
            timestamp: this.gamepad.timestamp,
            buttons: this.gamepad.buttons.length,
            axes: this.gamepad.axes.length,
            type: details.type,
            vendor: details.vendor,
            product: details.product,
            model: details.model
        }
    }

}


function createInitialButtonStates (gamepad) {
    const initialState = []
    
    for (let i = 0; i < gamepad.buttons.length; i++) {
        initialState[i] = {
            pressed: false,
            value: 0
        }
    }

    return initialState
}
