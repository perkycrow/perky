import Object3D from './object_3d.js'


export default class Sprite3D extends Object3D {

    constructor (options = {}) {
        super(options)
        this.texture = options.texture ?? null
        this.material = options.material ?? null
        this.width = options.width ?? 1
        this.height = options.height ?? 1
        this.castShadow = options.castShadow ?? false
        this.anchorX = options.anchorX ?? 0.5
        this.anchorY = options.anchorY ?? 0.0
    }


    get activeTexture () {
        if (this.material) {
            return this.material.texture
        }
        return this.texture
    }


    get renderHints () {
        if (!this.material) {
            return null
        }
        return {material: this.material}
    }

}
