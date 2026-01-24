import EditorComponent from '../editor_component.js'
import {createElement} from '../../application/dom_utils.js'


const SWIPE_THRESHOLD = 50


export default class SideDrawer extends EditorComponent {

    static styles = `
        :host {
            position: absolute;
            top: var(--drawer-top, 0);
            bottom: var(--drawer-bottom, 0);
            width: 280px;
            background: var(--bg-secondary);
            display: flex;
            flex-direction: column;
            transition: transform 0.25s ease-out;
            z-index: 100;
            touch-action: pan-y;
        }

        :host(.dragging) {
            transition: none;
        }

        :host([position="left"]) {
            left: 0;
            transform: translateX(-100%);
        }

        :host([position="right"]) {
            right: 0;
            transform: translateX(100%);
        }

        :host([open][position="left"]),
        :host([open][position="right"]) {
            transform: translateX(0);
        }

        .drawer-close {
            position: absolute;
            top: var(--spacing-sm);
            appearance: none;
            background: var(--bg-tertiary);
            border: none;
            color: var(--fg-muted);
            width: 28px;
            height: 28px;
            border-radius: var(--radius-md);
            font-size: 14px;
            cursor: pointer;
            transition: background var(--transition-fast), color var(--transition-fast);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1;
        }

        :host([position="left"]) .drawer-close {
            right: var(--spacing-sm);
        }

        :host([position="right"]) .drawer-close {
            left: var(--spacing-sm);
        }

        .drawer-close:hover {
            background: var(--bg-hover);
            color: var(--fg-primary);
        }

        .drawer-content {
            flex: 1;
            min-height: 0;
            padding: var(--spacing-md);
            box-sizing: border-box;
            overflow: hidden;
        }

        :host([no-padding]) .drawer-content {
            padding: 0;
        }
    `

    #closeBtn = null
    #contentEl = null
    #dragStartX = 0
    #currentTranslate = 0
    #isDragging = false

    constructor () {
        super()
        this.#buildDOM()
    }


    static get observedAttributes () {
        return ['open']
    }


    get isOpen () {
        return this.hasAttribute('open')
    }


    get #position () {
        return this.getAttribute('position') || 'left'
    }


    open () {
        if (!this.isOpen) {
            this.setAttribute('open', '')
            this.dispatchEvent(new CustomEvent('open', {bubbles: true}))
        }
    }


    close () {
        if (this.isOpen) {
            this.removeAttribute('open')
            this.dispatchEvent(new CustomEvent('close', {bubbles: true}))
        }
    }


    toggle () {
        if (this.isOpen) {
            this.close()
        } else {
            this.open()
        }
    }


    #buildDOM () {
        this.#closeBtn = createElement('button', {class: 'drawer-close', html: '✕'})
        this.#closeBtn.addEventListener('click', () => this.close())

        this.#contentEl = createElement('div', {class: 'drawer-content'})

        const slot = document.createElement('slot')
        this.#contentEl.appendChild(slot)

        this.shadowRoot.appendChild(this.#closeBtn)
        this.shadowRoot.appendChild(this.#contentEl)

        this.#setupSwipeToClose()
    }


    #setupSwipeToClose () {
        this.addEventListener('pointerdown', (e) => this.#onPointerDown(e))
    }


    #onPointerDown (e) {
        const interactive = 'button, input, select, textarea, slider-input, number-input, toggle-input, select-input'
        if (e.target.closest(interactive)) {
            return
        }

        this.#isDragging = true
        this.#dragStartX = e.clientX
        this.#currentTranslate = 0
        this.classList.add('dragging')
        this.setPointerCapture(e.pointerId)

        const onPointerMove = (moveEvent) => {
            if (!this.#isDragging) {
                return
            }

            const deltaX = moveEvent.clientX - this.#dragStartX

            if (this.#position === 'left') {
                this.#currentTranslate = Math.min(0, deltaX)
            } else {
                this.#currentTranslate = Math.max(0, deltaX)
            }

            this.style.transform = `translateX(${this.#currentTranslate}px)`
        }

        const onPointerUp = () => {
            this.#isDragging = false
            this.classList.remove('dragging')
            this.style.transform = ''

            const shouldClose = Math.abs(this.#currentTranslate) > SWIPE_THRESHOLD

            if (shouldClose) {
                this.close()
            }

            this.removeEventListener('pointermove', onPointerMove)
            this.removeEventListener('pointerup', onPointerUp)
            this.removeEventListener('pointercancel', onPointerUp)
        }

        this.addEventListener('pointermove', onPointerMove)
        this.addEventListener('pointerup', onPointerUp)
        this.addEventListener('pointercancel', onPointerUp)
    }

}


customElements.define('side-drawer', SideDrawer)
