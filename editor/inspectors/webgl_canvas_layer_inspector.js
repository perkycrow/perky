import {cssVariables, inspectorStyles} from '../components/perky_explorer_styles.js'
import WebGLCanvasLayer from '../../render/webgl_canvas_layer.js'


const styles = `
    :host {
        ${cssVariables}
        display: block;
    }

    ${inspectorStyles}
`


export default class WebGLCanvasLayerInspector extends HTMLElement {

    static matches (module) {
        return module instanceof WebGLCanvasLayer
    }

    #module = null
    #gridEl = null
    #actionsEl = null


    constructor () {
        super()
        this.attachShadow({mode: 'open'})
        this.#buildDOM()
    }


    setModule (module) {
        this.#module = module
        this.#update()
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = styles
        this.shadowRoot.appendChild(style)

        this.#gridEl = document.createElement('div')
        this.#gridEl.className = 'inspector-grid'

        this.#actionsEl = document.createElement('div')
        this.#actionsEl.className = 'inspector-actions'

        this.shadowRoot.appendChild(this.#gridEl)
        this.shadowRoot.appendChild(this.#actionsEl)
    }


    #update () {
        if (!this.#module) {
            return
        }

        this.#gridEl.innerHTML = ''
        this.#actionsEl.innerHTML = ''

        const layer = this.#module

        this.#addRow('zIndex', layer.zIndex)
        this.#addRow('visible', layer.visible ? 'yes' : 'no')
        this.#addRow('opacity', layer.opacity)
        this.#addRow('autoRender', layer.autoRender ? 'yes' : 'no')

        if (layer.renderer) {
            this.#addRow('renderer', layer.renderer.constructor.name)
        }

        const contentCount = layer.content?.children?.length ?? 0
        this.#addRow('content', layer.content ? `${layer.content.constructor.name} (${contentCount})` : '(none)', true)

        if (layer.content) {
            const sceneTreeBtn = document.createElement('button')
            sceneTreeBtn.className = 'inspector-btn primary'
            sceneTreeBtn.textContent = '🎬 Scene Tree'
            sceneTreeBtn.addEventListener('click', () => this.#openSceneTree())
            this.#actionsEl.appendChild(sceneTreeBtn)
        }
    }


    #addRow (label, value, isAccent = false) {
        const labelEl = document.createElement('div')
        labelEl.className = 'inspector-label'
        labelEl.textContent = label

        const valueEl = document.createElement('div')
        valueEl.className = `inspector-value ${isAccent ? 'accent' : ''}`
        valueEl.textContent = String(value)

        this.#gridEl.appendChild(labelEl)
        this.#gridEl.appendChild(valueEl)
    }


    #openSceneTree () {
        if (!this.#module?.content) {
            return
        }

        this.dispatchEvent(new CustomEvent('open:scene-tree', {
            bubbles: true,
            composed: true,
            detail: {content: this.#module.content}
        }))
    }

}


customElements.define('webgl-canvas-layer-inspector', WebGLCanvasLayerInspector)
