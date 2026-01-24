import EditorComponent from './editor_component.js'
import {detailsStyles} from './perky_explorer.styles.js'
import {createElement} from '../application/dom_utils.js'


const inspectorRegistry = new Set()


export default class PerkyExplorerDetails extends EditorComponent {

    static styles = `
    ${detailsStyles}

    .details-focus-btn {
        background: none;
        border: none;
        color: var(--fg-secondary);
        cursor: pointer;
        font-size: 14px;
        margin-left: auto;
        opacity: 0.5;
        padding: 4px;
        transition: opacity 0.2s, color 0.2s;
    }
    .details-focus-btn:hover {
        opacity: 1;
        color: var(--fg-primary);
    }
    `

    #module = null
    #titleEl = null
    #contentEl = null

    onConnected () {
        this.#buildDOM()
    }


    setModule (module) {
        this.#module = module
        this.#render()
    }


    getModule () {
        return this.#module
    }


    clear () {
        this.#module = null
        this.#render()
    }


    #buildDOM () {
        this.#titleEl = createElement('div', {class: 'details-title'})
        this.#contentEl = createElement('div', {class: 'details-content'})

        this.shadowRoot.appendChild(this.#titleEl)
        this.shadowRoot.appendChild(this.#contentEl)
    }


    #render () {
        if (!this.#module) {
            this.#renderEmpty()
            return
        }

        this.#renderTitle()
        this.#renderContent()
    }


    #renderEmpty () {
        this.#titleEl.textContent = ''
        this.#contentEl.innerHTML = ''

        const empty = createElement('div', {
            class: 'details-empty',
            text: 'Select a module to inspect'
        })
        this.#contentEl.appendChild(empty)
    }


    #renderTitle () {
        this.#titleEl.innerHTML = ''

        const statusDot = createElement('div', {
            class: `details-status ${this.#module.$status}`
        })

        const focusBtn = createElement('button', {
            class: 'details-focus-btn',
            html: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>',
            title: 'Focus on this module'
        })
        focusBtn.onclick = () => {
            this.dispatchEvent(new CustomEvent('focus:module', {
                detail: {module: this.#module},
                bubbles: true,
                composed: true
            }))
        }

        this.#titleEl.appendChild(statusDot)
        this.#titleEl.appendChild(document.createTextNode(this.#module.$id))
        this.#titleEl.appendChild(focusBtn)
    }


    #renderContent () {
        this.#contentEl.innerHTML = ''

        const matchingInspectors = findAllInspectors(this.#module)

        if (matchingInspectors.length > 0) {
            for (const Inspector of matchingInspectors) {
                this.#renderCustomInspector(Inspector)
            }
        } else if (typeof this.#module.inspect === 'function') {
            this.#renderInspectMethod()
        } else {
            this.#renderDefaultGrid()
        }
    }


    #renderCustomInspector (Inspector) {
        const inspector = new Inspector()
        inspector.setModule(this.#module)
        this.#contentEl.appendChild(inspector)
    }


    #renderInspectMethod () {
        const inspectData = this.#module.inspect()
        const grid = createGrid()

        for (const [key, value] of Object.entries(inspectData)) {
            addGridRow(grid, key, formatValue(value))
        }

        this.#contentEl.appendChild(grid)
    }


    #renderDefaultGrid () {
        const module = this.#module
        const grid = createGrid()

        addGridRow(grid, '$name', module.$name)
        addGridRow(grid, '$category', module.$category)

        const tags = module.$tags
        if (tags && tags.length > 0) {
            addGridRow(grid, '$tags', formatTags(tags))
        }

        addGridRow(grid, 'children', module.children.length, true)

        this.#contentEl.appendChild(grid)
    }


    static registerInspector (Inspector) {
        inspectorRegistry.add(Inspector)
    }


    static unregisterInspector (Inspector) {
        inspectorRegistry.delete(Inspector)
    }

}


function findAllInspectors (module) {
    const matches = []

    for (const Inspector of inspectorRegistry) {
        if (typeof Inspector.matches === 'function' && Inspector.matches(module)) {
            matches.push(Inspector)
        }
    }

    return matches
}


function createGrid () {
    return createElement('div', {class: 'details-grid'})
}


function addGridRow (grid, label, value, isAccent = false) {
    const labelEl = createElement('div', {
        class: 'details-label',
        text: label
    })

    const valueEl = createElement('div', {
        class: `details-value ${isAccent ? 'accent' : ''}`.trim()
    })

    if (value instanceof HTMLElement) {
        valueEl.appendChild(value)
    } else {
        valueEl.textContent = String(value)
        valueEl.title = String(value)
    }

    grid.appendChild(labelEl)
    grid.appendChild(valueEl)
}


function formatValue (value) {
    if (value === null || value === undefined) {
        return '(none)'
    }
    if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : '(empty)'
    }
    if (typeof value === 'object') {
        return JSON.stringify(value)
    }
    return String(value)
}


function formatTags (tags) {
    const container = createElement('div', {class: 'details-tags'})

    for (const tag of tags) {
        const tagEl = createElement('span', {
            class: 'details-tag',
            text: tag
        })
        container.appendChild(tagEl)
    }

    return container
}


customElements.define('perky-explorer-details', PerkyExplorerDetails)
