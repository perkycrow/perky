import Object2D from './object_2d'


export default class Image2D extends Object2D {

    constructor (options = {}) {
        super(options)
        
        this.image = options.image ?? null
        this.width = options.width ?? 10
        this.height = options.height ?? 10
    }


    render (ctx) {
        if (this.image && this.image.complete) {
            const offsetX = -this.width * this.anchorX
            const offsetY = -this.height * this.anchorY
            
            ctx.save()
            ctx.scale(1, -1)
            ctx.drawImage(
                this.image,
                offsetX,
                -offsetY - this.height,
                this.width,
                this.height
            )
            ctx.restore()
        }
    }

}
