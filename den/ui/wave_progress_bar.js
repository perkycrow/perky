import PerkyModule from '../../core/perky_module.js'
import {createElement} from '../../application/dom_utils.js'


export default class WaveProgressBar extends PerkyModule {

    static phaseNames = ['Dawn', 'Day', 'Dusk', 'Night']

    constructor (options = {}) {
        super(options)

        this.game = options.game
        this.currentDay = 0

        this.root = createElement('div', {
            class: 'wave-progress',
            html: `
            <div class="wave-progress-label"><span class="wave-name">Dawn</span> - <span class="day-label">Day 1</span></div>
            <div class="wave-progress-track">
                <div class="wave-progress-fill"></div>
            </div>
            <div class="day-announcement" style="display: none;">
                <span class="day-number">Day 1</span>
            </div>
        `
        })

        this.nameEl = this.root.querySelector('.wave-name')
        this.dayLabelEl = this.root.querySelector('.day-label')
        this.fillEl = this.root.querySelector('.wave-progress-fill')
        this.dayAnnouncementEl = this.root.querySelector('.day-announcement')
        this.dayNumberEl = this.root.querySelector('.day-number')

        this.#applyStyles()
    }


    onStart () {
        if (!this.game) {
            return
        }

        this.listenTo(this.game, 'wave:start', ({wave, dayNumber}) => {
            this.#updateWave(wave, dayNumber)
        })

        this.listenTo(this.game, 'wave:tick', ({progress}) => {
            this.#updateProgress(progress)
        })

        this.listenTo(this.game, 'day:announce', ({dayNumber}) => {
            this.#showDayAnnouncement(dayNumber)
        })

        this.listenTo(this.game, 'day:start', ({dayNumber}) => {
            this.#hideDayAnnouncement()
            this.#updateDayLabel(dayNumber)
        })
    }


    #showDayAnnouncement (dayNumber) {
        this.dayNumberEl.textContent = `Day ${dayNumber + 1}`
        this.dayAnnouncementEl.style.display = 'block'
    }


    #hideDayAnnouncement () {
        this.dayAnnouncementEl.style.display = 'none'
    }


    #updateDayLabel (dayNumber) {
        this.dayLabelEl.textContent = `Day ${dayNumber + 1}`
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


    #updateWave (wave, dayNumber) {
        const phaseName = WaveProgressBar.phaseNames[wave] || 'Dawn'
        this.nameEl.textContent = phaseName
        this.#updateDayLabel(dayNumber)
        this.#updateProgress(0)
    }


    #updateProgress (progress) {
        this.fillEl.style.width = `${progress * 100}%`
    }


    #applyStyles () {
        const style = createElement('style', {text: `
            .wave-progress {
                position: absolute;
                bottom: 7%;
                left: 50%;
                transform: translateX(-50%);
                width: 18%;
                text-align: center;
                font-family: 'Segoe UI', system-ui, sans-serif;
                container-type: inline-size;
            }

            .wave-progress-label {
                color: rgba(180, 150, 110, 0.85);
                font-size: 3.5cqi;
                font-weight: 500;
                letter-spacing: 0.3cqi;
                text-transform: uppercase;
                margin-bottom: 1.2cqi;
            }

            .wave-progress-label .wave-name {
                font-weight: 600;
                color: rgba(210, 175, 120, 0.9);
            }

            .wave-progress-track {
                width: 100%;
                height: 1.2cqi;
                background: rgba(0, 0, 0, 0.25);
                border-radius: 0.6cqi;
                overflow: hidden;
            }

            .wave-progress-fill {
                height: 100%;
                width: 0%;
                background: rgba(200, 160, 90, 0.7);
                border-radius: 0.6cqi;
                transition: width 0.4s ease-out;
            }

            .day-announcement {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
            }

            .day-number {
                font-size: 48px;
                font-weight: 700;
                color: #fff;
                text-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
                letter-spacing: 4px;
                text-transform: uppercase;
            }
        `})
        this.root.appendChild(style)
    }

}
