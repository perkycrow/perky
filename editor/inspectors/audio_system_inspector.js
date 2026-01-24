import BaseInspector from './base_inspector.js'
import PerkyExplorerDetails from '../perky_explorer_details.js'
import AudioSystem from '../../audio/audio_system.js'
import {ICONS} from '../devtools/devtools_icons.js'
import '../slider_input.js'


export default class AudioSystemInspector extends BaseInspector {

    static matches (module) {
        return module instanceof AudioSystem
    }

    static styles = `
    .volume-controls {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--border);
    }

    .volume-icon {
        width: 14px;
        height: 14px;
        display: inline-block;
        vertical-align: middle;
        margin-right: 4px;
    }
    `

    #unlockedValueEl = null
    #channelsValueEl = null
    #volumeInput = null
    #unlockBtn = null

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

        this.#unlockedValueEl = this.addRow('unlocked', 'false')
        this.#channelsValueEl = this.addRow('channels', '0')

        const controlsEl = document.createElement('div')
        controlsEl.className = 'volume-controls'

        this.#volumeInput = document.createElement('slider-input')
        this.#volumeInput.setAttribute('label', 'Master Volume')
        this.#volumeInput.setAttribute('min', '0')
        this.#volumeInput.setAttribute('max', '1')
        this.#volumeInput.setAttribute('step', '0.01')
        this.#volumeInput.setAttribute('value', '1')
        this.#volumeInput.addEventListener('change', (e) => this.#handleVolumeChange(e))

        controlsEl.appendChild(this.#volumeInput)
        this.gridEl.appendChild(controlsEl)

        this.#unlockBtn = this.createButton('', 'Unlock Audio', () => this.#handleUnlock())
        this.#unlockBtn.innerHTML = `<span class="volume-icon">${ICONS.audio}</span> Unlock Audio`
        this.actionsEl.appendChild(this.#unlockBtn)
    }


    #handleVolumeChange (e) {
        if (!this.module) {
            return
        }

        this.module.setVolume(e.detail.value)
    }


    #handleUnlock () {
        if (!this.module) {
            return
        }

        this.module.unlock()
    }


    #bindEvents () {
        if (!this.module) {
            return
        }

        this.listenTo(this.module, 'audio:unlocked', () => this.#updateUnlocked())
        this.listenTo(this.module, 'volume:changed', (volume) => this.#updateVolume(volume))
        this.listenTo(this.module, 'child:added', () => this.#updateChannels())
        this.listenTo(this.module, 'child:removed', () => this.#updateChannels())
    }


    #updateAll () {
        this.#updateUnlocked()
        this.#updateChannels()
        this.#updateVolume(this.module?.masterVolume ?? 1)
    }


    #updateUnlocked () {
        if (!this.module) {
            return
        }

        const unlocked = this.module.unlocked
        this.#unlockedValueEl.textContent = unlocked ? 'true' : 'false'
        this.#unlockedValueEl.className = `inspector-value ${unlocked ? 'accent' : ''}`

        if (this.#unlockBtn) {
            if (unlocked) {
                this.#unlockBtn.style.display = 'none'
            } else {
                this.#unlockBtn.style.display = ''
                this.#unlockBtn.classList.add('primary')
            }
        }
    }


    #updateChannels () {
        if (!this.module) {
            return
        }

        const channels = this.module.listChannels()
        this.#channelsValueEl.textContent = `${channels.length} (${channels.join(', ')})`
    }


    #updateVolume (volume) {
        if (this.#volumeInput) {
            this.#volumeInput.setValue(volume)
        }
    }

}


customElements.define('audio-system-inspector', AudioSystemInspector)

PerkyExplorerDetails.registerInspector(AudioSystemInspector)
