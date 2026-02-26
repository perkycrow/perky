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
            const type = classifyDistance(d, epsilon)
            polygonType = combineTypes(polygonType, type)
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

        splitSpanning({plane: this, polygon, types, front, back})
    }

}


function classifyDistance (d, epsilon) {
    if (d < -epsilon) {
        return BACK
    }
    if (d > epsilon) {
        return FRONT
    }
    return COPLANAR
}


function combineTypes (a, b) {
    if (a === COPLANAR) {
        return b
    }
    if (b === COPLANAR) {
        return a
    }
    if (a === b) {
        return a
    }
    return SPANNING
}


function isSpanningEdge (ti, tj) {
    return (ti === FRONT && tj === BACK) || (ti === BACK && tj === FRONT)
}


function splitSpanning (ctx) {
    const {polygon, front, back} = ctx
    const f = []
    const b = []
    const vertexCtx = {...ctx, f, b}

    for (let i = 0; i < polygon.vertices.length; i++) {
        processSpanningVertex(vertexCtx, i)
    }

    if (f.length >= 3) {
        front.push(new CSGPolygon(f))
    }

    if (b.length >= 3) {
        back.push(new CSGPolygon(b))
    }
}


function processSpanningVertex (ctx, i) {
    const {polygon, types, f, b, plane} = ctx
    const j = (i + 1) % polygon.vertices.length
    const ti = types[i]
    const tj = types[j]
    const vi = polygon.vertices[i]
    const vj = polygon.vertices[j]

    if (ti === FRONT || ti === COPLANAR) {
        f.push(vi)
    }

    if (ti === BACK || ti === COPLANAR) {
        b.push(ti === BACK ? vi : vi.clone())
    }

    if (isSpanningEdge(ti, tj)) {
        interpolateEdge({vi, vj, plane, f, b})
    }
}


function interpolateEdge (ctx) {
    const {vi, vj, plane, f, b} = ctx
    const pi = vi.position
    const pj = vj.position
    const nx = plane.normal.x
    const ny = plane.normal.y
    const nz = plane.normal.z
    const ex = pj.x - pi.x
    const ey = pj.y - pi.y
    const ez = pj.z - pi.z
    const denom = nx * ex + ny * ey + nz * ez

    if (Math.abs(denom) < 1e-10) {
        return
    }

    const t = (plane.w - (nx * pi.x + ny * pi.y + nz * pi.z)) / denom
    const v = vi.interpolate(vj, t)
    f.push(v)
    b.push(v.clone())
}
