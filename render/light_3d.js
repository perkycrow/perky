import Vec3 from '../math/vec3.js'


export const MAX_LIGHTS = 16


export default class Light3D {

    constructor (options = {}) {
        this.position = new Vec3(options.x ?? 0, options.y ?? 0, options.z ?? 0)
        this.color = options.color ?? [1, 1, 1]
        this.intensity = options.intensity ?? 1
        this.radius = options.radius ?? 10
    }

}
