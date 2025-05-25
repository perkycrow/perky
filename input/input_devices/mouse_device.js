import InputDevice from '../input_device'
import KeyControl from '../input_controls/key_control'
import Vec2Control from '../input_controls/vec2_control'


export default class MouseDevice extends InputDevice {

    static methods = [
        'isMouseButtonPressed',
        'getMousePosition',
        'getMousePressedButtons',
        'getMouseVelocity'
    ]

    static events = [
        'mousedown',
        'mouseup',
        'mousemove'
    ]


    constructor (params = {}) {
        super(params)

        this.pressedButtons = {}
        this.position = {x: 0, y: 0}
        this.previousPosition = {x: 0, y: 0}
        this.velocity = {x: 0, y: 0}
        this.timestamp = 0
    }


    createControls () {
        this.addControl('leftButton', new KeyControl({
            device: this,
            name: 'leftButton',
            displayName: 'Left Click'
        }))

        this.addControl('rightButton', new KeyControl({
            device: this,
            name: 'rightButton',
            displayName: 'Right Click'
        }))

        this.addControl('middleButton', new KeyControl({
            device: this,
            name: 'middleButton',
            displayName: 'Middle Click'
        }))

        this.addControl('position', new Vec2Control({
            device: this,
            name: 'position',
            displayName: 'Mouse Position',
            normalize: false
        }))

        this.addControl('velocity', new Vec2Control({
            device: this,
            name: 'velocity',
            displayName: 'Mouse Velocity',
            normalize: false
        }))
    }


    observe () {
        return observe(this)
    }


    unobserve () {
        return unobserve(this)
    }


    isPressed (button) {
        return this.isMouseButtonPressed(button)
    }

    
    isMouseButtonPressed (button) {
        return button in this.pressedButtons
    }


    getMousePosition () {
        return {...this.position}
    }


    getMousePressedButtons () {
        return Object.keys(this.pressedButtons)
    }


    getMouseVelocity () {
        return {...this.velocity}
    }

}


function observe (device) {

    if (device.mouseListeners) {
        return false
    }

    const listeners = {
        mousedown (event) {
            const modifiers = getModifiers(event)
            const mouseState = createMouseState(event, device, modifiers)

            device.pressedButtons[event.button] = mouseState

            const buttonControl = getButtonControl(device, event.button)
            if (buttonControl) {
                buttonControl.press()
            }

            device.emit('mousedown', mouseState)
        },
        mouseup (event) {
            const modifiers = getModifiers(event)
            const mouseState = createMouseState(event, device, modifiers)

            delete device.pressedButtons[event.button]

            const buttonControl = getButtonControl(device, event.button)
            if (buttonControl) {
                buttonControl.release()
            }

            device.emit('mouseup', mouseState)
        },
        mousemove (event) {
            const modifiers = getModifiers(event)
            const mouseState = updatePositionState(event, device, modifiers)

            const positionControl = device.getControl('position')
            const velocityControl = device.getControl('velocity')

            if (positionControl) {
                positionControl.setValue({x: event.offsetX, y: event.offsetY})
            }

            if (velocityControl) {
                velocityControl.setValue(device.velocity)
            }

            device.emit('mousemove', mouseState)
        },
        contextmenu (event) {
            if (2 in device.pressedButtons) {
                const modifiers = getModifiers(event)
                const mouseState = createMouseState(event, device, modifiers)
                mouseState.button = 2
                
                delete device.pressedButtons[2]

                const buttonControl = getButtonControl(device, 2)
                if (buttonControl) {
                    buttonControl.release()
                }

                device.emit('mouseup', mouseState)
            }
        },
        blur () {
            for (const button in device.pressedButtons) {
                delete device.pressedButtons[button]
            }

            // Relâcher tous les boutons
            for (const control of device.getAllControls()) {
                if (control.release) {
                    control.release()
                }
            }

            device.emit('blur')
        }
    }

    const {container} = device

    container.addEventListener('mousedown', listeners.mousedown)
    container.addEventListener('mouseup', listeners.mouseup)
    container.addEventListener('mousemove', listeners.mousemove)
    container.addEventListener('contextmenu', listeners.contextmenu)
    window.addEventListener('blur', listeners.blur)

    device.mouseListeners = listeners

    return true
}


function unobserve (device) {
    const listeners = device.mouseListeners

    if (listeners) {
        const {container} = device

        container.removeEventListener('mousedown', listeners.mousedown)
        container.removeEventListener('mouseup', listeners.mouseup)
        container.removeEventListener('mousemove', listeners.mousemove)
        container.removeEventListener('contextmenu', listeners.contextmenu)
        window.removeEventListener('blur', listeners.blur)

        delete device.mouseListeners

        return true
    }

    return false
}


function createMouseState (event, device, modifiers = {}) {
    return {
        button: event.button,
        position: {
            x: event.offsetX,
            y: event.offsetY
        },
        client: {
            x: event.clientX,
            y: event.clientY
        },
        offset: {
            x: event.offsetX,
            y: event.offsetY
        },
        page: {
            x: event.pageX,
            y: event.pageY
        },
        screen: {
            x: event.screenX,
            y: event.screenY
        },
        previousPosition: {...device.position},
        velocity: {...device.velocity},
        timestamp: event.timeStamp,
        modifiers: modifiers
    }
}


function updatePositionState (event, device, modifiers = {}) {
    const now = event.timeStamp
    const deltaTime = now - device.timestamp

    device.previousPosition = {...device.position}
    device.position = {x: event.offsetX, y: event.offsetY}

    if (deltaTime > 0) {
        device.velocity = {
            x: (device.position.x - device.previousPosition.x) / deltaTime,
            y: (device.position.y - device.previousPosition.y) / deltaTime
        }
    }

    device.timestamp = now

    return {
        position: {...device.position},
        client: {
            x: event.clientX,
            y: event.clientY
        },
        offset: {
            x: event.offsetX,
            y: event.offsetY
        },
        page: {
            x: event.pageX,
            y: event.pageY
        },
        screen: {
            x: event.screenX,
            y: event.screenY
        },
        previousPosition: {...device.previousPosition},
        velocity: {...device.velocity},
        timestamp: now,
        modifiers: modifiers
    }
}


function getButtonControl (device, buttonIndex) {
    const buttonNames = {
        0: 'leftButton',
        1: 'middleButton',
        2: 'rightButton'
    }
    return device.getControl(buttonNames[buttonIndex])
}


const MODIFIERS = [
    'Alt',
    'Control',
    'Meta',
    'Shift',
    'CapsLock',
    'NumLock',
    'AltGraph'
]


function getModifiers (event) {
    const modifiers = {}

    for (const key of MODIFIERS) {
        const modifier = event.getModifierState(key)
        if (modifier) {
            modifiers[key] = true
        }
    }

    return modifiers
}
