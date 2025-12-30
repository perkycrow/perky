import BaseInspector from './base_inspector.js'
import PerkyExplorerDetails from '../perky_explorer_details.js'
import WebGLTextureManager from '../../render/webgl_texture_manager.js'
import {formatBytes} from '../../core/utils.js'


function createStatCard (label, value, sub, className = '') {
    const card = document.createElement('div')
    card.className = 'stat-card'

    const labelEl = document.createElement('div')
    labelEl.className = 'stat-label'
    labelEl.textContent = label

    const valueEl = document.createElement('div')
    valueEl.className = `stat-value ${className}`
    valueEl.textContent = value

    const subEl = document.createElement('div')
    subEl.className = 'stat-sub'
    subEl.textContent = sub

    card.appendChild(labelEl)
    card.appendChild(valueEl)
    card.appendChild(subEl)

    return card
}


function createInfoRow (label) {
    const row = document.createElement('div')
    row.className = 'info-row'

    const labelEl = document.createElement('span')
    labelEl.className = 'info-label'
    labelEl.textContent = label

    const valueEl = document.createElement('span')
    valueEl.className = 'info-value'

    row.appendChild(labelEl)
    row.appendChild(valueEl)

    return row
}


const customStyles = `
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


export default class TextureManagerInspector extends BaseInspector {

    static matches (module) {
        return module instanceof WebGLTextureManager
    }

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
        super(customStyles)
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

        const stats = document.createElement('div')
        stats.className = 'inspector-stats'

        const activeCard = createStatCard('Active', '0', '0 B', 'active')
        this.#activeCountEl = activeCard.querySelector('.stat-value')
        this.#activeSizeEl = activeCard.querySelector('.stat-sub')

        const zombieCard = createStatCard('Zombies', '0', '0 B', 'zombie')
        this.#zombieCountEl = zombieCard.querySelector('.stat-value')
        this.#zombieSizeEl = zombieCard.querySelector('.stat-sub')

        stats.appendChild(activeCard)
        stats.appendChild(zombieCard)

        const progressSection = document.createElement('div')
        progressSection.className = 'progress-section'

        const progressHeader = document.createElement('div')
        progressHeader.className = 'progress-header'

        const progressLabel = document.createElement('span')
        progressLabel.className = 'progress-label'
        progressLabel.textContent = 'Zombie pool usage'

        this.#progressValueEl = document.createElement('span')
        this.#progressValueEl.className = 'progress-value'
        this.#progressValueEl.textContent = '0%'

        progressHeader.appendChild(progressLabel)
        progressHeader.appendChild(this.#progressValueEl)

        const progressBarContainer = document.createElement('div')
        progressBarContainer.className = 'progress-bar-container'

        this.#progressBarEl = document.createElement('div')
        this.#progressBarEl.className = 'progress-bar low'
        this.#progressBarEl.style.width = '0%'

        progressBarContainer.appendChild(this.#progressBarEl)
        progressSection.appendChild(progressHeader)
        progressSection.appendChild(progressBarContainer)

        const divider = document.createElement('div')
        divider.className = 'divider'

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
            console.log(`[TextureManager] Flushed ${result.count} textures (${formatBytes(result.size)})`)
        }
        this.#updateAll()
    }


    #handleFlushStale () {
        if (!this.module) {
            return
        }

        const result = this.module.flushStale()
        if (result.count > 0) {
            console.log(`[TextureManager] Flushed ${result.count} stale textures (${formatBytes(result.size)})`)
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


    #updateAll () { // eslint-disable-line complexity
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


customElements.define('texture-manager-inspector', TextureManagerInspector)

PerkyExplorerDetails.registerInspector(TextureManagerInspector)
