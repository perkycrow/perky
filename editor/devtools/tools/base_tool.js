import BaseEditorComponent from '../../base_editor_component.js'
import {registerTool} from '../devtools_registry.js'


export default class BaseTool extends BaseEditorComponent {

    static toolId = 'base'
    static toolName = 'Base Tool'
    static toolIcon = '\uD83D\uDD27'
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


    static register () {
        registerTool(this)
    }

}
