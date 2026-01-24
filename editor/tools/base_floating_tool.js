import BaseEditorComponent from '../base_editor_component.js'
import {buildEditorStyles, editorBaseStyles, editorScrollbarStyles} from '../editor_theme.js'
import {createStyleSheet, adoptStyleSheets} from '../../application/dom_utils.js'
import {ICONS} from '../devtools/devtools_icons.js'


export default class BaseFloatingTool extends BaseEditorComponent {

    static toolId = 'baseFloating'
    static toolName = 'Base Tool'
    static toolIcon = ICONS.wrench
    static defaultWidth = 400
    static defaultHeight = 250
    static resizable = true

    #params = {}
    #options = {}

    setOptions (options) {
        this.#options = options
        this.onOptionsSet?.(options)
    }


    get options () {
        return this.#options
    }


    setParams (params) {
        this.#params = params
        this.onParamsSet?.(params)
    }


    get params () {
        return this.#params
    }


    onOptionsSet () { }


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


    static buildStyleSheet (...customStyles) {
        return createStyleSheet(this.buildStyles(...customStyles))
    }


    setupStyles () {
        adoptStyleSheets(this.shadowRoot, this.constructor.styles)
    }

}
