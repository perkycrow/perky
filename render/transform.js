export default class Transform {

    #x = 0
    #y = 0
    #rotation = 0
    #scaleX = 1
    #scaleY = 1
    #pivotX = 0
    #pivotY = 0
    #localMatrix
    #worldMatrix
    #dirty
    #sortedChildren
    #childrenNeedSort

    constructor () {
        this.parent = null
        this.children = []
        this.#sortedChildren = null
        this.#childrenNeedSort = false

        this.#localMatrix = [1, 0, 0, 1, 0, 0]
        this.#worldMatrix = [1, 0, 0, 1, 0, 0]
        this.#dirty = true
    }


    get x () {
        return this.#x
    }


    set x (value) {
        if (this.#x !== value) {
            this.#x = value
            this.markDirty()
        }
    }


    get y () {
        return this.#y
    }


    set y (value) {
        if (this.#y !== value) {
            this.#y = value
            this.markDirty()
        }
    }


    get rotation () {
        return this.#rotation
    }


    set rotation (value) {
        if (this.#rotation !== value) {
            this.#rotation = value
            this.markDirty()
        }
    }


    get scaleX () {
        return this.#scaleX
    }


    set scaleX (value) {
        if (this.#scaleX !== value) {
            this.#scaleX = value
            this.markDirty()
        }
    }


    get scaleY () {
        return this.#scaleY
    }


    set scaleY (value) {
        if (this.#scaleY !== value) {
            this.#scaleY = value
            this.markDirty()
        }
    }


    get pivotX () {
        return this.#pivotX
    }


    set pivotX (value) {
        if (this.#pivotX !== value) {
            this.#pivotX = value
            this.markDirty()
        }
    }


    get pivotY () {
        return this.#pivotY
    }


    set pivotY (value) {
        if (this.#pivotY !== value) {
            this.#pivotY = value
            this.markDirty()
        }
    }


    get worldMatrix () {
        return this.#worldMatrix
    }


    add (...children) {
        children.forEach(child => {
            if (child.parent) {
                child.parent.remove(child)
            }
            this.children.push(child)
            child.parent = this
            child.markDirty()
        })
        this.markChildrenNeedSort()
        return this
    }


    remove (child) {
        const index = this.children.indexOf(child)
        if (index !== -1) {
            this.children.splice(index, 1)
            child.parent = null
            child.markDirty()
        }
        this.markChildrenNeedSort()
        return this
    }


    markChildrenNeedSort () {
        this.#childrenNeedSort = true
        this.#sortedChildren = null
    }


    getSortedChildren () {
        if (this.#childrenNeedSort || !this.#sortedChildren) {
            this.#sortedChildren = this.children.slice().sort((a, b) => (a.depth ?? 0) - (b.depth ?? 0))
            this.#childrenNeedSort = false
        }
        return this.#sortedChildren
    }


    markDirty () {
        if (this.#dirty) {
            return
        }
        this.#dirty = true
        this.children.forEach(child => child.markDirty())
    }


    updateLocalMatrix () {
        const cos = Math.cos(this.rotation)
        const sin = Math.sin(this.rotation)

        const px = -this.pivotX
        const py = -this.pivotY

        const a = cos * this.scaleX
        const b = sin * this.scaleX
        const c = -sin * this.scaleY
        const d = cos * this.scaleY

        this.#localMatrix[0] = a
        this.#localMatrix[1] = b
        this.#localMatrix[2] = c
        this.#localMatrix[3] = d
        this.#localMatrix[4] = this.x + (px * a + py * c)
        this.#localMatrix[5] = this.y + (px * b + py * d)
    }


    updateWorldMatrix (force = false) {
        if (this.#dirty || force) {
            this.updateLocalMatrix()

            if (this.parent) {
                multiplyMatrices(this.parent.#worldMatrix, this.#localMatrix, this.#worldMatrix)
            } else {
                this.#worldMatrix = [...this.#localMatrix]
            }

            this.#dirty = false
        }

        this.children.forEach(child => child.updateWorldMatrix(force))
    }


    transformPoint (point, matrix = this.#worldMatrix) {
        return {
            x: matrix[0] * point.x + matrix[2] * point.y + matrix[4],
            y: matrix[1] * point.x + matrix[3] * point.y + matrix[5]
        }
    }

}


function multiplyMatrices (a, b, out) {
    const a0 = a[0]
    const a1 = a[1]
    const a2 = a[2]
    const a3 = a[3]
    const a4 = a[4]
    const a5 = a[5]

    out[0] = a0 * b[0] + a2 * b[1]
    out[1] = a1 * b[0] + a3 * b[1]
    out[2] = a0 * b[2] + a2 * b[3]
    out[3] = a1 * b[2] + a3 * b[3]
    out[4] = a0 * b[4] + a2 * b[5] + a4
    out[5] = a1 * b[4] + a3 * b[5] + a5
}
