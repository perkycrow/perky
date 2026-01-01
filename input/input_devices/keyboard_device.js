import InputDevice from '../input_device.js'
import ButtonControl from '../input_controls/button_control.js'


export default class KeyboardDevice extends InputDevice {

    static $name = 'keyboard'

    #keydownListener
    #keyupListener
    #blurListener

    constructor (params = {}) {
        super(params)

        this.shouldPreventDefault = params.shouldPreventDefault

        this.#keydownListener = this.#handleKeydown.bind(this)
        this.#keyupListener = this.#handleKeyup.bind(this)
        this.#blurListener = this.#handleBlur.bind(this)
    }


    onStart () {
        this.container.addEventListener('keydown', this.#keydownListener, true)
        this.container.addEventListener('keyup', this.#keyupListener, true)
        this.container.addEventListener('blur', this.#blurListener)
    }


    onStop () {
        this.container.removeEventListener('keydown', this.#keydownListener, true)
        this.container.removeEventListener('keyup', this.#keyupListener, true)
        this.container.removeEventListener('blur', this.#blurListener)
    }


    #handleKeydown (event) {
        if (shouldIgnoreEvent(event)) {
            return
        }

        const keyName = getKeyName(event)
        const control = this.findOrCreateControl(ButtonControl, {
            name: keyName
        })

        this.preventDefault(event, control)

        if (!control.isPressed) {
            control.press(event)
        }
    }


    #handleKeyup (event) {
        if (shouldIgnoreEvent(event)) {
            return
        }

        const keyName = getKeyName(event)
        const control = this.getControl(keyName)

        this.preventDefault(event, control)

        if (control && control.isPressed) {
            control.release(event)
        }
    }


    #handleBlur () {
        this.pressedNames.forEach(keyName => {
            const control = this.getControl(keyName)
            if (control && control.isPressed) {
                control.release()
            }
        })
    }


}


function getKeyName (event) {
    return event.code
}


function shouldIgnoreEvent (event) {
    const path = event.composedPath()
    for (const element of path) {
        if (element.tagName) {
            const tagName = element.tagName.toLowerCase()
            if (tagName === 'input' || tagName === 'textarea') {
                return true
            }
            if (element.isContentEditable) {
                return true
            }
        }
    }
    return false
}

