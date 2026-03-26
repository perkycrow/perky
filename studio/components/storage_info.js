import EditorComponent from '../../editor/editor_component.js'
import {createElement, adoptStyleSheets} from '../../application/dom_utils.js'
import {formatBytes} from '../../core/utils.js'
import {storageInfoStyles} from './storage_info.styles.js'


export default class StorageInfo extends EditorComponent {

    #popoverEl = null
    #isOpen = false
    #boundClose = null

    onConnected () {
        adoptStyleSheets(this.shadowRoot, storageInfoStyles)
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
