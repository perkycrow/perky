import BaseInspector from './base_inspector.js'
import PerkyExplorerDetails from '../perky_explorer_details.js'
import Entity from '../../game/entity.js'
import '../vec2_input.js'


export default class EntityInspector extends BaseInspector {

    static matches (module) {
        return module instanceof Entity
    }

    #positionInput = null


    constructor () {
        super()
        this.buildDOM()
    }


    buildDOM () {
        super.buildDOM()

        this.#positionInput = document.createElement('vec2-input')
        this.#positionInput.setAttribute('label', 'Position')

        this.shadowRoot.insertBefore(this.#positionInput, this.gridEl)
    }


    onModuleSet (module) {
        if (module) {
            this.#positionInput.value = module.position
        }
    }

}


customElements.define('entity-inspector', EntityInspector)

PerkyExplorerDetails.registerInspector(EntityInspector)

