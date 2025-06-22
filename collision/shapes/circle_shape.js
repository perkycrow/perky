
export default class CircleShape {

    constructor (options = {}) {
        this.type = 'circle'
        this.radius = options.radius || 16
        this.offset = options.offset || {x: 0, y: 0}
        this.x = options.x || 0
        this.y = options.y || 0
        this.body = null
    }


    updateFromBody (body) {
        this.x = body.position.x + this.offset.x
        this.y = body.position.y + this.offset.y

        if (body.scale) {
            this.scaledRadius = this.radius * Math.max(body.scale.x, body.scale.y)
        } else {
            this.scaledRadius = this.radius
        }
    }


    getWorldPosition () {
        return {x: this.x, y: this.y}
    }


    getBounds () {
        const radius = this.scaledRadius || this.radius
        
        return {
            left: this.x - radius,
            right: this.x + radius,
            top: this.y - radius,
            bottom: this.y + radius,
            centerX: this.x,
            centerY: this.y,
            width: radius * 2,
            height: radius * 2
        }
    }


    containsPoint (x, y) {
        const dx = x - this.x
        const dy = y - this.y
        const radius = this.scaledRadius || this.radius
        return (dx * dx + dy * dy) <= (radius * radius)
    }


    setRadius (radius) {
        this.radius = radius
        return this
    }


    setOffset (x, y) {
        this.offset = {x, y}
        return this
    }


    debug (ctx) {
        const radius = this.scaledRadius || this.radius
        ctx.beginPath()
        ctx.arc(0, 0, radius, 0, Math.PI * 2)
        ctx.stroke()
    }

}
