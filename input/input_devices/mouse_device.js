import InputDevice from '../input_device'
import ButtonControl from '../input_controls/button_control'
import Vec2Control from '../input_controls/vec2_control'


export default class MouseDevice extends InputDevice {

    constructor (params = {}) {
        super({
            container: params.container || window,
            name: params.name || 'MouseDevice'
        })

        this.shouldPreventDefault = params.shouldPreventDefault

        this.#createControls()

        this.mousedownListener = this.#handleMousedown.bind(this)
        this.mouseupListener = this.#handleMouseup.bind(this)
        this.mousemoveListener = this.#handleMousemove.bind(this)
        this.contextmenuListener = this.#handleContextmenu.bind(this)
    }


    start () {
        if (!super.start()) {
            return false
        }

        this.container.addEventListener('mousedown', this.mousedownListener)
        this.container.addEventListener('mouseup', this.mouseupListener)
        this.container.addEventListener('mousemove', this.mousemoveListener)
        this.container.addEventListener('contextmenu', this.contextmenuListener)

        return true
    }


    stop () {
        if (!super.stop()) {
            return false
        }

        this.container.removeEventListener('mousedown', this.mousedownListener)
        this.container.removeEventListener('mouseup', this.mouseupListener)
        this.container.removeEventListener('mousemove', this.mousemoveListener)
        this.container.removeEventListener('contextmenu', this.contextmenuListener)

        return true
    }


    dispose () {
        this.stop()
        return super.dispose()
    }


    #createControls () {
        this.registerControl(new ButtonControl({
            device: this,
            name: 'leftButton'
        }))

        this.registerControl(new ButtonControl({
            device: this,
            name: 'rightButton'
        }))

        this.registerControl(new ButtonControl({
            device: this,
            name: 'middleButton'
        }))

        this.registerControl(new ButtonControl({
            device: this,
            name: 'backButton'
        }))

        this.registerControl(new ButtonControl({
            device: this,
            name: 'forwardButton'
        }))

        this.registerControl(new Vec2Control({
            device: this,
            name: 'position'
        }))
    }


    #handleMousedown (event) {
        const buttonName = getButtonName(event.button)
        const control = this.getControl(buttonName)

        this.preventDefault(event, control)

        if (control && !control.isPressed) {
            control.press(event)
        }
    }


    #handleMouseup (event) {
        const buttonName = getButtonName(event.button)
        const control = this.getControl(buttonName)

        this.preventDefault(event, control)

        if (control && control.isPressed) {
            control.release(event)
        }
    }


    #handleMousemove (event) {
        const positionControl = this.getControl('position')
        positionControl.setValue({
            x: event.clientX,
            y: event.clientY
        }, event)
    }


    #handleContextmenu (event) {
        const rightButtonControl = this.getControl('rightButton')
        
        this.preventDefault(event, rightButtonControl)
    }


}


const BUTTON_NAMES = {
    0: 'leftButton',
    1: 'middleButton',
    2: 'rightButton',
    3: 'backButton',
    4: 'forwardButton'
}

function getButtonName (button) {
    return BUTTON_NAMES[button] || `button${button}`
}
