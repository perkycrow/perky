import BaseInspector from './base_inspector.js'
import PerkyExplorerDetails from '../perky_explorer_details.js'
import WebGLRenderer from '../../render/webgl_renderer.js'
import {passStyles, renderPass} from './inspector_helpers.js'


export default class WebGLCanvasInspector extends BaseInspector {

    static matches (module) {
        return module instanceof WebGLRenderer
    }


    constructor () {
        super(passStyles)
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

        const renderer = this.module

        this.addRow('type', 'WebGL2')
        this.addRow('canvas', `${renderer.canvas.width}×${renderer.canvas.height}`)
        this.addRow('pixelRatio', renderer.pixelRatio)
        this.addRow('backgroundColor', renderer.backgroundColor || 'transparent')
        this.addRow('culling', renderer.enableCulling ? 'enabled' : 'disabled')

        this.addSeparator()

        this.#renderPostProcessing()
    }


    #renderPostProcessing () {
        const postProcessor = this.module.postProcessor
        if (!postProcessor) {
            return
        }

        const passes = postProcessor.passes
        this.addRow('post-processing', postProcessor.enabled ? 'enabled' : 'disabled')
        this.addRow('passes', passes.length.toString(), true)

        if (passes.length === 0) {
            const noPassesEl = document.createElement('div')
            noPassesEl.className = 'no-passes'
            noPassesEl.textContent = 'No post-processing passes'
            this.gridEl.appendChild(noPassesEl)
            return
        }

        for (const pass of passes) {
            renderPass(this.gridEl, pass)
        }
    }

}


customElements.define('webgl-canvas-inspector', WebGLCanvasInspector)

PerkyExplorerDetails.registerInspector(WebGLCanvasInspector)
