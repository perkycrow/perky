import EditorComponent from '../editor_component.js'
import {editorBaseStyles, editorScrollbarStyles} from '../editor_theme.js'
import {createStyleSheet} from '../../application/dom_utils.js'
import {ICONS} from '../devtools/devtools_icons.js'


export default class BaseFloatingTool extends EditorComponent {

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
        return `
            ${editorBaseStyles}
            ${editorScrollbarStyles}
            ${customStyles.join('\n')}
        `
    }


    static buildStyleSheet (...customStyles) {
        return createStyleSheet(this.buildStyles(...customStyles))
    }


    // Kept for backwards compatibility - styles are now auto-adopted by EditorComponent
    setupStyles () { }

}
