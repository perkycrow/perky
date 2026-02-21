import Stage from '../../game/stage.js'
import Group2D from '../../render/group_2d.js'
import Sprite from '../../render/sprite.js'


const CLOUD_COUNT = 20
const CLOUD_MIN_Y = -1
const CLOUD_MAX_Y = 5
const CLOUD_DRIFT_Y = 0.1
const CLOUD_GROW_W = 0.4
const CLOUD_GROW_H = 0.8
const CLOUD_BASE_WIDTH = 9
const CLOUD_BASE_HEIGHT = 4.5
const CLOUD_FADE_MIN = 0.75
const CLOUD_FADE_MAX = 3


export default class MenuStage extends Stage {

    #sceneGroup = null
    #fogGroup = null
    #clouds = []
    #htmlLayer = null

    onStart () {
        super.onStart()

        this.#sceneGroup = new Group2D()
        this.#buildTitle()
        this.#buildFog()

        this.game.getLayer('game').setContent(this.#sceneGroup)

        this.#htmlLayer = this.game.createLayer('menuUI', 'html', {
            camera: this.game.camera,
            pointerEvents: 'auto'
        })

        this.#buildUI()
    }


    onStop () {
        super.onStop()
        this.game.getLayer('game').setContent(null)

        if (this.game.getLayer('menuUI')) {
            this.game.removeLayer('menuUI')
        }

        this.#clouds = []
    }


    update (deltaTime) {
        super.update(deltaTime)
        this.#updateFog(deltaTime)
    }


    #buildTitle () {
        const titleImage = this.game.getSource('title')

        if (!titleImage) {
            return
        }

        this.#sceneGroup.addChild(new Sprite({
            image: titleImage,
            width: 9.5,
            height: 9.5,
            y: 2,
            depth: 0
        }))
    }


    #buildFog () {
        const spritesheet = this.game.getSpritesheet('clouds')

        if (!spritesheet) {
            return
        }

        this.#fogGroup = new Group2D({depth: 1, y: 2})
        this.#sceneGroup.addChild(this.#fogGroup)

        for (let i = 0; i < CLOUD_COUNT; i++) {
            const region = spritesheet.getRegion('cloud' + (i + 1))
            const sprite = new Sprite({region, opacity: 0})
            this.#fogGroup.addChild(sprite)
            this.#clouds.push(resetCloud(sprite, true))
        }
    }


    #updateFog (deltaTime) {
        for (const cloud of this.#clouds) {
            const sprite = cloud.sprite

            cloud.age += deltaTime
            sprite.y += CLOUD_DRIFT_Y * deltaTime
            sprite.width += CLOUD_GROW_W * deltaTime
            sprite.height += CLOUD_GROW_H * deltaTime

            if (cloud.age < cloud.fadeIn) {
                sprite.opacity = (cloud.age / cloud.fadeIn) * cloud.maxOpacity
            } else if (cloud.age > cloud.lifespan - cloud.fadeIn) {
                const remaining = cloud.lifespan - cloud.age
                sprite.opacity = Math.max(0, (remaining / cloud.fadeIn) * cloud.maxOpacity)
            } else {
                sprite.opacity = cloud.maxOpacity
            }

            if (cloud.age >= cloud.lifespan) {
                resetCloud(sprite, false)
                cloud.age = 0
                cloud.fadeIn = CLOUD_FADE_MIN + Math.random() * (CLOUD_FADE_MAX - CLOUD_FADE_MIN)
                cloud.lifespan = 3 + Math.random() * 5
                cloud.maxOpacity = 0.3 + Math.random() * 0.4
            }
        }
    }


    #buildUI () {
        if (!this.#htmlLayer) {
            return
        }

        const iconSrc = this.game.getSource('menuIcon')?.src || ''

        this.#htmlLayer.setContent(buildMenuHTML(iconSrc))

        const playButton = this.#htmlLayer.div.querySelector('[data-action="play"]')

        if (playButton) {
            playButton.addEventListener('click', () => {
                this.game.startAdventure()
            })
        }
    }

}


function resetCloud (sprite, scattered) {
    const y = CLOUD_MIN_Y + Math.random() * (CLOUD_MAX_Y - CLOUD_MIN_Y)
    const depthFactor = 0.5 + (3 + y) / 11
    const scale = (0.75 + Math.random() * 0.5) * depthFactor

    sprite.x = (Math.random() - 0.5) * 4
    sprite.y = y
    sprite.width = CLOUD_BASE_WIDTH * scale
    sprite.height = CLOUD_BASE_HEIGHT * scale
    sprite.rotation = (Math.random() - 0.5) * Math.PI / 2
    sprite.opacity = 0

    const age = scattered ? Math.random() * 6 : 0

    return {
        sprite,
        age,
        fadeIn: CLOUD_FADE_MIN + Math.random() * (CLOUD_FADE_MAX - CLOUD_FADE_MIN),
        lifespan: 3 + Math.random() * 5,
        maxOpacity: 0.3 + Math.random() * 0.4
    }
}


function buildMenuHTML (iconSrc) {
    const settingsIcon = iconSrc
        ? `<img src="${iconSrc}" style="width: 32px; height: 32px; opacity: 0.6; cursor: pointer;" />`
        : ''

    return `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            height: 100%;
            padding-bottom: 12%;
            box-sizing: border-box;
            font-family: 'Macondo Swash Caps', serif;
        ">
            <div data-action="play" style="
                text-align: center;
                cursor: pointer;
                color: #d8d0cc;
                font-size: 22px;
                font-weight: bold;
                letter-spacing: 1px;
                text-shadow: 0.15em 0.15em 0.4em #2c2119, -0.02em -0.02em 0.01em #977966;
                margin-bottom: 20px;
                transition: text-shadow 0.2s;
            " onmouseover="this.style.textShadow='0.15em 0.15em 0.8em #2c2119, -0.02em -0.02em 0.02em #977966'"
               onmouseout="this.style.textShadow='0.15em 0.15em 0.4em #2c2119, -0.02em -0.02em 0.01em #977966'"
            >Start the adventure</div>

            <div style="
                text-align: center;
                cursor: pointer;
                color: #d8d0cc;
                font-size: 14px;
                letter-spacing: 1px;
                text-shadow: 0.15em 0.15em 0.4em #2c2119, -0.02em -0.02em 0.01em #977966;
                transition: text-shadow 0.2s;
            " onmouseover="this.style.textShadow='0.15em 0.15em 0.8em #2c2119, -0.02em -0.02em 0.02em #977966'"
               onmouseout="this.style.textShadow='0.15em 0.15em 0.4em #2c2119, -0.02em -0.02em 0.01em #977966'"
            >Roadmap</div>
        </div>

        <div style="
            position: absolute;
            bottom: 20px;
            right: 20px;
        ">${settingsIcon}</div>
    `
}
