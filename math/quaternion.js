export default class Quaternion {

    static $exports = ['x', 'y', 'z', 'w']

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


    clone () {
        return new Quaternion(this.x, this.y, this.z, this.w)
    }


    copy (q) {
        this.x = q.x
        this.y = q.y
        this.z = q.z
        this.w = q.w
        return this
    }


    identity () {
        this.x = 0
        this.y = 0
        this.z = 0
        this.w = 1
        return this
    }


    lengthSq () {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
    }


    length () {
        return Math.sqrt(this.lengthSq())
    }


    normalize () {
        let len = this.length()
        if (len === 0) {
            this.x = 0
            this.y = 0
            this.z = 0
            this.w = 1
        } else {
            len = 1 / len
            this.x *= len
            this.y *= len
            this.z *= len
            this.w *= len
        }
        return this
    }


    conjugate () {
        this.x = -this.x
        this.y = -this.y
        this.z = -this.z
        return this
    }


    invert () {
        return this.conjugate().normalize()
    }


    dot (q) {
        return this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w
    }


    multiply (q) {
        return this.multiplyQuaternions(this, q)
    }


    premultiply (q) {
        return this.multiplyQuaternions(q, this)
    }


    multiplyQuaternions (a, b) {
        const ax = a.x
        const ay = a.y
        const az = a.z
        const aw = a.w
        const bx = b.x
        const by = b.y
        const bz = b.z
        const bw = b.w

        this.x = ax * bw + aw * bx + ay * bz - az * by
        this.y = ay * bw + aw * by + az * bx - ax * bz
        this.z = az * bw + aw * bz + ax * by - ay * bx
        this.w = aw * bw - ax * bx - ay * by - az * bz

        return this
    }


    setFromAxisAngle (axis, angle) {
        const halfAngle = angle / 2
        const s = Math.sin(halfAngle)

        this.x = axis.x * s
        this.y = axis.y * s
        this.z = axis.z * s
        this.w = Math.cos(halfAngle)

        return this
    }


    setFromEuler (x, y, z, order = 'YXZ') {
        const c1 = Math.cos(x / 2)
        const s1 = Math.sin(x / 2)
        const c2 = Math.cos(y / 2)
        const s2 = Math.sin(y / 2)
        const c3 = Math.cos(z / 2)
        const s3 = Math.sin(z / 2)

        applyEulerOrder(this, c1, s1, c2, s2, c3, s3, order)

        return this
    }


    setFromRotationMatrix (m) {
        const e = m.elements

        const m11 = e[0]
        const m12 = e[4]
        const m13 = e[8]
        const m21 = e[1]
        const m22 = e[5]
        const m23 = e[9]
        const m31 = e[2]
        const m32 = e[6]
        const m33 = e[10]

        extractQuaternionFromMatrix(this, m11, m12, m13, m21, m22, m23, m31, m32, m33)

        return this
    }


    rotateVec3 (v) {
        const qx = this.x
        const qy = this.y
        const qz = this.z
        const qw = this.w
        const vx = v.x
        const vy = v.y
        const vz = v.z

        const ix = qw * vx + qy * vz - qz * vy
        const iy = qw * vy + qz * vx - qx * vz
        const iz = qw * vz + qx * vy - qy * vx
        const iw = -qx * vx - qy * vy - qz * vz

        v.x = ix * qw + iw * -qx + iy * -qz - iz * -qy
        v.y = iy * qw + iw * -qy + iz * -qx - ix * -qz
        v.z = iz * qw + iw * -qz + ix * -qy - iy * -qx

        return v
    }


    slerp (q, t) {
        if (t === 0) {
            return this
        }
        if (t === 1) {
            return this.copy(q)
        }

        const x = this.x
        const y = this.y
        const z = this.z
        const w = this.w

        let cosHalfTheta = w * q.w + x * q.x + y * q.y + z * q.z

        if (cosHalfTheta < 0) {
            this.w = -q.w
            this.x = -q.x
            this.y = -q.y
            this.z = -q.z
            cosHalfTheta = -cosHalfTheta
        } else {
            this.copy(q)
        }

        if (cosHalfTheta >= 1.0) {
            this.w = w
            this.x = x
            this.y = y
            this.z = z
            return this
        }

        const sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta

        if (sqrSinHalfTheta <= Number.EPSILON) {
            const s = 1 - t
            this.w = s * w + t * this.w
            this.x = s * x + t * this.x
            this.y = s * y + t * this.y
            this.z = s * z + t * this.z
            return this.normalize()
        }

        const sinHalfTheta = Math.sqrt(sqrSinHalfTheta)
        const halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta)
        const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta
        const ratioB = Math.sin(t * halfTheta) / sinHalfTheta

        this.w = w * ratioA + this.w * ratioB
        this.x = x * ratioA + this.x * ratioB
        this.y = y * ratioA + this.y * ratioB
        this.z = z * ratioA + this.z * ratioB

        return this
    }


    slerpQuaternions (a, b, t) {
        return this.copy(a).slerp(b, t)
    }


    equals (q) {
        return q.x === this.x && q.y === this.y && q.z === this.z && q.w === this.w
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


    get isQuaternion () { // eslint-disable-line local/class-methods-use-this -- clean
        return true
    }


    *[Symbol.iterator] () {
        yield this.x
        yield this.y
        yield this.z
        yield this.w
    }

}


const EULER_SIGNS = {
    XYZ: [1, -1, 1, -1],
    YXZ: [1, -1, -1, 1],
    ZXY: [-1, 1, 1, -1],
    ZYX: [-1, 1, -1, 1],
    YZX: [1, 1, -1, -1],
    XZY: [-1, -1, 1, 1]
}


function applyEulerOrder (q, c1, s1, c2, s2, c3, s3, order) { // eslint-disable-line max-params -- clean
    const signs = EULER_SIGNS[order]
    q.x = s1 * c2 * c3 + signs[0] * c1 * s2 * s3
    q.y = c1 * s2 * c3 + signs[1] * s1 * c2 * s3
    q.z = c1 * c2 * s3 + signs[2] * s1 * s2 * c3
    q.w = c1 * c2 * c3 + signs[3] * s1 * s2 * s3
}


function extractQuaternionFromMatrix (q, m11, m12, m13, m21, m22, m23, m31, m32, m33) { // eslint-disable-line max-params -- clean
    const trace = m11 + m22 + m33

    if (trace > 0) {
        const s = 0.5 / Math.sqrt(trace + 1.0)
        q.w = 0.25 / s
        q.x = (m32 - m23) * s
        q.y = (m13 - m31) * s
        q.z = (m21 - m12) * s
    } else if (m11 > m22 && m11 > m33) {
        const s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33)
        q.w = (m32 - m23) / s
        q.x = 0.25 * s
        q.y = (m12 + m21) / s
        q.z = (m13 + m31) / s
    } else if (m22 > m33) {
        const s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33)
        q.w = (m13 - m31) / s
        q.x = (m12 + m21) / s
        q.y = 0.25 * s
        q.z = (m23 + m32) / s
    } else {
        const s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22)
        q.w = (m21 - m12) / s
        q.x = (m13 + m31) / s
        q.y = (m23 + m32) / s
        q.z = 0.25 * s
    }
}
