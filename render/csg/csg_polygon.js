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
    const abx = b.x - a.x
    const aby = b.y - a.y
    const abz = b.z - a.z
    const acx = c.x - a.x
    const acy = c.y - a.y
    const acz = c.z - a.z
    let nx = aby * acz - abz * acy
    let ny = abz * acx - abx * acz
    let nz = abx * acy - aby * acx
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz)
    if (len > 0) {
        nx /= len
        ny /= len
        nz /= len
    }
    const normal = new Vec3(nx, ny, nz)
    return {normal, w: nx * a.x + ny * a.y + nz * a.z}
}
