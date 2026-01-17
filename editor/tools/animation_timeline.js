import BaseEditorComponent from '../base_editor_component.js'
import {buildEditorStyles, editorBaseStyles, editorScrollbarStyles} from '../editor_theme.js'
import '../number_input.js'


const DRAG_TYPE_SPRITESHEET = 'application/x-spritesheet-frame'
const DRAG_TYPE_TIMELINE = 'application/x-timeline-frame'


export default class AnimationTimeline extends BaseEditorComponent {

    #containerEl = null
    #dropIndicator = null
    #frames = []
    #currentIndex = 0
    #dropIndex = -1
    #dragSourceIndex = -1

    connectedCallback () {
        this.#buildDOM()
        this.tabIndex = 0
        this.addEventListener('keydown', (e) => this.#handleKeydown(e))
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = STYLES
        this.shadowRoot.appendChild(style)

        this.#containerEl = document.createElement('div')
        this.#containerEl.className = 'timeline'

        this.#dropIndicator = document.createElement('div')
        this.#dropIndicator.className = 'drop-indicator'
        this.#dropIndicator.innerHTML = '<div class="drop-label"></div>'
        this.#containerEl.appendChild(this.#dropIndicator)

        this.#setupDropZone()
        this.shadowRoot.appendChild(this.#containerEl)
    }


    #setupDropZone () {
        this.#containerEl.addEventListener('dragover', (e) => {
            const isSpritesheetDrag = e.dataTransfer.types.includes(DRAG_TYPE_SPRITESHEET)
            const isTimelineDrag = e.dataTransfer.types.includes(DRAG_TYPE_TIMELINE)

            if (!isSpritesheetDrag && !isTimelineDrag) {
                return
            }

            e.preventDefault()
            e.dataTransfer.dropEffect = isTimelineDrag ? 'move' : 'copy'

            this.#containerEl.classList.add('drag-over')
            this.#dropIndex = this.#calculateDropIndex(e.clientX)
            this.#updateDropIndicator(isTimelineDrag ? 'move' : 'insert')
        })

        this.#containerEl.addEventListener('dragleave', (e) => {
            if (!this.#containerEl.contains(e.relatedTarget)) {
                this.#containerEl.classList.remove('drag-over')
                this.#hideDropIndicator()
            }
        })

        this.#containerEl.addEventListener('drop', (e) => {
            e.preventDefault()
            this.#containerEl.classList.remove('drag-over')

            const timelineData = e.dataTransfer.getData(DRAG_TYPE_TIMELINE)
            if (timelineData) {
                this.#handleTimelineDrop(timelineData)
                this.#hideDropIndicator()
                return
            }

            const spritesheetData = e.dataTransfer.getData(DRAG_TYPE_SPRITESHEET)
            if (spritesheetData) {
                this.#handleSpritesheetDrop(spritesheetData)
            }
            this.#hideDropIndicator()
        })
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
            // Invalid JSON, ignore
        }
    }


    #handleTimelineDrop (data) {
        try {
            const {sourceIndex} = JSON.parse(data)
            if (sourceIndex === this.#dropIndex || sourceIndex === this.#dropIndex - 1) {
                return
            }

            this.dispatchEvent(new CustomEvent('framemove', {
                detail: {
                    fromIndex: sourceIndex,
                    toIndex: this.#dropIndex
                }
            }))
        } catch {
            // Invalid JSON, ignore
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
            this.#dropIndicator.style.left = `${frameRect.right - containerRect.left + 2}px`
            return
        }

        const targetFrame = frameEls[this.#dropIndex]
        const containerRect = this.#containerEl.getBoundingClientRect()
        const frameRect = targetFrame.getBoundingClientRect()
        this.#dropIndicator.style.left = `${frameRect.left - containerRect.left - 2}px`
    }


    #hideDropIndicator () {
        this.#dropIndicator.classList.remove('visible')
        delete this.#dropIndicator.dataset.mode
        this.#dropIndex = -1
    }


    setFrames (frames) {
        this.#frames = frames
        this.#render()
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
    }


    #createFrameElement (frame, index) {
        const frameEl = document.createElement('div')
        frameEl.className = 'frame'
        frameEl.dataset.index = index
        frameEl.draggable = true

        if (frame.duration && frame.duration !== 1) {
            frameEl.style.flexGrow = frame.duration
        }

        const canvas = document.createElement('canvas')
        canvas.className = 'frame-thumbnail'
        canvas.width = 48
        canvas.height = 48
        drawFrameThumbnail(canvas, frame)
        frameEl.appendChild(canvas)

        const indexEl = document.createElement('div')
        indexEl.className = 'frame-index'
        indexEl.textContent = index
        frameEl.appendChild(indexEl)

        const frameName = frame.name || frame.source
        if (frameName) {
            const nameEl = document.createElement('div')
            nameEl.className = 'frame-name'
            nameEl.textContent = frameName
            nameEl.title = frameName
            frameEl.appendChild(nameEl)
        }

        if (frame.events && frame.events.length > 0) {
            const eventsEl = document.createElement('div')
            eventsEl.className = 'frame-events'
            eventsEl.textContent = frame.events.join(', ')
            frameEl.appendChild(eventsEl)
        }

        const durationEl = document.createElement('number-input')
        durationEl.className = 'frame-duration-input'
        durationEl.setCompact(true)
        durationEl.setValue(frame.duration || 1)
        durationEl.setStep(0.1)
        durationEl.setPrecision(1)
        durationEl.setMin(0.1)
        durationEl.setMax(10)
        durationEl.title = 'Frame duration multiplier'
        durationEl.addEventListener('click', (e) => e.stopPropagation())
        durationEl.addEventListener('mousedown', (e) => e.stopPropagation())
        durationEl.addEventListener('change', (e) => {
            this.dispatchEvent(new CustomEvent('frameduration', {
                detail: {index, duration: e.detail.value}
            }))
        })
        frameEl.appendChild(durationEl)

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

        frameEl.addEventListener('dragstart', (e) => {
            this.#dragSourceIndex = index
            e.dataTransfer.setData(DRAG_TYPE_TIMELINE, JSON.stringify({sourceIndex: index}))
            e.dataTransfer.effectAllowed = 'move'
            frameEl.classList.add('dragging')
        })

        frameEl.addEventListener('dragend', () => {
            this.#dragSourceIndex = -1
            frameEl.classList.remove('dragging')
        })

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


    #handleKeydown (e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (this.#currentIndex >= 0 && this.#currentIndex < this.#frames.length) {
                e.preventDefault()
                this.#dispatchDeleteEvent(this.#currentIndex)
            }
        }
    }

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


const STYLES = buildEditorStyles(
    editorBaseStyles,
    editorScrollbarStyles,
    `
    :host {
        display: block;
        overflow-x: auto;
        overflow-y: hidden;
        height: fit-content;
    }

    .timeline {
        display: flex;
        gap: 2px;
        padding: 4px 0;
        width: fit-content;
        position: relative;
    }

    .frame {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: 4px;
        background: transparent;
        border-radius: 4px;
        min-width: 56px;
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
    }

    .frame-thumbnail {
        border-radius: 3px;
        background: var(--bg-secondary);
    }

    .frame-index {
        font-size: 10px;
        color: var(--fg-muted);
    }

    .frame-name {
        font-size: 9px;
        color: var(--fg-muted);
        max-width: 56px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: center;
    }

    .frame-events {
        font-size: 9px;
        color: var(--accent);
        max-width: 60px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .frame-duration-input {
        width: 44px;
        font-size: 9px;
    }

    .frame-delete {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 16px;
        height: 16px;
        padding: 0;
        border: none;
        background: var(--status-error);
        color: white;
        font-size: 12px;
        line-height: 14px;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.15s;
    }

    .frame:hover .frame-delete {
        opacity: 1;
    }

    .frame-delete:hover {
        filter: brightness(1.2);
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
`
)


customElements.define('animation-timeline', AnimationTimeline)
