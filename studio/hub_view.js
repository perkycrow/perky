import EditorComponent from '../editor/editor_component.js'
import {createElement, adoptStyleSheets, createStyleSheet} from '../application/dom_utils.js'
import {pluralize} from '../core/utils.js'
import PerkyStore from '../io/perky_store.js'
import '../editor/layout/app_layout.js'
import './components/psd_importer.js'
import './components/conflict_resolver.js'
import './components/storage_info.js'


const hubViewStyles = createStyleSheet(`
    :host {
        display: block;
        height: 100%;
        width: 100%;
    }

    .hub-content {
        padding: var(--spacing-xl);
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }

    .section-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--fg-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: var(--spacing-lg);
        padding-left: var(--spacing-sm);
    }

    .animator-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: var(--spacing-lg);
    }

    .animator-card {
        background: var(--bg-secondary);
        border-radius: var(--radius-lg);
        overflow: hidden;
        cursor: pointer;
        transition: transform var(--transition-normal), background var(--transition-normal);
        -webkit-tap-highlight-color: transparent;
    }

    .animator-card:hover {
        background: var(--bg-hover);
        transform: scale(1.02);
    }

    .animator-card:active {
        transform: scale(0.98);
    }

    .card-preview {
        aspect-ratio: 1;
        background: var(--bg-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }

    .card-preview canvas {
        max-width: 80%;
        max-height: 80%;
        image-rendering: pixelated;
    }

    .card-preview .placeholder {
        width: 48px;
        height: 48px;
        background: var(--bg-hover);
        border-radius: var(--radius-md);
    }

    .card-info {
        padding: var(--spacing-md);
    }

    .card-title {
        font-size: var(--font-size-lg);
        font-weight: 500;
        color: var(--fg-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .card-meta {
        font-size: var(--font-size-sm);
        color: var(--fg-muted);
        margin-top: 2px;
    }

    .create-card {
        border: 2px dashed var(--border);
        background: transparent;
    }

    .create-card:hover {
        border-color: var(--accent);
        background: var(--bg-hover);
    }

    .create-card .card-preview {
        background: transparent;
    }

    .create-icon {
        font-size: 32px;
        color: var(--fg-muted);
    }

    .create-card:hover .create-icon {
        color: var(--accent);
    }

    .card-badge {
        position: absolute;
        top: var(--spacing-sm);
        right: var(--spacing-sm);
        padding: 2px 6px;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        background: var(--accent);
        color: var(--bg-primary);
        border-radius: var(--radius-sm);
    }

    .card-badge.modified {
        background: var(--warning, #f90);
    }

    .card-preview {
        position: relative;
    }

    .card-checkbox {
        position: absolute;
        top: var(--spacing-sm);
        right: var(--spacing-sm);
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid var(--fg-muted);
        background: var(--bg-secondary);
        display: none;
        align-items: center;
        justify-content: center;
        transition: all var(--transition-fast);
    }

    :host([selection-mode]) .card-checkbox {
        display: flex;
    }

    :host([selection-mode]) .card-badge {
        display: none;
    }

    .card-checkbox.selected {
        background: var(--accent);
        border-color: var(--accent);
    }

    .card-checkbox.selected::after {
        content: '';
        width: 8px;
        height: 8px;
        background: var(--bg-primary);
        border-radius: 50%;
    }

    :host([selection-mode]) .animator-card:not(.selectable) {
        opacity: 0.5;
        pointer-events: none;
    }

    :host([selection-mode]) .create-card {
        display: none;
    }
`)


export default class HubView extends EditorComponent {

    #manifest = null
    #animators = {}
    #customAnimators = {}
    #textureSystem = null
    #appLayout = null
    #contentEl = null
    #psdImporter = null
    #thumbnails = new Map()
    #customMeta = new Map()
    #store = new PerkyStore()
    #conflictResolver = null
    #selectionMode = false
    #selectedItems = new Set()
    #selectBtn = null
    #exportBtn = null
    #deleteBtn = null
    #revertBtn = null
    #playBtn = null

    onConnected () {
        adoptStyleSheets(this.shadowRoot, hubViewStyles)
        this.#buildDOM()
    }


    setContext ({manifest, animators, textureSystem}) {
        this.#manifest = manifest
        this.#animators = animators || {}
        this.#textureSystem = textureSystem

        if (this.isConnected) {
            this.#render()
        }
    }


    #buildDOM () {
        this.#appLayout = createElement('app-layout', {
            attrs: {'no-menu': '', 'no-close': '', 'no-footer': ''}
        })

        const storageInfo = document.createElement('storage-info')
        storageInfo.setAttribute('slot', 'header-center')
        this.#appLayout.appendChild(storageInfo)

        const headerActions = this.#buildHeaderActions()
        headerActions.setAttribute('slot', 'header-end')
        this.#appLayout.appendChild(headerActions)

        this.#contentEl = createElement('div', {class: 'hub-content'})
        this.#appLayout.appendChild(this.#contentEl)

        this.shadowRoot.appendChild(this.#appLayout)
        this.#render()
    }


    #buildHeaderActions () {
        const container = createElement('div')
        container.style.cssText = 'display: flex; gap: 8px;'

        const btnStyle = `
            padding: 8px 12px;
            background: transparent;
            border: none;
            color: var(--accent);
            font-size: var(--font-size-md);
            font-family: var(--font-mono);
            cursor: pointer;
            border-radius: var(--radius-md);
            min-height: 44px;
        `

        this.#exportBtn = createElement('button', {text: 'Export'})
        this.#exportBtn.style.cssText = btnStyle + 'display: none;'
        this.#exportBtn.addEventListener('click', () => this.#exportSelected())

        this.#revertBtn = createElement('button', {text: 'Revert'})
        this.#revertBtn.style.cssText = btnStyle + 'display: none; color: var(--warning, #f90);'
        this.#revertBtn.addEventListener('click', () => this.#revertSelected())

        this.#deleteBtn = createElement('button', {text: 'Delete'})
        this.#deleteBtn.style.cssText = btnStyle + 'display: none; color: #f66;'
        this.#deleteBtn.addEventListener('click', () => this.#deleteSelected())

        this.#selectBtn = createElement('button', {text: 'Select'})
        this.#selectBtn.style.cssText = btnStyle
        this.#selectBtn.addEventListener('click', () => this.#toggleSelectionMode())

        this.#playBtn = createElement('button', {text: '\u25B6 Preview'})
        this.#playBtn.style.cssText = btnStyle + 'background: var(--accent); color: var(--bg-primary); font-weight: 600;'
        this.#playBtn.addEventListener('click', () => {
            window.location.href = '../index.html?studio'
        })

        container.appendChild(this.#playBtn)
        container.appendChild(this.#exportBtn)
        container.appendChild(this.#revertBtn)
        container.appendChild(this.#deleteBtn)
        container.appendChild(this.#selectBtn)

        return container
    }


    async #render () {
        await this.#loadCustomAnimators()
        await this.#reconcile()

        const hasCustoms = Object.keys(this.#customAnimators).length > 0
        this.#selectBtn.style.display = hasCustoms ? 'block' : 'none'

        const section = createElement('div', {class: 'section'})
        section.appendChild(createElement('h2', {class: 'section-title', text: 'Animators'}))

        const grid = createElement('div', {class: 'animator-grid'})
        const renderedCustoms = new Set()

        for (const [name, config] of Object.entries(this.#animators)) {
            if (this.#customAnimators[name]) {
                grid.appendChild(this.#createAnimatorCard(name, this.#customAnimators[name], 'modified'))
                renderedCustoms.add(name)
            } else {
                grid.appendChild(this.#createAnimatorCard(name, config, 'game'))
            }
        }

        for (const [name, config] of Object.entries(this.#customAnimators)) {
            if (!renderedCustoms.has(name)) {
                grid.appendChild(this.#createAnimatorCard(name, config, 'custom'))
            }
        }

        grid.appendChild(this.#createNewAnimatorCard())
        section.appendChild(grid)

        this.#contentEl.innerHTML = ''
        this.#contentEl.appendChild(section)
    }


    async #loadCustomAnimators () {
        const resources = await this.#store.list('animator')

        for (const resource of resources) {
            if (this.#customAnimators[resource.id]) {
                continue
            }

            const full = await this.#store.get(resource.id)
            if (!full) {
                continue
            }

            const configFile = full.files.find(f => f.name.endsWith('Animator.json'))
            if (!configFile) {
                continue
            }

            const configText = await blobToText(configFile.blob)
            const config = JSON.parse(configText)

            this.#customAnimators[resource.id] = config
            this.#customMeta.set(resource.id, {updatedAt: resource.updatedAt || 0})

            if (!this.#thumbnails.has(resource.id)) {
                const thumbnail = await extractThumbnailFromPerky(full.files)
                if (thumbnail) {
                    this.#thumbnails.set(resource.id, thumbnail)
                }
            }
        }
    }


    async #reconcile () {
        const synced = []
        const conflicts = []

        for (const id of Object.keys(this.#customAnimators)) {
            const state = this.#compareVersions(id)
            if (state === 'synced') {
                synced.push(id)
            } else if (state === 'conflict') {
                conflicts.push(id)
            }
        }

        for (const id of synced) {
            await this.#deleteCustom(id)
        }

        if (conflicts.length > 0) {
            await this.#resolveConflicts(conflicts)
        }
    }


    #compareVersions (id) {
        if (!this.#animators[id]) {
            return 'custom-only'
        }
        const gameUpdatedAt = this.#manifest?.getAsset?.(id)?.updatedAt || 0
        const customUpdatedAt = this.#customMeta.get(id)?.updatedAt || 0

        if (gameUpdatedAt >= customUpdatedAt) {
            return 'synced'
        }

        const lastSeen = getLastSeenGameUpdate(id)
        if (lastSeen >= gameUpdatedAt) {
            return 'modified'
        }
        return 'conflict'
    }


    async #resolveConflicts (ids) {
        if (!this.#conflictResolver) {
            this.#conflictResolver = document.createElement('conflict-resolver')
            this.shadowRoot.appendChild(this.#conflictResolver)
        }

        const conflicts = ids.map(id => ({
            id,
            name: id,
            customDate: this.#customMeta.get(id)?.updatedAt || 0,
            gameDate: this.#manifest?.getAsset?.(id)?.updatedAt || 0
        }))
        const choices = await this.#conflictResolver.resolve(conflicts)

        for (const {id, choice} of choices) {
            if (choice === 'game') {
                await this.#deleteCustom(id)
            } else {
                const gameUpdatedAt = this.#manifest?.getAsset?.(id)?.updatedAt || 0
                setLastSeenGameUpdate(id, gameUpdatedAt)
            }
        }
    }


    async #deleteCustom (id) {
        await this.#store.delete(id)
        delete this.#customAnimators[id]
        this.#customMeta.delete(id)
        this.#thumbnails.delete(id)
        localStorage.removeItem(`${SEEN_KEY_PREFIX}${id}`)
    }


    #createAnimatorCard (name, config, state = 'game') {
        const card = createElement('div', {class: 'animator-card'})
        const isCustom = state === 'custom' || state === 'modified'

        if (isCustom) {
            card.classList.add('selectable')
            card.dataset.name = name
        }

        const preview = createElement('div', {class: 'card-preview'})
        const thumbnail = this.#createThumbnail(name, config)
        preview.appendChild(thumbnail)

        if (state === 'custom') {
            preview.appendChild(createElement('div', {class: 'card-badge', text: 'Custom'}))
        } else if (state === 'modified') {
            preview.appendChild(createElement('div', {class: 'card-badge modified', text: 'Modified'}))
        }

        if (isCustom) {
            const checkbox = createElement('div', {class: 'card-checkbox'})
            checkbox.dataset.name = name
            preview.appendChild(checkbox)
        }

        const info = createElement('div', {class: 'card-info'})
        info.appendChild(createElement('div', {class: 'card-title', text: name}))

        const animCount = config.animations ? Object.keys(config.animations).length : 0
        info.appendChild(createElement('div', {
            class: 'card-meta',
            text: pluralize('animation', animCount, true)
        }))

        card.appendChild(preview)
        card.appendChild(info)

        card.addEventListener('click', () => {
            if (this.#selectionMode && isCustom) {
                const checkbox = card.querySelector('.card-checkbox')
                checkbox.classList.toggle('selected')
                this.#toggleItemSelection(name)
            } else if (!this.#selectionMode) {
                this.#openAnimator(name, isCustom)
            }
        })

        return card
    }


    #createNewAnimatorCard () {
        const card = createElement('div', {class: 'animator-card create-card'})

        const preview = createElement('div', {class: 'card-preview'})
        preview.appendChild(createElement('div', {class: 'create-icon', text: '+'}))

        const info = createElement('div', {class: 'card-info'})
        info.appendChild(createElement('div', {class: 'card-title', text: 'New Animator'}))
        info.appendChild(createElement('div', {class: 'card-meta', text: 'Import from PSD'}))

        card.appendChild(preview)
        card.appendChild(info)

        card.addEventListener('click', () => this.#openPsdImporter())

        return card
    }


    #openPsdImporter () {
        if (!this.#psdImporter) {
            this.#psdImporter = document.createElement('psd-importer')
            this.#psdImporter.addEventListener('complete', (e) => this.#handleImportComplete(e))
            this.shadowRoot.appendChild(this.#psdImporter)
        }
        const existingNames = [
            ...Object.keys(this.#animators),
            ...Object.keys(this.#customAnimators)
        ]
        this.#psdImporter.setExistingNames(existingNames)
        this.#psdImporter.open()
    }


    #handleImportComplete (e) {
        const {name, animatorConfig, atlases} = e.detail
        const animatorName = `${name}Animator`

        this.#customAnimators[animatorName] = animatorConfig

        if (atlases?.length > 0 && atlases[0].canvas && atlases[0].frames?.length > 0) {
            const atlas = atlases[0]
            const firstFrame = atlas.frames[0]

            const thumbCanvas = document.createElement('canvas')
            thumbCanvas.width = firstFrame.width
            thumbCanvas.height = firstFrame.height
            const ctx = thumbCanvas.getContext('2d')
            ctx.drawImage(
                atlas.canvas,
                firstFrame.x, firstFrame.y, firstFrame.width, firstFrame.height,
                0, 0, firstFrame.width, firstFrame.height
            )
            this.#thumbnails.set(animatorName, thumbCanvas)
        }

        this.#render()

        this.dispatchEvent(new CustomEvent('animatorcreated', {
            bubbles: true,
            detail: e.detail
        }))
    }


    #createThumbnail (name, config) {
        const cached = this.#thumbnails.get(name)
        if (cached) {
            const canvas = document.createElement('canvas')
            canvas.width = cached.width
            canvas.height = cached.height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(cached, 0, 0)
            return canvas
        }

        const region = this.#getFirstFrameRegion(config)
        if (!region) {
            return createElement('div', {class: 'placeholder'})
        }

        const canvas = document.createElement('canvas')
        canvas.width = region.width
        canvas.height = region.height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(
            region.image,
            region.x, region.y, region.width, region.height,
            0, 0, region.width, region.height
        )

        return canvas
    }


    #getFirstFrameRegion (config) {
        if (!config.animations || !this.#textureSystem) {
            return null
        }

        const firstAnim = getFirstAnimation(config)
        if (!firstAnim?.frames?.length) {
            return null
        }

        const source = getFrameSource(firstAnim.frames[0])
        if (!source) {
            return null
        }

        return this.#resolveRegion(source, config.spritesheet)
    }


    #resolveRegion (source, defaultSpritesheet) {
        const [spritesheetName, frameName] = source.includes(':')
            ? source.split(':')
            : [defaultSpritesheet, source]

        const spritesheet = this.#textureSystem.getSpritesheet(spritesheetName)
        return spritesheet?.getRegion(frameName) || null
    }


    #openAnimator (name, isCustom = false) {
        this.dispatchEvent(new CustomEvent('navigate', {detail: {name, isCustom}}))
        const url = isCustom
            ? `animator.html?id=${encodeURIComponent(name)}&custom=1`
            : `animator.html?id=${encodeURIComponent(name)}`
        window.location.href = url
    }


    #toggleSelectionMode () {
        this.#selectionMode = !this.#selectionMode
        this.#selectedItems.clear()

        if (this.#selectionMode) {
            this.setAttribute('selection-mode', '')
            this.#selectBtn.textContent = 'Done'
            this.#exportBtn.style.display = 'block'
            this.#revertBtn.style.display = 'block'
            this.#deleteBtn.style.display = 'block'
        } else {
            this.removeAttribute('selection-mode')
            this.#selectBtn.textContent = 'Select'
            this.#exportBtn.style.display = 'none'
            this.#revertBtn.style.display = 'none'
            this.#deleteBtn.style.display = 'none'
        }

        this.#updateActionButtons()
    }


    #toggleItemSelection (name) {
        if (this.#selectedItems.has(name)) {
            this.#selectedItems.delete(name)
        } else {
            this.#selectedItems.add(name)
        }
        this.#updateActionButtons()
    }


    #updateActionButtons () {
        const hasSelection = this.#selectedItems.size > 0
        this.#exportBtn.disabled = !hasSelection
        this.#deleteBtn.disabled = !hasSelection

        const hasModified = [...this.#selectedItems].some(id => this.#animators[id])
        this.#revertBtn.disabled = !hasModified
    }


    async #exportSelected () {
        for (const name of this.#selectedItems) {
            await this.#store.export(name)
        }
    }


    async #revertSelected () {
        const revertable = [...this.#selectedItems].filter(id => this.#animators[id])
        if (revertable.length === 0) {
            return
        }

        const message = revertable.length === 1
            ? `Revert "${revertable[0]}" to native version?`
            : `Revert ${revertable.length} animators to native version?`

        if (!confirm(message)) {
            return
        }

        for (const id of revertable) {
            await this.#deleteCustom(id)
        }

        this.#selectedItems.clear()
        this.#toggleSelectionMode()
        this.#render()
    }


    async #deleteSelected () {
        const count = this.#selectedItems.size
        const message = count === 1
            ? `Delete "${[...this.#selectedItems][0]}"?`
            : `Delete ${count} animators?`

        if (!confirm(message)) {
            return
        }

        for (const name of this.#selectedItems) {
            await this.#store.delete(name)
            delete this.#customAnimators[name]
            this.#thumbnails.delete(name)
        }

        this.#selectedItems.clear()
        this.#toggleSelectionMode()
        this.#render()
    }

}


customElements.define('hub-view', HubView)


function getFirstAnimation (config) {
    const firstKey = Object.keys(config.animations)[0]
    return config.animations[firstKey]
}


function getFrameSource (frame) {
    return typeof frame === 'string' ? frame : frame.source
}


function blobToText (blob) {
    if (typeof blob.text === 'function') {
        return blob.text()
    }
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsText(blob)
    })
}


function blobToImage (blob) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob)
        const img = new Image()
        img.onload = () => {
            URL.revokeObjectURL(url)
            resolve(img)
        }
        img.onerror = () => {
            URL.revokeObjectURL(url)
            reject(new Error('Failed to load image'))
        }
        img.src = url
    })
}


async function extractThumbnailFromPerky (files) {
    const spritesheetJsonFile = files.find(f => f.name.endsWith('Spritesheet.json'))
    if (!spritesheetJsonFile) {
        return null
    }

    const spritesheetJson = JSON.parse(await blobToText(spritesheetJsonFile.blob))

    const firstFrameName = Object.keys(spritesheetJson.frames)[0]
    if (!firstFrameName) {
        return null
    }

    const frame = spritesheetJson.frames[firstFrameName]
    const pngFile = files.find(f => f.name.endsWith('_0.png'))
    if (!pngFile) {
        return null
    }

    const image = await blobToImage(pngFile.blob)

    const canvas = document.createElement('canvas')
    canvas.width = frame.frame.w
    canvas.height = frame.frame.h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(
        image,
        frame.frame.x, frame.frame.y, frame.frame.w, frame.frame.h,
        0, 0, frame.frame.w, frame.frame.h
    )

    return canvas
}


const SEEN_KEY_PREFIX = 'perky-seen-game-'


function getLastSeenGameUpdate (id) {
    return Number(localStorage.getItem(`${SEEN_KEY_PREFIX}${id}`)) || 0
}


function setLastSeenGameUpdate (id, timestamp) {
    localStorage.setItem(`${SEEN_KEY_PREFIX}${id}`, String(timestamp))
}
