import Stage from '../../game/stage.js'


export default class MenuStage extends Stage {

    #layer = null

    onStart () {
        super.onStart()

        this.#layer = this.game.createLayer('menuUI', 'html', {
            camera: this.game.camera,
            pointerEvents: 'auto'
        })

        this.#buildUI()
    }


    onStop () {
        super.onStop()

        if (this.game.getLayer('menuUI')) {
            this.game.removeLayer('menuUI')
        }
    }


    #buildUI () {
        if (!this.#layer) {
            return
        }

        this.#layer.setContent(buildMenuHTML())

        const button = this.#layer.div.querySelector('[data-action="play"]')

        if (button) {
            button.addEventListener('click', () => {
                this.game.startAdventure()
            })
        }
    }

}


function buildMenuHTML () {
    return `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            font-family: serif;
            color: #292621;
        ">
            <div style="font-size: 32px; letter-spacing: 2px; margin-bottom: 8px;">
                The Mistbrewer
            </div>
            <div style="font-size: 14px; opacity: 0.6; margin-bottom: 40px;">
                A reagent puzzle
            </div>
            <button data-action="play" style="
                font-family: serif;
                font-size: 18px;
                color: #292621;
                background: rgba(255, 245, 230, 0.85);
                border: 2px solid #292621;
                border-radius: 8px;
                padding: 12px 40px;
                cursor: pointer;
                transition: background 0.2s;
                letter-spacing: 1px;
            " onmouseover="this.style.background='rgba(255, 245, 230, 1)'"
               onmouseout="this.style.background='rgba(255, 245, 230, 0.85)'"
            >Play</button>
        </div>
    `
}
