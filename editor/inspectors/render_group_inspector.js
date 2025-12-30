import BaseInspector from './base_inspector.js'
import RenderGroup from '../../render/render_group.js'
import '../slider_input.js'
import '../toggle_input.js'


function createToggle (label, checked, onChange) {
    const container = document.createElement('div')
    container.style.cssText = 'grid-column: 1 / -1;'

    const toggle = document.createElement('toggle-input')
    toggle.checked = checked
    toggle.setAttribute('label', label)
    toggle.addEventListener('change', (e) => onChange(e.detail.checked))

    container.appendChild(toggle)
    return container
}


function createSlider (label, value, options, onChange) {
    const {min, max, step} = options
    const container = document.createElement('div')
    container.style.cssText = 'grid-column: 1 / -1;'

    const slider = document.createElement('slider-input')
    slider.setAttribute('label', label)
    slider.setAttribute('min', min)
    slider.setAttribute('max', max)
    slider.setAttribute('step', step)
    slider.value = value

    slider.addEventListener('change', (e) => onChange(e.detail.value))

    container.appendChild(slider)
    return container
}


function createColorRow (name, color, onChange) {
    const row = document.createElement('div')
    row.className = 'inspector-row'

    const label = document.createElement('span')
    label.className = 'inspector-row-label'
    label.textContent = name

    const colorInput = document.createElement('input')
    colorInput.type = 'color'
    colorInput.className = 'inspector-color'

    // Convert [r, g, b, a] to hex
    const toHex = (v) => Math.round(v * 255).toString(16).padStart(2, '0')
    colorInput.value = `#${toHex(color[0])}${toHex(color[1])}${toHex(color[2])}`

    colorInput.addEventListener('input', (e) => {
        const hex = e.target.value
        const r = parseInt(hex.slice(1, 3), 16) / 255
        const g = parseInt(hex.slice(3, 5), 16) / 255
        const b = parseInt(hex.slice(5, 7), 16) / 255
        onChange([r, g, b, color[3]]) // Preserve alpha
    })

    row.appendChild(label)
    row.appendChild(colorInput)
    return row
}


function renderTransformProperty (container, transform, name, config) {
    if (config.type === 'color') {
        const row = createColorRow(name, transform[name], (newColor) => {
            transform[name] = newColor
        })
        container.appendChild(row)
    } else {
        // Default: numeric slider
        const slider = document.createElement('slider-input')
        slider.setAttribute('label', name)
        slider.setAttribute('min', config.min ?? 0)
        slider.setAttribute('max', config.max ?? 1)
        slider.setAttribute('step', config.step ?? 0.01)
        slider.value = transform[name]

        slider.addEventListener('change', (e) => {
            transform[name] = e.detail.value
        })

        container.appendChild(slider)
    }
}


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


export default class RenderGroupInspector extends BaseInspector {

    static matches (module) {
        return module instanceof RenderGroup
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

        const group = this.module

        // Visibility toggle at the very top
        const visibleToggle = createToggle('visible', group.visible, (value) => {
            group.visible = value
        })
        this.gridEl.appendChild(visibleToggle)

        // Basic info
        this.addRow('name', group.$name)
        this.addRow('status', group.started ? 'started' : 'stopped')

        this.addSeparator()

        // Opacity slider
        const opacitySlider = createSlider('opacity', group.opacity, {min: 0, max: 1, step: 0.01}, (value) => {
            group.opacity = value
        })
        this.gridEl.appendChild(opacitySlider)

        // Blend mode selector using shared styles
        this.#renderBlendModeSelector(group)

        this.addSeparator()

        // Content info
        if (group.content) {
            this.addRow('content', group.content.name || group.content.constructor.name)
            const childCount = group.content.children?.length || 0
            this.addRow('children', childCount.toString())
        } else {
            this.addRow('content', 'none')
        }

        this.addSeparator()

        // Render transform (shadows, etc.)
        this.#renderTransform(group)

        this.addSeparator()

        // Post-passes
        this.#renderPostPasses(group)
    }


    #renderBlendModeSelector (group) {
        const row = document.createElement('div')
        row.className = 'inspector-row'

        const label = document.createElement('span')
        label.className = 'inspector-row-label'
        label.textContent = 'blendMode'

        const select = document.createElement('select')
        select.className = 'inspector-select'
        const modes = ['normal', 'additive', 'multiply']

        for (const mode of modes) {
            const option = document.createElement('option')
            option.value = mode
            option.textContent = mode
            option.selected = group.blendMode === mode
            select.appendChild(option)
        }

        select.addEventListener('change', () => {
            group.blendMode = select.value
        })

        row.appendChild(label)
        row.appendChild(select)
        this.gridEl.appendChild(row)
    }


    #renderTransform (group) {
        const transform = group.renderTransform

        if (!transform) {
            this.addRow('transform', 'none')
            return
        }

        const section = document.createElement('div')
        section.className = 'pass-section'

        const header = document.createElement('div')
        header.className = 'pass-header'

        const toggle = document.createElement('toggle-input')
        toggle.checked = transform.enabled
        toggle.setAttribute('label', transform.constructor.name)
        toggle.addEventListener('change', (e) => {
            transform.enabled = e.detail.checked
        })

        header.appendChild(toggle)
        section.appendChild(header)

        // Get editable properties from the transform
        const config = transform.getPropertyConfig?.() || {}
        const propertyNames = Object.keys(config)

        if (propertyNames.length > 0) {
            const propsEl = document.createElement('div')
            propsEl.className = 'pass-uniforms'

            for (const name of propertyNames) {
                const propConfig = config[name]
                renderTransformProperty(propsEl, transform, name, propConfig)
            }

            section.appendChild(propsEl)
        }

        this.gridEl.appendChild(section)
    }


    #renderPostPasses (group) {
        const passes = group.postPasses || []
        this.addRow('post-passes', passes.length.toString(), true)

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


customElements.define('render-group-inspector', RenderGroupInspector)
