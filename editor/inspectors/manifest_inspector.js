import BaseInspector from './base_inspector.js'
import PerkyExplorerDetails from '../perky_explorer_details.js'
import Manifest from '../../application/manifest.js'


const customStyles = `
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

    .data-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 4px 12px;
        font-size: 11px;
    }

    .data-key {
        color: var(--fg-muted);
    }

    .data-value {
        color: var(--fg-secondary);
        word-break: break-all;
    }

    .empty-message {
        color: var(--fg-muted);
        font-size: 10px;
        font-style: italic;
    }

    .asset-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .asset-type-group {
        margin-bottom: 8px;
    }

    .asset-type-header {
        font-size: 10px;
        color: var(--accent);
        margin-bottom: 6px;
        text-transform: capitalize;
    }

    .asset-card {
        background: var(--bg-hover);
        border-radius: 4px;
        padding: 8px;
        margin-bottom: 6px;
    }

    .asset-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
    }

    .asset-icon {
        font-size: 14px;
    }

    .asset-name {
        font-size: 11px;
        font-weight: 600;
        color: var(--fg-primary);
        flex: 1;
    }

    .asset-type-badge {
        font-size: 9px;
        background: var(--bg-primary);
        padding: 2px 6px;
        border-radius: 4px;
        color: var(--fg-muted);
    }

    .asset-details {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 2px 8px;
        font-size: 10px;
    }

    .asset-label {
        color: var(--fg-muted);
    }

    .asset-value {
        color: var(--fg-secondary);
        word-break: break-all;
    }

    .asset-link {
        color: var(--accent);
        text-decoration: none;
    }

    .asset-link:hover {
        text-decoration: underline;
    }

    .asset-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 6px;
    }

    .asset-tag {
        font-size: 9px;
        background: var(--bg-primary);
        color: var(--accent);
        padding: 2px 6px;
        border-radius: 8px;
    }

    .asset-preview {
        margin-top: 8px;
        max-width: 100%;
        border-radius: 4px;
        overflow: hidden;
    }

    .asset-preview img {
        max-width: 100%;
        max-height: 80px;
        object-fit: contain;
        display: block;
        background: var(--bg-primary);
    }

    .asset-preview audio {
        width: 100%;
        height: 32px;
        outline: none;
    }

    .asset-preview audio::-webkit-media-controls-panel {
        background-color: var(--bg-primary);
    }

    .asset-config {
        margin-top: 6px;
        padding-top: 6px;
        border-top: 1px solid var(--border);
    }

    .config-title {
        font-size: 9px;
        color: var(--fg-muted);
        text-transform: uppercase;
        margin-bottom: 4px;
    }
`


export default class ManifestInspector extends BaseInspector {

    static matches (module) {
        return module instanceof Manifest
    }

    #sectionsState = {
        config: true,
        assets: true
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

        const container = document.createElement('div')

        container.appendChild(this.#createConfigSection())
        container.appendChild(this.#createAssetsSection())

        this.gridEl.style.display = 'none'
        this.shadowRoot.insertBefore(container, this.gridEl)
    }


    #createSection (title, key, count = null) {
        const section = document.createElement('div')
        section.className = 'section'

        const header = document.createElement('div')
        header.className = 'section-header'

        const titleEl = document.createElement('div')
        titleEl.className = 'section-title'
        titleEl.textContent = title

        if (count !== null) {
            const countEl = document.createElement('span')
            countEl.className = 'section-count'
            countEl.textContent = count
            titleEl.appendChild(countEl)
        }

        const toggle = document.createElement('span')
        toggle.className = `section-toggle ${this.#sectionsState[key] ? '' : 'collapsed'}`
        toggle.textContent = '▼'

        header.appendChild(titleEl)
        header.appendChild(toggle)

        const content = document.createElement('div')
        content.className = `section-content ${this.#sectionsState[key] ? '' : 'collapsed'}`

        header.addEventListener('click', () => {
            this.#sectionsState[key] = !this.#sectionsState[key]
            toggle.classList.toggle('collapsed')
            content.classList.toggle('collapsed')
        })

        section.appendChild(header)
        section.appendChild(content)

        return {section, content}
    }


    #createConfigSection () {
        const config = this.module.getConfig()
        const entries = Object.entries(config)

        const {section, content} = this.#createSection('Config', 'config', entries.length)

        if (entries.length === 0) {
            content.innerHTML = '<div class="empty-message">No config defined</div>'
        } else {
            const grid = this.#createDataGrid(config)
            content.appendChild(grid)
        }

        return section
    }


    #createDataGrid (data, depth = 0) {
        const grid = document.createElement('div')
        grid.className = 'data-grid'

        if (depth > 0) {
            grid.style.marginLeft = `${depth * 12}px`
        }

        for (const [key, value] of Object.entries(data)) {
            const keyEl = document.createElement('div')
            keyEl.className = 'data-key'
            keyEl.textContent = key

            const valueEl = document.createElement('div')
            valueEl.className = 'data-value'

            if (value && typeof value === 'object' && !Array.isArray(value)) {
                valueEl.appendChild(this.#createDataGrid(value, depth + 1))
            } else if (Array.isArray(value)) {
                valueEl.textContent = `[${value.join(', ')}]`
            } else {
                valueEl.textContent = String(value)
            }

            grid.appendChild(keyEl)
            grid.appendChild(valueEl)
        }

        return grid
    }


    #createAssetsSection () {
        const allAssets = this.module.getAllAssets()

        const {section, content} = this.#createSection('Assets', 'assets', allAssets.length)

        if (allAssets.length === 0) {
            content.innerHTML = '<div class="empty-message">No assets defined</div>'
            return section
        }

        const assetsByType = groupAssetsByType(allAssets)

        for (const [type, assets] of Object.entries(assetsByType)) {
            const group = document.createElement('div')
            group.className = 'asset-type-group'

            const typeHeader = document.createElement('div')
            typeHeader.className = 'asset-type-header'
            typeHeader.textContent = `${type} (${assets.length})`
            group.appendChild(typeHeader)

            for (const asset of assets) {
                group.appendChild(createAssetCard(asset, (data) => this.#createDataGrid(data)))
            }

            content.appendChild(group)
        }

        return section
    }

}


function groupAssetsByType (assets) {
    const grouped = {}

    for (const asset of assets) {
        const type = asset.type || 'unknown'
        if (!grouped[type]) {
            grouped[type] = []
        }
        grouped[type].push(asset)
    }

    return grouped
}


function createAssetHeader (asset) {
    const header = document.createElement('div')
    header.className = 'asset-header'

    const icon = document.createElement('span')
    icon.className = 'asset-icon'
    icon.textContent = getAssetIcon(asset)

    const name = document.createElement('span')
    name.className = 'asset-name'
    name.textContent = asset.name || asset.id

    const typeBadge = document.createElement('span')
    typeBadge.className = 'asset-type-badge'
    typeBadge.textContent = asset.type

    header.appendChild(icon)
    header.appendChild(name)
    header.appendChild(typeBadge)

    return header
}


function createAssetDetails (asset) {
    const details = document.createElement('div')
    details.className = 'asset-details'

    addAssetRow(details, 'id', asset.id)

    if (asset.url) {
        const urlValue = document.createElement('a')
        urlValue.className = 'asset-link'
        urlValue.href = asset.url
        urlValue.target = '_blank'
        urlValue.textContent = asset.url
        addAssetRowElement(details, 'url', urlValue)
    }

    if (asset.loaded) {
        addAssetRow(details, 'loaded', 'Yes')
    }

    return details
}


function createAssetTags (asset) {
    if (!asset.tags || asset.tags.length === 0) {
        return null
    }

    const tagsContainer = document.createElement('div')
    tagsContainer.className = 'asset-tags'

    for (const tag of asset.tags) {
        const tagEl = document.createElement('span')
        tagEl.className = 'asset-tag'
        tagEl.textContent = tag
        tagsContainer.appendChild(tagEl)
    }

    return tagsContainer
}


function createAssetConfig (asset, createDataGrid) {
    if (!asset.config || Object.keys(asset.config).length === 0) {
        return null
    }

    const configSection = document.createElement('div')
    configSection.className = 'asset-config'

    const configTitle = document.createElement('div')
    configTitle.className = 'config-title'
    configTitle.textContent = 'Config'
    configSection.appendChild(configTitle)

    configSection.appendChild(createDataGrid(asset.config))

    return configSection
}


function createAssetCard (asset, createDataGrid) {
    const card = document.createElement('div')
    card.className = 'asset-card'

    card.appendChild(createAssetHeader(asset))
    card.appendChild(createAssetDetails(asset))

    const tags = createAssetTags(asset)
    if (tags) {
        card.appendChild(tags)
    }

    const config = createAssetConfig(asset, createDataGrid)
    if (config) {
        card.appendChild(config)
    }

    const preview = createSourcePreview(asset)
    if (preview) {
        card.appendChild(preview)
    }

    return card
}


function addAssetRow (container, label, value) {
    const labelEl = document.createElement('div')
    labelEl.className = 'asset-label'
    labelEl.textContent = label

    const valueEl = document.createElement('div')
    valueEl.className = 'asset-value'
    valueEl.textContent = value

    container.appendChild(labelEl)
    container.appendChild(valueEl)
}


function addAssetRowElement (container, label, element) {
    const labelEl = document.createElement('div')
    labelEl.className = 'asset-label'
    labelEl.textContent = label

    const valueEl = document.createElement('div')
    valueEl.className = 'asset-value'
    valueEl.appendChild(element)

    container.appendChild(labelEl)
    container.appendChild(valueEl)
}


const ASSET_ICON_PATTERNS = [
    {keywords: ['texture', 'image', 'sprite'], icon: '🖼'},
    {keywords: ['audio', 'sound', 'music'], icon: '🔊'},
    {keywords: ['font'], icon: '🔤'},
    {keywords: ['shader'], icon: '✨'},
    {keywords: ['scene'], icon: '🎬'},
    {keywords: ['script'], icon: '📜'},
    {keywords: ['data', 'json'], icon: '📄'}
]


function getAssetIcon (asset) {
    const type = asset.type?.toLowerCase() || ''

    for (const {keywords, icon} of ASSET_ICON_PATTERNS) {
        if (keywords.some((keyword) => type.includes(keyword))) {
            return icon
        }
    }

    return '📦'
}


function getImageSrc (source) {
    if (source instanceof HTMLImageElement) {
        return source.src
    }
    if (source instanceof HTMLCanvasElement) {
        return source.toDataURL()
    }
    return null
}


function createSourcePreview (asset) {
    if (asset.type === 'audio') {
        return createAudioPreview(asset)
    }

    const source = asset.source
    const src = getImageSrc(source)

    if (!src) {
        return null
    }

    const preview = document.createElement('div')
    preview.className = 'asset-preview'

    const img = document.createElement('img')
    img.src = src
    img.alt = asset.name || asset.id
    preview.appendChild(img)

    return preview
}


function createAudioPreview (asset) {
    const source = asset.source

    let audioSrc = null

    if (source instanceof HTMLAudioElement) {
        audioSrc = source.src
    } else if (asset.url) {
        audioSrc = asset.url
    }

    if (!audioSrc) {
        return null
    }

    const preview = document.createElement('div')
    preview.className = 'asset-preview'

    const audio = document.createElement('audio')
    audio.controls = true
    audio.preload = 'metadata'
    audio.src = audioSrc

    audio.setAttribute('controlsList', 'nodownload')

    preview.appendChild(audio)

    return preview
}


customElements.define('manifest-inspector', ManifestInspector)

PerkyExplorerDetails.registerInspector(ManifestInspector)
