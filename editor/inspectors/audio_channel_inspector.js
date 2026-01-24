import BaseInspector from './base_inspector.js'
import PerkyExplorerDetails from '../perky_explorer_details.js'
import AudioChannel from '../../audio/audio_channel.js'
import {ICONS} from '../devtools/devtools_icons.js'
import {createElement} from '../../application/dom_utils.js'
import '../slider_input.js'


export default class AudioChannelInspector extends BaseInspector {

    static matches (module) {
        return module instanceof AudioChannel
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

    #mutedValueEl = null
    #sourcesValueEl = null
    #volumeInput = null
    #muteBtn = null

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

        this.#mutedValueEl = this.addRow('muted', 'false')
        this.#sourcesValueEl = this.addRow('sources', '0')

        const controlsEl = createElement('div', {class: 'volume-controls'})

        this.#volumeInput = createElement('slider-input', {
            attrs: {label: 'Volume', min: '0', max: '1', step: '0.01', value: '1'}
        })
        this.#volumeInput.addEventListener('change', (e) => this.#handleVolumeChange(e))

        controlsEl.appendChild(this.#volumeInput)
        this.gridEl.appendChild(controlsEl)

        this.#muteBtn = this.createButton('', 'Mute', () => this.#handleToggleMute())
        this.#muteBtn.innerHTML = `<span class="volume-icon">${ICONS.volumeMuted}</span> Mute`
        this.actionsEl.appendChild(this.#muteBtn)
    }


    #handleVolumeChange (e) {
        if (!this.module) {
            return
        }

        this.module.setVolume(e.detail.value)
    }


    #handleToggleMute () {
        if (!this.module) {
            return
        }

        this.module.toggleMute()
    }


    #bindEvents () {
        if (!this.module) {
            return
        }

        this.listenTo(this.module, 'volume:changed', (volume) => this.#updateVolume(volume))
        this.listenTo(this.module, 'muted', () => this.#updateMuted())
        this.listenTo(this.module, 'unmuted', () => this.#updateMuted())
        this.listenTo(this.module, 'source:added', () => this.#updateSources())
        this.listenTo(this.module, 'source:removed', () => this.#updateSources())
    }


    #updateAll () {
        this.#updateMuted()
        this.#updateSources()
        this.#updateVolume(this.module?.volume ?? 1)
    }


    #updateMuted () {
        if (!this.module) {
            return
        }

        const muted = this.module.muted
        this.#mutedValueEl.textContent = muted ? 'true' : 'false'
        this.#mutedValueEl.className = `inspector-value ${muted ? 'accent' : ''}`

        if (muted) {
            this.#muteBtn.innerHTML = `<span class="volume-icon">${ICONS.volume}</span> Unmute`
            this.#muteBtn.classList.add('primary')
        } else {
            this.#muteBtn.innerHTML = `<span class="volume-icon">${ICONS.volumeMuted}</span> Mute`
            this.#muteBtn.classList.remove('primary')
        }
    }


    #updateSources () {
        if (!this.module) {
            return
        }

        const count = this.module.sourceCount
        this.#sourcesValueEl.textContent = count
        this.#sourcesValueEl.className = `inspector-value ${count > 0 ? 'accent' : ''}`
    }


    #updateVolume (volume) {
        if (this.#volumeInput) {
            this.#volumeInput.setValue(volume)
        }
    }

}


customElements.define('audio-channel-inspector', AudioChannelInspector)

PerkyExplorerDetails.registerInspector(AudioChannelInspector)
