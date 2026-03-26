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

        const codeControl = this.#pressControl(event.code, event)
        this.preventDefault(event, codeControl)

        const keyAlias = getKeyAlias(event)
        if (keyAlias) {
            this.#pressControl(keyAlias, event)
        }
    }


    #handleKeyup (event) {
        if (shouldIgnoreEvent(event)) {
            return
        }

        const codeControl = this.#releaseControl(event.code, event)
        this.preventDefault(event, codeControl)

        const keyAlias = getKeyAlias(event)
        if (keyAlias) {
            this.#releaseControl(keyAlias, event)
        }
    }


    #pressControl (name, event) {
        const control = this.findOrCreateControl(ButtonControl, {name})
        if (!control.isPressed) {
            control.press(event)
        }
        return control
    }


    #releaseControl (name, event) {
        const control = this.getControl(name)
        if (control?.isPressed) {
            control.release(event)
        }
        return control
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


function getKeyAlias (event) {
    const key = event.key

    if (!key || key === event.code) {
        return null
    }

    if (key.length === 1) {
        return key.toLowerCase()
    }

    return null
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
