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


    getBounds () {
        const size = this.radius * 2
        const offsetX = -this.radius * 2 * this.anchorX + this.radius
        const offsetY = -this.radius * 2 * this.anchorY + this.radius
        
        return {
            minX: offsetX - this.radius,
            minY: offsetY - this.radius,
            maxX: offsetX + this.radius,
            maxY: offsetY + this.radius,
            width: size,
            height: size
        }
    }

}
