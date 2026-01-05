import InputDevice from '../input_device.js'
import ButtonControl from '../input_controls/button_control.js'
import Vec2Control from '../input_controls/vec2_control.js'


export default class TouchDevice extends InputDevice {

    static $name = 'touch'

    #touchstartListener
    #touchmoveListener
    #touchendListener
    #touchcancelListener

    #activeTouch = null
    #startX = 0
    #startY = 0
    #currentY = 0
    #touchStartTime = 0
    #swipeReferenceY = 0

    constructor (params = {}) {
        super(params)

        this.swipeThreshold = params.swipeThreshold ?? 30
        this.tapThreshold = params.tapThreshold ?? 20
        this.tapMaxDuration = params.tapMaxDuration ?? 300
        this.shouldPreventDefault = params.shouldPreventDefault

        this.#createControls()

        this.#touchstartListener = this.#handleTouchstart.bind(this)
        this.#touchmoveListener = this.#handleTouchmove.bind(this)
        this.#touchendListener = this.#handleTouchend.bind(this)
        this.#touchcancelListener = this.#handleTouchcancel.bind(this)
    }


    onStart () {
        this.container.addEventListener('touchstart', this.#touchstartListener, {passive: false})
        this.container.addEventListener('touchmove', this.#touchmoveListener, {passive: false})
        this.container.addEventListener('touchend', this.#touchendListener)
        this.container.addEventListener('touchcancel', this.#touchcancelListener)
    }


    onStop () {
        this.container.removeEventListener('touchstart', this.#touchstartListener)
        this.container.removeEventListener('touchmove', this.#touchmoveListener)
        this.container.removeEventListener('touchend', this.#touchendListener)
        this.container.removeEventListener('touchcancel', this.#touchcancelListener)
    }


    #createControls () {
        this.registerControl(new ButtonControl({
            device: this,
            name: 'swipeUp'
        }))

        this.registerControl(new ButtonControl({
            device: this,
            name: 'swipeDown'
        }))

        this.registerControl(new Vec2Control({
            device: this,
            name: 'position'
        }))

        this.registerControl(new Vec2Control({
            device: this,
            name: 'delta'
        }))

        this.registerControl(new ButtonControl({
            device: this,
            name: 'tap'
        }))
    }


    #handleTouchstart (event) {
        if (this.#activeTouch !== null) {
            return
        }

        const touch = event.touches[0]
        this.#activeTouch = touch.identifier
        this.#startX = touch.clientX
        this.#startY = touch.clientY
        this.#currentY = touch.clientY
        this.#swipeReferenceY = touch.clientY
        this.#touchStartTime = Date.now()

        const positionControl = this.getControl('position')
        positionControl.setValue({
            x: touch.clientX,
            y: touch.clientY
        }, event)

        this.preventDefault(event, positionControl)
    }


    #handleTouchmove (event) {
        const touch = this.#findActiveTouch(event.touches)
        if (!touch) {
            return
        }

        const previousY = this.#currentY
        this.#currentY = touch.clientY

        const positionControl = this.getControl('position')
        positionControl.setValue({
            x: touch.clientX,
            y: touch.clientY
        }, event)

        const deltaControl = this.getControl('delta')
        deltaControl.setValue({
            x: 0,
            y: this.#currentY - previousY
        }, event)

        const deltaY = this.#swipeReferenceY - this.#currentY
        const swipeUpControl = this.getControl('swipeUp')
        const swipeDownControl = this.getControl('swipeDown')

        if (deltaY > this.swipeThreshold) {
            if (!swipeUpControl.isPressed) {
                swipeUpControl.press(event)
            }
            if (swipeDownControl.isPressed) {
                swipeDownControl.release(event)
                this.#swipeReferenceY = this.#currentY
            }
        } else if (deltaY < -this.swipeThreshold) {
            if (!swipeDownControl.isPressed) {
                swipeDownControl.press(event)
            }
            if (swipeUpControl.isPressed) {
                swipeUpControl.release(event)
                this.#swipeReferenceY = this.#currentY
            }
        }

        this.preventDefault(event, positionControl)
    }


    #handleTouchend (event) {
        if (!this.#isTouchActive(event.changedTouches)) {
            return
        }

        const touch = this.#findChangedTouch(event.changedTouches)
        if (touch) {
            this.#detectTap(touch, event)
        }

        this.#releaseAllSwipes(event)
        this.#activeTouch = null
    }


    #detectTap (touch, event) {
        const duration = Date.now() - this.#touchStartTime
        const deltaX = Math.abs(touch.clientX - this.#startX)
        const deltaY = Math.abs(touch.clientY - this.#startY)
        const distance = Math.max(deltaX, deltaY)

        if (duration <= this.tapMaxDuration && distance <= this.tapThreshold) {
            const tapControl = this.getControl('tap')
            tapControl.press(event)
            tapControl.release(event)
        }
    }


    #findChangedTouch (changedTouches) {
        for (let i = 0; i < changedTouches.length; i++) {
            if (changedTouches[i].identifier === this.#activeTouch) {
                return changedTouches[i]
            }
        }
        return null
    }


    #handleTouchcancel (event) {
        if (!this.#isTouchActive(event.changedTouches)) {
            return
        }

        this.#releaseAllSwipes(event)
        this.#activeTouch = null
    }


    #releaseAllSwipes (event) {
        const swipeUpControl = this.getControl('swipeUp')
        const swipeDownControl = this.getControl('swipeDown')

        if (swipeUpControl.isPressed) {
            swipeUpControl.release(event)
        }
        if (swipeDownControl.isPressed) {
            swipeDownControl.release(event)
        }
    }


    #findActiveTouch (touches) {
        for (let i = 0; i < touches.length; i++) {
            if (touches[i].identifier === this.#activeTouch) {
                return touches[i]
            }
        }
        return null
    }


    #isTouchActive (changedTouches) {
        for (let i = 0; i < changedTouches.length; i++) {
            if (changedTouches[i].identifier === this.#activeTouch) {
                return true
            }
        }
        return false
    }

}
