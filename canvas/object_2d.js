import Transform2D from './transform_2d'


export default class Object2D extends Transform2D {

    constructor (options = {}) {
        super()
        
        this.visible = options.visible ?? true
        this.opacity = options.opacity ?? 1
        this.anchorX = options.anchorX ?? 0.5
        this.anchorY = options.anchorY ?? 0.5
        
        if (options.x !== undefined) this.x = options.x
        if (options.y !== undefined) this.y = options.y
        if (options.rotation !== undefined) this.rotation = options.rotation
        if (options.scaleX !== undefined) this.scaleX = options.scaleX
        if (options.scaleY !== undefined) this.scaleY = options.scaleY
        if (options.pivotX !== undefined) this.pivotX = options.pivotX
        if (options.pivotY !== undefined) this.pivotY = options.pivotY
    }


    setPosition (x, y) {
        this.x = x
        this.y = y
        this.markDirty()
        return this
    }


    setRotation (rotation) {
        this.rotation = rotation
        this.markDirty()
        return this
    }


    setScale (scaleX, scaleY = scaleX) {
        this.scaleX = scaleX
        this.scaleY = scaleY
        this.markDirty()
        return this
    }


    setOpacity (opacity) {
        this.opacity = opacity
        return this
    }


    setAnchor (x, y = x) {
        this.anchorX = x
        this.anchorY = y
        this.markDirty()
        return this
    }


    setPivot (x, y) {
        this.pivotX = x
        this.pivotY = y
        this.markDirty()
        return this
    }


    render (ctx) {
    }

}
