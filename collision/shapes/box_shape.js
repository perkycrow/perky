export default class BoxShape {

    constructor (options = {}) {
        this.type = 'box'
        this.width = options.width || 32
        this.height = options.height || 32
        this.offset = options.offset || {x: 0, y: 0}
        this.x = options.x || 0
        this.y = options.y || 0
        this.body = null
    }


    updateFromBody (body) {
        this.x = body.position.x + this.offset.x
        this.y = body.position.y + this.offset.y

        if (body.scale) {
            this.scaledWidth = this.width * body.scale.x
            this.scaledHeight = this.height * body.scale.y
        } else {
            this.scaledWidth = this.width
            this.scaledHeight = this.height
        }
    }


    getBounds () {
        const halfWidth = (this.scaledWidth || this.width) / 2
        const halfHeight = (this.scaledHeight || this.height) / 2

        return {
            left: this.x - halfWidth,
            right: this.x + halfWidth,
            top: this.y - halfHeight,
            bottom: this.y + halfHeight,
            centerX: this.x,
            centerY: this.y,
            width: this.scaledWidth || this.width,
            height: this.scaledHeight || this.height
        }
    }


    containsPoint (x, y) {
        const bounds = this.getBounds()
        return x >= bounds.left && x <= bounds.right &&
               y >= bounds.top && y <= bounds.bottom
    }


    setSize (width, height) {
        this.width = width
        this.height = height || width
        return this
    }


    setOffset (x, y) {
        this.offset = {x, y}
        return this
    }


    debug (ctx) {
        const width = this.scaledWidth || this.width
        const height = this.scaledHeight || this.height
        ctx.strokeRect(-width / 2, -height / 2, width, height)
    }

}
