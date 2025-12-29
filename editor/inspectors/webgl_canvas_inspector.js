import BaseInspector from './base_inspector.js'
import WebGLCanvas2D from '../../render/webgl_canvas_2d.js'


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

    .pass-toggle {
        position: relative;
        width: 28px;
        height: 14px;
        appearance: none;
        background: var(--bg-hover);
        border-radius: 7px;
        cursor: pointer;
        transition: background 0.2s;
        flex-shrink: 0;
    }

    .pass-toggle::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 10px;
        height: 10px;
        background: var(--fg-muted);
        border-radius: 50%;
        transition: transform 0.2s, background 0.2s;
    }

    .pass-toggle:checked {
        background: var(--accent);
    }

    .pass-toggle:checked::after {
        transform: translateX(14px);
        background: var(--bg-primary);
    }

    .pass-name {
        color: var(--fg-primary);
        font-weight: 500;
        flex: 1;
    }

    .pass-uniforms {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-left: 4px;
    }

    .uniform-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .uniform-label {
        color: var(--fg-muted);
        font-size: 10px;
        min-width: 60px;
    }

    .uniform-slider-container {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .uniform-slider {
        flex: 1;
        height: 3px;
        appearance: none;
        background: var(--bg-hover);
        border-radius: 2px;
        cursor: pointer;
    }

    .uniform-slider::-webkit-slider-thumb {
        appearance: none;
        width: 12px;
        height: 12px;
        background: var(--accent);
        border-radius: 50%;
        cursor: pointer;
        transition: transform 0.1s, box-shadow 0.1s;
    }

    .uniform-slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
        box-shadow: 0 0 6px var(--accent);
    }

    .uniform-slider::-moz-range-thumb {
        width: 12px;
        height: 12px;
        background: var(--accent);
        border: none;
        border-radius: 50%;
        cursor: pointer;
    }

    .uniform-value {
        font-size: 10px;
        color: var(--fg-secondary);
        min-width: 32px;
        text-align: right;
        font-variant-numeric: tabular-nums;
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

        const toggle = document.createElement('input')
        toggle.type = 'checkbox'
        toggle.className = 'pass-toggle'
        toggle.checked = pass.enabled
        toggle.addEventListener('change', () => {
            pass.enabled = toggle.checked
        })

        const name = document.createElement('span')
        name.className = 'pass-name'
        name.textContent = pass.constructor.name

        header.appendChild(toggle)
        header.appendChild(name)
        section.appendChild(header)

        const uniforms = this.#getEditableUniforms(pass)
        if (uniforms.length > 0) {
            const uniformsEl = document.createElement('div')
            uniformsEl.className = 'pass-uniforms'

            for (const uniform of uniforms) {
                this.#renderUniformControl(uniformsEl, pass, uniform)
            }

            section.appendChild(uniformsEl)
        }

        this.gridEl.appendChild(section)
    }


    #getEditableUniforms (pass) {
        const defaults = pass.getDefaultUniforms?.() || {}
        const currentUniforms = pass.uniforms || {}
        return Object.entries(defaults).map(([name, defaultValue]) => ({
            name,
            defaultValue,
            currentValue: currentUniforms[name] ?? defaultValue
        }))
    }


    #renderUniformControl (container, pass, uniform) {
        const row = document.createElement('div')
        row.className = 'uniform-row'

        const label = document.createElement('span')
        label.className = 'uniform-label'
        label.textContent = uniform.name.replace(/^u/, '')

        const sliderContainer = document.createElement('div')
        sliderContainer.className = 'uniform-slider-container'

        const slider = document.createElement('input')
        slider.type = 'range'
        slider.className = 'uniform-slider'

        const config = this.#getSliderConfig(uniform.name, uniform.defaultValue)
        slider.min = config.min
        slider.max = config.max
        slider.step = config.step
        slider.value = uniform.currentValue * config.scale

        const valueDisplay = document.createElement('span')
        valueDisplay.className = 'uniform-value'
        valueDisplay.textContent = this.#formatValue(uniform.currentValue)

        slider.addEventListener('input', () => {
            const value = parseFloat(slider.value) / config.scale
            pass.setUniform(uniform.name, value)
            valueDisplay.textContent = this.#formatValue(value)
        })

        sliderContainer.appendChild(slider)
        sliderContainer.appendChild(valueDisplay)

        row.appendChild(label)
        row.appendChild(sliderContainer)
        container.appendChild(row)
    }


    #formatValue (value) {
        if (Math.abs(value) < 0.01) {
            return value.toFixed(3)
        }
        return value.toFixed(2)
    }


    #getSliderConfig (name, defaultValue) { // eslint-disable-line complexity
        const nameLower = name.toLowerCase()

        if (nameLower.includes('intensity') || nameLower.includes('smoothness')) {
            return {min: 0, max: 200, step: 1, scale: 100}
        }

        if (nameLower.includes('brightness')) {
            return {min: -50, max: 50, step: 1, scale: 100}
        }

        if (nameLower.includes('contrast') || nameLower.includes('saturation')) {
            return {min: 50, max: 150, step: 1, scale: 100}
        }

        if (nameLower.includes('amplitude')) {
            return {min: 0, max: 50, step: 1, scale: 1000}
        }

        if (nameLower.includes('time')) {
            return {min: 0, max: 100, step: 1, scale: 1}
        }

        return {min: 0, max: 100, step: 1, scale: 100}
    }

}


customElements.define('webgl-canvas-inspector', WebGLCanvasInspector)
