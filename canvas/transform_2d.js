export default class Transform2D {

    constructor () {
        this.x = 0
        this.y = 0
        this.rotation = 0
        this.scaleX = 1
        this.scaleY = 1
        this.pivotX = 0
        this.pivotY = 0
        
        this.parent = null
        this.children = []
        
        this.#localMatrix = [1, 0, 0, 1, 0, 0]
        this.#worldMatrix = [1, 0, 0, 1, 0, 0]
        this.#dirty = true
    }


    #localMatrix
    #worldMatrix
    #dirty


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
        return this
    }


    remove (child) {
        const index = this.children.indexOf(child)
        if (index !== -1) {
            this.children.splice(index, 1)
            child.parent = null
            child.markDirty()
        }
        return this
    }


    markDirty () {
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

