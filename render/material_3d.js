const DEFAULTS = {
    texture: null,
    color: [1, 1, 1],
    emissive: [0, 0, 0],
    opacity: 1,
    unlit: false,
    uvScale: [1, 1],
    roughness: 0.5,
    specular: 0.5,
    normalMap: null,
    normalStrength: 1.0
}


export default class Material3D {

    constructor (options = {}) {
        Object.assign(this, DEFAULTS, options)
    }

}
