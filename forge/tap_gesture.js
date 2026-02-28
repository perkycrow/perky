export default class TapGesture {

    #element = null
    #onTap = null
    #moveThreshold = 10
    #timeThreshold = 300
    #pointers = new Map()
    #maxFingers = 0
    #startTime = 0
    #cancelled = false
    #onPointerDown = null
    #onPointerMove = null
    #onPointerUp = null

    constructor (element, {onTap, moveThreshold = 10, timeThreshold = 300}) {
        this.#element = element
        this.#onTap = onTap
        this.#moveThreshold = moveThreshold
        this.#timeThreshold = timeThreshold

        this.#onPointerDown = (e) => this.#handlePointerDown(e)
        this.#onPointerMove = (e) => this.#handlePointerMove(e)
        this.#onPointerUp = (e) => this.#handlePointerUp(e)
    }


    attach () {
        this.#element.addEventListener('pointerdown', this.#onPointerDown)
        this.#element.addEventListener('pointermove', this.#onPointerMove)
        this.#element.addEventListener('pointerup', this.#onPointerUp)
        this.#element.addEventListener('pointercancel', this.#onPointerUp)
    }


    detach () {
        this.#element.removeEventListener('pointerdown', this.#onPointerDown)
        this.#element.removeEventListener('pointermove', this.#onPointerMove)
        this.#element.removeEventListener('pointerup', this.#onPointerUp)
        this.#element.removeEventListener('pointercancel', this.#onPointerUp)
    }


    #handlePointerDown (e) {
        if (this.#pointers.size === 0) {
            this.#startTime = Date.now()
            this.#maxFingers = 0
            this.#cancelled = false
        }

        this.#pointers.set(e.pointerId, {x: e.clientX, y: e.clientY})
        this.#maxFingers = Math.max(this.#maxFingers, this.#pointers.size)
    }


    #handlePointerMove (e) {
        const start = this.#pointers.get(e.pointerId)
        if (!start) {
            return
        }

        const dx = e.clientX - start.x
        const dy = e.clientY - start.y

        if (dx * dx + dy * dy > this.#moveThreshold * this.#moveThreshold) {
            this.#cancelled = true
        }
    }


    #handlePointerUp (e) {
        this.#pointers.delete(e.pointerId)

        if (this.#pointers.size > 0) {
            return
        }

        if (this.#cancelled || this.#maxFingers < 2) {
            return
        }

        if (Date.now() - this.#startTime > this.#timeThreshold) {
            return
        }

        this.#onTap(this.#maxFingers)
    }

}
