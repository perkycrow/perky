import EntityView from '../../game/entity_view.js'
import Group2D from '../../render/group_2d.js'
import Sprite from '../../render/sprite.js'
import Easing from '../../math/easing.js'


const POP_DURATION = 0.3
const FRAME_WIDTH = 8
const FRAME_HEIGHT = 7


export default class LabPanelView extends EntityView {

    #reagentSprites = []
    #lastUnlockedCount = 0
    #popTimers = []

    constructor (entity, context) {
        super(entity, context)

        this.spritesheet = context.game.getSpritesheet('reagents')
        this.#lastUnlockedCount = entity.unlockedCount
        this.root = new Group2D({x: entity.x, y: entity.y})

        this.#buildFrame(context)
        this.#buildGrid()
    }


    sync () {
        if (!this.entity) {
            return
        }

        const unlockedCount = this.entity.unlockedCount

        for (let i = 0; i < this.#reagentSprites.length; i++) {
            const wasLocked = i >= this.#lastUnlockedCount
            const isUnlocked = i < unlockedCount

            this.#reagentSprites[i].opacity = isUnlocked ? 1 : 0.25

            if (isUnlocked && wasLocked) {
                this.#popTimers[i] = POP_DURATION
                this.#reagentSprites[i].scaleX = 0
                this.#reagentSprites[i].scaleY = 0
            }
        }

        this.#lastUnlockedCount = unlockedCount
    }


    update (deltaTime) {
        for (let i = 0; i < this.#popTimers.length; i++) {
            if (this.#popTimers[i] > 0) {
                this.#popTimers[i] -= deltaTime
                const progress = 1 - Math.max(0, this.#popTimers[i] / POP_DURATION)
                const scale = Easing.easeOutBack(progress)
                this.#reagentSprites[i].scaleX = scale
                this.#reagentSprites[i].scaleY = scale
            }
        }
    }


    #buildFrame (context) {
        const frameImage = context.game.getSource('labFrame')

        if (frameImage) {
            this.root.addChild(new Sprite({
                image: frameImage,
                width: FRAME_WIDTH,
                height: FRAME_HEIGHT,
                depth: -1
            }))
        }
    }


    #buildGrid () {
        const names = this.entity.reagentNames
        const count = names.length

        if (count === 0) {
            return
        }

        const {width: perLine, height: perColumn} = getGridDimensions(count)
        const reagentScale = 3.5 / perLine

        const offsetX = -2.45
        const offsetY = (perColumn * reagentScale * 0.25) - reagentScale * 0.25 - 0.1

        const gridGroup = new Group2D({
            x: offsetX,
            y: offsetY,
            scaleX: reagentScale,
            scaleY: reagentScale
        })
        this.root.addChild(gridGroup)

        for (let i = 0; i < count; i++) {
            const name = names[i]
            const region = this.spritesheet?.getRegion(name)
            const unlocked = i < this.entity.unlockedCount

            const sprite = new Sprite({
                x: i % perLine,
                y: -Math.floor(i / perLine),
                width: 0.9,
                height: 0.9,
                region,
                opacity: unlocked ? 1 : 0.25
            })

            gridGroup.addChild(sprite)
            this.#reagentSprites.push(sprite)
            this.#popTimers.push(0)
        }
    }

}


function getGridDimensions (count) {
    const ratio = 6 / 5

    let width = Math.ceil(Math.sqrt(count * ratio))
    let height = Math.ceil(count / width)

    while (width * height < count) {
        height++
    }

    return {width, height}
}
