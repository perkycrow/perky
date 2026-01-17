import BaseEditorComponent from '../base_editor_component.js'
import {buildEditorStyles, editorBaseStyles, editorScrollbarStyles} from '../editor_theme.js'


export default class AnimationTimeline extends BaseEditorComponent {

    #containerEl = null
    #frames = []
    #currentIndex = 0

    connectedCallback () {
        this.#buildDOM()
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = STYLES
        this.shadowRoot.appendChild(style)

        this.#containerEl = document.createElement('div')
        this.#containerEl.className = 'timeline'
        this.shadowRoot.appendChild(this.#containerEl)
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

        if (frame.events && frame.events.length > 0) {
            const eventsEl = document.createElement('div')
            eventsEl.className = 'frame-events'
            eventsEl.textContent = frame.events.join(', ')
            frameEl.appendChild(eventsEl)
        }

        if (frame.duration && frame.duration !== 1) {
            const durationEl = document.createElement('div')
            durationEl.className = 'frame-duration'
            durationEl.textContent = `${frame.duration}x`
            frameEl.appendChild(durationEl)
        }

        frameEl.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('frameclick', {
                detail: {index}
            }))
        })

        return frameEl
    }


    #updateHighlight () {
        const frameEls = this.#containerEl.querySelectorAll('.frame')

        frameEls.forEach((el, i) => {
            el.classList.toggle('active', i === this.#currentIndex)
        })
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
    }

    .timeline {
        display: flex;
        gap: 4px;
        padding: 4px 0;
        min-width: min-content;
    }

    .frame {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: 4px;
        background: var(--bg-secondary);
        border-radius: 4px;
        border: 1px solid var(--border);
        min-width: 56px;
        flex-shrink: 0;
        cursor: pointer;
    }

    .frame:hover {
        border-color: var(--accent);
    }

    .frame.active {
        border-color: var(--accent);
        background: var(--bg-tertiary);
        box-shadow: 0 0 0 1px var(--accent);
    }

    .frame-thumbnail {
        border-radius: 2px;
        background: #1a1a1a;
    }

    .frame-index {
        font-size: 10px;
        color: var(--fg-secondary);
    }

    .frame-events {
        font-size: 9px;
        color: var(--accent);
        background: rgba(100, 200, 255, 0.1);
        padding: 2px 4px;
        border-radius: 2px;
        max-width: 60px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .frame-duration {
        font-size: 9px;
        color: var(--fg-secondary);
        opacity: 0.7;
    }
`
)


customElements.define('animation-timeline', AnimationTimeline)
