import EntityView from '../../game/entity_view.js'
import Group2D from '../../render/group_2d.js'
import Sprite from '../../render/sprite.js'


const FOG_COUNT = 10
const FOG_DRIFT_Y = 0.08
const FOG_GROW_W = 0.3
const FOG_GROW_H = 0.6
const FOG_FADE_MIN = 0.8
const FOG_FADE_MAX = 2.5
const FOG_BASE_WIDTH = 6
const FOG_BASE_HEIGHT = 3


export default class BoardView extends EntityView {

    #fogGroup = null
    #clouds = []

    constructor (entity, context) {
        super(entity, context)

        this.root = new Group2D({x: entity.x, y: entity.y})

        const frameImage = context.game.getSource('boardFrame')

        if (frameImage) {
            this.root.addChild(new Sprite({
                image: frameImage,
                x: 3,
                y: 4.5,
                width: 8,
                depth: -1
            }))
        }

        this.#buildFog(context)
    }


    update (deltaTime) {
        for (const cloud of this.#clouds) {
            const sprite = cloud.sprite

            cloud.age += deltaTime
            sprite.y += FOG_DRIFT_Y * deltaTime
            sprite.width += FOG_GROW_W * deltaTime
            sprite.height += FOG_GROW_H * deltaTime

            if (cloud.age < cloud.fadeIn) {
                sprite.opacity = (cloud.age / cloud.fadeIn) * cloud.maxOpacity
            } else if (cloud.age > cloud.lifespan - cloud.fadeIn) {
                const remaining = cloud.lifespan - cloud.age
                sprite.opacity = Math.max(0, (remaining / cloud.fadeIn) * cloud.maxOpacity)
            } else {
                sprite.opacity = cloud.maxOpacity
            }

            if (cloud.age >= cloud.lifespan) {
                resetCloud(sprite)
                cloud.age = 0
                cloud.fadeIn = FOG_FADE_MIN + Math.random() * (FOG_FADE_MAX - FOG_FADE_MIN)
                cloud.lifespan = 3 + Math.random() * 5
                cloud.maxOpacity = 0.1 + Math.random() * 0.15
            }
        }
    }


    #buildFog (context) {
        const spritesheet = context.game.getSpritesheet('clouds')

        if (!spritesheet) {
            return
        }

        this.#fogGroup = new Group2D({depth: 10})
        this.root.addChild(this.#fogGroup)

        for (let i = 0; i < FOG_COUNT; i++) {
            const region = spritesheet.getRegion('cloud' + (i + 1))
            const sprite = new Sprite({region, opacity: 0})
            this.#fogGroup.addChild(sprite)

            resetCloud(sprite)

            this.#clouds.push({
                sprite,
                age: Math.random() * 6,
                fadeIn: FOG_FADE_MIN + Math.random() * (FOG_FADE_MAX - FOG_FADE_MIN),
                lifespan: 3 + Math.random() * 5,
                maxOpacity: 0.1 + Math.random() * 0.15
            })
        }
    }

}


function resetCloud (sprite) {
    const scale = 0.5 + Math.random() * 0.5

    sprite.x = 3 + (Math.random() - 0.5) * 4
    sprite.y = Math.random() * 9
    sprite.width = FOG_BASE_WIDTH * scale
    sprite.height = FOG_BASE_HEIGHT * scale
    sprite.rotation = (Math.random() - 0.5) * Math.PI / 2
    sprite.opacity = 0
}
