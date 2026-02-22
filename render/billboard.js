import Object3D from './object_3d.js'


export default class Billboard extends Object3D {

    constructor (options = {}) {
        super(options)
        this.material = options.material ?? null
        this.width = options.width ?? 1
        this.height = options.height ?? 1
    }

}
