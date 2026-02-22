import Vec3 from '../math/vec3.js'


export default class Light3D {

    constructor (options = {}) {
        this.position = new Vec3(options.x ?? 0, options.y ?? 0, options.z ?? 0)
        this.color = options.color ?? [1, 1, 1]
        this.intensity = options.intensity ?? 1
        this.radius = options.radius ?? 10
        this.direction = parseDirection(options.direction)
        this.angle = options.angle ?? 30
        this.penumbra = options.penumbra ?? 0.15
    }

}


function parseDirection (direction) {
    if (!direction) {
        return null
    }
    return new Vec3(direction[0] ?? 0, direction[1] ?? -1, direction[2] ?? 0)
}
