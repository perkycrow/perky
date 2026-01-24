import EditorComponent from './editor_component.js'


const menuStyles = `
    :host {
        position: fixed;
        z-index: 10000;
    }

    .context-menu {
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: 4px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
        min-width: 140px;
        padding: 3px 0;
        font-family: var(--font-mono);
        font-size: 11px;
    }

    .context-menu-item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 5px 10px;
        color: var(--fg-primary);
        cursor: pointer;
        transition: background 0.1s;
    }

    .context-menu-item:hover {
        background: var(--bg-hover);
    }

    .context-menu-item.disabled {
        color: var(--fg-muted);
        cursor: not-allowed;
    }

    .context-menu-item.disabled:hover {
        background: transparent;
    }

    .context-menu-item.danger {
        color: var(--status-stopped);
    }

    .context-menu-item.danger:hover {
        background: rgba(248, 113, 113, 0.15);
    }

    .context-menu-icon {
        width: 14px;
        text-align: center;
        flex-shrink: 0;
        font-size: 10px;
    }

    .context-menu-label {
        flex: 1;
    }

    .context-menu-separator {
        height: 1px;
        background: var(--border);
        margin: 3px 6px;
    }
`


export default class ExplorerContextMenu extends EditorComponent {

    static styles = menuStyles

    #menuEl = null
    #actions = []
    #module = null

    onConnected () {
        this.#buildDOM()
    }


    show (actions, module, position) {
        this.#actions = actions
        this.#module = module
        this.#renderActions()
        this.#positionMenu(position.x, position.y)
        this.style.display = 'block'

        document.addEventListener('click', this.#handleOutsideClick)
        document.addEventListener('contextmenu', this.#handleOutsideClick)
        document.addEventListener('keydown', this.#handleKeyDown)
    }


    hide () {
        this.style.display = 'none'
        this.#actions = []
        this.#module = null

        document.removeEventListener('click', this.#handleOutsideClick)
        document.removeEventListener('contextmenu', this.#handleOutsideClick)
        document.removeEventListener('keydown', this.#handleKeyDown)
    }


    #buildDOM () {
        this.#menuEl = document.createElement('div')
        this.#menuEl.className = 'context-menu'
        this.#menuEl.addEventListener('contextmenu', (e) => {
            e.preventDefault()
            e.stopPropagation()
        })
        this.shadowRoot.appendChild(this.#menuEl)

        this.style.display = 'none'
    }


    #renderActions () {
        this.#menuEl.innerHTML = ''

        for (const action of this.#actions) {
            if (action.separator) {
                const separator = document.createElement('div')
                separator.className = 'context-menu-separator'
                this.#menuEl.appendChild(separator)
                continue
            }

            const item = document.createElement('div')
            item.className = 'context-menu-item'

            if (action.disabled) {
                item.classList.add('disabled')
            }

            if (action.danger) {
                item.classList.add('danger')
            }

            const icon = document.createElement('span')
            icon.className = 'context-menu-icon'
            if (action.iconSvg) {
                icon.innerHTML = action.iconSvg
            } else {
                icon.textContent = action.icon || ''
            }

            const label = document.createElement('span')
            label.className = 'context-menu-label'
            label.textContent = action.label

            item.appendChild(icon)
            item.appendChild(label)

            if (!action.disabled) {
                item.addEventListener('click', (e) => {
                    e.stopPropagation()
                    const module = this.#module
                    this.hide()
                    action.action(module)
                })
            }

            this.#menuEl.appendChild(item)
        }
    }


    #positionMenu (x, y) {
        const menuRect = this.#menuEl.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        let finalX = x
        let finalY = y

        if (x + menuRect.width > viewportWidth) {
            finalX = viewportWidth - menuRect.width - 10
        }

        if (y + menuRect.height > viewportHeight) {
            finalY = viewportHeight - menuRect.height - 10
        }

        this.style.left = `${Math.max(10, finalX)}px`
        this.style.top = `${Math.max(10, finalY)}px`
    }

    #handleOutsideClick = (e) => {
        if (e.type === 'contextmenu') {
            e.preventDefault()
        }
        this.hide()
    }


    #handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            this.hide()
        }
    }

}


customElements.define('explorer-context-menu', ExplorerContextMenu)
