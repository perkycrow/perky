import PerkyModule from '../../core/perky_module.js'
import {createElement} from '../../application/dom_utils.js'


const SPAWN_BUTTONS = [
    {label: 'Pig', action: 'spawnPigEnemy', maxSpeed: 0.4},
    {label: 'Red', action: 'spawnRedEnemy', maxSpeed: 0.6},
    {label: 'Granny', action: 'spawnGrannyEnemy', maxSpeed: 0.3},
    {label: 'Amalgam', action: 'spawnAmalgamEnemy', maxSpeed: 0.5}
]

const SPAWN_Y = {min: -1.9, max: 0.6}
const SPAWN_X = 3.5

const PHASE_LABELS = [
    {value: 0, label: 'Dawn'},
    {value: 0.25, label: 'Day'},
    {value: 0.5, label: 'Dusk'},
    {value: 0.75, label: 'Night'}
]


export default class PreviewControls extends PerkyModule {

    constructor (options = {}) {
        super(options)

        this.game = options.game

        this.root = createElement('div', {class: 'preview-controls'})
        this.#buildSpawnPanel()
        this.#buildSliderPanel()
        this.#applyStyles()
    }


    mount (container) {
        if (container instanceof HTMLElement) {
            container.appendChild(this.root)
        } else if (container.div) {
            container.div.appendChild(this.root)
        }
    }


    onDispose () {
        if (this.root?.parentNode) {
            this.root.parentNode.removeChild(this.root)
        }
    }


    #buildSpawnPanel () {
        const panel = createElement('div', {class: 'spawn-panel'})

        for (const config of SPAWN_BUTTONS) {
            const btn = createElement('button', {
                class: 'spawn-btn',
                text: config.label
            })

            btn.addEventListener('click', () => {
                const y = SPAWN_Y.min + Math.random() * (SPAWN_Y.max - SPAWN_Y.min)
                this.game.execute(config.action, {
                    x: SPAWN_X,
                    y,
                    maxSpeed: config.maxSpeed
                })
            })

            panel.appendChild(btn)
        }

        this.root.appendChild(panel)
    }


    #buildSliderPanel () {
        const panel = createElement('div', {class: 'slider-panel'})

        const labels = createElement('div', {class: 'slider-labels'})
        for (const phase of PHASE_LABELS) {
            const label = createElement('span', {
                class: 'phase-label',
                text: phase.label
            })
            label.dataset.value = phase.value
            label.addEventListener('click', () => {
                this.#setTimeOfDay(phase.value)
                this.slider.value = phase.value
            })
            labels.appendChild(label)
        }

        this.slider = createElement('input', {
            attrs: {type: 'range', min: '0', max: '1', step: '0.005', value: '0'}
        })
        this.slider.classList.add('day-slider')

        this.slider.addEventListener('input', () => {
            this.#setTimeOfDay(parseFloat(this.slider.value))
        })

        panel.appendChild(labels)
        panel.appendChild(this.slider)
        this.root.appendChild(panel)
    }


    #setTimeOfDay (value) {
        this.game.dayNightPass?.setProgress(value)
        this.game.updateShadows(value)
    }


    #applyStyles () {
        const style = createElement('style', {text: `
            .preview-controls {
                pointer-events: none;
            }

            .spawn-panel {
                position: absolute;
                left: 3%;
                top: 50%;
                transform: translateY(-50%);
                display: flex;
                flex-direction: column;
                gap: 8px;
                pointer-events: auto;
            }

            .spawn-btn {
                background: rgba(0, 0, 0, 0.5);
                color: rgba(220, 200, 170, 0.9);
                border: 1px solid rgba(220, 200, 170, 0.3);
                border-radius: 6px;
                padding: 8px 14px;
                font-size: 13px;
                font-family: 'Segoe UI', system-ui, sans-serif;
                cursor: pointer;
                transition: background 0.15s, border-color 0.15s;
                min-width: 80px;
                text-align: center;
            }

            .spawn-btn:hover {
                background: rgba(0, 0, 0, 0.7);
                border-color: rgba(220, 200, 170, 0.6);
            }

            .spawn-btn:active {
                background: rgba(220, 200, 170, 0.2);
            }

            .slider-panel {
                position: absolute;
                bottom: 5%;
                left: 50%;
                transform: translateX(-50%);
                width: 40%;
                pointer-events: auto;
            }

            .slider-labels {
                display: flex;
                justify-content: space-between;
                margin-bottom: 6px;
            }

            .phase-label {
                font-size: 11px;
                font-family: 'Segoe UI', system-ui, sans-serif;
                color: rgba(180, 150, 110, 0.7);
                cursor: pointer;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                transition: color 0.15s;
            }

            .phase-label:hover {
                color: rgba(210, 175, 120, 1);
            }

            .day-slider {
                width: 100%;
                height: 6px;
                -webkit-appearance: none;
                appearance: none;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 3px;
                outline: none;
                cursor: pointer;
            }

            .day-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: rgba(200, 160, 90, 0.9);
                border: 2px solid rgba(255, 255, 255, 0.3);
                cursor: pointer;
            }

            .day-slider::-moz-range-thumb {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: rgba(200, 160, 90, 0.9);
                border: 2px solid rgba(255, 255, 255, 0.3);
                cursor: pointer;
            }
        `})
        this.root.appendChild(style)
    }

}
