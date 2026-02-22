import CSGPolygon from './csg_polygon.js'


const COPLANAR = 0
const FRONT = 1
const BACK = 2
const SPANNING = 3

export {COPLANAR, FRONT, BACK, SPANNING}


export default class CSGPlane {

    constructor (normal, w) {
        this.normal = normal
        this.w = w
    }


    clone () {
        return new CSGPlane(this.normal.clone(), this.w)
    }


    flip () {
        this.normal.negate()
        this.w = -this.w
    }


    splitPolygon (polygon, coplanarFront, coplanarBack, front, back, epsilon) { // eslint-disable-line max-params -- clean
        let polygonType = COPLANAR
        const types = []

        for (const vertex of polygon.vertices) {
            const d = this.normal.dot(vertex.position) - this.w
            const type = d < -epsilon ? BACK : d > epsilon ? FRONT : COPLANAR
            polygonType |= type
            types.push(type)
        }

        if (polygonType === COPLANAR) {
            if (this.normal.dot(polygon.plane.normal) > 0) {
                coplanarFront.push(polygon)
            } else {
                coplanarBack.push(polygon)
            }
            return
        }

        if (polygonType === FRONT) {
            front.push(polygon)
            return
        }

        if (polygonType === BACK) {
            back.push(polygon)
            return
        }

        splitSpanning(this, polygon, types, front, back)
    }

}


function splitSpanning (plane, polygon, types, front, back) {
    const f = []
    const b = []
    const nx = plane.normal.x
    const ny = plane.normal.y
    const nz = plane.normal.z
    const pw = plane.w

    for (let i = 0; i < polygon.vertices.length; i++) {
        const j = (i + 1) % polygon.vertices.length
        const ti = types[i]
        const tj = types[j]
        const vi = polygon.vertices[i]
        const vj = polygon.vertices[j]

        if (ti !== BACK) {
            f.push(vi)
        }

        if (ti !== FRONT) {
            b.push(ti !== BACK ? vi.clone() : vi)
        }

        if ((ti | tj) === SPANNING) {
            const pi = vi.position
            const pj = vj.position
            const ex = pj.x - pi.x
            const ey = pj.y - pi.y
            const ez = pj.z - pi.z
            const denom = nx * ex + ny * ey + nz * ez
            const t = (pw - (nx * pi.x + ny * pi.y + nz * pi.z)) / denom
            const v = vi.interpolate(vj, t)
            f.push(v)
            b.push(v.clone())
        }
    }

    if (f.length >= 3) {
        front.push(new CSGPolygon(f))
    }

    if (b.length >= 3) {
        back.push(new CSGPolygon(b))
    }
}
