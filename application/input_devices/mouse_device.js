import InputDevice from '../input_device'


export default class MouseDevice extends InputDevice {

    static controls = [
        'position',
        'mouseButton'
    ]

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
            device.emit('mousedown', mouseState)
        },
        mouseup (event) {
            const modifiers = getModifiers(event)
            const mouseState = createMouseState(event, device, modifiers)

            delete device.pressedButtons[event.button]
            device.emit('mouseup', mouseState)
        },
        mousemove (event) {
            const modifiers = getModifiers(event)
            const mouseState = updatePositionState(event, device, modifiers)

            device.emit('mousemove', mouseState)
        }
    }

    const {container} = device

    container.addEventListener('mousedown', listeners.mousedown)
    container.addEventListener('mouseup', listeners.mouseup)
    container.addEventListener('mousemove', listeners.mousemove)

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

        delete device.mouseListeners

        return true
    }

    return false
}


function createMouseState (event, device, modifiers = {}) {
    return {
        button: event.button,
        position: {
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
    device.position = {x: event.clientX, y: event.clientY}

    if (deltaTime > 0) {
        device.velocity = {
            x: (device.position.x - device.previousPosition.x) / deltaTime,
            y: (device.position.y - device.previousPosition.y) / deltaTime
        }
    }

    device.timestamp = now

    return {
        position: {...device.position},
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
