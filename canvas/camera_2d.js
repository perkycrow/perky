export default class Camera2D {

    constructor (options = {}) { // eslint-disable-line complexity
        this.x = options.x ?? 0
        this.y = options.y ?? 0
        this.zoom = options.zoom ?? 1
        this.rotation = options.rotation ?? 0  // radians
        
        this.unitsInView = options.unitsInView ?? 10
        this.viewportWidth = options.viewportWidth ?? 800
        this.viewportHeight = options.viewportHeight ?? 600
        this.pixelRatio = options.pixelRatio ?? 1
        
        this.followTarget = null
        this.followSpeed = 0.1
    }


    get pixelsPerUnit () {
        return this.viewportHeight / this.unitsInView * this.zoom
    }


    setUnitsInView (units) {
        this.unitsInView = units
        return this
    }


    setZoom (zoom) {
        this.zoom = zoom
        return this
    }


    setPosition (x, y) {
        this.x = x
        this.y = y
        return this
    }


    follow (target, speed = 0.1) {
        this.followTarget = target
        this.followSpeed = speed
        return this
    }


    update () {
        if (this.followTarget) {
            const dx = this.followTarget.x - this.x
            const dy = this.followTarget.y - this.y
            this.x += dx * this.followSpeed
            this.y += dy * this.followSpeed
        }
    }


    worldToScreen (worldX, worldY) {
        const ppu = this.pixelsPerUnit
        const screenX = (worldX - this.x) * ppu + this.viewportWidth / 2
        const screenY = -(worldY - this.y) * ppu + this.viewportHeight / 2
        return {x: screenX, y: screenY}
    }


    worldToScreenCSS (worldX, worldY) {
        return this.worldToScreen(worldX, worldY)
    }


    screenToWorld (screenX, screenY) {
        const ppu = this.pixelsPerUnit
        const worldX = (screenX - this.viewportWidth / 2) / ppu + this.x
        const worldY = -((screenY - this.viewportHeight / 2) / ppu) + this.y
        return {x: worldX, y: worldY}
    }


    isVisible (bounds) { // eslint-disable-line complexity
        if (!bounds || (bounds.width === 0 && bounds.height === 0)) {
            return false
        }

        const halfWidth = this.viewportWidth / (2 * this.pixelsPerUnit)
        const halfHeight = this.viewportHeight / (2 * this.pixelsPerUnit)
        
        const cameraMinX = this.x - halfWidth
        const cameraMaxX = this.x + halfWidth
        const cameraMinY = this.y - halfHeight
        const cameraMaxY = this.y + halfHeight
        
        return !(
            bounds.maxX < cameraMinX ||
            bounds.minX > cameraMaxX ||
            bounds.maxY < cameraMinY ||
            bounds.minY > cameraMaxY
        )
    }


    applyToContext (ctx, pixelRatio = 1) {
        const physicalWidth = this.viewportWidth * pixelRatio
        const physicalHeight = this.viewportHeight * pixelRatio

        ctx.translate(physicalWidth / 2, physicalHeight / 2)

        if (this.rotation !== 0) {
            ctx.rotate(-this.rotation)
        }
        
        const ppu = this.pixelsPerUnit * pixelRatio
        ctx.scale(ppu, -ppu)
        
        ctx.translate(-this.x, -this.y)
    }

}

