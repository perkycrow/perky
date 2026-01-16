import BaseEditorComponent from '../base_editor_component.js'
import {buildEditorStyles, editorBaseStyles, editorScrollbarStyles} from '../editor_theme.js'


export default class BaseFloatingTool extends BaseEditorComponent {

    static toolId = 'base-floating'
    static toolName = 'Base Tool'
    static toolIcon = '🔧'
    static defaultWidth = 400
    static defaultHeight = 250
    static resizable = true

    #params = {}

    setParams (params) {
        this.#params = params
        this.onParamsSet?.(params)
    }


    get params () {
        return this.#params
    }


    onParamsSet () { }


    onOpen () { }


    onClose () { }


    static buildStyles (...customStyles) {
        return buildEditorStyles(
            editorBaseStyles,
            editorScrollbarStyles,
            ...customStyles
        )
    }

}
