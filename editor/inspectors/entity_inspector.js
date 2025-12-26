import {cssVariables, inspectorStyles} from '../components/perky_explorer_styles.js'
import Entity from '../../game/entity.js'


const styles = `
    :host {
        ${cssVariables}
        display: block;
    }

    ${inspectorStyles}

    .inspector-section-title {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--fg-muted);
        margin-bottom: 6px;
    }

    .position-inputs {
        display: flex;
        gap: 8px;
    }

    .input-group {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .input-label {
        font-size: 11px;
        color: var(--fg-muted);
        min-width: 12px;
    }

    .input-field {
        flex: 1;
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: 3px;
        color: var(--fg-primary);
        padding: 4px 6px;
        font-size: 11px;
        font-family: var(--font-mono);
        width: 100%;
        box-sizing: border-box;
    }

    .input-field:focus {
        outline: none;
        border-color: var(--accent);
    }
`


export default class EntityInspector extends HTMLElement {

    static matches (module) {
        return module instanceof Entity
    }

    #module = null
    #xInput = null
    #yInput = null


    constructor () {
        super()
        this.attachShadow({mode: 'open'})
        this.#buildDOM()
    }


    setModule (module) {
        this.#module = module

        if (module) {
            this.#updateInputs()
        }
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = styles
        this.shadowRoot.appendChild(style)

        const title = document.createElement('div')
        title.className = 'inspector-section-title'
        title.textContent = 'Position'

        const inputs = document.createElement('div')
        inputs.className = 'position-inputs'

        const xGroup = this.#createInputGroup('x')
        const yGroup = this.#createInputGroup('y')

        this.#xInput = xGroup.querySelector('.input-field')
        this.#yInput = yGroup.querySelector('.input-field')

        inputs.appendChild(xGroup)
        inputs.appendChild(yGroup)

        this.shadowRoot.appendChild(title)
        this.shadowRoot.appendChild(inputs)
    }


    #createInputGroup (label) {
        const group = document.createElement('div')
        group.className = 'input-group'

        const labelEl = document.createElement('span')
        labelEl.className = 'input-label'
        labelEl.textContent = label

        const input = document.createElement('input')
        input.className = 'input-field'
        input.type = 'number'
        input.step = '0.1'
        input.addEventListener('input', () => this.#handleInput(label, input.value))

        group.appendChild(labelEl)
        group.appendChild(input)

        return group
    }


    #handleInput (axis, value) {
        if (!this.#module) {
            return
        }

        const numValue = parseFloat(value)
        if (!isNaN(numValue)) {
            this.#module[axis] = numValue
        }
    }


    #updateInputs () {
        if (!this.#module) {
            return
        }

        this.#xInput.value = this.#module.x.toFixed(2)
        this.#yInput.value = this.#module.y.toFixed(2)
    }

}


customElements.define('entity-inspector', EntityInspector)

