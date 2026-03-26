import EditorComponent from '../editor/editor_component.js'
import {createElement, adoptStyleSheets} from '../application/dom_utils.js'
import {pluralize} from '../core/utils.js'
import {flash} from '../editor/flash.js'
import PerkyStore from '../io/perky_store.js'
import {blobToText, blobToImage} from '../io/canvas.js'
import {pickFile} from '../application/file_utils.js'
import {hubViewStyles} from './hub_view.styles.js'
import '../editor/layout/app_layout.js'
import './components/psd_importer.js'
import './components/conflict_resolver.js'
import './components/storage_info.js'


export default class HubView extends EditorComponent {

    #manifest = null
    #animators = {}
    #scenes = {}
    #customAnimators = {}
    #customScenes = {}
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
    #updateBtn = null

    onConnected () {
        adoptStyleSheets(this.shadowRoot, hubViewStyles)
        this.#buildDOM()
    }


    setContext ({manifest, animators, textureSystem, scenes}) {
        this.#manifest = manifest
        this.#animators = animators || {}
        this.#scenes = scenes || {}
        this.#textureSystem = textureSystem

        if (this.isConnected) {
            this.#render()
        }
    }


    #buildDOM () {
        this.#appLayout = createElement('app-layout', {
            attrs: {'no-menu': '', 'no-close': '', 'no-footer': ''}
        })

        const storageInfo = createElement('storage-info', {
            attrs: {slot: 'header-start'}
        })
        this.#appLayout.appendChild(storageInfo)

        const headerActions = this.#buildHeaderActions()
        this.#appLayout.appendChild(headerActions)

        this.#contentEl = createElement('div', {class: 'hub-content'})
        this.#appLayout.appendChild(this.#contentEl)

        this.shadowRoot.appendChild(this.#appLayout)
        this.#render()
    }


    #buildHeaderActions () {
        const container = createElement('div', {
            class: 'header-actions',
            attrs: {slot: 'header-end'}
        })

        const defaultActions = createElement('div', {class: 'default-actions'})
        const previewBtn = createElement('button', {text: '\u25B6 Preview'})
        previewBtn.addEventListener('click', () => {
            window.location.href = '../index.html?studio&preview'
        })
        const importBtn = createElement('button', {text: 'Import'})
        importBtn.addEventListener('click', () => this.#importFile())
        defaultActions.appendChild(previewBtn)
        defaultActions.appendChild(importBtn)

        const selectionActions = createElement('div', {class: 'selection-actions'})
        this.#updateBtn = createElement('button', {text: 'Update'})
        this.#updateBtn.addEventListener('click', () => this.#updateSelected())
        this.#exportBtn = createElement('button', {text: 'Export'})
        this.#exportBtn.addEventListener('click', () => this.#exportSelected())
        this.#revertBtn = createElement('button', {text: 'Revert', class: 'warning'})
        this.#revertBtn.addEventListener('click', () => this.#revertSelected())
        this.#deleteBtn = createElement('button', {text: 'Delete', class: 'danger'})
        this.#deleteBtn.addEventListener('click', () => this.#deleteSelected())
        selectionActions.appendChild(this.#updateBtn)
        selectionActions.appendChild(this.#exportBtn)
        selectionActions.appendChild(this.#revertBtn)
        selectionActions.appendChild(this.#deleteBtn)

        this.#selectBtn = createElement('button', {text: 'Select'})
        this.#selectBtn.addEventListener('click', () => this.#toggleSelectionMode())

        container.appendChild(defaultActions)
        container.appendChild(selectionActions)
        container.appendChild(this.#selectBtn)

        return container
    }


    async #render () {
        await this.#loadCustomAnimators()
        await this.#loadCustomScenes()
        await this.#reconcile()

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

        const hasScenes = Object.keys(this.#scenes).length > 0
            || Object.keys(this.#customScenes).length > 0
        if (hasScenes) {
            this.#contentEl.appendChild(this.#buildScenesSection())
        }

        this.#contentEl.appendChild(section)
    }


    #buildScenesSection () {
        const section = createElement('div', {class: 'section'})
        section.appendChild(createElement('h2', {class: 'section-title', text: 'Scenes'}))

        const grid = createElement('div', {class: 'animator-grid'})
        const renderedCustoms = new Set()

        for (const name of Object.keys(this.#scenes)) {
            const state = this.#customScenes[name] ? 'modified' : 'game'
            grid.appendChild(this.#createSceneCard(name, state))
            if (this.#customScenes[name]) {
                renderedCustoms.add(name)
            }
        }

        for (const name of Object.keys(this.#customScenes)) {
            if (!renderedCustoms.has(name)) {
                grid.appendChild(this.#createSceneCard(name, 'custom'))
            }
        }

        section.appendChild(grid)
        return section
    }


    #createSceneCard (name, state = 'game') {
        const card = createElement('div', {class: 'animator-card selectable'})
        const isCustom = state === 'custom' || state === 'modified'
        card.dataset.name = name

        const preview = createElement('div', {class: 'card-preview'})
        preview.appendChild(createElement('div', {class: 'create-icon', text: '\u25A6'}))

        if (state === 'custom') {
            preview.appendChild(createElement('div', {class: 'card-badge', text: 'New'}))
        } else if (state === 'modified') {
            preview.appendChild(createElement('div', {class: 'card-badge modified', text: 'Modified'}))
        }

        const checkbox = createElement('div', {class: 'card-checkbox'})
        checkbox.dataset.name = name
        preview.appendChild(checkbox)

        card.appendChild(preview)

        const info = createElement('div', {class: 'card-info'})
        info.appendChild(createElement('div', {class: 'card-title', text: name}))
        info.appendChild(createElement('div', {class: 'card-meta', text: 'Scene'}))
        card.appendChild(info)

        card.addEventListener('click', () => {
            if (this.#selectionMode) {
                const cardCheckbox = card.querySelector('.card-checkbox')
                cardCheckbox.classList.toggle('selected')
                this.#toggleItemSelection(name)
            } else {
                const url = isCustom
                    ? `scene.html?id=${encodeURIComponent(name)}&custom=1`
                    : `scene.html?id=${encodeURIComponent(name)}`
                window.location.href = url
            }
        })

        return card
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


    async #loadCustomScenes () {
        const resources = await this.#store.list('scene')

        for (const resource of resources) {
            if (this.#customScenes[resource.id]) {
                continue
            }

            const full = await this.#store.get(resource.id)
            if (!full) {
                continue
            }

            const jsonFile = full.files.find(f => f.name.endsWith('.json'))
            if (!jsonFile) {
                continue
            }

            const configText = await blobToText(jsonFile.blob)
            this.#customScenes[resource.id] = JSON.parse(configText)
            this.#customMeta.set(resource.id, {updatedAt: resource.updatedAt || 0})
        }
    }


    async #reconcile () {
        const synced = []
        const conflicts = []
        const customIds = [
            ...Object.keys(this.#customAnimators),
            ...Object.keys(this.#customScenes)
        ]

        for (const id of customIds) {
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
        if (!this.#animators[id] && !this.#scenes[id]) {
            return 'custom-only'
        }
        return compareCustomToGame(
            this.#manifest?.getAsset?.(id)?.updatedAt || 0,
            this.#customMeta.get(id)?.updatedAt || 0,
            id
        )
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
        delete this.#customScenes[id]
        this.#customMeta.delete(id)
        this.#thumbnails.delete(id)
        localStorage.removeItem(`${SEEN_KEY_PREFIX}${id}`)
    }


    #createAnimatorCard (name, config, state = 'game') {
        const card = createElement('div', {class: 'animator-card selectable'})
        const isCustom = state === 'custom' || state === 'modified'
        card.dataset.name = name

        const preview = createElement('div', {class: 'card-preview'})
        const thumbnail = this.#createThumbnail(name, config)
        preview.appendChild(thumbnail)

        if (state === 'custom') {
            preview.appendChild(createElement('div', {class: 'card-badge', text: 'New'}))
        } else if (state === 'modified') {
            preview.appendChild(createElement('div', {class: 'card-badge modified', text: 'Modified'}))
        }

        const checkbox = createElement('div', {class: 'card-checkbox'})
        checkbox.dataset.name = name
        preview.appendChild(checkbox)

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
            if (this.#selectionMode) {
                const cardCheckbox = card.querySelector('.card-checkbox')
                cardCheckbox.classList.toggle('selected')
                this.#toggleItemSelection(name)
            } else {
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
        this.#customMeta.set(animatorName, {updatedAt: Date.now()})

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
        this.#clearCheckboxes()

        if (this.#selectionMode) {
            this.setAttribute('selection-mode', '')
            this.#selectBtn.textContent = 'Done'
        } else {
            this.removeAttribute('selection-mode')
            this.#selectBtn.textContent = 'Select'
        }

        this.#updateActionButtons()
    }


    #clearCheckboxes () {
        const checkboxes = this.shadowRoot.querySelectorAll('.card-checkbox.selected')
        for (const cb of checkboxes) {
            cb.classList.remove('selected')
        }
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
        this.#updateBtn.disabled = this.#selectedItems.size !== 1

        const hasRevertable = [...this.#selectedItems].some(id =>
            this.#animators[id] || this.#scenes[id])
        this.#revertBtn.disabled = !hasRevertable
    }


    async #importFile () {
        const file = await pickFile('.perky')
        if (!file) {
            return
        }
        const result = await this.#store.import(file)
        const imported = Array.isArray(result) ? result : [result]
        const names = imported.map(r => r.name).join(', ')
        flash(`Imported: ${names}`, 'success')
        this.#render()
    }


    #updateSelected () {
        if (this.#selectedItems.size !== 1) {
            return
        }

        const name = [...this.#selectedItems][0]
        this.#toggleSelectionMode()
        this.#openPsdImporterForUpdate(name)
    }


    #openPsdImporterForUpdate (name) {
        if (!this.#psdImporter) {
            this.#psdImporter = document.createElement('psd-importer')
            this.#psdImporter.addEventListener('complete', (e) => this.#handleImportComplete(e))
            this.shadowRoot.appendChild(this.#psdImporter)
        }
        this.#psdImporter.setTargetName(name)
        this.#psdImporter.open()
    }


    async #exportSelected () {
        if (this.#selectedItems.size === 0) {
            return
        }

        const exported = await this.#store.exportBundle([...this.#selectedItems])

        if (exported) {
            flash(`Exported ${exported} ${pluralize('resource', exported)}`, 'success')
        } else {
            flash('Nothing to export — no custom changes found', 'warning')
        }
    }


    async #revertSelected () {
        const revertable = [...this.#selectedItems].filter(id =>
            this.#animators[id] || this.#scenes[id])

        if (revertable.length === 0) {
            return
        }

        const message = revertable.length === 1
            ? `Revert "${revertable[0]}" to native version?`
            : `Revert ${revertable.length} items to native version?`

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
        if (this.#selectedItems.size === 0) {
            return
        }

        const count = this.#selectedItems.size
        const message = count === 1
            ? `Delete "${[...this.#selectedItems][0]}"?`
            : `Delete ${count} items?`

        if (!confirm(message)) {
            return
        }

        for (const name of this.#selectedItems) {
            await this.#store.delete(name)
            delete this.#customAnimators[name]
            this.#customMeta.delete(name)
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


function compareCustomToGame (gameUpdatedAt, customUpdatedAt, id) {
    if (gameUpdatedAt >= customUpdatedAt) {
        return 'synced'
    }

    const lastSeen = getLastSeenGameUpdate(id)
    if (lastSeen >= gameUpdatedAt) {
        return 'modified'
    }
    return 'conflict'
}


const SEEN_KEY_PREFIX = 'perky-seen-game-'


function getLastSeenGameUpdate (id) {
    return Number(localStorage.getItem(`${SEEN_KEY_PREFIX}${id}`)) || 0
}


function setLastSeenGameUpdate (id, timestamp) {
    localStorage.setItem(`${SEEN_KEY_PREFIX}${id}`, String(timestamp))
}
