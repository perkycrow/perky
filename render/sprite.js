import Object2D from './object_2d.js'
import TextureRegion from './textures/texture_region.js'


export default class Sprite extends Object2D {

    #region = null

    constructor (options = {}) {
        super(options)

        this.width = options.width ?? null
        this.height = options.height ?? null

        this.animations = new Map()
        this.currentAnimation = null

        if (options.region) {
            this.#region = options.region
        } else if (options.frame) {
            this.setFrame(options.frame)
        } else if (options.image) {
            this.#region = TextureRegion.fromImage(options.image)
        }
    }


    get region () {
        return this.#region
    }


    set region (value) {
        this.#region = value
    }


    get image () {
        return this.#region?.image ?? null
    }


    set image (value) {
        if (value) {
            this.#region = TextureRegion.fromImage(value)
        } else {
            this.#region = null
        }
    }


    get currentFrame () {
        return this.#region
    }


    setFrame (frame) {
        if (frame instanceof TextureRegion) {
            this.#region = frame
        } else if (frame && frame.frame) {
            const image = frame.image
            this.#region = TextureRegion.fromFrame(image, frame.frame)
        } else {
            this.#region = null
        }
    }


    addAnimation (name, animation) {
        this.animations.set(name, animation)
    }


    play (name) {
        const animation = this.animations.get(name)
        if (animation) {
            if (this.currentAnimation && this.currentAnimation !== animation) {
                this.currentAnimation.stop()
            }
            this.currentAnimation = animation
            this.currentAnimation.play()
        }
    }


    stop () {
        if (this.currentAnimation) {
            this.currentAnimation.stop()
            this.currentAnimation = null
        }
    }


    getBounds () {
        const region = this.#region

        if (!region) {
            return super.getBounds()
        }

        const w = region.width
        const h = region.height

        let renderW = w
        let renderH = h

        if (this.width !== null) {
            renderW = this.width
            renderH = (h / w) * renderW
        } else if (this.height !== null) {
            renderH = this.height
            renderW = (w / h) * renderH
        }

        const offsetX = -renderW * this.anchorX
        const offsetY = -renderH * this.anchorY

        return {
            minX: offsetX,
            minY: offsetY,
            maxX: offsetX + renderW,
            maxY: offsetY + renderH,
            width: renderW,
            height: renderH
        }
    }

}
