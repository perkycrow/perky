import BaseEditorComponent from '../base_editor_component.js'
import {adoptStyles, createSheet} from '../styles/index.js'
import '../number_input.js'


const DRAG_TYPE_SPRITESHEET = 'application/x-spritesheet-frame'


export default class AnimationTimeline extends BaseEditorComponent {

    #wrapperEl = null
    #viewportEl = null
    #containerEl = null
    #scrubberEl = null
    #scrubberThumbEl = null
    #dropIndicator = null
    #frames = []
    #currentIndex = 0
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

    connectedCallback () {
        this.#buildDOM()
        this.tabIndex = 0
        this.addEventListener('keydown', (e) => this.#handleKeydown(e))
        this.#setupInternalDrag()
        if (this.#frames.length > 0) {
            this.#render()
        }
    }


    disconnectedCallback () {
        this.#cleanupScrubberEvents()
        this.#cleanupInternalDrag()
    }


    #buildDOM () {
        adoptStyles(this.shadowRoot, timelineStyles)


        this.#wrapperEl = document.createElement('div')
        this.#wrapperEl.className = 'timeline-wrapper'


        this.#viewportEl = document.createElement('div')
        this.#viewportEl.className = 'timeline-viewport'


        this.#containerEl = document.createElement('div')
        this.#containerEl.className = 'timeline'

        this.#dropIndicator = document.createElement('div')
        this.#dropIndicator.className = 'drop-indicator'
        this.#dropIndicator.innerHTML = '<div class="drop-label"></div>'
        this.#containerEl.appendChild(this.#dropIndicator)


        this.#scrubberEl = document.createElement('div')
        this.#scrubberEl.className = 'scrubber hidden'

        this.#scrubberThumbEl = document.createElement('div')
        this.#scrubberThumbEl.className = 'scrubber-thumb'
        this.#scrubberEl.appendChild(this.#scrubberThumbEl)

        this.#setupDropZone()
        this.#setupScrubber()

        this.#viewportEl.appendChild(this.#containerEl)
        this.#wrapperEl.appendChild(this.#viewportEl)
        this.#wrapperEl.appendChild(this.#scrubberEl)
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
            this.#createInternalDragGhost(e.clientX, e.clientY)
            this.#markFrameDragging(this.#internalDragIndex, true)
        }

        if (this.#internalDragActive) {
            e.preventDefault()
            this.#updateInternalDragGhost(e.clientX, e.clientY)
            this.#containerEl.classList.add('drag-over')
            this.#dropIndex = this.#calculateDropIndex(e.clientX)
            this.#updateDropIndicator('move')
        }
    }


    #onInternalDragEnd () {
        if (this.#internalDragIndex < 0) {
            return
        }

        if (this.#internalDragActive) {
            const sourceIndex = this.#internalDragIndex
            const targetIndex = this.#dropIndex

            if (targetIndex >= 0 && sourceIndex !== targetIndex && sourceIndex !== targetIndex - 1) {
                this.dispatchEvent(new CustomEvent('framemove', {
                    detail: {
                        fromIndex: sourceIndex,
                        toIndex: targetIndex
                    }
                }))
            }

            this.#markFrameDragging(this.#internalDragIndex, false)
            this.#removeInternalDragGhost()
            this.#containerEl.classList.remove('drag-over')
            this.#hideDropIndicator()
        }

        this.#internalDragIndex = -1
        this.#internalDragActive = false
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

        this.#internalDragGhost = document.createElement('div')
        this.#internalDragGhost.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 10000;
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(0.9);
        `

        const clonedCanvas = document.createElement('canvas')
        clonedCanvas.width = canvas.width
        clonedCanvas.height = canvas.height
        clonedCanvas.style.cssText = 'border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);'
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


    #setupDropZone () {
        // Handle drops from spritesheet viewer (HTML5 drag and drop)
        const handleDragOver = (e) => {
            if (!e.dataTransfer.types.includes(DRAG_TYPE_SPRITESHEET)) {
                return
            }

            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'

            this.#containerEl.classList.add('drag-over')
            this.#dropIndex = this.#calculateDropIndex(e.clientX)
            this.#updateDropIndicator('insert')
        }

        const handleDragLeave = (e) => {
            const rect = this.#viewportEl.getBoundingClientRect()
            if (e.clientX < rect.left || e.clientX > rect.right ||
                e.clientY < rect.top || e.clientY > rect.bottom) {
                this.#containerEl.classList.remove('drag-over')
                this.#hideDropIndicator()
            }
        }

        const handleDrop = (e) => {
            e.preventDefault()
            this.#containerEl.classList.remove('drag-over')

            const spritesheetData = e.dataTransfer.getData(DRAG_TYPE_SPRITESHEET)
            if (spritesheetData) {
                this.#handleSpritesheetDrop(spritesheetData)
            }
            this.#hideDropIndicator()
        }

        this.#viewportEl.addEventListener('dragover', handleDragOver)
        this.#viewportEl.addEventListener('dragleave', handleDragLeave)
        this.#viewportEl.addEventListener('drop', handleDrop)
    }


    #handleSpritesheetDrop (data) {
        try {
            const frameData = JSON.parse(data)
            this.dispatchEvent(new CustomEvent('framedrop', {
                detail: {
                    index: this.#dropIndex,
                    frameName: frameData.name,
                    regionData: frameData.regionData
                }
            }))
        } catch {

        }
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


    #updateDropIndicator (mode) {
        const frameEls = this.#containerEl.querySelectorAll('.frame')
        this.#dropIndicator.classList.add('visible')
        this.#dropIndicator.dataset.mode = mode

        const label = this.#dropIndicator.querySelector('.drop-label')
        label.textContent = this.#dropIndex

        if (frameEls.length === 0 || this.#dropIndex === 0) {
            this.#dropIndicator.style.left = '0px'
            return
        }

        if (this.#dropIndex >= frameEls.length) {
            const lastFrame = frameEls[frameEls.length - 1]
            const containerRect = this.#containerEl.getBoundingClientRect()
            const frameRect = lastFrame.getBoundingClientRect()
            this.#dropIndicator.style.left = `${frameRect.right - containerRect.left + this.#scrollLeft + 2}px`
            return
        }

        const targetFrame = frameEls[this.#dropIndex]
        const containerRect = this.#containerEl.getBoundingClientRect()
        const frameRect = targetFrame.getBoundingClientRect()
        this.#dropIndicator.style.left = `${frameRect.left - containerRect.left + this.#scrollLeft - 2}px`
    }


    #hideDropIndicator () {
        this.#dropIndicator.classList.remove('visible')
        delete this.#dropIndicator.dataset.mode
        this.#dropIndex = -1
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

        this.#dropIndicator = document.createElement('div')
        this.#dropIndicator.className = 'drop-indicator'
        this.#dropIndicator.innerHTML = '<div class="drop-label"></div>'
        this.#containerEl.appendChild(this.#dropIndicator)

        for (let i = 0; i < this.#frames.length; i++) {
            const frame = this.#frames[i]
            const frameEl = this.#createFrameElement(frame, i)
            this.#containerEl.appendChild(frameEl)
        }

        this.#updateHighlight()


        requestAnimationFrame(() => this.#updateScrubberThumb())
    }


    #createFrameElement (frame, index) {
        const frameEl = document.createElement('div')
        frameEl.className = 'frame'
        frameEl.dataset.index = index

        const thumbnailWrapper = document.createElement('div')
        thumbnailWrapper.className = 'frame-thumbnail-wrapper'

        const canvas = document.createElement('canvas')
        canvas.className = 'frame-thumbnail'
        canvas.width = 72
        canvas.height = 72
        drawFrameThumbnail(canvas, frame)
        thumbnailWrapper.appendChild(canvas)

        const indexEl = document.createElement('div')
        indexEl.className = 'frame-index'
        indexEl.textContent = index
        thumbnailWrapper.appendChild(indexEl)

        const durationBadge = document.createElement('div')
        durationBadge.className = 'frame-duration-badge'
        const duration = frame.duration || 1
        const displayDuration = Number.isInteger(duration) ? duration : duration.toFixed(1)
        durationBadge.textContent = `×${displayDuration}`
        durationBadge.title = 'Click to edit duration'
        durationBadge.addEventListener('click', (e) => {
            e.stopPropagation()
            this.#showDurationEditor(index, durationBadge, duration)
        })
        thumbnailWrapper.appendChild(durationBadge)

        if (frame.events && frame.events.length > 0) {
            const eventBadge = document.createElement('div')
            eventBadge.className = 'frame-event-badge'
            eventBadge.textContent = '⚡'
            eventBadge.title = frame.events.join(', ')
            thumbnailWrapper.appendChild(eventBadge)
        }

        frameEl.appendChild(thumbnailWrapper)

        const deleteBtn = document.createElement('button')
        deleteBtn.className = 'frame-delete'
        deleteBtn.textContent = '×'
        deleteBtn.title = 'Delete frame'
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            this.#dispatchDeleteEvent(index)
        })
        frameEl.appendChild(deleteBtn)

        frameEl.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('frameclick', {
                detail: {index}
            }))
        })

        frameEl.addEventListener('pointerdown', (e) => this.#onInternalDragStart(e, index))

        return frameEl
    }


    #updateHighlight () {
        const frameEls = this.#containerEl.querySelectorAll('.frame')

        frameEls.forEach((el, i) => {
            el.classList.toggle('active', i === this.#currentIndex)
        })
    }


    #dispatchDeleteEvent (index) {
        this.dispatchEvent(new CustomEvent('framedelete', {
            detail: {index}
        }))
    }


    #showDurationEditor (index, badgeEl, currentDuration) {
        const input = document.createElement('input')
        input.type = 'number'
        input.className = 'duration-editor'
        input.value = currentDuration
        input.step = '0.1'
        input.min = '0.1'

        const originalText = badgeEl.textContent
        badgeEl.textContent = ''
        badgeEl.appendChild(input)
        input.focus()
        input.select()

        const commit = () => {
            const newDuration = parseFloat(input.value) || 1
            badgeEl.textContent = originalText
            if (newDuration !== currentDuration) {
                const displayDuration = Number.isInteger(newDuration) ? newDuration : newDuration.toFixed(1)
                badgeEl.textContent = `×${displayDuration}`
                this.dispatchEvent(new CustomEvent('frameduration', {
                    detail: {index, duration: newDuration}
                }))
            }
        }

        input.addEventListener('blur', commit)
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault()
                input.blur()
            } else if (e.key === 'Escape') {
                e.preventDefault()
                badgeEl.textContent = originalText
            }
        })
    }


    #handleKeydown (e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (this.#currentIndex >= 0 && this.#currentIndex < this.#frames.length) {
                e.preventDefault()
                this.#dispatchDeleteEvent(this.#currentIndex)
            }
        }
    }


    handleTouchDragOver (clientX) {
        this.#containerEl.classList.add('drag-over')
        this.#dropIndex = this.#calculateDropIndex(clientX)
        this.#updateDropIndicator('insert')
    }


    handleTouchDrop (frameData) {
        this.#containerEl.classList.remove('drag-over')
        const insertIndex = this.#dropIndex
        if (insertIndex >= 0) {
            this.#handleSpritesheetDrop(JSON.stringify(frameData))
            requestAnimationFrame(() => this.#flashFrameAt(insertIndex))
        }
        this.#hideDropIndicator()
    }


    #flashFrameAt (index) {
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
    }


    handleTouchDragLeave () {
        this.#containerEl.classList.remove('drag-over')
        this.#hideDropIndicator()
    }


    flashMovedFrame (newIndex) {
        requestAnimationFrame(() => {
            const frameEls = this.#containerEl.querySelectorAll('.frame')
            const frameEl = frameEls[newIndex]

            if (!frameEl) {
                return
            }

            frameEl.classList.add('just-moved')
            frameEl.addEventListener('animationend', () => {
                frameEl.classList.remove('just-moved')
            }, {once: true})
        })
    }

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


const timelineStyles = createSheet(`
    :host {
        display: block;
        height: fit-content;
    }

    .timeline-wrapper {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .timeline-viewport {
        overflow: hidden;
        flex-shrink: 0;
    }

    .timeline {
        display: flex;
        gap: 2px;
        padding: 4px 0;
        position: relative;
        width: fit-content;
        min-width: 100%;
        will-change: transform;
    }


    .scrubber {
        position: relative;
        height: 24px;
        background: var(--bg-secondary);
        border-radius: 12px;
        cursor: pointer;
        touch-action: none;
        flex-shrink: 0;
    }

    .scrubber.hidden {
        display: none !important;
    }

    .scrubber-thumb {
        position: absolute;
        top: 2px;
        bottom: 2px;
        min-width: 44px;
        background: var(--bg-hover);
        border-radius: 10px;
        cursor: grab;
        transition: background 0.15s;
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
        padding: 4px;
        background: transparent;
        border-radius: 4px;
        flex-shrink: 0;
        cursor: grab;
        transition: opacity 0.15s, transform 0.15s, background 0.15s;
    }

    .frame:hover {
        background: var(--bg-hover);
    }

    .frame:active {
        cursor: grabbing;
    }

    .frame.active {
        background: var(--bg-selected);
    }

    .frame.active .frame-thumbnail {
        box-shadow: 0 0 0 2px var(--accent);
    }

    .frame.dragging {
        opacity: 0.4;
        transform: scale(0.95);
        pointer-events: none;
    }

    .frame.just-added {
        animation: frame-added 0.4s ease-out;
    }

    @keyframes frame-added {
        0% {
            background: var(--accent);
            transform: scale(0.8);
            opacity: 0;
        }
        50% {
            transform: scale(1.05);
            opacity: 1;
        }
        100% {
            background: transparent;
            transform: scale(1);
        }
    }

    .frame.just-moved {
        animation: frame-moved 0.35s ease-out;
    }

    @keyframes frame-moved {
        0% {
            background: var(--accent);
            transform: scale(1.1);
        }
        100% {
            background: transparent;
            transform: scale(1);
        }
    }

    .frame.pushed-right {
        animation: pushed-right 0.3s ease-out;
    }

    @keyframes pushed-right {
        0% {
            transform: translateX(-20px);
        }
        100% {
            transform: translateX(0);
        }
    }

    .frame-thumbnail-wrapper {
        position: relative;
    }

    .frame-thumbnail {
        border-radius: 3px;
        background: var(--bg-secondary);
        display: block;
    }

    .frame-index {
        position: absolute;
        top: 2px;
        left: 2px;
        font-size: 9px;
        color: var(--fg-muted);
        background: rgba(0, 0, 0, 0.5);
        padding: 1px 4px;
        border-radius: 2px;
        line-height: 1;
    }

    .frame-duration-badge {
        position: absolute;
        bottom: 2px;
        right: 2px;
        font-size: 9px;
        color: var(--fg-primary);
        background: rgba(0, 0, 0, 0.6);
        padding: 1px 4px;
        border-radius: 2px;
        line-height: 1;
        cursor: pointer;
        transition: background 0.15s;
    }

    .frame-duration-badge:hover {
        background: rgba(0, 0, 0, 0.8);
    }

    .duration-editor {
        width: 32px;
        background: transparent;
        border: none;
        color: var(--fg-primary);
        font-size: 9px;
        font-family: var(--font-mono);
        text-align: center;
        padding: 0;
        margin: 0;
        outline: none;
    }

    .duration-editor::-webkit-inner-spin-button,
    .duration-editor::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    .frame-event-badge {
        position: absolute;
        top: 2px;
        right: 2px;
        font-size: 10px;
        color: var(--status-warning, #ffc107);
        background: rgba(0, 0, 0, 0.6);
        padding: 1px 3px;
        border-radius: 2px;
        line-height: 1;
        cursor: help;
    }

    .frame-delete {
        position: absolute;
        top: -6px;
        right: -6px;
        width: 16px;
        height: 16px;
        padding: 0;
        border: none;
        background: var(--bg-secondary);
        color: var(--fg-muted);
        font-size: 12px;
        line-height: 16px;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.15s, color 0.15s, background 0.15s;
    }

    .frame:hover .frame-delete {
        opacity: 1;
    }

    .frame-delete:hover {
        background: var(--bg-hover);
        color: var(--fg-primary);
    }

    .drop-indicator {
        position: absolute;
        top: 4px;
        bottom: 4px;
        width: 2px;
        background: var(--accent);
        border-radius: 1px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.1s, left 0.1s;
        z-index: 10;
    }

    .drop-indicator.visible {
        opacity: 1;
    }

    .drop-label {
        position: absolute;
        top: -14px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--accent);
        color: var(--bg-primary);
        font-size: 9px;
        font-weight: 500;
        padding: 1px 5px;
        border-radius: 3px;
        white-space: nowrap;
    }

    .drop-indicator[data-mode="insert"] .drop-label::before {
        content: '+';
        margin-right: 2px;
    }

    .drop-indicator[data-mode="move"] .drop-label::before {
        content: '→';
        margin-right: 2px;
    }

    .hidden {
        display: none !important;
    }
`)


customElements.define('animation-timeline', AnimationTimeline)
