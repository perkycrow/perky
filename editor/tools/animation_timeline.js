import EditorComponent from '../editor_component.js'
import '../number_input.js'
import {createElement} from '../../application/dom_utils.js'


export default class AnimationTimeline extends EditorComponent {

    static styles = `
    :host {
        display: block;
        height: fit-content;
    }

    :host(.dragging) {
        user-select: none;
    }

    .timeline-wrapper {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
    }

    .timeline-viewport {
        overflow: hidden;
        flex-shrink: 0;
    }

    .timeline {
        display: flex;
        gap: var(--spacing-sm);
        padding: 0;
        position: relative;
        width: fit-content;
        min-width: 100%;
        will-change: transform;
    }

    .scrubber {
        position: relative;
        height: 28px;
        background: var(--bg-tertiary);
        border-radius: var(--radius-lg);
        cursor: pointer;
        touch-action: none;
        flex-shrink: 0;
    }

    .scrubber.hidden {
        display: none !important;
    }

    .scrubber-thumb {
        position: absolute;
        top: 3px;
        bottom: 3px;
        min-width: 48px;
        background: var(--bg-hover);
        border-radius: var(--radius-md);
        cursor: grab;
        transition: background 0.2s ease;
    }

    .scrubber-thumb:hover,
    .scrubber.dragging .scrubber-thumb {
        background: var(--accent);
    }

    .scrubber.dragging .scrubber-thumb {
        cursor: grabbing;
    }

    .frame {
        position: relative;
        padding: var(--spacing-xs);
        background: var(--bg-tertiary);
        border-radius: var(--radius-md);
        flex-shrink: 0;
        cursor: grab;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
    }

    .frame:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .frame:active {
        cursor: grabbing;
        transform: scale(0.98);
    }

    .frame.current {
        background: var(--bg-selected);
    }

    .frame.selected {
        outline: 2px solid var(--fg-primary);
        outline-offset: -2px;
    }

    .frame.dragging {
        opacity: 0;
        pointer-events: none;
    }

    .frame.drag-placeholder {
        opacity: 0.3 !important;
        outline: 2px dashed var(--accent);
        outline-offset: -2px;
    }

    .timeline.gap-active .frame {
        transition: transform 0.15s ease-out;
    }

    .frame.just-added {
        animation: frame-added 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes frame-added {
        0% {
            transform: scale(0.5);
            opacity: 0;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }

    .frame.just-settled {
        animation: frame-settle 0.4s ease-out;
    }

    @keyframes frame-settle {
        0% {
            transform: scale(1.05);
            box-shadow: 0 0 0 2px var(--accent), 0 0 12px rgba(99, 102, 241, 0.4);
        }
        100% {
            transform: scale(1);
            box-shadow: none;
        }
    }

    .frame.pushed-right {
        animation: pushed-right 0.3s ease-out;
    }

    @keyframes pushed-right {
        0% {
            transform: translateX(-16px);
        }
        100% {
            transform: translateX(0);
        }
    }

    .frame-thumbnail-wrapper {
        position: relative;
        border-radius: var(--radius-sm);
        overflow: hidden;
    }

    .frame-thumbnail {
        display: block;
        background: var(--bg-secondary);
    }

    .frame-index {
        position: absolute;
        top: 4px;
        left: 4px;
        font-size: 10px;
        font-weight: 500;
        color: var(--fg-muted);
        line-height: 1;
    }

    .frame-duration-badge {
        position: absolute;
        bottom: 4px;
        right: 4px;
        font-size: 10px;
        font-weight: 500;
        color: var(--fg-muted);
        line-height: 1;
    }

    .frame-event-badge {
        position: absolute;
        top: 6px;
        left: 18px;
        width: 5px;
        height: 5px;
        background: var(--status-warning, #ffc107);
        border-radius: 50%;
        cursor: help;
    }

    .add-frame-btn {
        appearance: none;
        background: var(--bg-tertiary);
        border: 2px dashed var(--border);
        border-radius: var(--radius-md);
        color: var(--fg-muted);
        font-size: 24px;
        font-weight: 300;
        width: 100px;
        height: 100px;
        margin: var(--spacing-xs);
        cursor: pointer;
        transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast), transform 0.1s;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .add-frame-btn:hover {
        background: var(--bg-hover);
        border-color: var(--accent);
        color: var(--accent);
    }

    .add-frame-btn:active {
        transform: scale(0.95);
    }

    .hidden {
        display: none !important;
    }
    `

    #wrapperEl = null
    #viewportEl = null
    #containerEl = null
    #scrubberEl = null
    #scrubberThumbEl = null
    #frames = []
    #currentIndex = 0
    #selectedIndex = -1
    #dropIndex = -1


    #scrollLeft = 0
    #maxScroll = 0


    #scrubberDragging = false
    #scrubberStartX = 0
    #scrubberStartScroll = 0


    #internalDragActive = false
    #internalDragIndex = -1
    #internalDragGhost = null
    #internalDragStartX = 0
    #internalDragStartY = 0
    #isDragOutside = false
    #dragFrameStep = 0

    onConnected () {
        this.#buildDOM()
        this.tabIndex = 0
        this.addEventListener('keydown', (e) => this.#handleKeydown(e))
        this.#setupInternalDrag()
        if (this.#frames.length > 0) {
            this.#render()
        }
    }


    onDisconnected () {
        this.#cleanupScrubberEvents()
        this.#cleanupInternalDrag()
    }


    #buildDOM () {
        this.#wrapperEl = createElement('div', {class: 'timeline-wrapper'})

        this.#viewportEl = createElement('div', {class: 'timeline-viewport'})

        this.#containerEl = createElement('div', {class: 'timeline'})

        this.#scrubberEl = createElement('div', {class: 'scrubber hidden'})

        this.#scrubberThumbEl = createElement('div', {class: 'scrubber-thumb'})
        this.#scrubberEl.appendChild(this.#scrubberThumbEl)

        this.#setupScrubber()
        this.#setupDeselect()

        this.#viewportEl.appendChild(this.#containerEl)
        this.#wrapperEl.appendChild(this.#scrubberEl)
        this.#wrapperEl.appendChild(this.#viewportEl)
        this.shadowRoot.appendChild(this.#wrapperEl)
    }


    #setupScrubber () {
        this.#scrubberEl.addEventListener('pointerdown', (e) => this.#onScrubberStart(e))
        this.#boundScrubberMove = (e) => this.#onScrubberMove(e)
        this.#boundScrubberUp = () => this.#onScrubberEnd()
        document.addEventListener('pointermove', this.#boundScrubberMove)
        document.addEventListener('pointerup', this.#boundScrubberUp)
        document.addEventListener('pointercancel', this.#boundScrubberUp)


        this.#scrubberEl.addEventListener('click', (e) => this.#onScrubberClick(e))
    }

    #boundScrubberMove = null
    #boundScrubberUp = null

    #cleanupScrubberEvents () {
        if (this.#boundScrubberMove) {
            document.removeEventListener('pointermove', this.#boundScrubberMove)
        }
        if (this.#boundScrubberUp) {
            document.removeEventListener('pointerup', this.#boundScrubberUp)
            document.removeEventListener('pointercancel', this.#boundScrubberUp)
        }
    }

    #boundPointerMove = null
    #boundPointerUp = null

    #setupInternalDrag () {
        this.#boundPointerMove = (e) => this.#onInternalDragMove(e)
        this.#boundPointerUp = (e) => this.#onInternalDragEnd(e)
        document.addEventListener('pointermove', this.#boundPointerMove)
        document.addEventListener('pointerup', this.#boundPointerUp)
        document.addEventListener('pointercancel', this.#boundPointerUp)
    }


    #cleanupInternalDrag () {
        if (this.#boundPointerMove) {
            document.removeEventListener('pointermove', this.#boundPointerMove)
        }
        if (this.#boundPointerUp) {
            document.removeEventListener('pointerup', this.#boundPointerUp)
            document.removeEventListener('pointercancel', this.#boundPointerUp)
        }
        this.#removeInternalDragGhost()
    }


    #onInternalDragStart (e, index) {
        if (e.button !== 0) {
            return
        }
        if (isInteractiveElement(e.target, e.currentTarget)) {
            return
        }

        this.#internalDragIndex = index
        this.#internalDragStartX = e.clientX
        this.#internalDragStartY = e.clientY
        this.#internalDragActive = false
    }


    #onInternalDragMove (e) {
        if (this.#internalDragIndex < 0) {
            return
        }

        const dx = e.clientX - this.#internalDragStartX
        const dy = e.clientY - this.#internalDragStartY
        const distance = Math.sqrt(dx * dx + dy * dy)


        if (!this.#internalDragActive && distance > 10) {
            this.#internalDragActive = true

            const frameEls = this.#containerEl.querySelectorAll('.frame')
            if (frameEls.length > 1) {
                this.#dragFrameStep = frameEls[1].getBoundingClientRect().left - frameEls[0].getBoundingClientRect().left
            } else if (frameEls.length > 0) {
                this.#dragFrameStep = frameEls[0].offsetWidth
            }

            this.#createInternalDragGhost(e.clientX, e.clientY)
            this.#markFrameDragging(this.#internalDragIndex, true)
            this.classList.add('dragging')
            this.#containerEl.classList.add('gap-active')
        }

        if (this.#internalDragActive) {
            e.preventDefault()
            this.#updateInternalDragGhost(e.clientX, e.clientY)

            const isOutside = this.#isPointerOutsideTimeline(e.clientX, e.clientY)

            if (isOutside !== this.#isDragOutside) {
                this.#isDragOutside = isOutside
                this.#updateDragGhostState(isOutside)
            }

            if (isOutside) {
                this.#containerEl.classList.remove('drag-over')
                this.#clearFrameGaps()
            } else {
                this.#containerEl.classList.add('drag-over')
                this.#dropIndex = this.#calculateDropIndex(e.clientX)
                this.#updateFrameGaps()
            }
        }
    }


    #isPointerOutsideTimeline (clientX, clientY) {
        const rect = this.#viewportEl.getBoundingClientRect()
        const margin = 20
        return (
            clientY < rect.top - margin ||
            clientY > rect.bottom + margin ||
            clientX < rect.left - margin ||
            clientX > rect.right + margin
        )
    }


    #updateDragGhostState (isOutside) {
        if (!this.#internalDragGhost) {
            return
        }

        const canvas = this.#internalDragGhost.querySelector('canvas')
        let deleteHint = this.#internalDragGhost.querySelector('.delete-hint')

        if (isOutside) {
            if (canvas) {
                canvas.style.filter = 'grayscale(1) brightness(0.7)'
                canvas.style.boxShadow = '0 4px 12px rgba(255,59,48,0.5)'
            }
            if (!deleteHint) {
                deleteHint = createElement('div', {
                    class: 'delete-hint',
                    text: 'Release to delete',
                    style: `
                        position: absolute;
                        top: 100%;
                        left: 50%;
                        transform: translateX(-50%);
                        margin-top: 8px;
                        background: rgba(255, 59, 48, 0.9);
                        color: white;
                        font-size: 11px;
                        font-weight: 500;
                        padding: 4px 10px;
                        border-radius: 4px;
                        white-space: nowrap;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    `
                })
                this.#internalDragGhost.appendChild(deleteHint)
            }
        } else {
            if (canvas) {
                canvas.style.filter = ''
                canvas.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)'
            }
            if (deleteHint) {
                deleteHint.remove()
            }
        }
    }


    #onInternalDragEnd () {
        if (this.#internalDragIndex < 0) {
            return
        }

        if (this.#internalDragActive) {
            const sourceIndex = this.#internalDragIndex

            if (this.#isDragOutside) {
                this.dispatchEvent(new CustomEvent('framedelete', {
                    detail: {index: sourceIndex}
                }))
            } else {
                const targetIndex = this.#dropIndex
                if (targetIndex >= 0 && sourceIndex !== targetIndex && sourceIndex !== targetIndex - 1) {
                    this.dispatchEvent(new CustomEvent('framemove', {
                        detail: {
                            fromIndex: sourceIndex,
                            toIndex: targetIndex
                        }
                    }))
                }
            }

            this.#markFrameDragging(this.#internalDragIndex, false)
            this.#removeInternalDragGhost()
            this.#clearFrameGaps()
            this.#containerEl.classList.remove('drag-over', 'gap-active')
            this.classList.remove('dragging')
        }

        this.#internalDragIndex = -1
        this.#internalDragActive = false
        this.#isDragOutside = false
    }


    #updateFrameGaps () {
        const frameEls = this.#containerEl.querySelectorAll('.frame')
        if (frameEls.length === 0) {
            return
        }

        const S = this.#internalDragIndex
        const D = this.#dropIndex
        const noMove = D < 0 || D === S || D === S + 1
        const step = this.#dragFrameStep

        const sourceShift = S < D ? (D - S - 1) * step : (D - S) * step
        this.#applySourceGap(frameEls[S], noMove, sourceShift)

        frameEls.forEach((el, i) => {
            if (i === S) {
                return
            }

            if (noMove) {
                el.style.transform = ''
                return
            }

            el.style.transform = computeFrameShift(i, S, D, step)
        })
    }


    #applySourceGap (el, noMove, shift) {
        if (noMove) {
            el.style.transform = ''
            el.classList.remove('drag-placeholder')
        } else {
            el.style.transform = `translateX(${shift}px)`
            el.classList.add('drag-placeholder')
        }
    }


    #clearFrameGaps () {
        const frameEls = this.#containerEl.querySelectorAll('.frame')
        frameEls.forEach(el => {
            el.style.transform = ''
            el.classList.remove('drag-placeholder')
        })
    }


    #markFrameDragging (index, isDragging) {
        const frameEls = this.#containerEl.querySelectorAll('.frame')
        const frameEl = frameEls[index]
        if (frameEl) {
            frameEl.classList.toggle('dragging', isDragging)
        }
    }


    #createInternalDragGhost (x, y) {
        const frameEls = this.#containerEl.querySelectorAll('.frame')
        const frameEl = frameEls[this.#internalDragIndex]
        if (!frameEl) {
            return
        }

        const canvas = frameEl.querySelector('canvas')
        if (!canvas) {
            return
        }

        this.#internalDragGhost = createElement('div', {
            style: `
                position: fixed;
                pointer-events: none;
                z-index: 10000;
                opacity: 0.8;
                transform: translate(-50%, -50%) scale(0.9);
            `
        })

        const clonedCanvas = createElement('canvas', {
            style: 'border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);'
        })
        clonedCanvas.width = canvas.width
        clonedCanvas.height = canvas.height
        clonedCanvas.getContext('2d').drawImage(canvas, 0, 0)

        this.#internalDragGhost.appendChild(clonedCanvas)
        document.body.appendChild(this.#internalDragGhost)
        this.#updateInternalDragGhost(x, y)
    }


    #updateInternalDragGhost (x, y) {
        if (this.#internalDragGhost) {
            this.#internalDragGhost.style.left = `${x}px`
            this.#internalDragGhost.style.top = `${y}px`
        }
    }


    #removeInternalDragGhost () {
        if (this.#internalDragGhost) {
            this.#internalDragGhost.remove()
            this.#internalDragGhost = null
        }
    }


    #onScrubberStart (e) {
        if (e.target === this.#scrubberThumbEl) {
            e.preventDefault()
            this.#scrubberDragging = true
            this.#scrubberStartX = e.clientX
            this.#scrubberStartScroll = this.#scrollLeft
            this.#scrubberEl.classList.add('dragging')
        }
    }


    #onScrubberMove (e) {
        if (!this.#scrubberDragging) {
            return
        }
        e.preventDefault()
        this.#updateScrollFromScrubber(e.clientX)
    }


    #updateScrollFromScrubber (clientX) {
        const scrubberRect = this.#scrubberEl.getBoundingClientRect()
        const thumbWidth = this.#scrubberThumbEl.offsetWidth
        const trackWidth = scrubberRect.width - thumbWidth

        if (trackWidth <= 0) {
            return
        }

        const deltaX = clientX - this.#scrubberStartX


        const newScroll = this.#scrubberStartScroll + (deltaX / trackWidth) * this.#maxScroll
        this.#setScrollLeft(newScroll)
    }


    #setScrollLeft (value) {
        this.#scrollLeft = Math.max(0, Math.min(this.#maxScroll, value))
        this.#containerEl.style.transform = `translateX(${-this.#scrollLeft}px)`
        this.#updateScrubberThumb()
    }


    #onScrubberEnd () {
        if (this.#scrubberDragging) {
            this.#scrubberDragging = false
            this.#scrubberEl.classList.remove('dragging')
        }
    }


    #onScrubberClick (e) {
        if (e.target === this.#scrubberThumbEl) {
            return
        }

        const scrubberRect = this.#scrubberEl.getBoundingClientRect()
        const thumbWidth = this.#scrubberThumbEl.offsetWidth
        const clickX = e.clientX - scrubberRect.left - thumbWidth / 2
        const trackWidth = scrubberRect.width - thumbWidth

        const scrollRatio = Math.max(0, Math.min(1, clickX / trackWidth))
        this.#setScrollLeft(scrollRatio * this.#maxScroll)
    }


    #updateScrubberThumb () {
        const viewportWidth = this.#viewportEl.clientWidth
        const contentWidth = this.#containerEl.scrollWidth

        this.#maxScroll = Math.max(0, contentWidth - viewportWidth)

        // Add small threshold to avoid floating point issues
        if (this.#maxScroll <= 1) {
            // No overflow, hide scrubber
            this.#scrubberEl.classList.add('hidden')
            return
        }

        this.#scrubberEl.classList.remove('hidden')

        const scrubberWidth = this.#scrubberEl.clientWidth
        if (scrubberWidth === 0) {
            return
        }

        const thumbRatio = viewportWidth / contentWidth
        const thumbWidth = Math.max(44, scrubberWidth * thumbRatio)
        const scrollRatio = this.#maxScroll > 0 ? this.#scrollLeft / this.#maxScroll : 0
        const thumbLeft = scrollRatio * (scrubberWidth - thumbWidth)

        this.#scrubberThumbEl.style.width = `${thumbWidth}px`
        this.#scrubberThumbEl.style.left = `${thumbLeft}px`
    }


    #setupDeselect () {
        this.#containerEl.addEventListener('click', (e) => {
            if (e.target === this.#containerEl) {
                this.clearSelection()
            }
        })
    }


    #calculateDropIndex (clientX) {
        const frameEls = this.#containerEl.querySelectorAll('.frame')
        if (frameEls.length === 0) {
            return 0
        }

        for (let i = 0; i < frameEls.length; i++) {
            const rect = frameEls[i].getBoundingClientRect()
            const midpoint = rect.left + rect.width / 2

            if (clientX < midpoint) {
                return i
            }
        }

        return frameEls.length
    }


    setFrames (frames) {
        this.#frames = frames
        if (this.#containerEl) {
            this.#render()
        }
    }


    setCurrentIndex (index) {
        if (this.#currentIndex === index) {
            return
        }
        this.#currentIndex = index
        this.#updateHighlight()
    }


    #render () {
        this.#containerEl.innerHTML = ''

        for (let i = 0; i < this.#frames.length; i++) {
            const frame = this.#frames[i]
            const frameEl = this.#createFrameElement(frame, i)
            this.#containerEl.appendChild(frameEl)
        }

        this.#containerEl.appendChild(this.#createAddButton())

        this.#updateHighlight()


        requestAnimationFrame(() => this.#updateScrubberThumb())
    }


    #createAddButton () {
        const addBtn = createElement('button', {
            class: 'add-frame-btn',
            html: '+',
            title: 'Add frames'
        })
        addBtn.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('addrequest', {bubbles: true}))
        })
        return addBtn
    }


    #createFrameElement (frame, index) {
        const frameEl = createElement('div', {class: 'frame'})
        frameEl.dataset.index = index

        const thumbnailWrapper = createElement('div', {class: 'frame-thumbnail-wrapper'})

        const canvas = createElement('canvas', {class: 'frame-thumbnail'})
        canvas.width = 100
        canvas.height = 100
        drawFrameThumbnail(canvas, frame)
        thumbnailWrapper.appendChild(canvas)

        const indexEl = createElement('div', {class: 'frame-index', text: String(index)})
        thumbnailWrapper.appendChild(indexEl)

        const duration = frame.duration || 1
        if (duration !== 1) {
            const displayDuration = Number.isInteger(duration) ? duration : duration.toFixed(1)
            const durationBadge = createElement('div', {
                class: 'frame-duration-badge',
                text: `${displayDuration}×`
            })
            thumbnailWrapper.appendChild(durationBadge)
        }

        if (frame.events && frame.events.length > 0) {
            const eventBadge = createElement('div', {
                class: 'frame-event-badge',
                title: frame.events.join(', ')
            })
            thumbnailWrapper.appendChild(eventBadge)
        }

        frameEl.appendChild(thumbnailWrapper)

        frameEl.addEventListener('click', () => {
            if (this.#internalDragActive) {
                return
            }
            this.#handleFrameTap(index)
        })

        frameEl.addEventListener('pointerdown', (e) => this.#onInternalDragStart(e, index))

        return frameEl
    }


    #updateHighlight () {
        const frameEls = this.#containerEl.querySelectorAll('.frame')

        frameEls.forEach((el, i) => {
            el.classList.toggle('current', i === this.#currentIndex)
            el.classList.toggle('selected', i === this.#selectedIndex)
        })
    }


    #handleFrameTap (index) {
        if (this.#selectedIndex === index) {
            this.#selectedIndex = -1
        } else {
            this.#selectedIndex = index
        }
        this.#updateHighlight()
        this.dispatchEvent(new CustomEvent('frameselect', {
            detail: {
                index: this.#selectedIndex,
                frame: this.#selectedIndex >= 0 ? this.#frames[this.#selectedIndex] : null
            }
        }))
    }


    clearSelection () {
        if (this.#selectedIndex !== -1) {
            this.#selectedIndex = -1
            this.#updateHighlight()
            this.dispatchEvent(new CustomEvent('frameselect', {
                detail: {index: -1, frame: null}
            }))
        }
    }


    getSelectedIndex () {
        return this.#selectedIndex
    }


    #dispatchDeleteEvent (index) {
        this.dispatchEvent(new CustomEvent('framedelete', {
            detail: {index}
        }))
    }


    #handleKeydown (e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (this.#currentIndex >= 0 && this.#currentIndex < this.#frames.length) {
                e.preventDefault()
                this.#dispatchDeleteEvent(this.#currentIndex)
            }
        }
    }


    flashAddedFrame (index) {
        requestAnimationFrame(() => {
            const frameEls = this.#containerEl.querySelectorAll('.frame')
            const frameEl = frameEls[index]

            if (!frameEl) {
                return
            }

            frameEl.classList.add('just-added')
            frameEl.addEventListener('animationend', () => {
                frameEl.classList.remove('just-added')
            }, {once: true})

            for (let i = index + 1; i < frameEls.length; i++) {
                const el = frameEls[i]
                el.classList.add('pushed-right')
                el.addEventListener('animationend', () => {
                    el.classList.remove('pushed-right')
                }, {once: true})
            }
        })
    }


    flashMovedFrame (newIndex) {
        requestAnimationFrame(() => {
            const frameEls = this.#containerEl.querySelectorAll('.frame')
            const frameEl = frameEls[newIndex]

            if (!frameEl) {
                return
            }

            frameEl.classList.add('just-settled')
            frameEl.addEventListener('animationend', () => {
                frameEl.classList.remove('just-settled')
            }, {once: true})
        })
    }

}


function computeFrameShift (i, S, D, step) {
    if (S < D && i > S && i < D) {
        return `translateX(${-step}px)`
    }
    if (S > D && i >= D && i < S) {
        return `translateX(${step}px)`
    }
    return ''
}


function isInteractiveElement (el, stopAt) {
    const interactiveTags = ['button', 'number-input', 'input']
    while (el && el !== stopAt) {
        if (interactiveTags.includes(el.tagName?.toLowerCase())) {
            return true
        }
        el = el.parentElement
    }
    return false
}


function drawFrameThumbnail (canvas, frame) {
    const ctx = canvas.getContext('2d')
    const region = frame.region

    if (!region || !region.image) {
        ctx.fillStyle = '#333'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#666'
        ctx.font = '10px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('?', canvas.width / 2, canvas.height / 2 + 3)
        return
    }

    const scale = Math.min(
        canvas.width / region.width,
        canvas.height / region.height
    )
    const w = region.width * scale
    const h = region.height * scale
    const x = (canvas.width - w) / 2
    const y = (canvas.height - h) / 2

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(
        region.image,
        region.x, region.y,
        region.width, region.height,
        x, y, w, h
    )
}


customElements.define('animation-timeline', AnimationTimeline)
