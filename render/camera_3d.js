import Matrix4 from '../math/matrix4.js'
import Vec3 from '../math/vec3.js'
import Quaternion from '../math/quaternion.js'


export default class Camera3D {

    #viewMatrix = new Matrix4()
    #projectionMatrix = new Matrix4()
    #dirty = true

    constructor (options = {}) {
        this.position = new Vec3(options.x ?? 0, options.y ?? 0, options.z ?? 0)
        this.rotation = new Quaternion()
        this.fov = options.fov ?? Math.PI / 4
        this.aspect = options.aspect ?? 1
        this.near = options.near ?? 0.1
        this.far = options.far ?? 100
        this.markDirty()
    }


    get viewMatrix () {
        this.#updateIfDirty()
        return this.#viewMatrix
    }


    get projectionMatrix () {
        this.#updateIfDirty()
        return this.#projectionMatrix
    }


    markDirty () {
        this.#dirty = true
    }


    setPosition (x, y, z) {
        this.position.set(x, y, z)
        this.markDirty()
        return this
    }


    setFov (fov) {
        this.fov = fov
        this.markDirty()
        return this
    }


    setAspect (aspect) {
        this.aspect = aspect
        this.markDirty()
        return this
    }


    setNearFar (near, far) {
        this.near = near
        this.far = far
        this.markDirty()
        return this
    }


    lookAt (target) {
        this.#viewMatrix.makeLookAt(this.position, target, new Vec3(0, 1, 0))
        this.rotation.setFromRotationMatrix(this.#viewMatrix)
        this.#projectionMatrix.makePerspective(this.fov, this.aspect, this.near, this.far)
        this.#dirty = false
        return this
    }


    update () {
        this.#updateIfDirty()
    }


    #updateIfDirty () {
        if (!this.#dirty) {
            return
        }

        this.#projectionMatrix.makePerspective(this.fov, this.aspect, this.near, this.far)

        const eye = this.position
        const forward = new Vec3(0, 0, -1)
        this.rotation.rotateVec3(forward)
        const target = eye.clone().add(forward)

        this.#viewMatrix.makeLookAt(eye, target, new Vec3(0, 1, 0))

        this.#dirty = false
    }

}
