import Sprite from './sprite.js'


export default class Image2D extends Sprite {

    constructor (options = {}) {
        const spriteOptions = {...options}

        spriteOptions.width = resolveDimension(options.width, options.height, 10)
        spriteOptions.height = resolveDimension(options.height, options.width, 10)

        super(spriteOptions)
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


function resolveDimension (primary, fallback, defaultValue) {
    if (primary !== undefined) {
        return primary
    }

    if (fallback !== undefined) {
        return fallback
    }

    return defaultValue
}
