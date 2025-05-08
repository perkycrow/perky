import PerkyModule from '../core/perky_module'


export default class InputObserver extends PerkyModule {

    constructor (container = window) {
        super()
        this.container = container
        this.pressedInputs = {}
        this.mousePosition = {x: 0, y: 0}

        initEvents(this)
    }


    isPressed (code) {
        return this.pressedInputs[code] || false
    }


    arePressed (codes) {
        return codes.every(code => this.isPressed(code))
    }


    getMousePosition () {
        return Object.assign({}, this.mousePosition)
    }

}


function initEvents (observer) {
    const {pressedInputs, mousePosition, container} = observer

    const listeners = {
        keydown (event) {
            pressedInputs[event.code] = true
            observer.emit('keydown', {
                code: event.code,
                key: event.key,
                event: event
            })
        },
        keyup (event) {
            delete pressedInputs[event.code]
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
                event: event
            })
        },
        mousedown (event) {
            pressedInputs[`Mouse${event.button}`] = true
            observer.emit('mousedown', {
                button: event.button,
                x: event.clientX,
                y: event.clientY,
                event: event
            })
        },
        mouseup (event) {
            delete pressedInputs[`Mouse${event.button}`]
            observer.emit('mouseup', {
                button: event.button,
                x: event.clientX,
                y: event.clientY,
                event: event
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

        observer.pressedInputs = {}
        observer.mousePosition = {x: 0, y: 0}
    })

}
