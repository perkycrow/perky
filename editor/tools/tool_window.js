import BaseEditorComponent from '../base_editor_component.js'
import {buildEditorStyles, editorBaseStyles} from '../editor_theme.js'


export default class ToolWindow extends BaseEditorComponent {

    static observedAttributes = ['title', 'width', 'height', 'x', 'y']

    #headerEl = null
    #contentEl = null
    #isDragging = false
    #isResizing = false
    #dragOffset = {x: 0, y: 0}

    #x = 20
    #y = 20
    #width = 450
    #height = 350
    #minWidth = 200
    #minHeight = 150
    #resizable = true

    #onPointerMove = null
    #onPointerUp = null
    #title = 'Tool'
    #icon = ''

    connectedCallback () {
        this.#buildDOM()
        this.#setupDrag()
        this.#setupResize()
        this.#applyPosition()
    }


    disconnectedCallback () {
        this.#cleanupWindowListeners()
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = STYLES
        this.shadowRoot.appendChild(style)

        const container = document.createElement('div')
        container.className = 'tool-window'

        this.#headerEl = document.createElement('div')
        this.#headerEl.className = 'tool-window-header'

        const iconEl = document.createElement('span')
        iconEl.className = 'tool-window-icon'
        iconEl.innerHTML = this.#icon
        this.#headerEl.appendChild(iconEl)

        const titleEl = document.createElement('span')
        titleEl.className = 'tool-window-title'
        titleEl.textContent = this.#title
        this.#headerEl.appendChild(titleEl)

        const closeBtn = document.createElement('button')
        closeBtn.className = 'tool-window-close'
        closeBtn.innerHTML = '×'
        closeBtn.addEventListener('click', () => this.close())
        this.#headerEl.appendChild(closeBtn)

        container.appendChild(this.#headerEl)

        this.#contentEl = document.createElement('div')
        this.#contentEl.className = 'tool-window-content'
        this.#contentEl.appendChild(document.createElement('slot'))
        container.appendChild(this.#contentEl)

        const resizeHandle = document.createElement('div')
        resizeHandle.className = 'tool-window-resize'
        container.appendChild(resizeHandle)

        this.shadowRoot.appendChild(container)
    }


    #setupDrag () {
        const startDrag = (e) => {
            if (e.target.closest('.tool-window-close')) {
                return
            }

            const coords = getPointerCoords(e)
            this.#isDragging = true
            this.#dragOffset = {
                x: coords.x - this.#x,
                y: coords.y - this.#y
            }
            this.bringToFront()
        }

        this.#headerEl.addEventListener('mousedown', startDrag)
        this.#headerEl.addEventListener('touchstart', startDrag, {passive: true})

        this.#onPointerMove = (e) => {
            if (!this.#isDragging && !this.#isResizing) {
                return
            }

            const coords = getPointerCoords(e)

            if (this.#isDragging) {
                this.#x = coords.x - this.#dragOffset.x
                this.#y = coords.y - this.#dragOffset.y
                this.#applyPosition()
            }

            if (this.#isResizing) {
                this.#width = Math.max(this.#minWidth, coords.x - this.#x)
                this.#height = Math.max(this.#minHeight, coords.y - this.#y)
                this.#applyPosition()
            }
        }

        this.#onPointerUp = () => {
            this.#isDragging = false
            this.#isResizing = false
        }

        window.addEventListener('mousemove', this.#onPointerMove)
        window.addEventListener('mouseup', this.#onPointerUp)
        window.addEventListener('touchmove', this.#onPointerMove, {passive: true})
        window.addEventListener('touchend', this.#onPointerUp)
    }


    #setupResize () {
        const handle = this.shadowRoot.querySelector('.tool-window-resize')

        const startResize = (e) => {
            if (!this.#resizable) {
                return
            }
            e.stopPropagation()
            this.#isResizing = true
            this.bringToFront()
        }

        handle.addEventListener('mousedown', startResize)
        handle.addEventListener('touchstart', startResize, {passive: false})
    }


    setResizable (resizable) {
        this.#resizable = resizable
        const handle = this.shadowRoot.querySelector('.tool-window-resize')
        if (handle) {
            handle.style.display = resizable ? 'block' : 'none'
        }
    }


    #cleanupWindowListeners () {
        if (this.#onPointerMove) {
            window.removeEventListener('mousemove', this.#onPointerMove)
            window.removeEventListener('touchmove', this.#onPointerMove)
        }
        if (this.#onPointerUp) {
            window.removeEventListener('mouseup', this.#onPointerUp)
            window.removeEventListener('touchend', this.#onPointerUp)
        }
    }


    #applyPosition () {
        this.style.left = `${this.#x}px`
        this.style.top = `${this.#y}px`
        this.style.width = `${this.#width}px`
        this.style.height = `${this.#height}px`
    }


    bringToFront () {
        this.dispatchEvent(new CustomEvent('focus', {bubbles: true}))
    }


    close () {
        this.dispatchEvent(new CustomEvent('close', {bubbles: true}))
        this.remove()
    }


    setTitle (title) {
        this.#title = title
        const titleEl = this.shadowRoot.querySelector('.tool-window-title')
        if (titleEl) {
            titleEl.textContent = title
        }
    }


    setIcon (iconSvg) {
        this.#icon = iconSvg || ''
        const iconEl = this.shadowRoot.querySelector('.tool-window-icon')
        if (iconEl) {
            iconEl.innerHTML = this.#icon
        }
    }


    setPosition (x, y) {
        this.#x = x
        this.#y = y
        this.#applyPosition()
    }


    setSize (width, height) {
        this.#width = width
        this.#height = height
        this.#applyPosition()
    }

}


function getPointerCoords (e) {
    if (e.touches && e.touches.length > 0) {
        return {x: e.touches[0].clientX, y: e.touches[0].clientY}
    }
    return {x: e.clientX, y: e.clientY}
}


const STYLES = buildEditorStyles(
    editorBaseStyles,
    `
    :host {
        position: fixed;
        z-index: 1000;
        display: block;
    }

    .tool-window {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        overflow: hidden;
    }

    .tool-window-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border);
        cursor: grab;
        user-select: none;
    }

    .tool-window-header:active {
        cursor: grabbing;
    }

    .tool-window-icon {
        width: 14px;
        height: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--fg-muted);
    }

    .tool-window-icon:empty {
        display: none;
    }

    .tool-window-icon svg {
        width: 100%;
        height: 100%;
    }

    .tool-window-title {
        font-size: 12px;
        font-weight: 500;
        color: var(--fg-primary);
    }

    .tool-window-close {
        width: 20px;
        height: 20px;
        margin-left: auto;
        border: none;
        background: transparent;
        color: var(--fg-muted);
        font-size: 16px;
        cursor: pointer;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .tool-window-close:hover {
        background: var(--bg-hover);
        color: var(--fg-primary);
    }

    .tool-window-content {
        flex: 1;
        overflow: auto;
        padding: 8px;
    }

    .tool-window-resize {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 16px;
        height: 16px;
        cursor: se-resize;
    }

    .tool-window-resize::before {
        content: '';
        position: absolute;
        bottom: 4px;
        right: 4px;
        width: 8px;
        height: 8px;
        border-right: 2px solid var(--fg-muted);
        border-bottom: 2px solid var(--fg-muted);
        opacity: 0.5;
    }
`
)


customElements.define('tool-window', ToolWindow)
