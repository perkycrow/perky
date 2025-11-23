import Object2D from './object_2d'


export default class Spritesheet2D extends Object2D {

    constructor (options = {}) {
        super(options)

        this.image = options.image ?? null
        this.data = options.data ?? {frames: [], meta: {}}
        this.framesMap = new Map()
        this.currentFrame = null

        this.width = options.width ?? null
        this.height = options.height ?? null

        this.#initializeFrames(this.data.frames, options)
    }


    #initializeFrames (frames, options) {
        if (!Array.isArray(frames)) {
            return
        }

        frames.forEach(frameData => {
            if (frameData.filename) {
                this.framesMap.set(frameData.filename, frameData)
            }
        })

        if (options.frame) {
            this.setFrame(options.frame)
        } else if (this.data.frames.length > 0) {
            const firstFrameName = this.data.frames[0].filename
            this.setFrame(firstFrameName)
        }
    }


    setFrame (frameName) {
        const frame = this.framesMap.get(frameName)
        if (frame) {
            this.currentFrame = frame
            this.markDirty()
        }
        return this
    }


    getFrame () {
        return this.currentFrame
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


    render (ctx) {
        if (this.image && this.image.complete && this.currentFrame) {
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
                this.image,
                x, y, w, h, 
                offsetX,
                -offsetY - renderH,
                renderW, renderH
            )

            ctx.restore()
        }
    }

}
