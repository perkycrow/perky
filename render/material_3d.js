export default class Material3D {

    constructor (options = {}) {
        this.texture = options.texture ?? null
        this.color = options.color ?? [1, 1, 1]
        this.emissive = options.emissive ?? [0, 0, 0]
        this.opacity = options.opacity ?? 1
        this.unlit = options.unlit ?? false
        this.uvScale = options.uvScale ?? [1, 1]
        this.roughness = options.roughness ?? 0.5
        this.specular = options.specular ?? 0.5
    }

}
