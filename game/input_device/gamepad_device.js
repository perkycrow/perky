import InputDevice from '../../input/input_device'
import GamepadManager from '../gamepad_manager'


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
        'getAxisValue'
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

        this.manager = new GamepadManager()
        this.gamepads = {}
        this.previousButtonStates = {}
        this.previousAxisValues = {}
        this.deadzone = 0.1
        this.throttleInterval = 100
        this.name = 'GamepadDevice'
        this.gamepadListeners = undefined
        this.setupEventForwarding()
    }


    observe () {
        if (!this.gamepadListeners) {
            this.gamepadListeners = {
                gamepadconnected: this.handleGamepadConnected.bind(this),
                gamepaddisconnected: this.handleGamepadDisconnected.bind(this)
            }
            
            window.addEventListener('gamepadconnected', this.gamepadListeners.gamepadconnected)
            window.addEventListener('gamepaddisconnected', this.gamepadListeners.gamepaddisconnected)
        }
        
        return this.manager.start()
    }


    unobserve () {
        if (this.gamepadListeners) {
            window.removeEventListener('gamepadconnected', this.gamepadListeners.gamepadconnected)
            window.removeEventListener('gamepaddisconnected', this.gamepadListeners.gamepaddisconnected)
            
            this.gamepadListeners = undefined
        }
        
        return this.manager.stop()
    }


    handleGamepadConnected (event) {
        const gamepad = event.gamepad
        this.gamepads[gamepad.index] = {
            index: gamepad.index,
            id: gamepad.id,
            buttons: gamepad.buttons.length,
            axes: gamepad.axes.length,
            mapping: gamepad.mapping,
            connected: gamepad.connected,
            timestamp: gamepad.timestamp
        }
        
        this.previousButtonStates[gamepad.index] = []
        this.previousAxisValues[gamepad.index] = []
        
        this.emit('gamepadconnected', {
            gamepad: this.gamepads[gamepad.index]
        })
    }


    handleGamepadDisconnected (event) {
        const gamepad = event.gamepad
        const gamepadData = this.gamepads[gamepad.index]
        
        if (gamepadData) {
            this.emit('gamepaddisconnected', {
                gamepad: gamepadData
            })
            
            delete this.gamepads[gamepad.index]
            delete this.previousButtonStates[gamepad.index]
            delete this.previousAxisValues[gamepad.index]
        }
    }


    setupEventForwarding () {
        this.manager.on('gamepadconnected', (data) => {
            const handler = data.handler
            const index = data.index
            
            this.gamepads[index] = {
                index: index,
                id: handler.id,
                buttons: handler.gamepad.buttons.length,
                axes: handler.gamepad.axes.length,
                mapping: handler.gamepad.mapping,
                connected: handler.gamepad.connected,
                timestamp: handler.gamepad.timestamp
            }
            
            this.previousButtonStates[index] = []
            this.previousAxisValues[index] = []
            
            this.emit('gamepadconnected', {
                gamepad: this.gamepads[index]
            })
        })
        
        this.manager.on('gamepaddisconnected', (data) => {
            const index = data.index
            
            if (this.gamepads[index]) {
                this.emit('gamepaddisconnected', {
                    gamepad: this.gamepads[index]
                })
                
                delete this.gamepads[index]
                delete this.previousButtonStates[index]
                delete this.previousAxisValues[index]
            }
        })
        
        this.manager.on('buttonpress', (data) => {
            this.emit('buttonpress', data)
        })
        
        this.manager.on('buttonrelease', (data) => {
            this.emit('buttonrelease', data)
        })
        
        this.manager.on('axischange', (data) => {
            this.emit('axischange', data)
        })
    }


    start () {
        return this.observe()
    }


    stop () {
        return this.unobserve()
    }


    isPressed (button, gamepadIndex = 0) {
        return this.isButtonPressed(button, gamepadIndex)
    }


    isGamepadConnected (gamepadIndex) {
        return Boolean(this.gamepads[gamepadIndex])
    }


    getConnectedGamepads () {
        return Object.keys(this.gamepads).filter(index => this.gamepads[index] !== null)
    }


    getGamepadInfo (gamepadIndex) {
        if (this.gamepads[gamepadIndex]) {
            const gamepad = this.gamepads[gamepadIndex]

            if (gamepad.buttons && Array.isArray(gamepad.buttons)) {
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


            const handler = this.manager.getHandler(gamepadIndex)
            if (handler) {
                return handler.getInfo()
            }


            return gamepad
        }
        return null
    }


    isButtonPressed (buttonIndex, gamepadIndex = 0) {
        if (!this.gamepads[gamepadIndex]) {
            return false
        }

        const gamepad = this.gamepads[gamepadIndex]
        if (gamepad.buttons && buttonIndex < gamepad.buttons.length) {
            return gamepad.buttons[buttonIndex].pressed || false
        }

        const handler = this.manager.getHandler(gamepadIndex)
        return handler ? handler.isButtonPressed(buttonIndex) : false
    }


    getButtonValue (buttonIndex, gamepadIndex = 0) {
        if (!this.gamepads[gamepadIndex]) {
            return 0
        }

        const gamepad = this.gamepads[gamepadIndex]
        if (gamepad.buttons && buttonIndex < gamepad.buttons.length) {
            return gamepad.buttons[buttonIndex].value || 0
        }

        const handler = this.manager.getHandler(gamepadIndex)
        return handler ? handler.getButtonValue(buttonIndex) : 0
    }


    getAxisValue (axisIndex, gamepadIndex = 0) {
        if (!this.gamepads[gamepadIndex]) {
            return 0
        }

        const gamepad = this.gamepads[gamepadIndex]
        if (gamepad.axes && axisIndex < gamepad.axes.length) {
            const value = gamepad.axes[axisIndex]
            return Math.abs(value) < this.deadzone ? 0 : value
        }

        const handler = this.manager.getHandler(gamepadIndex)
        return handler ? handler.getAxisValue(axisIndex) : 0
    }

}
