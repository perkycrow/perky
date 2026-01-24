import BaseInspector from './base_inspector.js'
import PerkyExplorerDetails from '../perky_explorer_details.js'
import Manifest from '../../application/manifest.js'
import {createElement} from '../../application/dom_utils.js'


export default class ManifestInspector extends BaseInspector {

    static matches (module) {
        return module instanceof Manifest
    }

    static styles = `
    .filters-container {
        margin-bottom: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .search-container {
        position: relative;
        width: 100%;
    }

    .search-bar {
        width: 100%;
        padding: 6px 28px 6px 8px;
        background: var(--bg-hover);
        border: 1px solid var(--border);
        border-radius: 4px;
        color: var(--fg-primary);
        font-size: 11px;
        outline: none;
        box-sizing: border-box;
    }

    .search-clear {
        position: absolute;
        right: 6px;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        display: none;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--fg-muted);
        font-size: 14px;
        line-height: 1;
        user-select: none;
        border-radius: 2px;
    }

    .search-clear:hover {
        color: var(--fg-primary);
        background: var(--bg-primary);
    }

    .search-container.has-value .search-clear {
        display: flex;
    }

    .search-bar:focus {
        border-color: var(--accent);
    }

    .search-bar::placeholder {
        color: var(--fg-muted);
    }

    .filter-buttons {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
    }

    .filter-button {
        padding: 4px 8px;
        background: var(--bg-hover);
        border: 1px solid var(--border);
        border-radius: 4px;
        font-size: 10px;
        color: var(--fg-secondary);
        cursor: pointer;
        user-select: none;
        transition: all 0.2s;
    }

    .filter-button:hover {
        background: var(--bg-primary);
        color: var(--fg-primary);
    }

    .filter-button.active {
        background: var(--accent);
        color: var(--bg-primary);
        border-color: var(--accent);
    }

    .filter-button .count {
        opacity: 0.7;
        margin-left: 4px;
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

    .asset-card.collapsed {
        padding-bottom: 8px;
    }

    .asset-header {
        display: flex;
        align-items: center;
        gap: 8px;
        position: relative;
    }

    .asset-header:not(.collapsed) {
        margin-bottom: 6px;
    }

    .asset-header::before {
        content: '▼';
        font-size: 8px;
        color: var(--fg-muted);
        transition: transform 0.2s;
        margin-right: 2px;
    }

    .asset-header.collapsed::before {
        transform: rotate(-90deg);
    }

    .asset-icon {
        width: 14px;
        height: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .asset-icon svg {
        width: 100%;
        height: 100%;
        color: var(--fg-muted);
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

    #sectionsState = {
        config: true,
        assets: true
    }

    #filterState = {
        searchQuery: ''
    }

    #typeGroupsState = {}
    #mainContainer = null
    #assetsListContainer = null

    constructor () {
        super()
        this.buildDOM()
    }


    onModuleSet (module) {
        if (module) {
            this.#update(false)
        }
    }


    #update (onlyAssetsList = false) {
        if (!this.module) {
            return
        }


        if (onlyAssetsList && this.#assetsListContainer) {
            this.#updateAssetsList()
            return
        }


        if (this.#mainContainer && this.#mainContainer.parentNode) {
            this.#mainContainer.remove()
        }

        this.clearContent()

        const container = createElement('div')
        this.#mainContainer = container

        container.appendChild(this.#createConfigSection())
        container.appendChild(this.#createAssetsSection())

        this.gridEl.style.display = 'none'
        this.shadowRoot.insertBefore(container, this.gridEl)
    }


    #updateAssetsList () {
        if (!this.#assetsListContainer) {
            return
        }


        this.#assetsListContainer.innerHTML = ''

        const allAssets = this.module.getAllAssets()
        const filteredAssets = this.#applyFilters(allAssets)
        const hasActiveSearch = this.#filterState.searchQuery.length > 0

        if (filteredAssets.length === 0) {
            this.#assetsListContainer.innerHTML = '<div class="empty-message">No assets match the current filters</div>'
            return
        }

        const assetsByType = groupAssetsByType(filteredAssets)

        for (const [type, assets] of Object.entries(assetsByType)) {
            const group = this.#createTypeGroup(type, assets, hasActiveSearch)
            this.#assetsListContainer.appendChild(group)
        }
    }


    #applyFilters (assets) {
        if (!this.#filterState.searchQuery) {
            return assets
        }

        return assets.filter((asset) => matchesSearch(asset, this.#filterState.searchQuery))
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
        const grid = createElement('div', {class: 'data-grid'})

        if (depth > 0) {
            grid.style.marginLeft = `${depth * 12}px`
        }

        for (const [key, value] of Object.entries(data)) {
            const keyEl = createElement('div', {class: 'data-key', text: key})
            const valueEl = createElement('div', {class: 'data-value'})

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


    #createFiltersBar (allAssets) {
        const container = createElement('div', {class: 'filters-container'})

        const searchContainer = createElement('div', {class: 'search-container'})
        if (this.#filterState.searchQuery) {
            searchContainer.classList.add('has-value')
        }

        const searchBar = createElement('input', {
            type: 'text',
            class: 'search-bar',
            placeholder: 'Search by name, id, type or tag...',
            value: this.#filterState.searchQuery
        })

        const clearButton = createElement('div', {
            class: 'search-clear',
            text: '×',
            title: 'Clear search'
        })

        const updateSearch = (value) => {
            searchBar.value = value
            this.#filterState.searchQuery = value
            if (value) {
                searchContainer.classList.add('has-value')
            } else {
                searchContainer.classList.remove('has-value')
            }
            this.#update()
        }

        searchBar.addEventListener('input', (e) => {
            this.#filterState.searchQuery = e.target.value
            if (e.target.value) {
                searchContainer.classList.add('has-value')
            } else {
                searchContainer.classList.remove('has-value')
            }
            this.#update(true)
        })

        clearButton.addEventListener('click', () => {
            updateSearch('')
            searchBar.focus()
        })

        searchContainer.appendChild(searchBar)
        searchContainer.appendChild(clearButton)
        container.appendChild(searchContainer)


        const quickFilters = createElement('div', {class: 'filter-buttons'})

        const typeStats = getTypeStats(allAssets)
        for (const [type, count] of Object.entries(typeStats)) {
            const chip = createFilterChip(type, count, () => {
                updateSearch(type)
                searchBar.focus()
            })
            quickFilters.appendChild(chip)
        }

        const tagStats = getTagStats(allAssets)
        if (Object.keys(tagStats).length > 0) {
            for (const [tag, count] of Object.entries(tagStats)) {
                const chip = createFilterChip(`#${tag}`, count, () => {
                    updateSearch(tag)
                    searchBar.focus()
                })
                quickFilters.appendChild(chip)
            }
        }

        container.appendChild(quickFilters)

        return container
    }


    #createAssetsSection () {
        const allAssets = this.module.getAllAssets()
        const hasActiveSearch = this.#filterState.searchQuery.length > 0

        const {section, content} = this.#createSection('Assets', 'assets', allAssets.length)

        if (allAssets.length === 0) {
            content.innerHTML = '<div class="empty-message">No assets defined</div>'
            return section
        }


        content.appendChild(this.#createFiltersBar(allAssets))


        const assetsListContainer = createElement('div')
        this.#assetsListContainer = assetsListContainer
        content.appendChild(assetsListContainer)


        const filteredAssets = this.#applyFilters(allAssets)

        if (filteredAssets.length === 0) {
            assetsListContainer.innerHTML = '<div class="empty-message">No assets match the current filters</div>'
            return section
        }

        const assetsByType = groupAssetsByType(filteredAssets)

        for (const [type, assets] of Object.entries(assetsByType)) {
            const group = this.#createTypeGroup(type, assets, hasActiveSearch)
            assetsListContainer.appendChild(group)
        }

        return section
    }


    #createTypeGroup (type, assets, hasActiveSearch) {
        const group = createElement('div', {class: 'asset-type-group'})

        const typeHeader = createElement('div', {
            class: 'asset-type-header',
            style: {cursor: 'pointer'},
            text: `${type} (${assets.length})`
        })

        const isCollapsed = this.#typeGroupsState[type] === false

        const typeContent = createElement('div', {
            style: {display: isCollapsed ? 'none' : 'block'}
        })

        typeHeader.addEventListener('click', () => {
            this.#typeGroupsState[type] = typeContent.style.display === 'none'
            typeContent.style.display = typeContent.style.display === 'none' ? 'block' : 'none'
        })

        for (const asset of assets) {
            typeContent.appendChild(createAssetCard(asset, (data) => this.#createDataGrid(data), hasActiveSearch))
        }

        group.appendChild(typeHeader)
        group.appendChild(typeContent)

        return group
    }

}


function matchesSearch (asset, query) {
    const lowerQuery = query.toLowerCase()


    if ((asset.id || '').toLowerCase().includes(lowerQuery)) {
        return true
    }


    if ((asset.name || '').toLowerCase().includes(lowerQuery)) {
        return true
    }

    if ((asset.type || '').toLowerCase().includes(lowerQuery)) {
        return true
    }

    if (asset.tags && asset.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))) {
        return true
    }

    return false
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


function getTypeStats (assets) {
    const stats = {}
    for (const asset of assets) {
        const type = asset.type || 'unknown'
        stats[type] = (stats[type] || 0) + 1
    }
    return stats
}


function getTagStats (assets) {
    const stats = {}
    for (const asset of assets) {
        if (asset.tags) {
            for (const tag of asset.tags) {
                stats[tag] = (stats[tag] || 0) + 1
            }
        }
    }
    return stats
}


function createFilterChip (label, count, onClick) {
    const chip = createElement('div', {
        class: 'filter-button',
        html: `${label}<span class="count">${count}</span>`
    })
    chip.addEventListener('click', onClick)
    return chip
}


function createAssetHeader (asset) {
    const header = createElement('div', {class: 'asset-header'})
    const icon = createElement('span', {class: 'asset-icon', html: getAssetIcon(asset)})
    const name = createElement('span', {class: 'asset-name', text: asset.name || asset.id})
    const typeBadge = createElement('span', {class: 'asset-type-badge', text: asset.type})

    header.appendChild(icon)
    header.appendChild(name)
    header.appendChild(typeBadge)

    return header
}


function createAssetDetails (asset) {
    const details = createElement('div', {class: 'asset-details'})

    addAssetRow(details, 'id', asset.id)

    if (asset.url) {
        const urlValue = createElement('a', {
            class: 'asset-link',
            href: asset.url,
            text: asset.url,
            attrs: {target: '_blank'}
        })
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

    const tagsContainer = createElement('div', {class: 'asset-tags'})

    for (const tag of asset.tags) {
        const tagEl = createElement('span', {class: 'asset-tag', text: tag})
        tagsContainer.appendChild(tagEl)
    }

    return tagsContainer
}


function createAssetConfig (asset, createDataGrid) {
    if (!asset.config || Object.keys(asset.config).length === 0) {
        return null
    }

    const configSection = createElement('div', {class: 'asset-config'})
    const configTitle = createElement('div', {class: 'config-title', text: 'Config'})
    configSection.appendChild(configTitle)
    configSection.appendChild(createDataGrid(asset.config))

    return configSection
}


function createAssetCard (asset, createDataGrid, hasActiveSearch = false) {
    const card = createElement('div', {class: 'asset-card'})

    const header = createAssetHeader(asset)
    card.appendChild(header)

    const isCollapsed = !hasActiveSearch
    const detailsContainer = createElement('div', {
        style: {display: hasActiveSearch ? 'block' : 'none'}
    })

    if (isCollapsed) {
        header.classList.add('collapsed')
        card.classList.add('collapsed')
    }

    detailsContainer.appendChild(createAssetDetails(asset))

    const tags = createAssetTags(asset)
    if (tags) {
        detailsContainer.appendChild(tags)
    }

    const config = createAssetConfig(asset, createDataGrid)
    if (config) {
        detailsContainer.appendChild(config)
    }

    const preview = createSourcePreview(asset)
    if (preview) {
        detailsContainer.appendChild(preview)
    }

    card.appendChild(detailsContainer)


    header.style.cursor = 'pointer'
    header.addEventListener('click', () => {
        const isHidden = detailsContainer.style.display === 'none'
        detailsContainer.style.display = isHidden ? 'block' : 'none'
        header.classList.toggle('collapsed')
        card.classList.toggle('collapsed')
    })

    return card
}


function addAssetRow (container, label, value) {
    const labelEl = createElement('div', {class: 'asset-label', text: label})
    const valueEl = createElement('div', {class: 'asset-value', text: value})

    container.appendChild(labelEl)
    container.appendChild(valueEl)
}


function addAssetRowElement (container, label, element) {
    const labelEl = createElement('div', {class: 'asset-label', text: label})
    const valueEl = createElement('div', {class: 'asset-value'})
    valueEl.appendChild(element)

    container.appendChild(labelEl)
    container.appendChild(valueEl)
}


const ASSET_ICONS = {
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>',
    audio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>',
    font: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>',
    shader: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>',
    scene: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22.7 19-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"></path></svg>',
    script: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
    data: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>',
    default: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>'
}

const ASSET_ICON_PATTERNS = [
    {keywords: ['texture', 'image', 'sprite'], key: 'image'},
    {keywords: ['audio', 'sound', 'music'], key: 'audio'},
    {keywords: ['font'], key: 'font'},
    {keywords: ['shader'], key: 'shader'},
    {keywords: ['scene'], key: 'scene'},
    {keywords: ['script'], key: 'script'},
    {keywords: ['data', 'json'], key: 'data'}
]


function getAssetIcon (asset) {
    const type = asset.type?.toLowerCase() || ''

    for (const {keywords, key} of ASSET_ICON_PATTERNS) {
        if (keywords.some((keyword) => type.includes(keyword))) {
            return ASSET_ICONS[key]
        }
    }

    return ASSET_ICONS.default
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

    const preview = createElement('div', {class: 'asset-preview'})
    const img = createElement('img', {src, alt: asset.name || asset.id})
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

    const preview = createElement('div', {class: 'asset-preview'})
    const audio = createElement('audio', {src: audioSrc})
    audio.controls = true
    audio.preload = 'metadata'
    audio.setAttribute('controlsList', 'nodownload')

    preview.appendChild(audio)

    return preview
}


customElements.define('manifest-inspector', ManifestInspector)

PerkyExplorerDetails.registerInspector(ManifestInspector)
