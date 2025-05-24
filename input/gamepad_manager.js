import Notifier from '../core/notifier'
import GamepadHandler from './gamepad_handler'


export default class GamepadManager extends Notifier {

    constructor () {
        super()
        
        this.handlers = {}
        this.isRunning = false
        this.animationFrameId = null
        this.poll = this.poll.bind(this)
        this.animationLoop = this.animationLoop.bind(this)
        this.setupEventListeners()
        this.syncExistingGamepads()
    }


    start () {
        if (this.isRunning) {
            return false
        }

        this.isRunning = true
        this.animationFrameId = requestAnimationFrame(this.animationLoop)
        return true
    }


    stop () {
        if (!this.isRunning) {
            return false
        }

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId)
            this.animationFrameId = null
        }
        this.isRunning = false
        return true
    }


    animationLoop () {
        this.poll()
        if (this.isRunning) {
            this.animationFrameId = requestAnimationFrame(this.animationLoop)
        }
    }


    setupEventListeners () {
        window.addEventListener('gamepadconnected', e => this.handleGamepadConnected(e))
        window.addEventListener('gamepaddisconnected', e => this.handleGamepadDisconnected(e))
    }


    syncExistingGamepads () {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : []
        
        for (let i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i]
            if (gamepad) {
                this.createHandler(gamepad)
            }
        }
    }


    poll () {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : []
        
        for (let i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i]
            
            if (gamepad && this.handlers[gamepad.index]) {
                this.handlers[gamepad.index].update(gamepad)
            }
        }
    }


    handleGamepadConnected (event) {
        const gamepad = event.gamepad
        this.createHandler(gamepad)
    }


    createHandler (gamepad) {
        if (this.handlers[gamepad.index]) {
            return false
        }

        this.handlers[gamepad.index] = new GamepadHandler(gamepad)
        
        // Transmettre les événements du handler
        this.setupHandlerEvents(this.handlers[gamepad.index])
        
        this.emit('gamepadconnected', {
            index: gamepad.index,
            handler: this.handlers[gamepad.index]
        })

        return true
    }


    handleGamepadDisconnected (event) {
        const gamepad = event.gamepad
        const handler = this.handlers[gamepad.index]
        
        if (handler) {
            delete this.handlers[gamepad.index]
            
            this.emit('gamepaddisconnected', {
                index: gamepad.index,
                handler
            })
            
            return true
        }
        
        return false
    }


    setupHandlerEvents (handler) {
        const gamepadIndex = handler.index
        
        handler.on('buttonpress', (buttonData) => {
            this.emit('buttonpress', {
                ...buttonData,
                gamepadIndex
            })
        })
        
        handler.on('buttonrelease', (buttonData) => {
            this.emit('buttonrelease', {
                ...buttonData,
                gamepadIndex
            })
        })
        
        handler.on('axischange', (axisData) => {
            this.emit('axischange', {
                ...axisData,
                gamepadIndex
            })
        })
    }


    getHandler (index) {
        return this.handlers[index] || null
    }


    getConnectedGamepads () {
        return Object.keys(this.handlers)
    }


    isGamepadConnected (index) {
        return Boolean(this.handlers[index])
    }

}
