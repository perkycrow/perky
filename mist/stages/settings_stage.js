import Stage from '../../game/stage.js'
import ChapterController from '../controllers/chapter_controller.js'


const ACTIONS = [
    {id: 'rotateCluster', label: 'Rotate'},
    {id: 'moveLeft', label: 'Move left'},
    {id: 'moveRight', label: 'Move right'},
    {id: 'dropCluster', label: 'Drop'},
    {id: 'activateSkill0', label: 'Madness'},
    {id: 'activateSkill1', label: 'Ruin'},
    {id: 'activateSkill2', label: 'Contagion'}
]

const SLOTS = 2


export default class SettingsStage extends Stage {

    #layer = null
    #bindings = null
    #rebindListener = null
    #rebindTarget = null

    onStart () {
        super.onStart()

        this.game.getLayer('game').setContent(null)

        this.#bindings = this.game.loadKeybinds() || buildBindingsFromStatic()

        this.#layer = this.game.createLayer('settingsUI', 'html', {
            camera: this.game.camera,
            pointerEvents: 'auto'
        })

        const camera = this.game.camera
        this.#layer.resize(camera.viewportWidth, camera.viewportHeight)

        this.#buildUI()
    }


    onStop () {
        super.onStop()
        this.#cancelRebind()

        if (this.game.getLayer('settingsUI')) {
            this.game.removeLayer('settingsUI')
        }
    }


    #buildUI () {
        if (!this.#layer) {
            return
        }

        const backSrc = this.game.getSource('backArrow')?.src || ''
        const gearSrc = this.game.getSource('menuIcon')?.src || ''

        this.#layer.setContent(buildSettingsHTML(backSrc, gearSrc, this.#bindings))
        this.#wireNavigation()
        this.#wireSliders()
        this.#wireKeybinds()
        this.#wireReset()
    }


    #wireNavigation () {
        const div = this.#layer.div

        const backBtn = div.querySelector('[data-action="back"]')

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.game.setStage('menu')
            })
        }
    }


    #wireSliders () {
        const div = this.#layer.div
        const audio = this.game.audioSystem

        if (!audio) {
            return
        }

        this.#wireSlider(div, 'global', this.game.getVolume(), (v) => {
            this.game.setVolume(v)
        })

        this.#wireSlider(div, 'music', audio.getChannelVolume('music'), (v) => {
            audio.setChannelVolume('music', v)
        })

        this.#wireSlider(div, 'sfx', audio.getChannelVolume('sfx'), (v) => {
            audio.setChannelVolume('sfx', v)
        })
    }


    #wireSlider (div, name, initialValue, onChange) {
        const slider = div.querySelector(`[data-slider="${name}"]`)
        const label = div.querySelector(`[data-value="${name}"]`)

        if (!slider) {
            return
        }

        slider.value = Math.round(initialValue * 100)

        if (label) {
            label.textContent = slider.value
        }

        slider.addEventListener('input', () => {
            const value = parseInt(slider.value, 10) / 100

            if (label) {
                label.textContent = slider.value
            }

            onChange(value)
            this.#saveVolume()
        })
    }


    #wireKeybinds () {
        const div = this.#layer.div
        const cells = div.querySelectorAll('[data-bind]')

        for (const cell of cells) {
            cell.addEventListener('click', () => {
                this.#startRebind(cell)
            })
        }
    }


    #startRebind (cell) {
        this.#cancelRebind()

        const actionId = cell.dataset.bind
        const slot = parseInt(cell.dataset.slot, 10)

        cell.textContent = '...'
        cell.style.background = '#e2dbd2'
        this.#rebindTarget = {cell, actionId, slot}

        this.#rebindListener = (event) => {
            event.preventDefault()

            if (event.code === 'Escape') {
                this.#cancelRebind()
                this.#refreshKeybindDisplay()
                return
            }

            this.#bindings[actionId][slot] = event.code
            this.#cancelRebind()
            this.#refreshKeybindDisplay()
            this.game.saveKeybinds(this.#bindings)
        }

        document.addEventListener('keydown', this.#rebindListener)
    }


    #cancelRebind () {
        if (this.#rebindListener) {
            document.removeEventListener('keydown', this.#rebindListener)
            this.#rebindListener = null
        }

        this.#rebindTarget = null
    }


    #refreshKeybindDisplay () {
        const div = this.#layer.div

        for (const action of ACTIONS) {
            const keys = this.#bindings[action.id]

            for (let s = 0; s < SLOTS; s++) {
                const cell = div.querySelector(`[data-bind="${action.id}"][data-slot="${s}"]`)

                if (cell) {
                    cell.textContent = formatKey(keys[s] || '')
                    cell.style.background = ''
                }
            }
        }
    }


    #wireReset () {
        const div = this.#layer.div
        const resetBtn = div.querySelector('[data-action="reset"]')

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.#cancelRebind()
                this.#bindings = buildBindingsFromStatic()
                this.#refreshKeybindDisplay()
                this.game.saveKeybinds(this.#bindings)
            })
        }

        const deleteBtn = div.querySelector('[data-action="deleteSave"]')

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.game.clearSave()
                deleteBtn.textContent = 'Sauvegarde supprimée'
                deleteBtn.disabled = true
            })
        }
    }


    #saveVolume () {
        const audio = this.game.audioSystem

        if (!audio) {
            return
        }

        this.game.saveVolume(
            this.game.getVolume(),
            audio.getChannelVolume('music'),
            audio.getChannelVolume('sfx')
        )
    }

}


function buildBindingsFromStatic () {
    const defaults = ChapterController.bindings
    const result = {}

    for (const action of ACTIONS) {
        const keys = defaults[action.id] || []
        result[action.id] = [keys[0] || '', keys[1] || '']
    }

    return result
}


function formatKey (code) {
    if (!code) {
        return ''
    }

    return code
        .replace('Arrow', '')
        .replace('Key', '')
        .replace('Digit', '')
        .replace('Space', 'Space')
}


function buildSettingsHTML (backSrc, gearSrc, bindings) {
    const backImg = backSrc
        ? `<img src="${backSrc}" style="width: 50px; height: 50px; cursor: pointer; opacity: 0.7;" />`
        : '&larr;'

    const gearImg = gearSrc
        ? `<img src="${gearSrc}" style="width: 32px; height: 32px; opacity: 0.6;" />`
        : ''

    return `
        <div style="
            display: flex;
            flex-direction: column;
            height: 100%;
            font-family: 'Jacques Francois', serif;
            color: #4d382a;
            padding: 20px 40px;
            box-sizing: border-box;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div data-action="back">${backImg}</div>
                <div>${gearImg}</div>
            </div>

            <div style="display: flex; gap: 20px; flex: 1; justify-content: center;">
                ${buildSoundSection()}
                ${buildKeybindSection(bindings)}
            </div>

            <div style="text-align: center; margin-top: 20px;">
                <button data-action="deleteSave" style="
                    font-family: 'Jacques Francois', serif;
                    font-size: 14px;
                    color: #4d382a;
                    background: rgba(199, 189, 183, 0.5);
                    border: 1px solid #c7bdb7;
                    border-radius: 4px;
                    padding: 10px 40px;
                    cursor: pointer;
                    width: 60%;
                    max-width: 500px;
                ">Supprimer la sauvegarde</button>
            </div>
        </div>
    `
}


function buildSoundSection () {
    return `
        <div style="
            border: 1px solid #c7bdb7;
            border-radius: 6px;
            padding: 20px 24px;
            width: 300px;
            background: rgba(255, 255, 255, 0.08);
        ">
            <div style="
                text-align: center;
                font-size: 20px;
                font-family: 'Macondo Swash Caps', serif;
                margin-bottom: 20px;
                border-bottom: 1px solid #c7bdb7;
                padding-bottom: 12px;
            ">Sound</div>

            ${buildSlider('global', 'Global volume')}
            ${buildSlider('music', 'Music volume')}
            ${buildSlider('sfx', 'SFX volume')}
        </div>
    `
}


function buildSlider (name, label) {
    return `
        <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-size: 14px;">${label}</span>
                <span data-value="${name}" style="font-size: 14px;">100</span>
            </div>
            <input data-slider="${name}" type="range" min="0" max="100" value="100" style="
                width: 100%;
                height: 6px;
                -webkit-appearance: none;
                appearance: none;
                background: #c7a84e;
                border-radius: 3px;
                outline: none;
                cursor: pointer;
            " />
        </div>
    `
}


function buildKeybindSection (bindings) {
    let rows = ''

    for (const action of ACTIONS) {
        const keys = bindings[action.id]

        rows += `
            <tr>
                <td style="padding: 6px 12px; font-size: 14px; font-weight: bold;">${action.label}</td>
                <td data-bind="${action.id}" data-slot="0" style="
                    padding: 6px 16px;
                    text-align: center;
                    font-size: 13px;
                    cursor: pointer;
                    background: rgba(199, 189, 183, 0.3);
                    border-radius: 3px;
                ">${formatKey(keys[0])}</td>
                <td data-bind="${action.id}" data-slot="1" style="
                    padding: 6px 16px;
                    text-align: center;
                    font-size: 13px;
                    cursor: pointer;
                    background: rgba(199, 189, 183, 0.3);
                    border-radius: 3px;
                ">${formatKey(keys[1])}</td>
            </tr>
        `
    }

    return `
        <div style="
            border: 1px solid #c7bdb7;
            border-radius: 6px;
            padding: 20px 24px;
            width: 340px;
            background: rgba(255, 255, 255, 0.08);
        ">
            <div style="
                text-align: center;
                font-size: 20px;
                font-family: 'Macondo Swash Caps', serif;
                margin-bottom: 20px;
                border-bottom: 1px solid #c7bdb7;
                padding-bottom: 12px;
            ">KeyBinds</div>

            <table style="width: 100%; border-collapse: separate; border-spacing: 4px;">
                <thead>
                    <tr>
                        <th></th>
                        <th style="font-size: 12px; font-weight: normal; opacity: 0.6;">1</th>
                        <th style="font-size: 12px; font-weight: normal; opacity: 0.6;">2</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>

            <div style="text-align: right; margin-top: 12px;">
                <span data-action="reset" style="
                    font-size: 13px;
                    cursor: pointer;
                    opacity: 0.7;
                ">Reset &#x21BA;</span>
            </div>
        </div>
    `
}
