import Object2D from './object_2d.js'


export default class Group2D extends Object2D {

    constructor (options = {}) {
        super(options)
    }


    addChild (...objects) {
        return this.add(...objects)
    }


    getBounds () {
        if (this.children.length === 0) {
            return {
                minX: 0,
                minY: 0,
                maxX: 0,
                maxY: 0,
                width: 0,
                height: 0
            }
        }
        
        let minX = Infinity
        let minY = Infinity
        let maxX = -Infinity
        let maxY = -Infinity
        
        this.children.forEach(child => {
            const bounds = child.getBounds()
            
            if (bounds.width === 0 && bounds.height === 0) {
                return
            }
            
            const m = child.worldMatrix
            const corners = [
                {x: bounds.minX, y: bounds.minY},
                {x: bounds.maxX, y: bounds.minY},
                {x: bounds.minX, y: bounds.maxY},
                {x: bounds.maxX, y: bounds.maxY}
            ]
            
            corners.forEach(corner => {
                const x = m[0] * corner.x + m[2] * corner.y + m[4]
                const y = m[1] * corner.x + m[3] * corner.y + m[5]
                
                minX = Math.min(minX, x)
                minY = Math.min(minY, y)
                maxX = Math.max(maxX, x)
                maxY = Math.max(maxY, y)
            })
        })
        
        if (minX === Infinity) {
            return {
                minX: 0,
                minY: 0,
                maxX: 0,
                maxY: 0,
                width: 0,
                height: 0
            }
        }
        
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
