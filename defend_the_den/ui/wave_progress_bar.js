import PerkyModule from '../../core/perky_module'


export default class WaveProgressBar extends PerkyModule {

    constructor (options = {}) {
        super(options)

        this.gameController = options.gameController

        this.root = document.createElement('div')
        this.root.className = 'wave-progress'
        this.root.innerHTML = `
            <div class="wave-progress-label">Wave <span class="wave-number">1</span></div>
            <div class="wave-progress-track">
                <div class="wave-progress-fill"></div>
            </div>
        `

        this.labelEl = this.root.querySelector('.wave-number')
        this.fillEl = this.root.querySelector('.wave-progress-fill')

        this.#applyStyles()
    }


    onStart () {
        if (!this.gameController) {
            return
        }

        this.listenTo(this.gameController, 'wave:start', (waveNumber) => {
            this.#updateWave(waveNumber)
        })

        this.listenTo(this.gameController, 'wave:progress', (progress) => {
            this.#updateProgress(progress)
        })

        this.listenTo(this.gameController, 'wave:complete', () => {
            this.#updateProgress(1)
        })
    }


    mount (container) {
        if (container instanceof HTMLElement) {
            container.appendChild(this.root)
        } else if (container.div) {
            container.div.appendChild(this.root)
        }
    }


    #updateWave (waveNumber) {
        this.labelEl.textContent = waveNumber + 1
        this.#updateProgress(0)
    }


    #updateProgress (progress) {
        this.fillEl.style.width = `${progress * 100}%`
    }


    #applyStyles () {
        const style = document.createElement('style')
        style.textContent = `
            .wave-progress {
                position: absolute;
                top: 16px;
                left: 50%;
                transform: translateX(-50%);
                text-align: center;
                font-family: system-ui, sans-serif;
            }

            .wave-progress-label {
                color: #333;
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 6px;
                text-shadow: 0 1px 2px rgba(255,255,255,0.8);
            }

            .wave-progress-track {
                width: 200px;
                height: 8px;
                background: rgba(0,0,0,0.15);
                border-radius: 4px;
                overflow: hidden;
            }

            .wave-progress-fill {
                height: 100%;
                width: 0%;
                background: linear-gradient(90deg, #4ade80, #22c55e);
                border-radius: 4px;
                transition: width 0.3s ease;
            }
        `
        this.root.appendChild(style)
    }

}

