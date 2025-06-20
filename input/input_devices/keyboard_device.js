import InputDevice from '../input_device'
import ButtonControl from '../input_controls/button_control'


export default class KeyboardDevice extends InputDevice {

    constructor (params = {}) {
        super({
            container: params.container || window,
            name: params.name || 'KeyboardDevice'
        })

        this.shouldPreventDefault = params.shouldPreventDefault

        this.keydownListener = this.#handleKeydown.bind(this)
        this.keyupListener = this.#handleKeyup.bind(this)
        this.blurListener = this.#handleBlur.bind(this)
    }


    start () {
        if (!super.start()) {
            return false
        }

        this.container.addEventListener('keydown', this.keydownListener, true)
        this.container.addEventListener('keyup', this.keyupListener, true)
        this.container.addEventListener('blur', this.blurListener)

        return true
    }


    stop () {
        if (!super.stop()) {
            return false
        }

        this.container.removeEventListener('keydown', this.keydownListener, true)
        this.container.removeEventListener('keyup', this.keyupListener, true)
        this.container.removeEventListener('blur', this.blurListener)

        return true
    }


    dispose () {
        this.stop()
        return super.dispose()
    }


    #handleKeydown (event) {
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

