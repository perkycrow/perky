import EditorComponent from '../editor/editor_component.js'
import {createElement, adoptStyleSheets, createStyleSheet} from '../application/dom_utils.js'
import {pluralize} from '../core/utils.js'
import '../editor/layout/app_layout.js'
import './components/psd_importer.js'


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
`)


export default class HubView extends EditorComponent {

    #manifest = null
    #animators = {}
    #textureSystem = null
    #appLayout = null
    #psdImporter = null
    #thumbnails = new Map()

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

        this.#appLayout.setTitle('Studio')

        this.shadowRoot.appendChild(this.#appLayout)
        this.#render()
    }


    #render () {
        const content = createElement('div', {class: 'hub-content'})

        const section = createElement('div', {class: 'section'})
        section.appendChild(createElement('h2', {class: 'section-title', text: 'Animators'}))

        const grid = createElement('div', {class: 'animator-grid'})

        for (const [name, config] of Object.entries(this.#animators)) {
            grid.appendChild(this.#createAnimatorCard(name, config))
        }

        grid.appendChild(this.#createNewAnimatorCard())
        section.appendChild(grid)
        content.appendChild(section)

        this.#appLayout.innerHTML = ''
        this.#appLayout.appendChild(content)
    }


    #createAnimatorCard (name, config) {
        const card = createElement('div', {class: 'animator-card'})

        const preview = createElement('div', {class: 'card-preview'})
        const thumbnail = this.#createThumbnail(name, config)
        preview.appendChild(thumbnail)

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
            this.#openAnimator(name)
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
        this.#psdImporter.setExistingNames(Object.keys(this.#animators))
        this.#psdImporter.open()
    }


    #handleImportComplete (e) {
        const {name, animatorConfig, atlases} = e.detail
        const animatorName = `${name}Animator`

        this.#animators[animatorName] = animatorConfig

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


    #openAnimator (name) {
        this.dispatchEvent(new CustomEvent('navigate', {detail: {name}}))
        window.location.href = `animator.html?id=${encodeURIComponent(name)}`
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
