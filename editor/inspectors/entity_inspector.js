import BaseInspector from './base_inspector.js'
import Entity from '../../game/entity.js'
import '../number_input.js'


const customStyles = `
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
        width: 100%;
    }
`


export default class EntityInspector extends BaseInspector {

    static matches (module) {
        return module instanceof Entity
    }

    #xInput = null
    #yInput = null


    constructor () {
        super(customStyles)
        this.buildDOM()
    }


    buildDOM () {
        super.buildDOM()

        const title = document.createElement('div')
        title.className = 'inspector-section-title'
        title.textContent = 'Position'

        const inputs = document.createElement('div')
        inputs.className = 'position-inputs'

        this.#xInput = document.createElement('number-input')
        this.#xInput.setAttribute('label', 'x')
        this.#xInput.setAttribute('step', '0.1')
        this.#xInput.setAttribute('precision', '2')
        this.#xInput.addEventListener('change', (e) => this.#handleInput('x', e.detail.value))

        this.#yInput = document.createElement('number-input')
        this.#yInput.setAttribute('label', 'y')
        this.#yInput.setAttribute('step', '0.1')
        this.#yInput.setAttribute('precision', '2')
        this.#yInput.addEventListener('change', (e) => this.#handleInput('y', e.detail.value))

        inputs.appendChild(this.#xInput)
        inputs.appendChild(this.#yInput)

        this.shadowRoot.insertBefore(inputs, this.gridEl)
        this.shadowRoot.insertBefore(title, inputs)
    }


    onModuleSet (module) {
        if (module) {
            this.#updateInputs()
        }
    }


    #handleInput (axis, value) {
        if (!this.module) {
            return
        }

        this.module[axis] = value
    }


    #updateInputs () {
        if (!this.module) {
            return
        }

        this.#xInput.value = this.module.x
        this.#yInput.value = this.module.y
    }

}


customElements.define('entity-inspector', EntityInspector)
