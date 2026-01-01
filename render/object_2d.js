import Transform2D from './transform_2d.js'


export default class Object2D extends Transform2D {

    constructor (options = {}) { // eslint-disable-line complexity
        super()

        this.visible = options.visible ?? true
        this.opacity = options.opacity ?? 1
        this.depth = options.depth ?? 0
        this.anchorX = options.anchorX ?? 0.5
        this.anchorY = options.anchorY ?? 0.5

        if (options.x !== undefined) {
            this.x = options.x
        }
        if (options.y !== undefined) {
            this.y = options.y
        }
        if (options.rotation !== undefined) {
            this.rotation = options.rotation
        }
        if (options.scaleX !== undefined) {
            this.scaleX = options.scaleX
        }
        if (options.scaleY !== undefined) {
            this.scaleY = options.scaleY
        }
        if (options.pivotX !== undefined) {
            this.pivotX = options.pivotX
        }
        if (options.pivotY !== undefined) {
            this.pivotY = options.pivotY
        }
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
        this.markDirty()
        return this
    }


    setVisible (visible) {
        this.visible = visible
        this.markDirty()
        return this
    }


    setDepth (depth) {
        if (this.depth !== depth) {
            this.depth = depth
            if (this.parent) {
                this.parent.markChildrenNeedSort()
            }
            this.markDirty()
        }
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


    getBounds () { // eslint-disable-line class-methods-use-this
        return {
            minX: 0,
            minY: 0,
            maxX: 0,
            maxY: 0,
            width: 0,
            height: 0
        }
    }


    getWorldBounds () {
        const localBounds = this.getBounds()

        if (localBounds.width === 0 && localBounds.height === 0) {
            return localBounds
        }

        const corners = [
            {x: localBounds.minX, y: localBounds.minY},
            {x: localBounds.maxX, y: localBounds.minY},
            {x: localBounds.minX, y: localBounds.maxY},
            {x: localBounds.maxX, y: localBounds.maxY}
        ]

        const transformedCorners = corners.map(corner => this.transformPoint(corner))

        const xs = transformedCorners.map(c => c.x)
        const ys = transformedCorners.map(c => c.y)

        const minX = Math.min(...xs)
        const minY = Math.min(...ys)
        const maxX = Math.max(...xs)
        const maxY = Math.max(...ys)

        return {
            minX,
            minY,
            maxX,
            maxY,
            width: maxX - minX,
            height: maxY - minY
        }
    }


    get renderHints () { // eslint-disable-line class-methods-use-this
        return null
    }


    render () { // eslint-disable-line class-methods-use-this

    }

}
