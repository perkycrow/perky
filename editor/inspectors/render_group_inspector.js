import BaseInspector from './base_inspector.js'
import RenderGroup from '../../render/render_group.js'
import {
    createToggle,
    createSlider,
    passStyles,
    renderPass,
    renderTransform
} from './inspector_helpers.js'


export default class RenderGroupInspector extends BaseInspector {

    static matches (module) {
        return module instanceof RenderGroup
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
        renderTransform(this.gridEl, this.addRow.bind(this), group.renderTransform)

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
            renderPass(this.gridEl, pass)
        }
    }

}


customElements.define('render-group-inspector', RenderGroupInspector)
