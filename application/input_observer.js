import PerkyModule from '../core/perky_module'


export default class InputObserver extends PerkyModule {

    constructor (container = window) {
        super()
        this.container = container
        this.keyStates = {}
        this.mousePosition = {x: 0, y: 0}
        this.mouseButtons = {}

        initEvents(this)
    }


    getKeyState (code) {
        return this.keyStates[code] || false
    }


    getMousePosition () {
        return {...this.mousePosition}
    }


    getMouseButtonState (button) {
        return this.mouseButtons[button] || false
    }

}


function initEvents (observer) {
    const {keyStates, mousePosition, mouseButtons, container} = observer

    const listeners = {
        keydown (event) {
            keyStates[event.code] = true
            observer.emit('keydown', {
                code: event.code,
                key: event.key,
                event: event
            })
        },
        keyup (event) {
            keyStates[event.code] = false
            observer.emit('keyup', {
                code: event.code,
                key: event.key,
                event: event
            })
        },
        mousemove (event) {
            mousePosition.x = event.clientX
            mousePosition.y = event.clientY
            observer.emit('mousemove', {
                x: event.clientX,
                y: event.clientY,
                position: {x: event.clientX, y: event.clientY},
                event: event
            })
        },
        mousedown (event) {
            mouseButtons[event.button] = true
            observer.emit('mousedown', {
                button: event.button,
                x: event.clientX,
                y: event.clientY,
                position: {x: event.clientX, y: event.clientY},
                event: event
            })
        },
        mouseup (event) {
            mouseButtons[event.button] = false
            observer.emit('mouseup', {
                button: event.button,
                x: event.clientX,
                y: event.clientY,
                position: {x: event.clientX, y: event.clientY}
            })
        }
    }

    for (const key in listeners) {
        container.addEventListener(key, listeners[key])
    }

    observer.on('dispose', () => {
        for (const key in listeners) {
            container.removeEventListener(key, listeners[key])
        }

        observer.keyStates = {}
        observer.mousePosition = {x: 0, y: 0}
        observer.mouseButtons = {}
    })

}
