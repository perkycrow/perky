import StudioTool from '../studio_tool.js'
import {createElement, createStyleSheet} from '../../application/dom_utils.js'
import './painter_view.js'


const painterToolStyles = createStyleSheet(`
    painter-view {
        display: block;
        width: 100%;
        height: 100%;
    }
`)


export default class PainterTool extends StudioTool {

    static actions = {
        clear: 'handleClear'
    }

    static bindings = {
        clear: ['Delete', 'Backspace']
    }

    #painterView = null
    #paintingId = null

    setContext ({paintingId} = {}) {
        this.#paintingId = paintingId || 'default'
        if (this.isConnected) {
            this.init()
        }
    }


    hasContext () {
        return true
    }


    init () {
        this.#painterView.addEventListener('change', () => this.markDirty())
    }


    buildContent () {
        this.#painterView = createElement('painter-view')
        return this.#painterView
    }


    toolStyles () { // eslint-disable-line local/class-methods-use-this -- clean
        return [painterToolStyles]
    }


    autoSave () {
    }


    handleClear () {
        this.#painterView?.clear()
    }

}


customElements.define('painter-tool', PainterTool)
