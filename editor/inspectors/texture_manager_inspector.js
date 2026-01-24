import BaseInspector from './base_inspector.js'
import PerkyExplorerDetails from '../perky_explorer_details.js'
import WebGLTextureManager from '../../render/webgl_texture_manager.js'
import {formatBytes} from '../../core/utils.js'
import {createElement} from '../../application/dom_utils.js'
import logger from '../../core/logger.js'


export default class TextureManagerInspector extends BaseInspector {

    static matches (module) {
        return module instanceof WebGLTextureManager
    }

    static styles = `
    .inspector-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 10px;
    }

    .stat-card {
        background: var(--bg-hover);
        border-radius: 4px;
        padding: 8px 10px;
    }

    .stat-label {
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--fg-muted);
        margin-bottom: 2px;
    }

    .stat-value {
        font-size: 14px;
        font-weight: 600;
        color: var(--fg-primary);
    }

    .stat-value.active {
        color: var(--status-started);
    }

    .stat-value.zombie {
        color: var(--status-warning);
    }

    .stat-sub {
        font-size: 10px;
        color: var(--fg-muted);
        margin-top: 1px;
    }

    .progress-section {
        margin-bottom: 10px;
    }

    .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
    }

    .progress-label {
        font-size: 10px;
        color: var(--fg-muted);
    }

    .progress-value {
        font-size: 10px;
        color: var(--fg-secondary);
        font-family: var(--font-mono);
    }

    .progress-bar-container {
        height: 6px;
        background: var(--bg-primary);
        border-radius: 3px;
        overflow: hidden;
    }

    .progress-bar {
        height: 100%;
        background: var(--accent);
        border-radius: 3px;
        transition: width 0.3s ease, background 0.3s ease;
        min-width: 2px;
    }

    .progress-bar.low {
        background: var(--status-started);
    }

    .progress-bar.medium {
        background: var(--status-warning);
    }

    .progress-bar.high {
        background: var(--status-stopped);
    }

    .divider {
        height: 1px;
        background: var(--border);
        margin: 10px 0;
    }

    .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        padding: 3px 0;
    }

    .info-label {
        color: var(--fg-muted);
    }

    .info-value {
        color: var(--fg-secondary);
        font-family: var(--font-mono);
    }

    .info-value.enabled {
        color: var(--status-started);
    }

    .info-value.disabled {
        color: var(--fg-muted);
    }
    `

    #activeCountEl = null
    #activeSizeEl = null
    #zombieCountEl = null
    #zombieSizeEl = null
    #progressBarEl = null
    #progressValueEl = null
    #totalSizeEl = null
    #autoFlushEl = null
    #maxSizeEl = null

    constructor () {
        super()
        this.buildDOM()
    }


    onModuleSet (module) {
        if (module) {
            this.#bindEvents()
            this.#updateAll()
        }
    }


    buildDOM () {
        super.buildDOM()

        const stats = createElement('div', {class: 'inspector-stats'})

        const activeCard = createStatCard('Active', '0', '0 B', 'active')
        this.#activeCountEl = activeCard.querySelector('.stat-value')
        this.#activeSizeEl = activeCard.querySelector('.stat-sub')

        const zombieCard = createStatCard('Zombies', '0', '0 B', 'zombie')
        this.#zombieCountEl = zombieCard.querySelector('.stat-value')
        this.#zombieSizeEl = zombieCard.querySelector('.stat-sub')

        stats.appendChild(activeCard)
        stats.appendChild(zombieCard)

        const progressSection = createElement('div', {class: 'progress-section'})
        const progressHeader = createElement('div', {class: 'progress-header'})
        const progressLabel = createElement('span', {
            class: 'progress-label',
            text: 'Zombie pool usage'
        })

        this.#progressValueEl = createElement('span', {
            class: 'progress-value',
            text: '0%'
        })

        progressHeader.appendChild(progressLabel)
        progressHeader.appendChild(this.#progressValueEl)

        const progressBarContainer = createElement('div', {class: 'progress-bar-container'})

        this.#progressBarEl = createElement('div', {
            class: 'progress-bar low',
            style: {width: '0%'}
        })

        progressBarContainer.appendChild(this.#progressBarEl)
        progressSection.appendChild(progressHeader)
        progressSection.appendChild(progressBarContainer)

        const divider = createElement('div', {class: 'divider'})

        const infoSection = document.createElement('div')

        const totalRow = createInfoRow('Total memory')
        this.#totalSizeEl = totalRow.querySelector('.info-value')

        const maxRow = createInfoRow('Max zombie size')
        this.#maxSizeEl = maxRow.querySelector('.info-value')

        const autoFlushRow = createInfoRow('Auto flush')
        this.#autoFlushEl = autoFlushRow.querySelector('.info-value')

        infoSection.appendChild(totalRow)
        infoSection.appendChild(maxRow)
        infoSection.appendChild(autoFlushRow)

        const flushBtn = this.createButton('🗑', 'Flush All', () => this.#handleFlush())
        const flushStaleBtn = this.createButton('🧹', 'Flush Stale', () => this.#handleFlushStale())

        this.actionsEl.appendChild(flushBtn)
        this.actionsEl.appendChild(flushStaleBtn)

        this.shadowRoot.insertBefore(stats, this.gridEl)
        this.shadowRoot.insertBefore(progressSection, this.gridEl)
        this.shadowRoot.insertBefore(divider, this.gridEl)
        this.shadowRoot.insertBefore(infoSection, this.gridEl)

        this.gridEl.style.display = 'none'
    }


    #handleFlush () {
        if (!this.module) {
            return
        }

        const result = this.module.flush()
        if (result.count > 0) {
            logger.info(`[TextureManager] Flushed ${result.count} textures (${formatBytes(result.size)})`)
        }
        this.#updateAll()
    }


    #handleFlushStale () {
        if (!this.module) {
            return
        }

        const result = this.module.flushStale()
        if (result.count > 0) {
            logger.info(`[TextureManager] Flushed ${result.count} stale textures (${formatBytes(result.size)})`)
        }
        this.#updateAll()
    }


    #bindEvents () {
        if (!this.module) {
            return
        }

        const events = ['create', 'zombie', 'resurrect', 'delete', 'flush', 'flushStale', 'flushIfFull']
        for (const event of events) {
            this.listenTo(this.module, event, () => this.#updateAll())
        }
    }


    #updateAll () {
        if (!this.module) {
            return
        }

        const stats = this.module.stats

        this.#activeCountEl.textContent = stats.activeCount
        this.#activeSizeEl.textContent = formatBytes(stats.activeSize)

        this.#zombieCountEl.textContent = stats.zombieCount
        this.#zombieSizeEl.textContent = formatBytes(stats.zombieSize)

        this.#totalSizeEl.textContent = formatBytes(stats.totalSize)
        this.#maxSizeEl.textContent = formatBytes(this.module.maxZombieSize)

        const usagePercent = this.module.maxZombieSize > 0
            ? (stats.zombieSize / this.module.maxZombieSize) * 100
            : 0

        this.#progressValueEl.textContent = `${usagePercent.toFixed(1)}%`
        this.#progressBarEl.style.width = `${Math.min(usagePercent, 100)}%`

        this.#progressBarEl.classList.remove('low', 'medium', 'high')
        if (usagePercent > 75) {
            this.#progressBarEl.classList.add('high')
        } else if (usagePercent > 40) {
            this.#progressBarEl.classList.add('medium')
        } else {
            this.#progressBarEl.classList.add('low')
        }

        const autoFlushEnabled = this.module.autoFlushEnabled
        this.#autoFlushEl.textContent = autoFlushEnabled ? 'Enabled' : 'Disabled'
        this.#autoFlushEl.className = `info-value ${autoFlushEnabled ? 'enabled' : 'disabled'}`
    }

}


function createStatCard (label, value, sub, className = '') {
    const card = createElement('div', {class: 'stat-card'})
    const labelEl = createElement('div', {class: 'stat-label', text: label})
    const valueEl = createElement('div', {
        class: `stat-value ${className}`,
        text: value
    })
    const subEl = createElement('div', {class: 'stat-sub', text: sub})

    card.appendChild(labelEl)
    card.appendChild(valueEl)
    card.appendChild(subEl)

    return card
}


function createInfoRow (label) {
    const row = createElement('div', {class: 'info-row'})
    const labelEl = createElement('span', {class: 'info-label', text: label})
    const valueEl = createElement('span', {class: 'info-value'})

    row.appendChild(labelEl)
    row.appendChild(valueEl)

    return row
}


customElements.define('texture-manager-inspector', TextureManagerInspector)

PerkyExplorerDetails.registerInspector(TextureManagerInspector)
