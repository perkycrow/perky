import EditorComponent from '../../editor_component.js'
import {registerTool} from '../devtools_registry.js'
import {ICONS} from '../devtools_icons.js'


export default class BaseTool extends EditorComponent {

    static toolId = 'base'
    static toolName = 'Base Tool'
    static toolIcon = ICONS.wrench
    static location = 'sidebar'
    static order = 100

    #state = null

    get state () {
        return this.#state
    }


    setState (state) {
        this.#state = state
        this.onStateSet(state)
    }


    onStateSet () {

    }


    onActivate () {

    }


    onDeactivate () {

    }


    getHeaderActions () { // eslint-disable-line local/class-methods-use-this -- clean
        return []
    }


    static register () {
        registerTool(this)
    }

}
