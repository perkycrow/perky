export default class Vec3 {

    constructor (x = 0, y = 0, z = 0) { // eslint-disable-line complexity -- clean
        if (typeof x === 'object') {
            if (Array.isArray(x)) {
                this.x = x[0] ?? 0
                this.y = x[1] ?? 0
                this.z = x[2] ?? 0
            } else {
                this.x = x.x ?? 0
                this.y = x.y ?? 0
                this.z = x.z ?? 0
            }
        } else {
            this.x = x
            this.y = y
            this.z = z
        }
    }


    set (x, y, z) {
        this.x = x
        this.y = y
        this.z = z
        return this
    }


    setX (x) {
        this.x = x
        return this
    }


    setY (y) {
        this.y = y
        return this
    }


    setZ (z) {
        this.z = z
        return this
    }


    setScalar (scalar) {
        this.x = scalar
        this.y = scalar
        this.z = scalar
        return this
    }


    copy (v) {
        this.x = v.x
        this.y = v.y
        this.z = v.z
        return this
    }


    clone () {
        return new Vec3(this.x, this.y, this.z)
    }


    add (v) {
        this.x += v.x
        this.y += v.y
        this.z += v.z
        return this
    }


    addScalar (s) {
        this.x += s
        this.y += s
        this.z += s
        return this
    }


    addVectors (a, b) {
        this.x = a.x + b.x
        this.y = a.y + b.y
        this.z = a.z + b.z
        return this
    }


    addScaledVector (v, s) {
        this.x += v.x * s
        this.y += v.y * s
        this.z += v.z * s
        return this
    }


    sub (v) {
        this.x -= v.x
        this.y -= v.y
        this.z -= v.z
        return this
    }


    subScalar (s) {
        this.x -= s
        this.y -= s
        this.z -= s
        return this
    }


    subVectors (a, b) {
        this.x = a.x - b.x
        this.y = a.y - b.y
        this.z = a.z - b.z
        return this
    }


    multiply (v) {
        this.x *= v.x
        this.y *= v.y
        this.z *= v.z
        return this
    }


    multiplyScalar (scalar) {
        this.x *= scalar
        this.y *= scalar
        this.z *= scalar
        return this
    }


    multiplyVectors (a, b) {
        this.x = a.x * b.x
        this.y = a.y * b.y
        this.z = a.z * b.z
        return this
    }


    divide (v) {
        this.x /= v.x
        this.y /= v.y
        this.z /= v.z
        return this
    }


    divideScalar (scalar) {
        return this.multiplyScalar(1 / scalar)
    }


    dot (v) {
        return this.x * v.x + this.y * v.y + this.z * v.z
    }


    cross (v) {
        return this.crossVectors(this, v)
    }


    crossVectors (a, b) {
        const ax = a.x
        const ay = a.y
        const az = a.z
        const bx = b.x
        const by = b.y
        const bz = b.z

        this.x = ay * bz - az * by
        this.y = az * bx - ax * bz
        this.z = ax * by - ay * bx

        return this
    }


    lengthSq () {
        return this.x * this.x + this.y * this.y + this.z * this.z
    }


    length () {
        return Math.sqrt(this.lengthSq())
    }


    manhattanLength () {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z)
    }


    normalize () {
        return this.divideScalar(this.length() || 1)
    }


    setLength (length) {
        return this.normalize().multiplyScalar(length)
    }


    angleTo (v) {
        const denominator = Math.sqrt(this.lengthSq() * v.lengthSq())
        if (denominator === 0) {
            return Math.PI / 2
        }
        const theta = this.dot(v) / denominator
        return Math.acos(Math.max(-1, Math.min(1, theta)))
    }


    distanceTo (v) {
        return Math.sqrt(this.distanceToSquared(v))
    }


    distanceToSquared (v) {
        const dx = this.x - v.x
        const dy = this.y - v.y
        const dz = this.z - v.z
        return dx * dx + dy * dy + dz * dz
    }


    manhattanDistanceTo (v) {
        return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z)
    }


    lerp (v, alpha) {
        this.x += (v.x - this.x) * alpha
        this.y += (v.y - this.y) * alpha
        this.z += (v.z - this.z) * alpha
        return this
    }


    lerpVectors (v1, v2, alpha) {
        this.x = v1.x + (v2.x - v1.x) * alpha
        this.y = v1.y + (v2.y - v1.y) * alpha
        this.z = v1.z + (v2.z - v1.z) * alpha
        return this
    }


    equals (v) {
        return v.x === this.x && v.y === this.y && v.z === this.z
    }


    fromArray (array, offset = 0) {
        this.x = array[offset]
        this.y = array[offset + 1]
        this.z = array[offset + 2]
        return this
    }


    toArray (array = [], offset = 0) {
        array[offset] = this.x
        array[offset + 1] = this.y
        array[offset + 2] = this.z
        return array
    }


    negate () {
        this.x = -this.x
        this.y = -this.y
        this.z = -this.z
        return this
    }


    min (v) {
        this.x = Math.min(this.x, v.x)
        this.y = Math.min(this.y, v.y)
        this.z = Math.min(this.z, v.z)
        return this
    }


    max (v) {
        this.x = Math.max(this.x, v.x)
        this.y = Math.max(this.y, v.y)
        this.z = Math.max(this.z, v.z)
        return this
    }


    clamp (min, max) {
        this.x = Math.max(min.x, Math.min(max.x, this.x))
        this.y = Math.max(min.y, Math.min(max.y, this.y))
        this.z = Math.max(min.z, Math.min(max.z, this.z))
        return this
    }


    clampScalar (minVal, maxVal) {
        this.x = Math.max(minVal, Math.min(maxVal, this.x))
        this.y = Math.max(minVal, Math.min(maxVal, this.y))
        this.z = Math.max(minVal, Math.min(maxVal, this.z))
        return this
    }


    clampLength (min, max) {
        const length = this.length()
        return this.divideScalar(length || 1).multiplyScalar(
            Math.max(min, Math.min(max, length))
        )
    }


    floor () {
        this.x = Math.floor(this.x)
        this.y = Math.floor(this.y)
        this.z = Math.floor(this.z)
        return this
    }


    ceil () {
        this.x = Math.ceil(this.x)
        this.y = Math.ceil(this.y)
        this.z = Math.ceil(this.z)
        return this
    }


    round () {
        this.x = Math.round(this.x)
        this.y = Math.round(this.y)
        this.z = Math.round(this.z)
        return this
    }


    roundToZero () {
        this.x = Math.trunc(this.x)
        this.y = Math.trunc(this.y)
        this.z = Math.trunc(this.z)
        return this
    }


    random () {
        this.x = Math.random()
        this.y = Math.random()
        this.z = Math.random()
        return this
    }


    randomDirection () {
        const u = (Math.random() - 0.5) * 2
        const t = Math.random() * Math.PI * 2
        const f = Math.sqrt(1 - u * u)

        this.x = f * Math.cos(t)
        this.y = f * Math.sin(t)
        this.z = u

        return this
    }


    reflect (normal) {
        return this.sub(new Vec3().copy(normal).multiplyScalar(2 * this.dot(normal)))
    }


    projectOnVector (v) {
        const denominator = v.lengthSq()
        if (denominator === 0) {
            return this.set(0, 0, 0)
        }
        const scalar = v.dot(this) / denominator
        return this.copy(v).multiplyScalar(scalar)
    }


    projectOnPlane (planeNormal) {
        const projected = new Vec3().copy(this).projectOnVector(planeNormal)
        return this.sub(projected)
    }


    applyAxisAngle (axis, angle) {
        const halfAngle = angle / 2
        const s = Math.sin(halfAngle)

        const qx = axis.x * s
        const qy = axis.y * s
        const qz = axis.z * s
        const qw = Math.cos(halfAngle)

        const ix = qw * this.x + qy * this.z - qz * this.y
        const iy = qw * this.y + qz * this.x - qx * this.z
        const iz = qw * this.z + qx * this.y - qy * this.x
        const iw = -qx * this.x - qy * this.y - qz * this.z

        this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy
        this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz
        this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx

        return this
    }


    getComponent (index) {
        if (index === 0) {
            return this.x
        } else if (index === 1) {
            return this.y
        } else if (index === 2) {
            return this.z
        }
        throw new Error(`index out of range: ${index}`)
    }


    setComponent (index, value) {
        if (index === 0) {
            this.x = value
        } else if (index === 1) {
            this.y = value
        } else if (index === 2) {
            this.z = value
        } else {
            throw new Error(`index out of range: ${index}`)
        }
        return this
    }


    get isVector3 () { // eslint-disable-line local/class-methods-use-this -- clean
        return true
    }


    *[Symbol.iterator] () {
        yield this.x
        yield this.y
        yield this.z
    }

}
