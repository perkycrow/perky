import Object2D from './object_2d.js'


export default class Line extends Object2D {

    constructor (options = {}) {
        super(options)

        this.x2 = options.x2 ?? 0
        this.y2 = options.y2 ?? 0
        this.color = options.color ?? '#000000'
        this.lineWidth = options.lineWidth ?? 1
    }


    getBounds () {
        const minX = Math.min(0, this.x2)
        const minY = Math.min(0, this.y2)
        const maxX = Math.max(0, this.x2)
        const maxY = Math.max(0, this.y2)

        return {
            minX,
            minY,
            maxX,
            maxY,
            width: maxX - minX,
            height: maxY - minY
        }
    }

}
