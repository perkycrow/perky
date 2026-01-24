import BaseInspector from './base_inspector.js'
import PerkyExplorerDetails from '../perky_explorer_details.js'
import TextureSystem from '../../render/textures/texture_system.js'
import {createElement} from '../../application/dom_utils.js'


export default class TextureSystemInspector extends BaseInspector {

    static matches (module) {
        return module instanceof TextureSystem
    }

    static styles = `
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-bottom: 16px;
    }

    .stat-card {
        background: var(--bg-hover);
        border-radius: 4px;
        padding: 8px;
        text-align: center;
    }

    .stat-value {
        font-size: 18px;
        font-weight: 600;
        color: var(--accent);
    }

    .stat-label {
        font-size: 9px;
        color: var(--fg-muted);
        text-transform: uppercase;
        margin-top: 2px;
    }

    .atlas-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .atlas-card {
        background: var(--bg-hover);
        border-radius: 4px;
        overflow: hidden;
    }

    .atlas-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 10px;
        cursor: pointer;
        user-select: none;
    }

    .atlas-header:hover {
        background: var(--bg-primary);
    }

    .atlas-title {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .atlas-toggle {
        font-size: 8px;
        color: var(--fg-muted);
        transition: transform 0.2s;
    }

    .atlas-toggle.collapsed {
        transform: rotate(-90deg);
    }

    .atlas-name {
        font-size: 11px;
        font-weight: 600;
        color: var(--fg-primary);
    }

    .atlas-badge {
        font-size: 9px;
        background: var(--bg-primary);
        padding: 2px 6px;
        border-radius: 4px;
        color: var(--fg-muted);
    }

    .atlas-content {
        border-top: 1px solid var(--border);
    }

    .atlas-content.collapsed {
        display: none;
    }

    .atlas-preview {
        padding: 8px;
        background: var(--bg-primary);
        display: flex;
        justify-content: center;
    }

    .atlas-preview canvas {
        max-width: 100%;
        max-height: 200px;
        object-fit: contain;
        border: 1px solid var(--border);
        background: repeating-conic-gradient(#333 0% 25%, #444 0% 50%) 50% / 8px 8px;
    }

    .regions-section {
        padding: 8px;
        border-top: 1px solid var(--border);
    }

    .regions-header {
        font-size: 9px;
        color: var(--fg-muted);
        text-transform: uppercase;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .regions-list {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }

    .region-tag {
        font-size: 9px;
        background: var(--bg-primary);
        color: var(--fg-secondary);
        padding: 2px 6px;
        border-radius: 4px;
        cursor: default;
    }

    .region-tag:hover {
        color: var(--fg-primary);
        background: var(--border);
    }

    .region-tag .region-size {
        color: var(--fg-muted);
        margin-left: 4px;
        font-size: 8px;
    }

    .empty-message {
        color: var(--fg-muted);
        font-size: 10px;
        font-style: italic;
        padding: 12px;
        text-align: center;
    }

    .section {
        margin-bottom: 12px;
    }

    .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px solid var(--border);
        margin-bottom: 8px;
        cursor: pointer;
        user-select: none;
    }

    .section-header:hover {
        color: var(--fg-primary);
    }

    .section-title {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--fg-muted);
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .section-count {
        background: var(--bg-hover);
        padding: 1px 6px;
        border-radius: 8px;
        font-size: 9px;
        color: var(--fg-secondary);
    }

    .section-toggle {
        font-size: 10px;
        color: var(--fg-muted);
        transition: transform 0.2s;
    }

    .section-toggle.collapsed {
        transform: rotate(-90deg);
    }

    .section-content {
        display: block;
    }

    .section-content.collapsed {
        display: none;
    }
    `

    #sectionsState = {
        atlases: true
    }

    #atlasExpandState = {}
    #mainContainer = null

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

        if (this.#mainContainer && this.#mainContainer.parentNode) {
            this.#mainContainer.remove()
        }

        this.clearContent()

        const container = createElement('div')
        this.#mainContainer = container

        container.appendChild(this.#createStatsSection())
        container.appendChild(this.#createAtlasesSection())

        this.gridEl.style.display = 'none'
        this.shadowRoot.insertBefore(container, this.gridEl)
    }


    #createStatsSection () {
        const stats = createElement('div', {class: 'stats-grid'})

        const atlases = this.module.atlases
        const regionCount = this.module.regionCount

        let totalPixels = 0
        for (const atlas of atlases) {
            totalPixels += atlas.width * atlas.height
        }
        const totalMB = (totalPixels * 4 / 1024 / 1024).toFixed(2)

        stats.appendChild(createStatCard(atlases.length, 'Atlases'))
        stats.appendChild(createStatCard(regionCount, 'Regions'))
        stats.appendChild(createStatCard(`${totalMB}MB`, 'Memory'))

        return stats
    }


    #createAtlasesSection () {
        const atlases = this.module.atlases

        const {section, content} = this.#createSection('Atlases', 'atlases', atlases.length)

        if (atlases.length === 0) {
            content.innerHTML = '<div class="empty-message">No atlases created yet</div>'
            return section
        }

        const atlasList = createElement('div', {class: 'atlas-list'})

        atlases.forEach((atlas, index) => {
            atlasList.appendChild(this.#createAtlasCard(atlas, index))
        })

        content.appendChild(atlasList)

        return section
    }


    #createSection (title, key, count = null) {
        const section = createElement('div', {class: 'section'})
        const header = createElement('div', {class: 'section-header'})
        const titleEl = createElement('div', {class: 'section-title', text: title})

        if (count !== null) {
            const countEl = createElement('span', {class: 'section-count', text: count})
            titleEl.appendChild(countEl)
        }

        const toggle = createElement('span', {
            class: `section-toggle ${this.#sectionsState[key] ? '' : 'collapsed'}`,
            text: '▼'
        })

        header.appendChild(titleEl)
        header.appendChild(toggle)

        const content = createElement('div', {
            class: `section-content ${this.#sectionsState[key] ? '' : 'collapsed'}`
        })

        header.addEventListener('click', () => {
            this.#sectionsState[key] = !this.#sectionsState[key]
            toggle.classList.toggle('collapsed')
            content.classList.toggle('collapsed')
        })

        section.appendChild(header)
        section.appendChild(content)

        return {section, content}
    }


    #createAtlasCard (atlas, index) {
        const card = createElement('div', {class: 'atlas-card'})
        const header = createElement('div', {class: 'atlas-header'})
        const titleContainer = createElement('div', {class: 'atlas-title'})
        const toggle = createElement('span', {class: 'atlas-toggle', text: '▼'})
        const name = createElement('span', {class: 'atlas-name', text: `Atlas ${index + 1}`})
        const badge = createElement('span', {class: 'atlas-badge', text: `${atlas.width}×${atlas.height}`})

        titleContainer.appendChild(toggle)
        titleContainer.appendChild(name)

        const regionCount = createElement('span', {class: 'atlas-badge', text: `${atlas.regionCount} regions`})

        header.appendChild(titleContainer)

        const badges = createElement('div', {style: {display: 'flex', gap: '4px'}})
        badges.appendChild(regionCount)
        badges.appendChild(badge)
        header.appendChild(badges)

        const content = createElement('div', {class: 'atlas-content'})

        const isCollapsed = this.#atlasExpandState[index] === false
        if (isCollapsed) {
            toggle.classList.add('collapsed')
            content.classList.add('collapsed')
        }

        header.addEventListener('click', () => {
            this.#atlasExpandState[index] = content.classList.contains('collapsed')
            toggle.classList.toggle('collapsed')
            content.classList.toggle('collapsed')
        })

        const preview = createElement('div', {class: 'atlas-preview'})

        const canvas = atlas.canvas
        if (canvas) {
            const displayCanvas = createElement('canvas', {
                attrs: {width: canvas.width, height: canvas.height}
            })
            const ctx = displayCanvas.getContext('2d')
            ctx.drawImage(canvas, 0, 0)
            preview.appendChild(displayCanvas)
        }

        content.appendChild(preview)
        content.appendChild(createRegionsList(atlas))

        card.appendChild(header)
        card.appendChild(content)

        return card
    }

}


function createStatCard (value, label) {
    const card = createElement('div', {class: 'stat-card'})
    const valueEl = createElement('div', {class: 'stat-value', text: value})
    const labelEl = createElement('div', {class: 'stat-label', text: label})

    card.appendChild(valueEl)
    card.appendChild(labelEl)

    return card
}


function createRegionsList (atlas) {
    const section = createElement('div', {class: 'regions-section'})
    const header = createElement('div', {class: 'regions-header', text: 'Regions'})
    const list = createElement('div', {class: 'regions-list'})

    const regions = atlas.getAllRegions()
    for (const [id, region] of regions) {
        const tag = createElement('span', {
            class: 'region-tag',
            title: `${id} (${region.width}×${region.height})`
        })
        const nameSpan = createElement('span', {text: id})
        const sizeSpan = createElement('span', {class: 'region-size', text: `${region.width}×${region.height}`})

        tag.appendChild(nameSpan)
        tag.appendChild(sizeSpan)

        list.appendChild(tag)
    }

    section.appendChild(header)
    section.appendChild(list)

    return section
}

customElements.define('texture-system-inspector', TextureSystemInspector)

PerkyExplorerDetails.registerInspector(TextureSystemInspector)
