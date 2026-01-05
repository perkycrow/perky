import BaseInspector from './base_inspector.js'
import PerkyExplorerDetails from '../perky_explorer_details.js'
import CanvasLayer from '../../render/canvas_layer.js'


export default class CanvasLayerInspector extends BaseInspector {

    static matches (module) {
        return module instanceof CanvasLayer
    }


    constructor () {
        super()
        this.buildDOM()
    }


    onModuleSet (module) {
        if (module) {
            this.#update()
        }
    }


    #update () {
        if (!this.module) {
            return
        }

        this.clearContent()

        const layer = this.module

        this.addRow('rendererType', layer.rendererType)
        this.addRow('zIndex', layer.zIndex)
        this.addRow('visible', layer.visible ? 'yes' : 'no')
        this.addRow('opacity', layer.opacity)
        this.addRow('autoRender', layer.autoRender ? 'yes' : 'no')

        if (layer.renderer) {
            this.addRow('renderer', layer.renderer.constructor.name)
        }

        const contentCount = layer.content?.children?.length ?? 0
        this.addRow('content', layer.content ? `${layer.content.constructor.name} (${contentCount})` : '(none)', true)

        if (layer.content) {
            const sceneTreeBtn = this.createButton('🎬', 'Scene Tree', () => this.#openSceneTree())
            sceneTreeBtn.classList.add('primary')
            this.actionsEl.appendChild(sceneTreeBtn)
        }
    }


    #openSceneTree () {
        if (!this.module?.content) {
            return
        }

        this.dispatchEvent(new CustomEvent('open:scene-tree', {
            bubbles: true,
            composed: true,
            detail: {content: this.module.content}
        }))
    }

}


customElements.define('canvas-layer-inspector', CanvasLayerInspector)

PerkyExplorerDetails.registerInspector(CanvasLayerInspector)
