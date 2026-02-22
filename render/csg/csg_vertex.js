import Vec3 from '../../math/vec3.js'


export default class CSGVertex {

    constructor (position, normal, uv) {
        this.position = position instanceof Vec3 ? position : new Vec3(position)
        this.normal = normal instanceof Vec3 ? normal : new Vec3(normal)
        this.uv = uv
    }


    clone () {
        return new CSGVertex(
            this.position.clone(),
            this.normal.clone(),
            [this.uv[0], this.uv[1]]
        )
    }


    interpolate (other, t) {
        return new CSGVertex(
            this.position.clone().lerp(other.position, t),
            this.normal.clone().lerp(other.normal, t).normalize(),
            [
                this.uv[0] + (other.uv[0] - this.uv[0]) * t,
                this.uv[1] + (other.uv[1] - this.uv[1]) * t
            ]
        )
    }

}
