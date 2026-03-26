import StudioTool from '../studio_tool.js'
import {createElement} from '../../application/dom_utils.js'
import {createStyleSheet} from '../../application/dom_utils.js'


const assetBrowserStyles = createStyleSheet(`
    :host {
        display: block;
        height: 100%;
    }

    .browser-container {
        height: 100%;
        overflow-y: auto;
        padding: var(--spacing-lg);
    }

    .search-input {
        width: 100%;
        padding: var(--spacing-sm) var(--spacing-md);
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        color: var(--fg-primary);
        font-family: var(--font-mono);
        font-size: var(--font-size-sm);
        margin-bottom: var(--spacing-lg);
        box-sizing: border-box;
    }

    .search-input:focus {
        outline: none;
        border-color: var(--accent);
    }

    .asset-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: var(--spacing-md);
    }

    .asset-card {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: var(--spacing-sm);
        cursor: pointer;
        transition: border-color var(--transition-fast);
    }

    .asset-card:hover {
        border-color: var(--accent);
    }

    .asset-card.selected {
        border-color: var(--accent);
        background: var(--bg-hover);
    }

    .asset-preview {
        width: 100%;
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-tertiary);
        border-radius: var(--radius-sm);
        overflow: hidden;
        margin-bottom: var(--spacing-xs);
    }

    .asset-preview img {
        max-width: 100%;
        max-height: 100%;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
    }

    .asset-name {
        font-size: var(--font-size-sm);
        color: var(--fg-primary);
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .asset-type {
        font-size: 10px;
        color: var(--fg-muted);
        text-align: center;
    }

    .empty {
        color: var(--fg-muted);
        text-align: center;
        padding: var(--spacing-xl);
    }
`)


export default class AssetBrowserView extends StudioTool {

    #context = null
    #containerEl = null
    #gridEl = null
    #filter = ''

    setContext ({manifest, textureSystem}) {
        this.#context = {manifest, textureSystem}

        if (this.isConnected) {
            this.init()
        }
    }


    hasContext () {
        return Boolean(this.#context)
    }


    init () {
        this.#renderAssets()
    }


    toolStyles () { // eslint-disable-line local/class-methods-use-this -- clean
        return [assetBrowserStyles]
    }


    buildContent () {
        this.#containerEl = createElement('div', {class: 'browser-container'})

        const searchInput = createElement('input', {
            class: 'search-input',
            attrs: {type: 'text', placeholder: 'Search assets...'}
        })
        searchInput.addEventListener('input', () => {
            this.#filter = searchInput.value.toLowerCase()
            this.#renderAssets()
        })
        this.#containerEl.appendChild(searchInput)

        this.#gridEl = createElement('div', {class: 'asset-grid'})
        this.#containerEl.appendChild(this.#gridEl)

        return this.#containerEl
    }


    #renderAssets () {
        if (!this.#gridEl || !this.#context?.manifest) {
            return
        }

        this.#gridEl.innerHTML = ''
        const manifest = this.#context.manifest
        const assets = manifest.listAssets?.() || []

        const filtered = assets.filter(asset =>
            !this.#filter || asset.id.toLowerCase().includes(this.#filter))

        if (filtered.length === 0) {
            this.#gridEl.appendChild(createElement('div', {class: 'empty', text: 'No assets found'}))
            return
        }

        for (const asset of filtered) {
            this.#gridEl.appendChild(this.#createAssetCard(asset))
        }
    }


    #createAssetCard (asset) {
        const card = createElement('div', {class: 'asset-card'})

        const preview = createElement('div', {class: 'asset-preview'})
        const source = this.#context.manifest.getSource(asset.id)

        if (source instanceof HTMLImageElement || source instanceof ImageBitmap) {
            const img = createElement('img')
            img.src = source instanceof HTMLImageElement ? source.src : ''
            preview.appendChild(img)
        }

        card.appendChild(preview)
        card.appendChild(createElement('div', {class: 'asset-name', text: asset.id}))
        card.appendChild(createElement('div', {class: 'asset-type', text: asset.type}))

        return card
    }

}


customElements.define('asset-browser-view', AssetBrowserView)
