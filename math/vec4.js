export default class Vec4 {

    constructor (x = 0, y = 0, z = 0, w = 1) { // eslint-disable-line complexity -- clean
        if (typeof x === 'object') {
            if (Array.isArray(x)) {
                this.x = x[0] ?? 0
                this.y = x[1] ?? 0
                this.z = x[2] ?? 0
                this.w = x[3] ?? 1
            } else {
                this.x = x.x ?? 0
                this.y = x.y ?? 0
                this.z = x.z ?? 0
                this.w = x.w ?? 1
            }
        } else {
            this.x = x
            this.y = y
            this.z = z
            this.w = w
        }
    }


    set (x, y, z, w) {
        this.x = x
        this.y = y
        this.z = z
        this.w = w
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


    setW (w) {
        this.w = w
        return this
    }


    setScalar (scalar) {
        this.x = scalar
        this.y = scalar
        this.z = scalar
        this.w = scalar
        return this
    }


    copy (v) {
        this.x = v.x
        this.y = v.y
        this.z = v.z ?? 0
        this.w = v.w ?? 1
        return this
    }


    clone () {
        return new Vec4(this.x, this.y, this.z, this.w)
    }


    add (v) {
        this.x += v.x
        this.y += v.y
        this.z += v.z
        this.w += v.w
        return this
    }


    addScalar (s) {
        this.x += s
        this.y += s
        this.z += s
        this.w += s
        return this
    }


    addVectors (a, b) {
        this.x = a.x + b.x
        this.y = a.y + b.y
        this.z = a.z + b.z
        this.w = a.w + b.w
        return this
    }


    addScaledVector (v, s) {
        this.x += v.x * s
        this.y += v.y * s
        this.z += v.z * s
        this.w += v.w * s
        return this
    }


    sub (v) {
        this.x -= v.x
        this.y -= v.y
        this.z -= v.z
        this.w -= v.w
        return this
    }


    subScalar (s) {
        this.x -= s
        this.y -= s
        this.z -= s
        this.w -= s
        return this
    }


    subVectors (a, b) {
        this.x = a.x - b.x
        this.y = a.y - b.y
        this.z = a.z - b.z
        this.w = a.w - b.w
        return this
    }


    multiply (v) {
        this.x *= v.x
        this.y *= v.y
        this.z *= v.z
        this.w *= v.w
        return this
    }


    multiplyScalar (scalar) {
        this.x *= scalar
        this.y *= scalar
        this.z *= scalar
        this.w *= scalar
        return this
    }


    divide (v) {
        this.x /= v.x
        this.y /= v.y
        this.z /= v.z
        this.w /= v.w
        return this
    }


    divideScalar (scalar) {
        return this.multiplyScalar(1 / scalar)
    }


    dot (v) {
        return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w
    }


    lengthSq () {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
    }


    length () {
        return Math.sqrt(this.lengthSq())
    }


    manhattanLength () {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w)
    }


    normalize () {
        return this.divideScalar(this.length() || 1)
    }


    setLength (length) {
        return this.normalize().multiplyScalar(length)
    }


    lerp (v, alpha) {
        this.x += (v.x - this.x) * alpha
        this.y += (v.y - this.y) * alpha
        this.z += (v.z - this.z) * alpha
        this.w += (v.w - this.w) * alpha
        return this
    }


    lerpVectors (v1, v2, alpha) {
        this.x = v1.x + (v2.x - v1.x) * alpha
        this.y = v1.y + (v2.y - v1.y) * alpha
        this.z = v1.z + (v2.z - v1.z) * alpha
        this.w = v1.w + (v2.w - v1.w) * alpha
        return this
    }


    equals (v) {
        return v.x === this.x && v.y === this.y && v.z === this.z && v.w === this.w
    }


    fromArray (array, offset = 0) {
        this.x = array[offset]
        this.y = array[offset + 1]
        this.z = array[offset + 2]
        this.w = array[offset + 3]
        return this
    }


    toArray (array = [], offset = 0) {
        array[offset] = this.x
        array[offset + 1] = this.y
        array[offset + 2] = this.z
        array[offset + 3] = this.w
        return array
    }


    negate () {
        this.x = -this.x
        this.y = -this.y
        this.z = -this.z
        this.w = -this.w
        return this
    }


    min (v) {
        this.x = Math.min(this.x, v.x)
        this.y = Math.min(this.y, v.y)
        this.z = Math.min(this.z, v.z)
        this.w = Math.min(this.w, v.w)
        return this
    }


    max (v) {
        this.x = Math.max(this.x, v.x)
        this.y = Math.max(this.y, v.y)
        this.z = Math.max(this.z, v.z)
        this.w = Math.max(this.w, v.w)
        return this
    }


    clamp (min, max) {
        this.x = Math.max(min.x, Math.min(max.x, this.x))
        this.y = Math.max(min.y, Math.min(max.y, this.y))
        this.z = Math.max(min.z, Math.min(max.z, this.z))
        this.w = Math.max(min.w, Math.min(max.w, this.w))
        return this
    }


    clampScalar (minVal, maxVal) {
        this.x = Math.max(minVal, Math.min(maxVal, this.x))
        this.y = Math.max(minVal, Math.min(maxVal, this.y))
        this.z = Math.max(minVal, Math.min(maxVal, this.z))
        this.w = Math.max(minVal, Math.min(maxVal, this.w))
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
        this.w = Math.floor(this.w)
        return this
    }


    ceil () {
        this.x = Math.ceil(this.x)
        this.y = Math.ceil(this.y)
        this.z = Math.ceil(this.z)
        this.w = Math.ceil(this.w)
        return this
    }


    round () {
        this.x = Math.round(this.x)
        this.y = Math.round(this.y)
        this.z = Math.round(this.z)
        this.w = Math.round(this.w)
        return this
    }


    roundToZero () {
        this.x = Math.trunc(this.x)
        this.y = Math.trunc(this.y)
        this.z = Math.trunc(this.z)
        this.w = Math.trunc(this.w)
        return this
    }


    random () {
        this.x = Math.random()
        this.y = Math.random()
        this.z = Math.random()
        this.w = Math.random()
        return this
    }


    getComponent (index) {
        if (index === 0) {
            return this.x
        } else if (index === 1) {
            return this.y
        } else if (index === 2) {
            return this.z
        } else if (index === 3) {
            return this.w
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
        } else if (index === 3) {
            this.w = value
        } else {
            throw new Error(`index out of range: ${index}`)
        }
        return this
    }


    get width () {
        return this.z
    }


    set width (value) {
        this.z = value
    }


    get height () {
        return this.w
    }


    set height (value) {
        this.w = value
    }


    get isVector4 () { // eslint-disable-line local/class-methods-use-this -- clean
        return true
    }


    *[Symbol.iterator] () {
        yield this.x
        yield this.y
        yield this.z
        yield this.w
    }

}
