import Vec3 from '../../math/vec3.js'


export default class CSGPolygon {

    constructor (vertices, plane) {
        this.vertices = vertices
        this.plane = plane || computePlane(vertices)
    }


    clone () {
        return new CSGPolygon(
            this.vertices.map(v => v.clone()),
            {normal: this.plane.normal.clone(), w: this.plane.w}
        )
    }


    flip () {
        this.vertices.reverse()
        this.plane.normal.negate()
        this.plane.w = -this.plane.w
    }

}


function computePlane (vertices) {
    const a = vertices[0].position
    const b = vertices[1].position
    const c = vertices[2].position
    const normal = new Vec3()
        .subVectors(b, a)
        .cross(new Vec3().subVectors(c, a))
        .normalize()
    return {normal, w: normal.dot(a)}
}
