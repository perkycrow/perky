import BaseEditorComponent from '../base_editor_component.js'
import {buildEditorStyles, editorBaseStyles, editorScrollbarStyles} from '../editor_theme.js'


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


export default class SpritesheetViewer extends BaseEditorComponent {

    #containerEl = null
    #filterEl = null
    #gridEl = null
    #spritesheet = null
    #filter = null
    #animationColorMap = new Map()

    #dragData = null
    #dragGhost = null
    #dragStartPos = null
    #dragStartEl = null
    #lastTimeline = null

    connectedCallback () {
        this.#buildDOM()
        this.#setupPointerDrag()
        if (this.#spritesheet) {
            this.#renderFilter()
            this.#renderGrid()
        }
    }


    disconnectedCallback () {
        this.#cleanupPointerDrag()
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
        frameEl.draggable = true
        frameEl.title = name

        const animPrefix = getAnimationPrefix(name)
        if (animPrefix && this.#animationColorMap.has(animPrefix)) {
            frameEl.style.background = this.#animationColorMap.get(animPrefix)
        }

        const canvas = document.createElement('canvas')
        canvas.className = 'frame-thumbnail'
        canvas.width = 100
        canvas.height = 100
        drawFrameThumbnail(canvas, frameData.region)
        frameEl.appendChild(canvas)

        const nameEl = document.createElement('div')
        nameEl.className = 'frame-name'
        nameEl.textContent = name
        frameEl.appendChild(nameEl)

        frameEl.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('frameclick', {
                detail: {name, region: frameData.region, frameData}
            }))
        })

        frameEl.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('application/x-spritesheet-frame', JSON.stringify({
                name,
                regionData: {
                    x: frameData.region?.x,
                    y: frameData.region?.y,
                    width: frameData.region?.width,
                    height: frameData.region?.height
                }
            }))
            e.dataTransfer.effectAllowed = 'copy'
            frameEl.classList.add('dragging')
        })

        frameEl.addEventListener('dragend', () => {
            frameEl.classList.remove('dragging')
        })

        return frameEl
    }


    #setupPointerDrag () {
        this.addEventListener('pointerdown', (e) => this.#onPointerStart(e))
        this.#boundPointerMove = (e) => this.#onPointerMove(e)
        this.#boundPointerEnd = (e) => this.#onPointerEnd(e)
        document.addEventListener('pointermove', this.#boundPointerMove)
        document.addEventListener('pointerup', this.#boundPointerEnd)
        document.addEventListener('pointercancel', this.#boundPointerEnd)
    }

    #boundPointerMove = null
    #boundPointerEnd = null

    #cleanupPointerDrag () {
        if (this.#boundPointerMove) {
            document.removeEventListener('pointermove', this.#boundPointerMove)
        }
        if (this.#boundPointerEnd) {
            document.removeEventListener('pointerup', this.#boundPointerEnd)
            document.removeEventListener('pointercancel', this.#boundPointerEnd)
        }
        this.#removeDragGhost()
    }


    #onPointerStart (e) {
        // Mouse uses HTML5 Drag and Drop (native)
        if (e.pointerType === 'mouse') {
            return
        }

        const target = e.composedPath()[0]
        const frameEl = target.closest?.('.frame') || this.#findFrameFromPoint(e.clientX, e.clientY)

        if (!frameEl) {
            return
        }

        this.#dragStartPos = {x: e.clientX, y: e.clientY}
        this.#dragStartEl = frameEl
        this.#dragData = null
    }


    #findFrameFromPoint (x, y) {
        const elements = this.shadowRoot.elementsFromPoint(x, y)
        for (const el of elements) {
            if (el.classList?.contains('frame')) {
                return el
            }
        }
        return null
    }


    #onPointerMove (e) {
        if (!this.#dragStartEl) {
            return
        }
        // Mouse uses HTML5 Drag and Drop
        if (e.pointerType === 'mouse') {
            return
        }

        const dx = e.clientX - this.#dragStartPos.x
        const dy = e.clientY - this.#dragStartPos.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (!this.#dragData && distance > 10) {
            e.preventDefault()
            this.#startDrag(e.clientX, e.clientY)
        }

        if (this.#dragData) {
            e.preventDefault()
            this.#updateDragGhost(e.clientX, e.clientY)

            const timeline = findTimeline(e.clientX, e.clientY)
            if (timeline) {
                timeline.handleTouchDragOver(e.clientX)
            } else if (this.#lastTimeline) {
                this.#lastTimeline.handleTouchDragLeave()
                this.#lastTimeline = null
            }
            this.#lastTimeline = timeline
        }
    }


    #onPointerEnd (e) {
        if (!this.#dragStartEl) {
            return
        }
        // Mouse uses HTML5 Drag and Drop
        if (e.pointerType === 'mouse') {
            return
        }

        if (this.#dragData) {
            const timeline = findTimeline(e.clientX, e.clientY)

            if (timeline) {
                timeline.handleTouchDrop(this.#dragData)
            } else if (this.#lastTimeline) {
                this.#lastTimeline.handleTouchDragLeave()
            }

            this.#dragStartEl?.classList.remove('dragging')
            this.#removeDragGhost()
        }

        this.#dragStartPos = null
        this.#dragStartEl = null
        this.#dragData = null
        this.#lastTimeline = null
    }


    #startDrag (x, y) {
        const frameEl = this.#dragStartEl
        const name = frameEl.dataset.name
        const frameData = this.#spritesheet?.framesMap.get(name)

        if (!frameData) {
            return
        }

        this.#dragData = {
            name,
            regionData: {
                x: frameData.region?.x,
                y: frameData.region?.y,
                width: frameData.region?.width,
                height: frameData.region?.height
            }
        }

        frameEl.classList.add('dragging')
        this.#createDragGhost(frameEl, x, y)
    }


    #createDragGhost (frameEl, x, y) {
        const canvas = frameEl.querySelector('canvas')
        if (!canvas) {
            return
        }

        this.#dragGhost = document.createElement('div')
        this.#dragGhost.className = 'drag-ghost'
        this.#dragGhost.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 10000;
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(0.8);
        `

        const clonedCanvas = document.createElement('canvas')
        clonedCanvas.width = canvas.width
        clonedCanvas.height = canvas.height
        clonedCanvas.style.cssText = 'border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);'
        clonedCanvas.getContext('2d').drawImage(canvas, 0, 0)

        this.#dragGhost.appendChild(clonedCanvas)
        document.body.appendChild(this.#dragGhost)

        this.#updateDragGhost(x, y)
    }


    #updateDragGhost (x, y) {
        if (this.#dragGhost) {
            this.#dragGhost.style.left = `${x}px`
            this.#dragGhost.style.top = `${y}px`
        }
    }


    #removeDragGhost () {
        if (this.#dragGhost) {
            this.#dragGhost.remove()
            this.#dragGhost = null
        }
    }

}


function findTimeline (x, y) {
    const visited = new Set()
    return findElementInShadowDom({root: document, x, y, tagName: 'animation-timeline', visited})
}


function getAnimationPrefix (frameName) {
    const slashIndex = frameName.lastIndexOf('/')
    if (slashIndex === -1) {
        return null
    }
    return frameName.substring(0, slashIndex)
}


function findElementInShadowDom ({root, x, y, tagName, visited}) {
    const elements = root.elementsFromPoint(x, y)

    for (const el of elements) {
        if (visited.has(el)) {
            continue
        }
        visited.add(el)

        if (el.tagName?.toLowerCase() === tagName) {
            return el
        }

        if (el.shadowRoot) {
            const found = findElementInShadowDom({root: el.shadowRoot, x, y, tagName, visited})
            if (found) {
                return found
            }
        }
    }

    return null
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
        gap: 8px;
    }

    .filter-select {
        background: var(--bg-secondary);
        color: var(--fg-secondary);
        border: none;
        border-radius: 4px;
        padding: 6px 10px;
        font-family: var(--font-mono);
        font-size: 11px;
        flex-shrink: 0;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
    }

    .filter-select:hover {
        background: var(--bg-hover);
        color: var(--fg-primary);
    }

    .filter-select:focus {
        outline: none;
        background: var(--bg-hover);
    }

    .frame-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, 100px);
        overflow-y: auto;
        flex: 1;
        align-content: flex-start;
        background: var(--bg-secondary);
        border-radius: 6px;
    }

    .frame {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2px;
        cursor: grab;
        transition: filter 0.15s;
    }

    .frame:hover {
        filter: brightness(1.2);
    }

    .frame:active {
        cursor: grabbing;
    }

    .frame.dragging {
        opacity: 0.5;
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
)


customElements.define('spritesheet-viewer', SpritesheetViewer)
