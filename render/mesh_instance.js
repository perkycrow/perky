import Object3D from './object_3d.js'


export default class MeshInstance extends Object3D {

    constructor (options = {}) {
        super(options)
        this.mesh = options.mesh ?? null
        this.texture = options.texture ?? null
        this.tint = options.tint ?? null
        this.material = options.material ?? null
        this.castShadow = options.castShadow ?? true
    }


    get activeTexture () {
        if (this.material) {
            return this.material.texture
        }
        return this.texture
    }


    get renderHints () {
        if (!this.tint && !this.material) {
            return null
        }

        const hints = {}

        if (this.tint) {
            hints.tint = this.tint
        }

        if (this.material) {
            hints.material = this.material
        }

        return hints
    }

}
