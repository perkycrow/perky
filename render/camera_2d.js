import PerkyModule from '../core/perky_module'
import Easing from '../math/easing'


export default class Camera2D extends PerkyModule {

    static $category = 'camera'

    constructor (options = {}) { // eslint-disable-line complexity
        super(options)

        this.x = options.x ?? 0
        this.y = options.y ?? 0
        this.zoom = options.zoom ?? 1
        this.rotation = options.rotation ?? 0

        const unitsInView = options.unitsInView ?? 10
        if (typeof unitsInView === 'number') {
            this.unitsInView = {height: unitsInView}
        } else {
            this.unitsInView = unitsInView
        }

        this.viewportWidth = options.viewportWidth ?? 800
        this.viewportHeight = options.viewportHeight ?? 600
        this.pixelRatio = options.pixelRatio ?? 1

        this.followTarget = null
        this.followSpeed = 0.1

        this.offsetX = 0
        this.offsetY = 0
        this.offsetZoom = 0
        this.offsetRotation = 0

        this.transition = null
        this.effects = []
    }


    get pixelsPerUnit () {
        const effectiveZoom = this.zoom + this.offsetZoom

        if (this.unitsInView.width && this.unitsInView.height) {
            const ppuForWidth = this.viewportWidth / this.unitsInView.width
            const ppuForHeight = this.viewportHeight / this.unitsInView.height

            return Math.min(ppuForWidth, ppuForHeight) * effectiveZoom
        } else if (this.unitsInView.width) {
            return this.viewportWidth / this.unitsInView.width * effectiveZoom
        } else {
            return this.viewportHeight / this.unitsInView.height * effectiveZoom
        }
    }


    get effectiveX () {
        return this.x + this.offsetX
    }


    get effectiveY () {
        return this.y + this.offsetY
    }


    get effectiveRotation () {
        return this.rotation + this.offsetRotation
    }


    setUnitsInView (units) {
        if (typeof units === 'number') {
            this.unitsInView = {height: units}
        } else {
            this.unitsInView = units
        }
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


    stopFollow () {
        this.followTarget = null
        return this
    }


    animateTo (config, options = {}) { // eslint-disable-line complexity
        const duration = options.duration ?? 1
        const easing = options.easing ?? 'easeOutQuad'
        const onComplete = options.onComplete ?? null

        this.transition = {
            startX: this.x,
            startY: this.y,
            startZoom: this.zoom,
            startRotation: this.rotation,
            targetX: config.x ?? this.x,
            targetY: config.y ?? this.y,
            targetZoom: config.zoom ?? this.zoom,
            targetRotation: config.rotation ?? this.rotation,
            duration,
            elapsed: 0,
            easing: Easing.resolve(easing),
            onComplete
        }

        return this
    }


    transitionTo (otherCamera, options = {}) {
        return this.animateTo({
            x: otherCamera.x,
            y: otherCamera.y,
            zoom: otherCamera.zoom,
            rotation: otherCamera.rotation
        }, options)
    }


    cancelTransition () {
        this.transition = null
        return this
    }


    animate (handler, options = {}) {
        const effect = {
            handler,
            duration: options.duration ?? Infinity,
            elapsed: 0,
            onComplete: options.onComplete ?? null
        }

        this.effects.push(effect)
        return this
    }


    shake (options = {}) {
        const intensity = options.intensity ?? 0.5
        const duration = options.duration ?? 0.3
        const decay = options.decay ?? true

        return this.animate((deltaTime, elapsed, total) => {
            const progress = elapsed / total
            const factor = decay ? 1 - progress : 1

            this.offsetX = (Math.random() - 0.5) * 2 * intensity * factor
            this.offsetY = (Math.random() - 0.5) * 2 * intensity * factor

            return progress >= 1
        }, {
            duration,
            onComplete: () => {
                this.offsetX = 0
                this.offsetY = 0
            }
        })
    }


    clearEffects () {
        this.effects = []
        this.offsetX = 0
        this.offsetY = 0
        this.offsetZoom = 0
        this.offsetRotation = 0
        return this
    }


    update (deltaTime = 0) { // eslint-disable-line complexity
        if (this.followTarget) {
            const dx = this.followTarget.x - this.x
            const dy = this.followTarget.y - this.y
            this.x += dx * this.followSpeed
            this.y += dy * this.followSpeed
        }

        if (!deltaTime) {
            return
        }

        if (this.transition) {
            this.transition.elapsed += deltaTime

            const t = Math.min(this.transition.elapsed / this.transition.duration, 1)
            const easedT = this.transition.easing(t)

            this.x = this.transition.startX + (this.transition.targetX - this.transition.startX) * easedT
            this.y = this.transition.startY + (this.transition.targetY - this.transition.startY) * easedT
            this.zoom = this.transition.startZoom + (this.transition.targetZoom - this.transition.startZoom) * easedT
            this.rotation = this.transition.startRotation + (this.transition.targetRotation - this.transition.startRotation) * easedT

            if (t >= 1) {
                const onComplete = this.transition.onComplete
                this.transition = null
                if (onComplete) {
                    onComplete()
                }
            }
        }

        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i]
            effect.elapsed += deltaTime

            const done = effect.handler(deltaTime, effect.elapsed, effect.duration)

            if (done) {
                if (effect.onComplete) {
                    effect.onComplete()
                }
                this.effects.splice(i, 1)
            }
        }
    }


    worldToScreen (worldX, worldY) {
        const ppu = this.pixelsPerUnit
        const rotation = this.effectiveRotation

        let dx = worldX - this.effectiveX
        let dy = worldY - this.effectiveY

        if (rotation !== 0) {
            const cos = Math.cos(-rotation)
            const sin = Math.sin(-rotation)
            const rotatedX = dx * cos - dy * sin
            const rotatedY = dx * sin + dy * cos
            dx = rotatedX
            dy = rotatedY
        }

        const screenX = dx * ppu + this.viewportWidth / 2
        const screenY = -dy * ppu + this.viewportHeight / 2
        return {x: screenX, y: screenY}
    }


    worldToScreenCSS (worldX, worldY) {
        return this.worldToScreen(worldX, worldY)
    }


    screenToWorld (screenX, screenY) {
        const ppu = this.pixelsPerUnit
        const rotation = this.effectiveRotation

        let dx = (screenX - this.viewportWidth / 2) / ppu
        let dy = -((screenY - this.viewportHeight / 2) / ppu)

        if (rotation !== 0) {
            const cos = Math.cos(rotation)
            const sin = Math.sin(rotation)
            const rotatedX = dx * cos - dy * sin
            const rotatedY = dx * sin + dy * cos
            dx = rotatedX
            dy = rotatedY
        }

        const worldX = dx + this.effectiveX
        const worldY = dy + this.effectiveY
        return {x: worldX, y: worldY}
    }


    isVisible (bounds) { // eslint-disable-line complexity
        if (!bounds || (bounds.width === 0 && bounds.height === 0)) {
            return false
        }

        const halfWidth = this.viewportWidth / (2 * this.pixelsPerUnit)
        const halfHeight = this.viewportHeight / (2 * this.pixelsPerUnit)

        const cameraMinX = this.effectiveX - halfWidth
        const cameraMaxX = this.effectiveX + halfWidth
        const cameraMinY = this.effectiveY - halfHeight
        const cameraMaxY = this.effectiveY + halfHeight

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
        const rotation = this.effectiveRotation

        ctx.translate(physicalWidth / 2, physicalHeight / 2)

        if (rotation !== 0) {
            ctx.rotate(-rotation)
        }

        const ppu = this.pixelsPerUnit * pixelRatio
        ctx.scale(ppu, -ppu)

        ctx.translate(-this.effectiveX, -this.effectiveY)
    }

}
