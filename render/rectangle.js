import Object2D from './object_2d'


export default class Rectangle extends Object2D {

    constructor (options = {}) {
        super(options)
        
        this.width = options.width ?? 10
        this.height = options.height ?? 10
        this.color = options.color ?? '#000000'
        this.strokeColor = options.strokeColor ?? '#000000'
        this.strokeWidth = options.strokeWidth ?? 0
    }


    getBounds () {
        const offsetX = -this.width * this.anchorX
        const offsetY = -this.height * this.anchorY
        
        return {
            minX: offsetX,
            minY: offsetY,
            maxX: offsetX + this.width,
            maxY: offsetY + this.height,
            width: this.width,
            height: this.height
        }
    }


    render (ctx) {
        const offsetX = -this.width * this.anchorX
        const offsetY = -this.height * this.anchorY

        if (this.color && this.color !== 'transparent') {
            ctx.fillStyle = this.color
            ctx.fillRect(offsetX, offsetY, this.width, this.height)
        }

        if (this.strokeWidth > 0) {
            ctx.strokeStyle = this.strokeColor
            ctx.lineWidth = this.strokeWidth
            ctx.strokeRect(offsetX, offsetY, this.width, this.height)
        }
    }

}
