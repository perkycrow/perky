import EditorComponent from '../editor_component.js'
import {createElement} from '../../application/dom_utils.js'


const ANIMATION_COLORS = [
    'rgba(99, 102, 241, 0.15)',
    'rgba(236, 72, 153, 0.15)',
    'rgba(34, 197, 94, 0.15)',
    'rgba(249, 115, 22, 0.15)',
    'rgba(14, 165, 233, 0.15)',
    'rgba(168, 85, 247, 0.15)',
    'rgba(234, 179, 8, 0.15)',
    'rgba(20, 184, 166, 0.15)'
]


export default class SpritesheetViewer extends EditorComponent {

    static styles = `
    :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    .viewer-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        flex: 1;
        min-height: 0;
        gap: var(--spacing-md);
    }

    .filter-select {
        appearance: none;
        background: var(--bg-tertiary);
        color: var(--fg-primary);
        border: none;
        border-radius: var(--radius-md);
        padding: var(--spacing-sm) var(--spacing-lg) var(--spacing-sm) var(--spacing-md);
        font-family: var(--font-mono);
        font-size: var(--font-size-sm);
        flex-shrink: 0;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239898a0' d='M3 4.5L6 8l3-3.5H3z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 8px center;
        min-height: var(--touch-target);
        max-width: calc(100% - 40px);
    }

    .filter-select:hover {
        background-color: var(--bg-hover);
    }

    .filter-select:focus {
        outline: none;
        background-color: var(--bg-hover);
    }

    .frame-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        overflow-y: auto;
        width: 100%;
        flex: 1;
        min-height: 0;
        align-content: flex-start;
        background: var(--bg-tertiary);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
        gap: var(--spacing-sm);
        box-sizing: border-box;
    }

    .frame {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2px;
        cursor: pointer;
        transition: filter 0.15s;
    }

    .frame:hover {
        filter: brightness(1.2);
    }

    .frame:active {
        transform: scale(0.95);
    }

    .frame-thumbnail {
        display: block;
    }

    .frame-name {
        font-size: 8px;
        color: var(--fg-muted);
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: center;
    }
    `

    #containerEl = null
    #filterEl = null
    #gridEl = null
    #spritesheet = null
    #filter = null
    #animationColorMap = new Map()

    onConnected () {
        this.#buildDOM()
        if (this.#spritesheet) {
            this.#renderFilter()
            this.#renderGrid()
        }
    }


    #buildDOM () {
        this.#containerEl = createElement('div', {class: 'viewer-container'})

        this.#filterEl = createElement('select', {class: 'filter-select'})
        this.#filterEl.addEventListener('change', (e) => {
            this.#filter = e.target.value || null
            this.#renderGrid()
        })

        this.#gridEl = createElement('div', {class: 'frame-grid'})

        this.#containerEl.appendChild(this.#filterEl)
        this.#containerEl.appendChild(this.#gridEl)
        this.shadowRoot.appendChild(this.#containerEl)
    }


    setSpritesheet (spritesheet) {
        this.#spritesheet = spritesheet
        this.#filter = null
        this.#buildAnimationColorMap()
        if (this.#filterEl) {
            this.#renderFilter()
            this.#renderGrid()
        }
    }


    #buildAnimationColorMap () {
        this.#animationColorMap.clear()
        if (!this.#spritesheet) {
            return
        }

        const animations = this.#spritesheet.listAnimations()
        animations.forEach((name, index) => {
            this.#animationColorMap.set(name, ANIMATION_COLORS[index % ANIMATION_COLORS.length])
        })
    }


    #renderFilter () {
        this.#filterEl.innerHTML = ''

        const allOption = createElement('option', {value: '', text: 'All frames'})
        this.#filterEl.appendChild(allOption)

        if (!this.#spritesheet) {
            return
        }

        const animations = this.#spritesheet.listAnimations()
        for (const name of animations) {
            const option = createElement('option', {value: name, text: name})
            this.#filterEl.appendChild(option)
        }
    }


    #renderGrid () {
        this.#gridEl.innerHTML = ''

        if (!this.#spritesheet) {
            return
        }

        const frames = this.#getFilteredFrames()

        for (const [name, frameData] of frames) {
            const frameEl = this.#createFrameElement(name, frameData)
            this.#gridEl.appendChild(frameEl)
        }
    }


    #getFilteredFrames () {
        if (!this.#spritesheet) {
            return []
        }

        const allFrames = this.#spritesheet.framesMap

        if (!this.#filter) {
            return Array.from(allFrames.entries())
        }

        const animationFrameNames = this.#spritesheet.getAnimation(this.#filter)
        if (!animationFrameNames) {
            return []
        }

        return animationFrameNames
            .map(name => [name, allFrames.get(name)])
            .filter(([, data]) => data)
    }


    #createFrameElement (name, frameData) {
        const frameEl = createElement('div', {
            class: 'frame',
            title: name,
            attrs: {'data-name': name}
        })

        const animPrefix = getAnimationPrefix(name)
        if (animPrefix && this.#animationColorMap.has(animPrefix)) {
            frameEl.style.background = this.#animationColorMap.get(animPrefix)
        }

        const canvas = createElement('canvas', {class: 'frame-thumbnail'})
        canvas.width = 100
        canvas.height = 100
        drawFrameThumbnail(canvas, frameData.region)
        frameEl.appendChild(canvas)

        const nameEl = createElement('div', {class: 'frame-name', text: name})
        frameEl.appendChild(nameEl)

        frameEl.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('frameclick', {
                detail: {name, region: frameData.region, frameData}
            }))
        })

        return frameEl
    }

}


function getAnimationPrefix (frameName) {
    const slashIndex = frameName.lastIndexOf('/')
    if (slashIndex === -1) {
        return null
    }
    return frameName.substring(0, slashIndex)
}


function drawFrameThumbnail (canvas, region) {
    const ctx = canvas.getContext('2d')

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


customElements.define('spritesheet-viewer', SpritesheetViewer)
