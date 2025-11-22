import Object2D from './object_2d'


export default class Circle extends Object2D {

    constructor (options = {}) {
        super(options)
        
        this.radius = options.radius ?? 10
        this.color = options.color ?? '#000000'
        this.strokeColor = options.strokeColor ?? '#000000'
        this.strokeWidth = options.strokeWidth ?? 0
    }


    setRadius (radius) {
        this.radius = radius
        return this
    }


    render (ctx) {
        const offsetX = -this.radius * 2 * this.anchorX + this.radius
        const offsetY = -this.radius * 2 * this.anchorY + this.radius
        
        ctx.beginPath()
        ctx.arc(offsetX, offsetY, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
        
        if (this.strokeWidth > 0) {
            ctx.strokeStyle = this.strokeColor
            ctx.lineWidth = this.strokeWidth
            ctx.stroke()
        }
    }

}
