import EditorComponent from '../editor/editor_component.js'
import {createElement, adoptStyleSheets, createStyleSheet} from '../application/dom_utils.js'
import Inflector from '../core/inflector.js'
import '../editor/layout/app_layout.js'


const inflector = new Inflector()


function getFirstAnimation (config) {
    const firstKey = Object.keys(config.animations)[0]
    return config.animations[firstKey]
}


function getFrameSource (frame) {
    return typeof frame === 'string' ? frame : frame.source
}


function createEmptyStateElement () {
    const empty = createElement('div', {class: 'empty-state'})
    empty.appendChild(createElement('div', {class: 'empty-state-icon', text: '🎬'}))
    empty.appendChild(createElement('div', {text: 'No animators found'}))
    empty.appendChild(createElement('div', {
        class: 'card-meta',
        text: 'Add animator assets to your manifest.json'
    }))
    return empty
}


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

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: var(--fg-muted);
        text-align: center;
        gap: var(--spacing-md);
    }

    .empty-state-icon {
        font-size: 48px;
        opacity: 0.5;
    }
`)


export default class HubView extends EditorComponent {

    #manifest = null
    #animators = {}
    #textureSystem = null
    #appLayout = null

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

        const animatorNames = Object.keys(this.#animators)

        if (animatorNames.length === 0) {
            content.appendChild(this.#createEmptyState())
        } else {
            const section = createElement('div', {class: 'section'})
            section.appendChild(createElement('h2', {class: 'section-title', text: 'Animators'}))

            const grid = createElement('div', {class: 'animator-grid'})

            for (const name of animatorNames) {
                const config = this.#animators[name]
                const card = this.#createAnimatorCard(name, config)
                grid.appendChild(card)
            }

            section.appendChild(grid)
            content.appendChild(section)
        }

        this.#appLayout.innerHTML = ''
        this.#appLayout.appendChild(content)
    }


    #createAnimatorCard (name, config) {
        const card = createElement('div', {class: 'animator-card'})

        const preview = createElement('div', {class: 'card-preview'})
        const thumbnail = this.#createThumbnail(config)
        preview.appendChild(thumbnail)

        const info = createElement('div', {class: 'card-info'})
        info.appendChild(createElement('div', {class: 'card-title', text: name}))

        const animCount = config.animations ? Object.keys(config.animations).length : 0
        info.appendChild(createElement('div', {
            class: 'card-meta',
            text: inflector.pluralize('animation', animCount, true)
        }))

        card.appendChild(preview)
        card.appendChild(info)

        card.addEventListener('click', () => {
            this.#openAnimator(name)
        })

        return card
    }


    #createThumbnail (config) {
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


    #createEmptyState () {
        return this.shadowRoot && createEmptyStateElement()
    }


    #openAnimator (name) {
        this.dispatchEvent(new CustomEvent('navigate', {detail: {name}}))
        window.location.href = `animator.html?id=${encodeURIComponent(name)}`
    }

}


customElements.define('hub-view', HubView)
