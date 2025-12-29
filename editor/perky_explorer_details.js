import BaseEditorComponent from './base_editor_component.js'
import {detailsStyles, cssVariables} from './perky_explorer_styles.js'


const inspectorRegistry = new Set()


export default class PerkyExplorerDetails extends BaseEditorComponent {

    #module = null
    #titleEl = null
    #contentEl = null


    connectedCallback () {
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
        const style = document.createElement('style')
        style.textContent = `:host { ${cssVariables} } ${detailsStyles}
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
        this.shadowRoot.appendChild(style)

        this.#titleEl = document.createElement('div')
        this.#titleEl.className = 'details-title'

        this.#contentEl = document.createElement('div')
        this.#contentEl.className = 'details-content'

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

        const empty = document.createElement('div')
        empty.className = 'details-empty'
        empty.textContent = 'Select a module to inspect'
        this.#contentEl.appendChild(empty)
    }


    #renderTitle () {
        this.#titleEl.innerHTML = ''

        const statusDot = document.createElement('div')
        statusDot.className = `details-status ${this.#module.$status}`

        const focusBtn = document.createElement('button')
        focusBtn.className = 'details-focus-btn'
        focusBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>'
        focusBtn.title = 'Focus on this module'
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
    const grid = document.createElement('div')
    grid.className = 'details-grid'
    return grid
}


function addGridRow (grid, label, value, isAccent = false) {
    const labelEl = document.createElement('div')
    labelEl.className = 'details-label'
    labelEl.textContent = label

    const valueEl = document.createElement('div')
    valueEl.className = `details-value ${isAccent ? 'accent' : ''}`

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
    const container = document.createElement('div')
    container.className = 'details-tags'

    for (const tag of tags) {
        const tagEl = document.createElement('span')
        tagEl.className = 'details-tag'
        tagEl.textContent = tag
        container.appendChild(tagEl)
    }

    return container
}


customElements.define('perky-explorer-details', PerkyExplorerDetails)

