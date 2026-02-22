import Matrix4 from '../math/matrix4.js'
import Vec3 from '../math/vec3.js'
import Quaternion from '../math/quaternion.js'


export default class Object3D {

    #localMatrix = new Matrix4()
    #worldMatrix = new Matrix4()
    #dirty = true
    #children = []
    #parent = null

    constructor (options = {}) {
        this.position = createPosition(options)
        this.rotation = new Quaternion()
        this.scale = createScale(options)
        this.visible = options.visible ?? true
        this.opacity = options.opacity ?? 1
        this.depth = options.depth ?? 0
    }


    get parent () {
        return this.#parent
    }


    get children () {
        return this.#children
    }


    get localMatrix () {
        return this.#localMatrix
    }


    get worldMatrix () {
        return this.#worldMatrix
    }


    addChild (child) {
        if (child.#parent) {
            child.#parent.removeChild(child)
        }
        child.#parent = this
        this.#children.push(child)
        child.markDirty()
        return this
    }


    removeChild (child) {
        const index = this.#children.indexOf(child)
        if (index !== -1) {
            this.#children.splice(index, 1)
            child.#parent = null
        }
        return this
    }


    markDirty () {
        this.#dirty = true
        for (const child of this.#children) {
            child.markDirty()
        }
    }


    updateLocalMatrix () {
        this.#localMatrix.compose(this.position, this.rotation, this.scale)
    }


    updateWorldMatrix (force = false) {
        if (this.#dirty || force) {
            this.updateLocalMatrix()

            if (this.#parent) {
                this.#worldMatrix.multiplyMatrices(this.#parent.#worldMatrix, this.#localMatrix)
            } else {
                this.#worldMatrix.copy(this.#localMatrix)
            }

            this.#dirty = false
        }

        for (const child of this.#children) {
            child.updateWorldMatrix(force)
        }
    }


    getSortedChildren () {
        if (this.#children.length <= 1) {
            return this.#children
        }
        return [...this.#children].sort((a, b) => a.depth - b.depth)
    }

}


function createPosition (options) {
    return new Vec3(options.x ?? 0, options.y ?? 0, options.z ?? 0)
}


function createScale (options) {
    return new Vec3(options.scaleX ?? 1, options.scaleY ?? 1, options.scaleZ ?? 1)
}
