import BaseInspector from './base_inspector.js'
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

    .descriptor-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .descriptor-type-group {
        margin-bottom: 8px;
    }

    .descriptor-type-header {
        font-size: 10px;
        color: var(--accent);
        margin-bottom: 6px;
        text-transform: capitalize;
    }

    .descriptor-card {
        background: var(--bg-hover);
        border-radius: 4px;
        padding: 8px;
        margin-bottom: 6px;
    }

    .descriptor-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
    }

    .descriptor-icon {
        font-size: 14px;
    }

    .descriptor-name {
        font-size: 11px;
        font-weight: 600;
        color: var(--fg-primary);
        flex: 1;
    }

    .descriptor-type-badge {
        font-size: 9px;
        background: var(--bg-primary);
        padding: 2px 6px;
        border-radius: 4px;
        color: var(--fg-muted);
    }

    .descriptor-details {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 2px 8px;
        font-size: 10px;
    }

    .descriptor-label {
        color: var(--fg-muted);
    }

    .descriptor-value {
        color: var(--fg-secondary);
        word-break: break-all;
    }

    .descriptor-link {
        color: var(--accent);
        text-decoration: none;
    }

    .descriptor-link:hover {
        text-decoration: underline;
    }

    .descriptor-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 6px;
    }

    .descriptor-tag {
        font-size: 9px;
        background: var(--bg-primary);
        color: var(--accent);
        padding: 2px 6px;
        border-radius: 8px;
    }

    .descriptor-preview {
        margin-top: 8px;
        max-width: 100%;
        border-radius: 4px;
        overflow: hidden;
    }

    .descriptor-preview img {
        max-width: 100%;
        max-height: 80px;
        object-fit: contain;
        display: block;
        background: var(--bg-primary);
    }

    .descriptor-config {
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
        metadata: true,
        config: true,
        sources: true
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

        container.appendChild(this.#createMetadataSection())
        container.appendChild(this.#createConfigSection())
        container.appendChild(this.#createSourceDescriptorsSection())

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


    #createMetadataSection () {
        const metadata = this.module.getMetadata()
        const entries = Object.entries(metadata)

        const {section, content} = this.#createSection('Metadata', 'metadata', entries.length)

        if (entries.length === 0) {
            content.innerHTML = '<div class="empty-message">No metadata defined</div>'
        } else {
            const grid = this.#createDataGrid(metadata)
            content.appendChild(grid)
        }

        return section
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


    #createSourceDescriptorsSection () {
        const types = this.module.getSourceDescriptorTypes()
        const allDescriptors = this.module.getAllSourceDescriptors()

        const {section, content} = this.#createSection('Source Descriptors', 'sources', allDescriptors.length)

        if (types.length === 0) {
            content.innerHTML = '<div class="empty-message">No source descriptors defined</div>'
            return section
        }

        for (const type of types) {
            const descriptors = this.module.getSourceDescriptorsByType(type)
            if (descriptors.length === 0) {
                continue
            }

            const group = document.createElement('div')
            group.className = 'descriptor-type-group'

            const typeHeader = document.createElement('div')
            typeHeader.className = 'descriptor-type-header'
            typeHeader.textContent = `${type} (${descriptors.length})`
            group.appendChild(typeHeader)

            for (const descriptor of descriptors) {
                group.appendChild(this.#createDescriptorCard(descriptor))
            }

            content.appendChild(group)
        }

        return section
    }


    #createDescriptorCard (descriptor) { // eslint-disable-line complexity
        const card = document.createElement('div')
        card.className = 'descriptor-card'

        const header = document.createElement('div')
        header.className = 'descriptor-header'

        const icon = document.createElement('span')
        icon.className = 'descriptor-icon'
        icon.textContent = this.#getDescriptorIcon(descriptor)

        const name = document.createElement('span')
        name.className = 'descriptor-name'
        name.textContent = descriptor.name || descriptor.id

        const typeBadge = document.createElement('span')
        typeBadge.className = 'descriptor-type-badge'
        typeBadge.textContent = descriptor.type

        header.appendChild(icon)
        header.appendChild(name)
        header.appendChild(typeBadge)
        card.appendChild(header)

        const details = document.createElement('div')
        details.className = 'descriptor-details'

        this.#addDescriptorRow(details, 'id', descriptor.id)

        if (descriptor.url) {
            const urlValue = document.createElement('a')
            urlValue.className = 'descriptor-link'
            urlValue.href = descriptor.url
            urlValue.target = '_blank'
            urlValue.textContent = descriptor.url
            this.#addDescriptorRowElement(details, 'url', urlValue)
        }

        if (descriptor.loaded) {
            this.#addDescriptorRow(details, 'loaded', 'Yes')
        }

        card.appendChild(details)

        if (descriptor.tags && descriptor.tags.length > 0) {
            const tagsContainer = document.createElement('div')
            tagsContainer.className = 'descriptor-tags'

            for (const tag of descriptor.tags) {
                const tagEl = document.createElement('span')
                tagEl.className = 'descriptor-tag'
                tagEl.textContent = tag
                tagsContainer.appendChild(tagEl)
            }

            card.appendChild(tagsContainer)
        }

        if (descriptor.config && Object.keys(descriptor.config).length > 0) {
            const configSection = document.createElement('div')
            configSection.className = 'descriptor-config'

            const configTitle = document.createElement('div')
            configTitle.className = 'config-title'
            configTitle.textContent = 'Config'
            configSection.appendChild(configTitle)

            configSection.appendChild(this.#createDataGrid(descriptor.config))
            card.appendChild(configSection)
        }

        const preview = this.#createSourcePreview(descriptor)
        if (preview) {
            card.appendChild(preview)
        }

        return card
    }


    #addDescriptorRow (container, label, value) {
        const labelEl = document.createElement('div')
        labelEl.className = 'descriptor-label'
        labelEl.textContent = label

        const valueEl = document.createElement('div')
        valueEl.className = 'descriptor-value'
        valueEl.textContent = value

        container.appendChild(labelEl)
        container.appendChild(valueEl)
    }


    #addDescriptorRowElement (container, label, element) {
        const labelEl = document.createElement('div')
        labelEl.className = 'descriptor-label'
        labelEl.textContent = label

        const valueEl = document.createElement('div')
        valueEl.className = 'descriptor-value'
        valueEl.appendChild(element)

        container.appendChild(labelEl)
        container.appendChild(valueEl)
    }


    #getDescriptorIcon (descriptor) {
        const type = descriptor.type?.toLowerCase() || ''

        if (type.includes('texture') || type.includes('image') || type.includes('sprite')) {
            return '🖼'
        }
        if (type.includes('audio') || type.includes('sound') || type.includes('music')) {
            return '🔊'
        }
        if (type.includes('font')) {
            return '🔤'
        }
        if (type.includes('shader')) {
            return '✨'
        }
        if (type.includes('scene')) {
            return '🎬'
        }
        if (type.includes('script')) {
            return '📜'
        }
        if (type.includes('data') || type.includes('json')) {
            return '📄'
        }

        return '📦'
    }


    #createSourcePreview (descriptor) {
        const source = descriptor.source

        if (!source) {
            return null
        }

        if (source instanceof HTMLImageElement || source instanceof HTMLCanvasElement) {
            const preview = document.createElement('div')
            preview.className = 'descriptor-preview'

            if (source instanceof HTMLImageElement) {
                const img = document.createElement('img')
                img.src = source.src
                img.alt = descriptor.name || descriptor.id
                preview.appendChild(img)
            } else {
                const img = document.createElement('img')
                img.src = source.toDataURL()
                img.alt = descriptor.name || descriptor.id
                preview.appendChild(img)
            }

            return preview
        }

        return null
    }

}


customElements.define('manifest-inspector', ManifestInspector)
