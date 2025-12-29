import BaseInspector from './base_inspector.js'
import WebGLCanvas2D from '../../render/webgl_canvas_2d.js'
import '../slider_input.js'
import '../toggle_input.js'


function getEditableUniforms (pass) {
    const defaults = pass.getDefaultUniforms?.() || {}
    const configs = pass.getUniformConfig?.() || {}
    const currentUniforms = pass.uniforms || {}

    return Object.entries(defaults)
        .filter(([, defaultValue]) => typeof defaultValue === 'number')
        .map(([name, defaultValue]) => ({
            name,
            defaultValue,
            currentValue: currentUniforms[name] ?? defaultValue,
            config: configs[name] || {min: 0, max: defaultValue * 2 || 1, step: 0.01}
        }))
}


function renderUniformControl (container, pass, uniform) {
    const {min, max, step} = uniform.config

    const slider = document.createElement('slider-input')
    slider.setAttribute('label', uniform.name.replace(/^u/, ''))
    slider.setAttribute('min', min)
    slider.setAttribute('max', max)
    slider.setAttribute('step', step)
    slider.value = uniform.currentValue

    slider.addEventListener('change', (e) => {
        pass.setUniform(uniform.name, e.detail.value)
    })

    container.appendChild(slider)
}


const customStyles = `
    .pass-section {
        grid-column: 1 / -1;
        margin-top: 8px;
    }

    .pass-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 0;
        border-bottom: 1px solid var(--border);
        margin-bottom: 8px;
    }

    .pass-uniforms {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-left: 4px;
    }

    .no-passes {
        color: var(--fg-muted);
        font-style: italic;
        padding: 8px 0;
    }
`


export default class WebGLCanvasInspector extends BaseInspector {

    static matches (module) {
        return module instanceof WebGLCanvas2D
    }


    constructor () {
        super(customStyles)
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
            this.#renderPass(pass)
        }
    }


    #renderPass (pass) {
        const section = document.createElement('div')
        section.className = 'pass-section'

        const header = document.createElement('div')
        header.className = 'pass-header'

        const toggle = document.createElement('toggle-input')
        toggle.checked = pass.enabled
        toggle.setAttribute('label', pass.constructor.name)
        toggle.addEventListener('change', (e) => {
            pass.enabled = e.detail.checked
        })

        header.appendChild(toggle)
        section.appendChild(header)

        const uniforms = getEditableUniforms(pass)
        if (uniforms.length > 0) {
            const uniformsEl = document.createElement('div')
            uniformsEl.className = 'pass-uniforms'

            for (const uniform of uniforms) {
                renderUniformControl(uniformsEl, pass, uniform)
            }

            section.appendChild(uniformsEl)
        }

        this.gridEl.appendChild(section)
    }

}


customElements.define('webgl-canvas-inspector', WebGLCanvasInspector)
