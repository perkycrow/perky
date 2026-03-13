import EntityView from '../../game/entity_view.js'
import Group2D from '../../render/group_2d.js'
import Sprite from '../../render/sprite.js'


const FILL_DURATION = 3
const FLASK_WIDTH = 6
const FLASK_HEIGHT = 4.5
const FILLING_WIDTH = 6
const FILLING_HEIGHT = 3
const BUTTON_SIZE = 1.5


export default class EndPanelView extends EntityView {

    #game = null
    #winGroup = null
    #loseGroup = null
    #fillingSprite = null
    #fillProgress = 0
    #currentState = null
    #buttonElement = null

    constructor (entity, context) {
        super(entity, context)

        this.root = new Group2D({x: entity.x, y: entity.y, visible: false, depth: 10})
        this.#game = context.game
        this.htmlLayer = context.game.getLayer('chapterUI') || null

        this.#buildWinGroup(context)
        this.#buildLoseGroup(context)
    }


    sync () {
        if (!this.entity) {
            return
        }

        const {active, state} = this.entity

        if (!active || !state) {
            this.root.visible = false
            this.#removeButton()
            return
        }

        if (state !== this.#currentState) {
            this.#currentState = state
            this.#fillProgress = 0
            this.#showState(state)
        }

        this.root.visible = true
    }


    update (deltaTime) {
        if (this.#currentState === 'win' && this.#fillProgress < 1) {
            this.#fillProgress = Math.min(this.#fillProgress + deltaTime / FILL_DURATION, 1)
            this.#updateFilling()
        }
    }


    dispose () {
        this.#removeButton()
        super.dispose()
    }


    #buildWinGroup (context) {
        this.#winGroup = new Group2D({visible: false})

        const bgImage = context.game.getSource('winBg')

        if (bgImage) {
            this.#winGroup.addChild(new Sprite({
                image: bgImage,
                width: FLASK_WIDTH,
                height: FLASK_HEIGHT,
                y: 0.75,
                depth: 0
            }))
        }

        const fillingImage = context.game.getSource('winFilling')

        if (fillingImage) {
            this.#fillingSprite = new Sprite({
                image: fillingImage,
                width: FILLING_WIDTH,
                height: FILLING_HEIGHT,
                visible: false,
                depth: 1
            })
            this.#winGroup.addChild(this.#fillingSprite)
        }

        const lineImage = context.game.getSource('winLine')

        if (lineImage) {
            this.#winGroup.addChild(new Sprite({
                image: lineImage,
                width: FLASK_WIDTH,
                height: FLASK_HEIGHT,
                y: 0.75,
                depth: 2
            }))
        }

        const nextImage = context.game.getSource('nextButton')

        if (nextImage) {
            this.#winGroup.addChild(new Sprite({
                image: nextImage,
                width: BUTTON_SIZE,
                height: BUTTON_SIZE,
                depth: 3
            }))
        }

        this.root.addChild(this.#winGroup)
    }


    #buildLoseGroup (context) {
        this.#loseGroup = new Group2D({visible: false})

        const loseImage = context.game.getSource('loseVisual')

        if (loseImage) {
            this.#loseGroup.addChild(new Sprite({
                image: loseImage,
                width: FLASK_WIDTH,
                height: FLASK_HEIGHT,
                y: 0.75,
                depth: 0
            }))
        }

        const restartImage = context.game.getSource('restartButton')

        if (restartImage) {
            this.#loseGroup.addChild(new Sprite({
                image: restartImage,
                width: BUTTON_SIZE,
                height: BUTTON_SIZE,
                depth: 3
            }))
        }

        this.root.addChild(this.#loseGroup)
    }


    #showState (state) {
        this.#winGroup.visible = state === 'win'
        this.#loseGroup.visible = state === 'lose'
        this.#removeButton()

        if (state === 'win') {
            this.#fillProgress = 0

            if (this.#fillingSprite) {
                this.#fillingSprite.visible = true
            }

            this.#updateFilling()
            this.#createButton('Next', () => this.#onNext())
        } else if (state === 'lose') {
            this.#createButton('Restart', () => this.#onRestart())
        }
    }


    #updateFilling () {
        const filling = this.#fillingSprite

        if (!filling) {
            return
        }

        const progress = easeIn(this.#fillProgress)

        if (progress <= 0) {
            filling.visible = false
            return
        }

        filling.visible = true
        const region = filling.region

        if (region?.image) {
            const imgH = region.image.height
            const cropH = Math.round(imgH * progress)
            region.y = imgH - cropH
            region.height = cropH
        }

        filling.height = FILLING_HEIGHT * progress
        filling.y = -(FILLING_HEIGHT * (1 - progress)) / 2 + 0.75
    }


    #createButton (label, onClick) {
        if (!this.htmlLayer) {
            return
        }

        const worldX = this.entity.x
        const worldY = this.entity.y - 1.75

        this.#buttonElement = this.htmlLayer.createWorldElement(
            buildButtonHTML(label),
            worldX,
            worldY,
            {
                pointerEvents: 'auto',
                autoCenter: true
            }
        )

        this.#buttonElement.addEventListener('click', onClick)
    }


    #removeButton () {
        if (this.#buttonElement && this.htmlLayer) {
            this.htmlLayer.removeWorldElement(this.#buttonElement)
            this.#buttonElement = null
        }
    }


    #onNext () {
        this.#game?.nextStep()
    }


    #onRestart () {
        this.#game?.restartChapter()
    }

}


function easeIn (t) {
    return t * t
}


function buildButtonHTML (label) {
    return `
        <button style="
            font-family: serif;
            font-size: 16px;
            color: #292621;
            background: rgba(255, 245, 230, 0.85);
            border: 2px solid #292621;
            border-radius: 6px;
            padding: 8px 24px;
            cursor: pointer;
            transition: background 0.2s;
        " onmouseover="this.style.background='rgba(255, 245, 230, 1)'"
           onmouseout="this.style.background='rgba(255, 245, 230, 0.85)'"
        >${label}</button>
    `
}
