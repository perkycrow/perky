import '../slider_input.js'
import '../toggle_input.js'


export function createToggle (label, checked, onChange) {
    const container = document.createElement('div')
    container.style.cssText = 'grid-column: 1 / -1;'

    const toggle = document.createElement('toggle-input')
    toggle.checked = checked
    toggle.setAttribute('label', label)
    toggle.addEventListener('change', (e) => onChange(e.detail.checked))

    container.appendChild(toggle)
    return container
}


export function createSlider (label, value, options, onChange) {
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


export function createColorRow (name, color, onChange) {
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


export function getEditableUniforms (pass) {
    const defaults = pass.constructor.defaultUniforms || pass.getDefaultUniforms?.() || {}
    const configs = pass.constructor.uniformConfig || pass.getUniformConfig?.() || {}
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


export function renderUniformSlider (container, pass, uniform) {
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


export function renderTransformProperty (container, transform, name, config) {
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


export const passStyles = `
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


export function renderPass (gridEl, pass) {
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
            renderUniformSlider(uniformsEl, pass, uniform)
        }

        section.appendChild(uniformsEl)
    }

    gridEl.appendChild(section)
}


export function renderTransform (gridEl, addRow, transform) {
    if (!transform) {
        addRow('transform', 'none')
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

    gridEl.appendChild(section)
}
