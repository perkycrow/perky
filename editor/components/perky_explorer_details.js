import {detailsStyles, cssVariables} from './perky_explorer_styles.js'


const inspectorRegistry = new Map()


export default class PerkyExplorerDetails extends HTMLElement {

    #module = null
    #titleEl = null
    #contentEl = null


    constructor () {
        super()
        this.attachShadow({mode: 'open'})
    }


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
        style.textContent = `:host { ${cssVariables} } ${detailsStyles}`
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

        this.#titleEl.appendChild(statusDot)
        this.#titleEl.appendChild(document.createTextNode(this.#module.$id))
    }


    #renderContent () {
        this.#contentEl.innerHTML = ''

        const customInspector = findInspector(this.#module)

        if (customInspector) {
            this.#renderCustomInspector(customInspector)
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
        addGridRow(grid, '$tags', formatTags(module.$tags))
        addGridRow(grid, '$status', module.$status)
        addGridRow(grid, 'installed', module.installed ? 'yes' : 'no')
        addGridRow(grid, 'children', module.children.length, true)

        this.#contentEl.appendChild(grid)
    }


    static registerInspector (key, Inspector) {
        inspectorRegistry.set(key, Inspector)
    }


    static unregisterInspector (key) {
        inspectorRegistry.delete(key)
    }


    static getInspector (key) {
        return inspectorRegistry.get(key)
    }


    static hasInspector (key) {
        return inspectorRegistry.has(key)
    }

}


function findInspector (module) {
    if (inspectorRegistry.has(module.$category)) {
        return inspectorRegistry.get(module.$category)
    }

    if (inspectorRegistry.has(module.constructor.$name)) {
        return inspectorRegistry.get(module.constructor.$name)
    }

    if (inspectorRegistry.has(module.constructor.name)) {
        return inspectorRegistry.get(module.constructor.name)
    }

    return null
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
    if (!tags || tags.length === 0) {
        return '(none)'
    }

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

