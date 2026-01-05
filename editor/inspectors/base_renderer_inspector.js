import BaseInspector from './base_inspector.js'
import PerkyExplorerDetails from '../perky_explorer_details.js'
import BaseRenderer from '../../render/base_renderer.js'
import {createSlider} from './inspector_helpers.js'


export default class BaseRendererInspector extends BaseInspector {

    static matches (module) {
        return module instanceof BaseRenderer
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

        const renderer = this.module

        this.addRow('canvas', `${renderer.canvas.width}×${renderer.canvas.height}`)
        this.addRow('display', `${renderer.displayWidth}×${renderer.displayHeight}`)

        this.addSeparator()

        const slider = createSlider(
            'pixelRatio',
            renderer.pixelRatio,
            {min: 0.25, max: 3, step: 0.25},
            (value) => renderer.setPixelRatio(value)
        )
        this.gridEl.appendChild(slider)
    }

}


customElements.define('base-renderer-inspector', BaseRendererInspector)

PerkyExplorerDetails.registerInspector(BaseRendererInspector)
