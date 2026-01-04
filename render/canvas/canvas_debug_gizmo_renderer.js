import CanvasObjectRenderer from './canvas_object_renderer.js'


export default class CanvasDebugGizmoRenderer extends CanvasObjectRenderer {

    static get handles () {
        return []
    }


    collectGizmo (object, opacity) {
        this.collect(object, opacity, null)
    }


    flush () {
        const ctx = this.ctx

        for (const {object, opacity} of this.collected) {
            ctx.save()
            ctx.globalAlpha = opacity

            const m = object.worldMatrix
            ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5])

            this.renderGizmos(object, ctx)

            ctx.restore()
        }
    }


    get collected () {
        return this.constructor.prototype._collected || []
    }


    collect (object, opacity, hints) {
        if (!this.constructor.prototype._collected) {
            this.constructor.prototype._collected = []
        }
        this.constructor.prototype._collected.push({object, opacity, hints})
    }


    reset () {
        this.constructor.prototype._collected = []
    }


    renderGizmos (object, ctx) {
        const gizmos = object.debugGizmos
        if (!gizmos) {
            return
        }

        const bounds = object.getBounds()
        const hasSize = bounds.width > 0 || bounds.height > 0

        if (gizmos.bounds && hasSize) {
            this.renderBounds(ctx, bounds)
        }

        if (gizmos.anchor) {
            this.renderAnchor(ctx, object, bounds)
        }

        if (gizmos.pivot) {
            this.renderPivot(ctx, object)
        }

        if (gizmos.origin) {
            this.renderOrigin(ctx)
        }
    }


    renderBounds (ctx, bounds) { // eslint-disable-line local/class-methods-use-this -- static helper
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)'
        ctx.lineWidth = 0.02
        ctx.setLineDash([0.05, 0.05])
        ctx.strokeRect(bounds.minX, bounds.minY, bounds.width, bounds.height)
        ctx.setLineDash([])
    }


    renderAnchor (ctx, object, bounds) { // eslint-disable-line local/class-methods-use-this -- static helper
        const anchorX = bounds.minX + object.anchorX * bounds.width
        const anchorY = bounds.minY + object.anchorY * bounds.height

        const size = 0.08

        ctx.strokeStyle = 'rgba(255, 255, 0, 1)'
        ctx.lineWidth = 0.02

        ctx.beginPath()
        ctx.moveTo(anchorX - size, anchorY)
        ctx.lineTo(anchorX + size, anchorY)
        ctx.moveTo(anchorX, anchorY - size)
        ctx.lineTo(anchorX, anchorY + size)
        ctx.stroke()

        ctx.fillStyle = 'rgba(255, 255, 0, 0.5)'
        ctx.beginPath()
        ctx.arc(anchorX, anchorY, size * 0.5, 0, Math.PI * 2)
        ctx.fill()
    }


    renderPivot (ctx, object) { // eslint-disable-line local/class-methods-use-this -- static helper
        const pivotX = object.pivotX
        const pivotY = object.pivotY

        const size = 0.06

        ctx.strokeStyle = 'rgba(255, 0, 255, 1)'
        ctx.lineWidth = 0.02

        ctx.beginPath()
        ctx.arc(pivotX, pivotY, size, 0, Math.PI * 2)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(pivotX - size * 1.5, pivotY)
        ctx.lineTo(pivotX + size * 1.5, pivotY)
        ctx.moveTo(pivotX, pivotY - size * 1.5)
        ctx.lineTo(pivotX, pivotY + size * 1.5)
        ctx.stroke()
    }


    renderOrigin (ctx) { // eslint-disable-line local/class-methods-use-this -- static helper
        const size = 0.1

        ctx.strokeStyle = 'rgba(255, 0, 0, 1)'
        ctx.lineWidth = 0.025

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(size * 2, 0)
        ctx.stroke()

        ctx.strokeStyle = 'rgba(0, 255, 0, 1)'
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, size * 2)
        ctx.stroke()

        ctx.fillStyle = 'rgba(255, 255, 255, 1)'
        ctx.beginPath()
        ctx.arc(0, 0, 0.03, 0, Math.PI * 2)
        ctx.fill()
    }

}
