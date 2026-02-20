import EntityView from '../../game/entity_view.js'
import Group2D from '../../render/group_2d.js'
import Sprite from '../../render/sprite.js'
import Easing from '../../math/easing.js'


const SKILL_OFFSET_X = -1.4
const SKILL_OFFSET_Y = 1.25
const SKILL_SPACING = 1.5
const SKILL_SCALE = 0.75
const POP_DURATION = 0.3


export default class ArsenalPanelView extends EntityView {

    #skillSprites = []
    #fillingSprites = []
    #wasReady = []
    #popTimers = []

    constructor (entity, context) {
        super(entity, context)

        this.root = new Group2D({x: entity.x, y: entity.y, depth: -10})

        this.#buildFrame(context)
        this.#buildSkills(context)
    }


    sync () {
        if (!this.entity) {
            return
        }

        const skills = this.entity.skills

        for (let i = 0; i < skills.length; i++) {
            const skill = skills[i]
            const wasReady = this.#wasReady[i]

            this.#updateFilling(i, skill.progress)

            if (skill.ready && !wasReady) {
                this.#popTimers[i] = POP_DURATION
            }

            this.#wasReady[i] = skill.ready
        }
    }


    update (deltaTime) {
        for (let i = 0; i < this.#popTimers.length; i++) {
            if (this.#popTimers[i] > 0) {
                this.#popTimers[i] -= deltaTime
                const progress = 1 - Math.max(0, this.#popTimers[i] / POP_DURATION)
                const scale = Easing.easeOutBack(progress) * SKILL_SCALE
                this.#skillSprites[i].scaleX = scale
                this.#skillSprites[i].scaleY = scale
            }
        }
    }


    #buildFrame (context) {
        const frameImage = context.game.getSource('arsenalFrame')

        if (frameImage) {
            this.root.addChild(new Sprite({
                image: frameImage,
                width: 7,
                height: 6,
                depth: -1
            }))
        }
    }


    #buildSkills (context) {
        const skills = this.entity.skills

        for (let i = 0; i < skills.length; i++) {
            const skill = skills[i]
            const skillGroup = new Group2D({
                x: SKILL_OFFSET_X,
                y: -i * SKILL_SPACING + SKILL_OFFSET_Y,
                scaleX: SKILL_SCALE,
                scaleY: SKILL_SCALE
            })

            const fillingImage = context.game.getSource('skill' + capitalize(skill.id) + 'Filling')

            if (fillingImage) {
                const filling = new Sprite({
                    image: fillingImage,
                    width: 2,
                    height: 2,
                    opacity: 0.65
                })
                skillGroup.addChild(filling)
                this.#fillingSprites.push(filling)
            } else {
                this.#fillingSprites.push(null)
            }

            const skillImage = context.game.getSource('skill' + capitalize(skill.id))

            if (skillImage) {
                const sprite = new Sprite({
                    image: skillImage,
                    width: 2,
                    height: 2
                })
                skillGroup.addChild(sprite)
                this.#skillSprites.push(sprite)
            } else {
                this.#skillSprites.push(skillGroup)
            }

            this.root.addChild(skillGroup)
            this.#wasReady.push(skill.ready)
            this.#popTimers.push(0)
        }
    }


    #updateFilling (index, progress) {
        const filling = this.#fillingSprites[index]

        if (!filling) {
            return
        }

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

        const baseHeight = 2
        filling.height = baseHeight * progress
        filling.y = -(baseHeight * (1 - progress)) / 2
        filling.opacity = progress >= 1 ? 1 : 0.65
    }

}


function capitalize (string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}
