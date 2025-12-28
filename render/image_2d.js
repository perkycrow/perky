import Object2D from './object_2d'


export default class Image2D extends Object2D {

    constructor (options = {}) {
        super(options)
        
        this.image = options.image ?? null
        this.width = options.width ?? 10
        this.height = options.height ?? 10
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



}
