import EntityView from '../../game/entity_view.js'
import Group2D from '../../render/group_2d.js'
import Sprite from '../../render/sprite.js'


const OPEN_DURATION = 0.175
const CLOSE_DURATION = 0.1
const FRAME_COUNT = 6


export default class NotebookView extends EntityView {

    #frames = []
    #progress = 0
    #currentFrame = 0
    #bookSprite = null
    #visualSprite = null
    #contentElement = null
    #lastSkill = null

    constructor (entity, context) {
        super(entity, context)

        this.root = new Group2D({x: entity.x, y: entity.y})

        this.#loadFrames(context)
        this.#buildBook()
        this.#buildVisual(context)
        this.htmlLayer = context.game.getLayer('chapterUI') || null
    }


    sync () {
        if (!this.entity) {
            return
        }

        if (this.entity.currentSkill !== this.#lastSkill) {
            this.#lastSkill = this.entity.currentSkill
        }
    }


    update (deltaTime) {
        if (!this.entity) {
            return
        }

        const target = this.entity.opened ? 1 : 0

        if (this.#progress === target) {
            return
        }

        if (this.#progress < target) {
            this.#progress = Math.min(this.#progress + deltaTime / OPEN_DURATION, 1)
        } else {
            this.#progress = Math.max(this.#progress - deltaTime / CLOSE_DURATION, 0)
        }

        this.#currentFrame = Math.min(Math.floor(this.#progress * FRAME_COUNT), FRAME_COUNT - 1)
        this.#updateBookFrame()
        this.#updateContent()
    }


    dispose () {
        this.#removeContent()
        super.dispose()
    }


    #loadFrames (context) {
        const spritesheet = context.game.getSpritesheet('noteBook')

        if (spritesheet) {
            for (let i = 1; i <= FRAME_COUNT; i++) {
                this.#frames.push(spritesheet.getRegion('notebook' + i))
            }
        }
    }


    #buildBook () {
        this.#bookSprite = new Sprite({
            width: 12,
            height: 12,
            x: -3,
            region: this.#frames[0] || null
        })
        this.root.addChild(this.#bookSprite)
    }


    #buildVisual (context) {
        this.#visualSprite = new Sprite({
            width: 3.5,
            height: 3.5,
            x: -5.5,
            y: 0.25,
            visible: false
        })
        this.root.addChild(this.#visualSprite)
    }


    #updateBookFrame () {
        if (this.#frames[this.#currentFrame]) {
            this.#bookSprite.region = this.#frames[this.#currentFrame]
        }
    }


    #updateContent () {
        const isOpen = this.#currentFrame === FRAME_COUNT - 1
        const skill = this.entity?.currentSkill

        if (isOpen && skill) {
            this.#showContent(skill)
        } else {
            this.#hideContent()
        }
    }


    #showContent (skill) {
        const game = this.context?.game

        if (game) {
            const visualImage = game.getSource(skill.id + 'Visual')

            if (visualImage) {
                this.#visualSprite.image = visualImage
                this.#visualSprite.visible = true
            }
        }

        if (this.htmlLayer && !this.#contentElement) {
            const worldX = this.entity.x - 0.5
            const worldY = this.entity.y + 0.25

            this.#contentElement = this.htmlLayer.createWorldElement(
                buildSkillHTML(skill),
                worldX,
                worldY,
                {
                    pointerEvents: 'none',
                    autoCenter: true
                }
            )
        } else if (this.#contentElement) {
            this.#contentElement.innerHTML = buildSkillHTML(skill)
        }
    }


    #hideContent () {
        this.#visualSprite.visible = false
        this.#removeContent()
    }


    #removeContent () {
        if (this.#contentElement && this.htmlLayer) {
            this.htmlLayer.removeWorldElement(this.#contentElement)
            this.#contentElement = null
        }
    }

}


function buildSkillHTML (skill) {
    const title = skill.translate('title', 'en')
    const description = skill.translate('description', 'en')
    const chargeDescription = skill.translate('chargeDescription', 'en')

    return `
        <div style="
            font-family: serif;
            font-size: 14px;
            color: #333;
            padding: 8px;
            line-height: 1.4;
            width: 140px;
        ">
            <div style="text-align: center; font-weight: bold; margin-bottom: 6px;">
                ${title}
            </div>
            <div style="font-size: 11px; margin-bottom: 8px;">
                ${description}
            </div>
            <div style="font-size: 11px; font-style: italic;">
                ${chargeDescription}
            </div>
        </div>
    `
}
