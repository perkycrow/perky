import Stage from '../../game/stage.js'


export default class InterludeStage extends Stage {

    #layer = null

    onStart () {
        super.onStart()

        this.#layer = this.game.createLayer('interludeUI', 'html', {
            camera: this.game.camera,
            pointerEvents: 'auto'
        })

        this.#buildUI()
    }


    onStop () {
        super.onStop()

        if (this.game.getLayer('interludeUI')) {
            this.game.removeLayer('interludeUI')
        }
    }


    #buildUI () {
        const interlude = this.options.interlude

        if (!this.#layer || !interlude) {
            return
        }

        const content = interlude.contentFor('en') || ''
        const choices = interlude.choices || []

        this.#layer.setContent(buildInterludeHTML(content, choices))

        for (let i = 0; i < choices.length; i++) {
            const button = this.#layer.div.querySelector(`[data-choice="${i}"]`)

            if (button) {
                button.addEventListener('click', () => {
                    interlude.triggerAction('choice', choices[i])
                })
            }
        }
    }

}


function buildInterludeHTML (content, choices) {
    const choicesHTML = choices.map((choice, i) => {
        const label = capitalize(choice.id)

        return `
            <button data-choice="${i}" style="
                font-family: serif;
                font-size: 16px;
                color: #292621;
                background: rgba(255, 245, 230, 0.85);
                border: 2px solid #292621;
                border-radius: 6px;
                padding: 10px 28px;
                cursor: pointer;
                transition: background 0.2s;
                margin-top: 12px;
            " onmouseover="this.style.background='rgba(255, 245, 230, 1)'"
               onmouseout="this.style.background='rgba(255, 245, 230, 0.85)'"
            >Learn ${label}</button>
        `
    }).join('')

    return `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            font-family: serif;
            color: #292621;
            padding: 40px;
            box-sizing: border-box;
        ">
            <div style="
                max-width: 400px;
                text-align: center;
            ">
                <div style="font-size: 20px; letter-spacing: 1px; margin-bottom: 24px;">
                    New Skill
                </div>
                <div style="font-size: 14px; line-height: 1.6; margin-bottom: 32px;">
                    ${content}
                </div>
                <div>
                    ${choicesHTML}
                </div>
            </div>
        </div>
    `
}


function capitalize (string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}
