import BaseInspector from './base_inspector.js'
import PerkyExplorerDetails from '../perky_explorer_details.js'
import RenderGroup from '../../render/render_group.js'
import {createElement} from '../../application/dom_utils.js'
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


        const visibleToggle = createToggle('visible', group.visible, (value) => {
            group.visible = value
        })
        this.gridEl.appendChild(visibleToggle)


        this.addRow('name', group.$name)
        this.addRow('status', group.started ? 'started' : 'stopped')

        this.addSeparator()


        const opacitySlider = createSlider('opacity', group.opacity, {min: 0, max: 1, step: 0.01}, (value) => {
            group.opacity = value
        })
        this.gridEl.appendChild(opacitySlider)


        this.#renderBlendModeSelector(group)

        this.addSeparator()


        if (group.content) {
            this.addRow('content', group.content.name || group.content.constructor.name)
            const childCount = group.content.children?.length || 0
            this.addRow('children', childCount.toString())
        } else {
            this.addRow('content', 'none')
        }

        this.addSeparator()


        renderTransform(this.gridEl, this.addRow.bind(this), group.renderTransform)

        this.addSeparator()


        this.#renderPostPasses(group)
    }


    #renderBlendModeSelector (group) {
        const row = createElement('div', {class: 'inspector-row'})
        const label = createElement('span', {
            class: 'inspector-row-label',
            text: 'blendMode'
        })
        const select = createElement('select', {class: 'inspector-select'})
        const modes = ['normal', 'additive', 'multiply']

        for (const mode of modes) {
            const option = createElement('option', {
                value: mode,
                text: mode,
                selected: group.blendMode === mode
            })
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
            const noPassesEl = createElement('div', {
                class: 'no-passes',
                text: 'No post-processing passes'
            })
            this.gridEl.appendChild(noPassesEl)
            return
        }

        for (const pass of passes) {
            renderPass(this.gridEl, pass)
        }
    }

}


customElements.define('render-group-inspector', RenderGroupInspector)

PerkyExplorerDetails.registerInspector(RenderGroupInspector)
