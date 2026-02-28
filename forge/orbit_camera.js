import Vec3 from '../math/vec3.js'


export default class OrbitCamera {

    #camera3d
    #canvas
    #target = new Vec3(0, 0, 0)
    #theta = Math.PI / 4
    #phi = Math.acos(5 / Math.sqrt(75))
    #radius = Math.sqrt(75)

    #minRadius = 1
    #maxRadius = 50
    #minPhi = 0.1
    #maxPhi = Math.PI / 2 - 0.1

    #rotateSensitivity = 0.005
    #zoomSensitivity = 0.002
    #panSensitivity = 0.005

    #pointers = new Map()
    #lastPinchDist = 0
    #lastMidpoint = null

    #onPointerDown = (e) => this.#handlePointerDown(e)
    #onPointerMove = (e) => this.#handlePointerMove(e)
    #onPointerUp = (e) => this.#handlePointerUp(e)
    #onWheel = (e) => this.#handleWheel(e)


    interceptor = null


    constructor (camera3d, canvas, options = {}) {
        this.#camera3d = camera3d
        this.#canvas = canvas

        if (options.target) {
            this.#target.copy(options.target)
        }
        if (options.theta !== undefined) {
            this.#theta = options.theta
        }
        if (options.phi !== undefined) {
            this.#phi = options.phi
        }
        if (options.radius !== undefined) {
            this.#radius = options.radius
        }
        if (options.minRadius !== undefined) {
            this.#minRadius = options.minRadius
        }
        if (options.maxRadius !== undefined) {
            this.#maxRadius = options.maxRadius
        }
        if (options.minPhi !== undefined) {
            this.#minPhi = options.minPhi
        }
        if (options.maxPhi !== undefined) {
            this.#maxPhi = options.maxPhi
        }
        if (options.rotateSensitivity !== undefined) {
            this.#rotateSensitivity = options.rotateSensitivity
        }
        if (options.zoomSensitivity !== undefined) {
            this.#zoomSensitivity = options.zoomSensitivity
        }
        if (options.panSensitivity !== undefined) {
            this.#panSensitivity = options.panSensitivity
        }

        this.update()
    }


    get target () {
        return this.#target
    }


    get theta () {
        return this.#theta
    }


    set theta (value) {
        this.#theta = value
    }


    get phi () {
        return this.#phi
    }


    set phi (value) {
        this.#phi = clamp(value, this.#minPhi, this.#maxPhi)
    }


    get radius () {
        return this.#radius
    }


    set radius (value) {
        this.#radius = clamp(value, this.#minRadius, this.#maxRadius)
    }


    update () {
        const sinPhi = Math.sin(this.#phi)
        const cosPhi = Math.cos(this.#phi)
        const sinTheta = Math.sin(this.#theta)
        const cosTheta = Math.cos(this.#theta)

        this.#camera3d.position.set(
            this.#target.x + this.#radius * sinPhi * sinTheta,
            this.#target.y + this.#radius * cosPhi,
            this.#target.z + this.#radius * sinPhi * cosTheta
        )

        this.#camera3d.lookAt(this.#target)
    }


    attach () {
        this.#canvas.style.touchAction = 'none'
        this.#canvas.addEventListener('pointerdown', this.#onPointerDown)
        this.#canvas.addEventListener('pointermove', this.#onPointerMove)
        this.#canvas.addEventListener('pointerup', this.#onPointerUp)
        this.#canvas.addEventListener('pointercancel', this.#onPointerUp)
        this.#canvas.addEventListener('wheel', this.#onWheel, {passive: false})
    }


    detach () {
        this.#canvas.removeEventListener('pointerdown', this.#onPointerDown)
        this.#canvas.removeEventListener('pointermove', this.#onPointerMove)
        this.#canvas.removeEventListener('pointerup', this.#onPointerUp)
        this.#canvas.removeEventListener('pointercancel', this.#onPointerUp)
        this.#canvas.removeEventListener('wheel', this.#onWheel)
        this.#pointers.clear()
    }


    #handlePointerDown (e) {
        if (this.interceptor?.(e)) {
            return
        }
        this.#canvas.setPointerCapture(e.pointerId)
        this.#pointers.set(e.pointerId, {x: e.clientX, y: e.clientY})

        if (this.#pointers.size === 2) {
            this.#lastPinchDist = this.#getPinchDistance()
            this.#lastMidpoint = this.#getMidpoint()
        }
    }


    #handlePointerMove (e) {
        if (this.interceptor?.(e)) {
            return
        }
        const prev = this.#pointers.get(e.pointerId)
        if (!prev) {
            return
        }

        const curr = {x: e.clientX, y: e.clientY}

        if (this.#pointers.size === 1) {
            if (e.button === 1 || e.buttons === 4) {
                this.#pan(curr.x - prev.x, curr.y - prev.y)
            } else {
                this.#orbit(curr.x - prev.x, curr.y - prev.y)
            }
        } else if (this.#pointers.size === 2) {
            this.#pointers.set(e.pointerId, curr)
            this.#handlePinchAndPan()
            return
        }

        this.#pointers.set(e.pointerId, curr)
    }


    #handlePointerUp (e) {
        if (this.interceptor?.(e)) {
            return
        }
        this.#pointers.delete(e.pointerId)
        this.#lastMidpoint = null
    }


    #handleWheel (e) {
        e.preventDefault()
        this.#radius = clamp(
            this.#radius + e.deltaY * this.#zoomSensitivity * this.#radius,
            this.#minRadius,
            this.#maxRadius
        )
        this.update()
    }


    #orbit (deltaX, deltaY) {
        this.#theta -= deltaX * this.#rotateSensitivity
        this.#phi = clamp(
            this.#phi - deltaY * this.#rotateSensitivity,
            this.#minPhi,
            this.#maxPhi
        )
        this.update()
    }


    #pan (deltaX, deltaY) {
        const forward = new Vec3(
            this.#target.x - this.#camera3d.position.x,
            0,
            this.#target.z - this.#camera3d.position.z
        ).normalize()

        const worldUp = new Vec3(0, 1, 0)
        const right = new Vec3().crossVectors(forward, worldUp).normalize()
        const up = new Vec3().crossVectors(right, forward).normalize()

        const speed = this.#panSensitivity * this.#radius

        this.#target.addScaledVector(right, -deltaX * speed)
        this.#target.addScaledVector(up, deltaY * speed)

        this.update()
    }


    #handlePinchAndPan () {
        const dist = this.#getPinchDistance()
        const mid = this.#getMidpoint()

        if (this.#lastPinchDist > 0) {
            const ratio = this.#lastPinchDist / dist
            this.#radius = clamp(
                this.#radius * ratio,
                this.#minRadius,
                this.#maxRadius
            )
        }

        if (this.#lastMidpoint) {
            this.#pan(
                mid.x - this.#lastMidpoint.x,
                mid.y - this.#lastMidpoint.y
            )
        }

        this.#lastPinchDist = dist
        this.#lastMidpoint = mid
    }


    #getPinchDistance () {
        const pts = Array.from(this.#pointers.values())
        const dx = pts[1].x - pts[0].x
        const dy = pts[1].y - pts[0].y
        return Math.sqrt(dx * dx + dy * dy)
    }


    #getMidpoint () {
        const pts = Array.from(this.#pointers.values())
        return {
            x: (pts[0].x + pts[1].x) / 2,
            y: (pts[0].y + pts[1].y) / 2
        }
    }

}


function clamp (value, min, max) {
    return Math.max(min, Math.min(max, value))
}
