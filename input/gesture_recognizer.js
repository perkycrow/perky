import Notifier from '../core/notifier.js'


export default class GestureRecognizer extends Notifier {

    #element
    #pointers = new Map()
    #gestureState = 'idle'
    #longPressTimer = null
    #pinchStartDist = 0
    #pinchStartCenter = {x: 0, y: 0}
    #pinchStartZoom = 1
    #lastTapTime = 0
    #lastTapX = 0
    #lastTapY = 0
    #multiTouchStartTime = 0
    #multiTouchMaxMovement = 0
    #maxPointerCount = 0

    #pointerdownListener
    #pointermoveListener
    #pointerupListener
    #pointercancelListener
    #wheelListener
    #contextmenuListener

    constructor (element, params = {}) {
        super()
        this.#element = element
        this.tapThreshold = params.tapThreshold ?? 10
        this.tapMaxDuration = params.tapMaxDuration ?? 300
        this.longPressDelay = params.longPressDelay ?? 500
        this.pinchThreshold = params.pinchThreshold ?? 10
        this.dragThreshold = params.dragThreshold ?? 5
        this.doubleTapDelay = params.doubleTapDelay ?? 300
        this.multiTouchWindow = params.multiTouchWindow ?? 100
        this.preventDefaultEvents = params.preventDefaultEvents ?? true

        this.#pointerdownListener = this.#handlePointerdown.bind(this)
        this.#pointermoveListener = this.#handlePointermove.bind(this)
        this.#pointerupListener = this.#handlePointerup.bind(this)
        this.#pointercancelListener = this.#handlePointercancel.bind(this)
        this.#wheelListener = this.#handleWheel.bind(this)
        this.#contextmenuListener = this.#handleContextmenu.bind(this)
    }


    get element () {
        return this.#element
    }


    get pointerCount () {
        return this.#pointers.size
    }


    get gestureState () {
        return this.#gestureState
    }


    start () {
        this.#element.addEventListener('pointerdown', this.#pointerdownListener)
        this.#element.addEventListener('pointermove', this.#pointermoveListener)
        this.#element.addEventListener('pointerup', this.#pointerupListener)
        this.#element.addEventListener('pointercancel', this.#pointercancelListener)
        this.#element.addEventListener('wheel', this.#wheelListener, {passive: false})
        this.#element.addEventListener('contextmenu', this.#contextmenuListener)
        this.#element.style.touchAction = 'none'
    }


    stop () {
        this.#element.removeEventListener('pointerdown', this.#pointerdownListener)
        this.#element.removeEventListener('pointermove', this.#pointermoveListener)
        this.#element.removeEventListener('pointerup', this.#pointerupListener)
        this.#element.removeEventListener('pointercancel', this.#pointercancelListener)
        this.#element.removeEventListener('wheel', this.#wheelListener)
        this.#element.removeEventListener('contextmenu', this.#contextmenuListener)
        this.#reset()
    }


    dispose () {
        this.stop()
        this.removeListeners()
    }


    #handlePointerdown (event) {
        if (this.preventDefaultEvents) {
            event.preventDefault()
        }

        this.#element.setPointerCapture(event.pointerId)

        this.#pointers.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
            startX: event.clientX,
            startY: event.clientY,
            startTime: Date.now(),
            button: event.button
        })

        const pointerCount = this.#pointers.size
        this.#maxPointerCount = Math.max(this.#maxPointerCount, pointerCount)

        if (pointerCount >= 2) {
            this.#handleMultiPointer()
            return
        }

        if (event.button === 1 || event.button === 2) {
            this.#startPan(event.clientX, event.clientY)
            return
        }

        this.#gestureState = 'tap-candidate'
        this.#startLongPressTimer(event.clientX, event.clientY)
    }


    #handlePointermove (event) {
        const pointer = this.#pointers.get(event.pointerId)
        if (!pointer) {
            return
        }

        const previousX = pointer.x
        const previousY = pointer.y
        pointer.x = event.clientX
        pointer.y = event.clientY

        if (this.#gestureState === 'pinching' || this.#gestureState === 'multi-touch-candidate') {
            this.#handlePinchMove()
            return
        }

        if (this.#gestureState === 'panning') {
            this.#handlePanMove(event.clientX - previousX, event.clientY - previousY)
            return
        }

        if (this.#gestureState === 'dragging') {
            this.#handleDragMove(pointer)
            return
        }

        if (this.#gestureState === 'tap-candidate') {
            const dx = event.clientX - pointer.startX
            const dy = event.clientY - pointer.startY
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance > this.dragThreshold) {
                this.#cancelLongPress()
                this.#gestureState = 'dragging'
                this.emit('drag:start', {
                    x: pointer.startX,
                    y: pointer.startY,
                    pointerId: event.pointerId
                })
                this.#handleDragMove(pointer)
            }
        }
    }


    #handlePointerup (event) {
        const pointer = this.#pointers.get(event.pointerId)
        if (!pointer) {
            return
        }

        this.#pointers.delete(event.pointerId)

        if (this.#gestureState === 'multi-touch-candidate') {
            this.#handleMultiTouchRelease()
            return
        }

        if (this.#gestureState === 'pinching') {
            this.#handlePinchEnd()
            return
        }

        if (this.#gestureState === 'panning') {
            this.#gestureState = 'idle'
            this.emit('pan:end')
            return
        }

        if (this.#gestureState === 'dragging') {
            this.#gestureState = 'idle'
            this.emit('drag:end', {
                x: pointer.x,
                y: pointer.y,
                startX: pointer.startX,
                startY: pointer.startY
            })
            return
        }

        if (this.#gestureState === 'tap-candidate') {
            this.#cancelLongPress()
            this.#handleTapCandidate(pointer)
        }
    }


    #handlePointercancel (event) {
        const pointer = this.#pointers.get(event.pointerId)
        if (!pointer) {
            return
        }

        this.#pointers.delete(event.pointerId)

        if (this.#gestureState === 'pinching' && this.#pointers.size < 2) {
            this.emit('pinch:end')
        }

        if (this.#pointers.size === 0) {
            this.#reset()
        }
    }


    #handleWheel (event) {
        if (this.preventDefaultEvents) {
            event.preventDefault()
        }

        this.emit('wheel', {
            deltaX: event.deltaX,
            deltaY: event.deltaY,
            x: event.clientX,
            y: event.clientY
        })
    }


    #handleContextmenu (event) {
        if (this.preventDefaultEvents) {
            event.preventDefault()
        }
    }


    #handleMultiPointer () {
        this.#cancelLongPress()

        const wasActive = this.#gestureState === 'dragging' || this.#gestureState === 'panning'

        if (this.#gestureState === 'dragging') {
            this.emit('drag:end', this.#getDragEndData())
        }

        if (this.#gestureState === 'panning') {
            this.emit('pan:end')
        }

        if (this.#gestureState === 'multi-touch-candidate' || this.#gestureState === 'pinching') {
            this.#initPinchData()
            return
        }

        this.#initPinchData()

        const pointers = [...this.#pointers.values()]
        const allRecent = !wasActive && pointers.every(
            p => Date.now() - p.startTime < this.multiTouchWindow * 2
        )

        if (allRecent) {
            this.#gestureState = 'multi-touch-candidate'
            this.#multiTouchStartTime = Math.min(...pointers.map(p => p.startTime))
            this.#multiTouchMaxMovement = 0
        } else {
            this.#startPinchGesture()
        }
    }


    #startPinchGesture () {
        this.#gestureState = 'pinching'
        const center = this.#pinchStartCenter
        this.emit('pinch:start', {
            centerX: center.x,
            centerY: center.y,
            distance: this.#pinchStartDist
        })
    }


    #startPan (x, y) {
        this.#gestureState = 'panning'
        this.emit('pan:start', {x, y})
    }


    #initPinchData () {
        const pointers = [...this.#pointers.values()]
        if (pointers.length < 2) {
            return
        }

        this.#pinchStartDist = pointerDistance(pointers[0], pointers[1])
        this.#pinchStartCenter = pointerCenter(pointers[0], pointers[1])
        this.#pinchStartZoom = 1
    }


    #handlePinchMove () {
        const pointers = [...this.#pointers.values()]
        if (pointers.length < 2) {
            return
        }

        const currentDist = pointerDistance(pointers[0], pointers[1])
        const currentCenter = pointerCenter(pointers[0], pointers[1])

        const scale = this.#pinchStartDist > 0
            ? currentDist / this.#pinchStartDist
            : 1

        const dx = currentCenter.x - this.#pinchStartCenter.x
        const dy = currentCenter.y - this.#pinchStartCenter.y

        if (this.#gestureState === 'multi-touch-candidate') {
            const maxPointerMovement = pointers.reduce((max, p) => {
                const pmx = Math.abs(p.x - p.startX)
                const pmy = Math.abs(p.y - p.startY)
                return Math.max(max, pmx, pmy)
            }, 0)
            this.#multiTouchMaxMovement = Math.max(this.#multiTouchMaxMovement, maxPointerMovement)

            if (maxPointerMovement > this.tapThreshold) {
                this.#gestureState = 'pinching'
                this.emit('pinch:start', {
                    centerX: currentCenter.x,
                    centerY: currentCenter.y,
                    distance: currentDist
                })
            }
            return
        }

        this.emit('pinch:move', {
            centerX: currentCenter.x,
            centerY: currentCenter.y,
            distance: currentDist,
            scale,
            dx,
            dy
        })

        this.#pinchStartCenter = currentCenter
    }


    #handlePinchEnd () {
        if (this.#pointers.size < 2) {
            this.#gestureState = 'idle'
            this.emit('pinch:end')
        }
    }


    #handlePanMove (dx, dy) {
        this.emit('pan:move', {dx, dy})
    }


    #handleDragMove (pointer) {
        this.emit('drag:move', {
            x: pointer.x,
            y: pointer.y,
            dx: pointer.x - pointer.startX,
            dy: pointer.y - pointer.startY,
            startX: pointer.startX,
            startY: pointer.startY
        })
    }


    #handleTapCandidate (pointer) {
        const duration = Date.now() - pointer.startTime
        const dx = Math.abs(pointer.x - pointer.startX)
        const dy = Math.abs(pointer.y - pointer.startY)
        const distance = Math.max(dx, dy)

        this.#gestureState = 'idle'

        if (duration > this.longPressDelay && distance <= this.tapThreshold) {
            this.emit('longpress', {x: pointer.x, y: pointer.y})
            return
        }

        if (duration <= this.tapMaxDuration && distance <= this.tapThreshold) {
            this.#emitTap(pointer.x, pointer.y, 1)
        }
    }


    #handleMultiTouchRelease () {
        if (this.#pointers.size > 0) {
            return
        }

        const duration = Date.now() - this.#multiTouchStartTime
        const pointerCount = this.#maxPointerCount

        this.#gestureState = 'idle'

        if (duration <= this.tapMaxDuration && this.#multiTouchMaxMovement <= this.tapThreshold) {
            this.emit('tap', {x: 0, y: 0, pointerCount})
            return
        }

        this.emit('pinch:end')
    }


    #emitTap (x, y, pointerCount) {
        const now = Date.now()
        const timeSinceLastTap = now - this.#lastTapTime
        const distFromLastTap = Math.max(
            Math.abs(x - this.#lastTapX),
            Math.abs(y - this.#lastTapY)
        )

        if (pointerCount === 1 && timeSinceLastTap <= this.doubleTapDelay && distFromLastTap <= this.tapThreshold) {
            this.#lastTapTime = 0
            this.emit('doubletap', {x, y})
            return
        }

        this.#lastTapTime = now
        this.#lastTapX = x
        this.#lastTapY = y
        this.emit('tap', {x, y, pointerCount})
    }


    #startLongPressTimer (x, y) {
        this.#cancelLongPress()
        this.#longPressTimer = setTimeout(() => {
            if (this.#gestureState === 'tap-candidate') {
                this.emit('longpress', {x, y})
                this.#gestureState = 'idle'
            }
        }, this.longPressDelay)
    }


    #cancelLongPress () {
        if (this.#longPressTimer !== null) {
            clearTimeout(this.#longPressTimer)
            this.#longPressTimer = null
        }
    }


    #getDragEndData () {
        const firstPointer = this.#pointers.values().next().value
        if (!firstPointer) {
            return {x: 0, y: 0, startX: 0, startY: 0}
        }
        return {
            x: firstPointer.x,
            y: firstPointer.y,
            startX: firstPointer.startX,
            startY: firstPointer.startY
        }
    }


    #reset () {
        this.#cancelLongPress()
        this.#gestureState = 'idle'
        this.#pointers.clear()
        this.#pinchStartDist = 0
        this.#pinchStartCenter = {x: 0, y: 0}
        this.#multiTouchMaxMovement = 0
        this.#maxPointerCount = 0
    }

}


function pointerDistance (a, b) {
    const dx = a.x - b.x
    const dy = a.y - b.y
    return Math.sqrt(dx * dx + dy * dy)
}


function pointerCenter (a, b) {
    return {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2
    }
}
