import BaseEditorComponent from '../base_editor_component.js'
import {buildEditorStyles, editorBaseStyles, editorScrollbarStyles} from '../editor_theme.js'


export default class SpritesheetViewer extends BaseEditorComponent {

    #containerEl = null
    #filterEl = null
    #gridEl = null
    #spritesheet = null
    #filter = null

    connectedCallback () {
        this.#buildDOM()
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = STYLES
        this.shadowRoot.appendChild(style)

        this.#containerEl = document.createElement('div')
        this.#containerEl.className = 'viewer-container'

        this.#filterEl = document.createElement('select')
        this.#filterEl.className = 'filter-select'
        this.#filterEl.addEventListener('change', (e) => {
            this.#filter = e.target.value || null
            this.#renderGrid()
        })

        this.#gridEl = document.createElement('div')
        this.#gridEl.className = 'frame-grid'

        this.#containerEl.appendChild(this.#filterEl)
        this.#containerEl.appendChild(this.#gridEl)
        this.shadowRoot.appendChild(this.#containerEl)
    }


    setSpritesheet (spritesheet) {
        this.#spritesheet = spritesheet
        this.#filter = null
        this.#renderFilter()
        this.#renderGrid()
    }


    #renderFilter () {
        this.#filterEl.innerHTML = ''

        const allOption = document.createElement('option')
        allOption.value = ''
        allOption.textContent = 'All frames'
        this.#filterEl.appendChild(allOption)

        if (!this.#spritesheet) {
            return
        }

        const animations = this.#spritesheet.listAnimations()
        for (const name of animations) {
            const option = document.createElement('option')
            option.value = name
            option.textContent = name
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
        const frameEl = document.createElement('div')
        frameEl.className = 'frame'
        frameEl.dataset.name = name

        const canvas = document.createElement('canvas')
        canvas.className = 'frame-thumbnail'
        canvas.width = 48
        canvas.height = 48
        drawFrameThumbnail(canvas, frameData.region)
        frameEl.appendChild(canvas)

        const nameEl = document.createElement('div')
        nameEl.className = 'frame-name'
        nameEl.textContent = getShortName(name)
        nameEl.title = name
        frameEl.appendChild(nameEl)

        frameEl.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('frameclick', {
                detail: {name, region: frameData.region, frameData}
            }))
        })

        return frameEl
    }

}


function getShortName (name) {
    const parts = name.split('/')
    return parts[parts.length - 1]
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


const STYLES = buildEditorStyles(
    editorBaseStyles,
    editorScrollbarStyles,
    `
    :host {
        display: block;
        overflow: hidden;
    }

    .viewer-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: 4px;
    }

    .filter-select {
        background: var(--bg-secondary);
        color: var(--fg-primary);
        border: 1px solid var(--border);
        border-radius: 4px;
        padding: 4px 8px;
        font-family: var(--font-mono);
        font-size: 11px;
        flex-shrink: 0;
    }

    .frame-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        overflow-y: auto;
        flex: 1;
        align-content: flex-start;
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
        cursor: pointer;
    }

    .frame:hover {
        border-color: var(--accent);
    }

    .frame-thumbnail {
        border-radius: 2px;
        background: #1a1a1a;
    }

    .frame-name {
        font-size: 9px;
        color: var(--fg-secondary);
        max-width: 48px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: center;
    }
`
)


customElements.define('spritesheet-viewer', SpritesheetViewer)
