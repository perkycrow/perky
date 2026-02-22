import Object3D from './object_3d.js'


export default class MeshInstance extends Object3D {

    constructor (options = {}) {
        super(options)
        this.mesh = options.mesh ?? null
        this.texture = options.texture ?? null
        this.tint = options.tint ?? null
    }


    get renderHints () {
        if (!this.tint) {
            return null
        }
        return {tint: this.tint}
    }

}
