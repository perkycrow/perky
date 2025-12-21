import Object2D from './object_2d.js'

export default class Sprite2D extends Object2D {

    constructor (options = {}) {
        super(options)

        this.image = options.image || null
        this.currentFrame = options.frame || null
        this.width = options.width ?? null
        this.height = options.height ?? null

        this.animations = new Map()
        this.currentAnimation = null
    }

    setFrame (frame) {
        this.currentFrame = frame
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
        if (!this.currentFrame) {
            return super.getBounds()
        }

        const {w, h} = this.currentFrame.frame

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

    render (ctx) { // eslint-disable-line complexity
        const img = this.image || (this.currentFrame ? this.currentFrame.image : null)

        if (img && img.complete && this.currentFrame) {
            const {x, y, w, h} = this.currentFrame.frame

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

            ctx.save()

            ctx.scale(1, -1)

            ctx.drawImage(
                img,
                x, y, w, h,
                offsetX,
                -offsetY - renderH,
                renderW, renderH
            )

            ctx.restore()
        }
    }
}
