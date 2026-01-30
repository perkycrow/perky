import EditorComponent from '../../editor/editor_component.js'
import {createElement, adoptStyleSheets, createStyleSheet} from '../../application/dom_utils.js'
import {formatBytes} from '../../core/utils.js'


const styles = createStyleSheet(`
    :host {
        display: block;
        position: relative;
    }

    .title-btn {
        background: none;
        border: none;
        font-size: var(--font-size-lg);
        font-weight: 500;
        color: var(--fg-primary);
        font-family: var(--font-mono);
        cursor: pointer;
        padding: 4px 8px;
        border-radius: var(--radius-md);
        -webkit-tap-highlight-color: transparent;
        transition: background var(--transition-normal);
    }

    .title-btn:hover {
        background: var(--bg-hover);
    }

    .title-btn:active {
        background: var(--bg-secondary);
    }

    .popover {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: var(--spacing-sm);
        background: var(--bg-secondary);
        border: 1px solid var(--border, #333);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        min-width: 240px;
        z-index: 100;
        opacity: 0;
        pointer-events: none;
        transition: opacity var(--transition-normal);
    }

    .popover.open {
        opacity: 1;
        pointer-events: auto;
    }

    .popover-section {
        margin-bottom: var(--spacing-md);
    }

    .popover-section:last-child {
        margin-bottom: 0;
    }

    .popover-label {
        font-size: var(--font-size-sm);
        color: var(--fg-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: var(--spacing-xs);
    }

    .popover-value {
        font-size: var(--font-size-md);
        color: var(--fg-primary);
        font-weight: 500;
    }

    .storage-bar {
        height: 6px;
        background: var(--bg-primary);
        border-radius: 3px;
        margin-top: var(--spacing-sm);
        overflow: hidden;
    }

    .storage-fill {
        height: 100%;
        background: var(--accent);
        border-radius: 3px;
        transition: width var(--transition-normal);
    }
`)


export default class StorageInfo extends EditorComponent {

    #popoverEl = null
    #isOpen = false
    #boundClose = null

    onConnected () {
        adoptStyleSheets(this.shadowRoot, styles)
        this.#buildDOM()
        this.#boundClose = (e) => this.#onOutsideClick(e)
    }


    onDisconnected () {
        document.removeEventListener('pointerdown', this.#boundClose)
    }


    #buildDOM () {
        const btn = createElement('button', {
            class: 'title-btn',
            text: 'Perky Studio'
        })
        btn.addEventListener('click', () => this.#toggle())

        this.#popoverEl = createElement('div', {class: 'popover'})

        this.shadowRoot.appendChild(btn)
        this.shadowRoot.appendChild(this.#popoverEl)
    }


    #toggle () {
        if (this.#isOpen) {
            this.#close()
        } else {
            this.#open()
        }
    }


    async #open () {
        this.#isOpen = true
        await this.#refreshContent()
        this.#popoverEl.classList.add('open')
        requestAnimationFrame(() => {
            document.addEventListener('pointerdown', this.#boundClose)
        })
    }


    #close () {
        this.#isOpen = false
        this.#popoverEl.classList.remove('open')
        document.removeEventListener('pointerdown', this.#boundClose)
    }


    #onOutsideClick (e) {
        if (!this.contains(e.target)) {
            this.#close()
        }
    }


    async #refreshContent () {
        this.#popoverEl.innerHTML = ''

        const storage = await estimateStorage()

        this.#popoverEl.appendChild(
            buildSection('Storage', `${storage.usedText} / ${storage.totalText}`)
        )

        const bar = createElement('div', {class: 'storage-bar'})
        const fill = createElement('div', {class: 'storage-fill'})
        fill.style.width = `${storage.percent}%`
        bar.appendChild(fill)
        this.#popoverEl.appendChild(bar)
    }

}


customElements.define('storage-info', StorageInfo)


function buildSection (label, value) {
    const section = createElement('div', {class: 'popover-section'})
    section.appendChild(createElement('div', {class: 'popover-label', text: label}))
    section.appendChild(createElement('div', {class: 'popover-value', text: value}))
    return section
}


async function estimateStorage () {
    try {
        const estimate = await navigator.storage.estimate()
        const used = estimate.usage || 0
        const total = estimate.quota || 0
        const percent = total > 0 ? Math.min(100, (used / total) * 100) : 0

        return {
            used,
            total,
            percent: Math.round(percent * 10) / 10,
            usedText: formatBytes(used),
            totalText: formatBytes(total)
        }
    } catch {
        return {used: 0, total: 0, percent: 0, usedText: '—', totalText: '—'}
    }
}



