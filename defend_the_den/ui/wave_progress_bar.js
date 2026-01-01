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


    onDispose () {
        if (this.root?.parentNode) {
            this.root.parentNode.removeChild(this.root)
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
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                text-align: center;
                font-family: 'Segoe UI', system-ui, sans-serif;
            }

            .wave-progress-label {
                color: rgba(255, 255, 255, 0.9);
                font-size: 12px;
                font-weight: 500;
                letter-spacing: 2px;
                text-transform: uppercase;
                margin-bottom: 8px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
            }

            .wave-progress-label .wave-number {
                font-weight: 700;
                color: #fff;
            }

            .wave-progress-track {
                width: 180px;
                height: 4px;
                background: rgba(255, 255, 255, 0.15);
                border-radius: 2px;
                overflow: hidden;
                box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
            }

            .wave-progress-fill {
                height: 100%;
                width: 0%;
                background: linear-gradient(90deg,
                    rgba(255, 255, 255, 0.6),
                    rgba(255, 255, 255, 0.9)
                );
                border-radius: 2px;
                transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
            }
        `
        this.root.appendChild(style)
    }

}

