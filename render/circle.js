import Object2D from './object_2d.js'


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
        const offsetX = -size * this.anchorX
        const offsetY = -size * this.anchorY

        return {
            minX: offsetX,
            minY: offsetY,
            maxX: offsetX + size,
            maxY: offsetY + size,
            width: size,
            height: size
        }
    }

}
