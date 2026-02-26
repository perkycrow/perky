export default class Matrix4 {

    constructor (elements) {
        this.elements = new Float32Array(16)
        if (elements) {
            this.elements.set(elements)
        } else {
            this.identity()
        }
    }


    identity () {
        this.elements.set([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ])
        return this
    }


    clone () {
        return new Matrix4(this.elements)
    }


    copy (m) {
        this.elements.set(m.elements)
        return this
    }


    set (...values) {
        const e = this.elements
        e[0] = values[0]
        e[4] = values[1]
        e[8] = values[2]
        e[12] = values[3]
        e[1] = values[4]
        e[5] = values[5]
        e[9] = values[6]
        e[13] = values[7]
        e[2] = values[8]
        e[6] = values[9]
        e[10] = values[10]
        e[14] = values[11]
        e[3] = values[12]
        e[7] = values[13]
        e[11] = values[14]
        e[15] = values[15]
        return this
    }


    fromArray (array, offset = 0) {
        for (let i = 0; i < 16; i++) {
            this.elements[i] = array[offset + i]
        }
        return this
    }


    toArray (array = [], offset = 0) {
        const e = this.elements
        for (let i = 0; i < 16; i++) {
            array[offset + i] = e[i]
        }
        return array
    }


    multiply (m) {
        return this.multiplyMatrices(this, m)
    }


    premultiply (m) {
        return this.multiplyMatrices(m, this)
    }


    multiplyMatrices (a, b) {
        const ae = a.elements
        const be = b.elements
        const te = this.elements

        const a11 = ae[0]
        const a12 = ae[4]
        const a13 = ae[8]
        const a14 = ae[12]
        const a21 = ae[1]
        const a22 = ae[5]
        const a23 = ae[9]
        const a24 = ae[13]
        const a31 = ae[2]
        const a32 = ae[6]
        const a33 = ae[10]
        const a34 = ae[14]
        const a41 = ae[3]
        const a42 = ae[7]
        const a43 = ae[11]
        const a44 = ae[15]

        const b11 = be[0]
        const b12 = be[4]
        const b13 = be[8]
        const b14 = be[12]
        const b21 = be[1]
        const b22 = be[5]
        const b23 = be[9]
        const b24 = be[13]
        const b31 = be[2]
        const b32 = be[6]
        const b33 = be[10]
        const b34 = be[14]
        const b41 = be[3]
        const b42 = be[7]
        const b43 = be[11]
        const b44 = be[15]

        te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41
        te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42
        te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43
        te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44

        te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41
        te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42
        te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43
        te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44

        te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41
        te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42
        te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43
        te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44

        te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41
        te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42
        te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43
        te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44

        return this
    }


    multiplyScalar (s) {
        const e = this.elements
        for (let i = 0; i < 16; i++) {
            e[i] *= s
        }
        return this
    }


    determinant () {
        const e = this.elements

        const n11 = e[0]
        const n12 = e[4]
        const n13 = e[8]
        const n14 = e[12]
        const n21 = e[1]
        const n22 = e[5]
        const n23 = e[9]
        const n24 = e[13]
        const n31 = e[2]
        const n32 = e[6]
        const n33 = e[10]
        const n34 = e[14]
        const n41 = e[3]
        const n42 = e[7]
        const n43 = e[11]
        const n44 = e[15]

        return (
            n41 * (n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34) +
            n42 * (n11 * n23 * n34 - n11 * n24 * n33 + n14 * n21 * n33 - n13 * n21 * n34 + n13 * n24 * n31 - n14 * n23 * n31) +
            n43 * (n11 * n24 * n32 - n11 * n22 * n34 - n14 * n21 * n32 + n12 * n21 * n34 + n14 * n22 * n31 - n12 * n24 * n31) +
            n44 * (-n13 * n22 * n31 - n11 * n23 * n32 + n11 * n22 * n33 + n13 * n21 * n32 - n12 * n21 * n33 + n12 * n23 * n31)
        )
    }


    transpose () {
        const e = this.elements
        swapElements(e, 1, 4)
        swapElements(e, 2, 8)
        swapElements(e, 6, 9)
        swapElements(e, 3, 12)
        swapElements(e, 7, 13)
        swapElements(e, 11, 14)
        return this
    }


    invert () {
        const e = this.elements

        const n11 = e[0]
        const n21 = e[1]
        const n31 = e[2]
        const n41 = e[3]
        const n12 = e[4]
        const n22 = e[5]
        const n32 = e[6]
        const n42 = e[7]
        const n13 = e[8]
        const n23 = e[9]
        const n33 = e[10]
        const n43 = e[11]
        const n14 = e[12]
        const n24 = e[13]
        const n34 = e[14]
        const n44 = e[15]

        const t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44
        const t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44
        const t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44
        const t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34

        const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14

        if (det === 0) {
            return this.identity()
        }

        const detInv = 1 / det

        e[0] = t11 * detInv
        e[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv
        e[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv
        e[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv

        e[4] = t12 * detInv
        e[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv
        e[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv
        e[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv

        e[8] = t13 * detInv
        e[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv
        e[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv
        e[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv

        e[12] = t14 * detInv
        e[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv
        e[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv
        e[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv

        return this
    }


    makeTranslation (x, y, z) {
        return this.set(
            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1
        )
    }


    makeScale (x, y, z) {
        return this.set(
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        )
    }


    makeRotationX (theta) {
        const c = Math.cos(theta)
        const s = Math.sin(theta)
        return this.set(
            1, 0, 0, 0,
            0, c, -s, 0,
            0, s, c, 0,
            0, 0, 0, 1
        )
    }


    makeRotationY (theta) {
        const c = Math.cos(theta)
        const s = Math.sin(theta)
        return this.set(
            c, 0, s, 0,
            0, 1, 0, 0,
            -s, 0, c, 0,
            0, 0, 0, 1
        )
    }


    makeRotationZ (theta) {
        const c = Math.cos(theta)
        const s = Math.sin(theta)
        return this.set(
            c, -s, 0, 0,
            s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        )
    }


    makeRotationFromQuaternion (q) {
        return this.compose({x: 0, y: 0, z: 0}, q, {x: 1, y: 1, z: 1})
    }


    compose (position, quaternion, scale) {
        const x = quaternion.x
        const y = quaternion.y
        const z = quaternion.z
        const w = quaternion.w
        const x2 = x + x
        const y2 = y + y
        const z2 = z + z
        const xx = x * x2
        const xy = x * y2
        const xz = x * z2
        const yy = y * y2
        const yz = y * z2
        const zz = z * z2
        const wx = w * x2
        const wy = w * y2
        const wz = w * z2

        const sx = scale.x
        const sy = scale.y
        const sz = scale.z
        const e = this.elements

        e[0] = (1 - (yy + zz)) * sx
        e[1] = (xy + wz) * sx
        e[2] = (xz - wy) * sx
        e[3] = 0

        e[4] = (xy - wz) * sy
        e[5] = (1 - (xx + zz)) * sy
        e[6] = (yz + wx) * sy
        e[7] = 0

        e[8] = (xz + wy) * sz
        e[9] = (yz - wx) * sz
        e[10] = (1 - (xx + yy)) * sz
        e[11] = 0

        e[12] = position.x
        e[13] = position.y
        e[14] = position.z
        e[15] = 1

        return this
    }


    decompose (position, quaternion, scale) {
        const e = this.elements

        let sx = Math.sqrt(e[0] * e[0] + e[1] * e[1] + e[2] * e[2])
        const sy = Math.sqrt(e[4] * e[4] + e[5] * e[5] + e[6] * e[6])
        const sz = Math.sqrt(e[8] * e[8] + e[9] * e[9] + e[10] * e[10])

        if (this.determinant() < 0) {
            sx = -sx
        }

        position.x = e[12]
        position.y = e[13]
        position.z = e[14]

        const invSx = 1 / sx
        const invSy = 1 / sy
        const invSz = 1 / sz

        const m11 = e[0] * invSx
        const m12 = e[4] * invSy
        const m13 = e[8] * invSz
        const m21 = e[1] * invSx
        const m22 = e[5] * invSy
        const m23 = e[9] * invSz
        const m31 = e[2] * invSx
        const m32 = e[6] * invSy
        const m33 = e[10] * invSz

        extractQuaternion(quaternion, m11, m12, m13, m21, m22, m23, m31, m32, m33)

        scale.x = sx
        scale.y = sy
        scale.z = sz

        return this
    }


    makePerspective (fov, aspect, near, far) {
        const top = near * Math.tan(fov * 0.5)
        const height = 2 * top
        const width = aspect * height
        const left = -0.5 * width
        const right = left + width
        const bottom = -top

        const e = this.elements
        const x = 2 * near / (right - left)
        const y = 2 * near / (top - bottom)

        const a = (right + left) / (right - left)
        const b = (top + bottom) / (top - bottom)
        const c = -(far + near) / (far - near)
        const d = -2 * far * near / (far - near)

        e[0] = x
        e[4] = 0
        e[8] = a
        e[12] = 0
        e[1] = 0
        e[5] = y
        e[9] = b
        e[13] = 0
        e[2] = 0
        e[6] = 0
        e[10] = c
        e[14] = d
        e[3] = 0
        e[7] = 0
        e[11] = -1
        e[15] = 0

        return this
    }


    makeOrthographic (left, right, bottom, top, near, far) { // eslint-disable-line max-params -- clean
        const e = this.elements
        const w = 1 / (right - left)
        const h = 1 / (top - bottom)
        const d = 1 / (far - near)

        e[0] = 2 * w
        e[4] = 0
        e[8] = 0
        e[12] = -(right + left) * w
        e[1] = 0
        e[5] = 2 * h
        e[9] = 0
        e[13] = -(top + bottom) * h
        e[2] = 0
        e[6] = 0
        e[10] = -2 * d
        e[14] = -(far + near) * d
        e[3] = 0
        e[7] = 0
        e[11] = 0
        e[15] = 1

        return this
    }


    makeLookAt (eye, target, up) {
        const zx = eye.x - target.x
        const zy = eye.y - target.y
        const zz = eye.z - target.z
        let len = Math.sqrt(zx * zx + zy * zy + zz * zz)

        if (len === 0) {
            return this.identity()
        }

        const izLen = 1 / len
        const fzx = zx * izLen
        const fzy = zy * izLen
        const fzz = zz * izLen

        let xx = up.y * fzz - up.z * fzy
        let xy = up.z * fzx - up.x * fzz
        let xz = up.x * fzy - up.y * fzx

        len = Math.sqrt(xx * xx + xy * xy + xz * xz)
        if (len > 0) {
            const ixLen = 1 / len
            xx *= ixLen
            xy *= ixLen
            xz *= ixLen
        } else {
            xx = 0
            xy = 0
            xz = 0
        }

        const yx = fzy * xz - fzz * xy
        const yy = fzz * xx - fzx * xz
        const yz = fzx * xy - fzy * xx

        const e = this.elements

        e[0] = xx
        e[4] = xy
        e[8] = xz
        e[12] = -(xx * eye.x + xy * eye.y + xz * eye.z)
        e[1] = yx
        e[5] = yy
        e[9] = yz
        e[13] = -(yx * eye.x + yy * eye.y + yz * eye.z)
        e[2] = fzx
        e[6] = fzy
        e[10] = fzz
        e[14] = -(fzx * eye.x + fzy * eye.y + fzz * eye.z)
        e[3] = 0
        e[7] = 0
        e[11] = 0
        e[15] = 1

        return this
    }


    transformPoint (v) {
        const e = this.elements
        const x = v.x
        const y = v.y
        const z = v.z
        const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15])

        v.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w
        v.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w
        v.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w

        return v
    }


    transformDirection (v) {
        const e = this.elements
        const x = v.x
        const y = v.y
        const z = v.z

        v.x = e[0] * x + e[4] * y + e[8] * z
        v.y = e[1] * x + e[5] * y + e[9] * z
        v.z = e[2] * x + e[6] * y + e[10] * z

        return v
    }


    equals (m) {
        const a = this.elements
        const b = m.elements
        for (let i = 0; i < 16; i++) {
            if (a[i] !== b[i]) {
                return false
            }
        }
        return true
    }


    get isMatrix4 () { // eslint-disable-line local/class-methods-use-this -- clean
        return true
    }

}


function swapElements (e, i, j) {
    const tmp = e[i]
    e[i] = e[j]
    e[j] = tmp
}


function extractQuaternion (q, m11, m12, m13, m21, m22, m23, m31, m32, m33) { // eslint-disable-line max-params -- clean
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
