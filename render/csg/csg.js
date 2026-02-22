import Geometry from '../geometry.js'
import Vec3 from '../../math/vec3.js'
import CSGVertex from './csg_vertex.js'
import CSGPolygon from './csg_polygon.js'
import CSGNode from './csg_node.js'


const BASE_EPSILON = 1e-5


export default class CSG {

    constructor (polygons) {
        this.polygons = polygons || []
    }


    clone () {
        return new CSG(this.polygons.map(p => p.clone()))
    }


    union (other) {
        const epsilon = computeEpsilon(this, other)
        const a = new CSGNode(this.clone().polygons, epsilon)
        const b = new CSGNode(other.clone().polygons, epsilon)
        a.clipTo(b, epsilon)
        b.clipTo(a, epsilon)
        b.invert()
        b.clipTo(a, epsilon)
        b.invert()
        a.build(b.allPolygons(), epsilon)
        return new CSG(a.allPolygons())
    }


    subtract (other) {
        const epsilon = computeEpsilon(this, other)
        const a = new CSGNode(this.clone().polygons, epsilon)
        const b = new CSGNode(other.clone().polygons, epsilon)
        a.invert()
        a.clipTo(b, epsilon)
        b.clipTo(a, epsilon)
        b.invert()
        b.clipTo(a, epsilon)
        b.invert()
        a.build(b.allPolygons(), epsilon)
        a.invert()
        return new CSG(a.allPolygons())
    }


    intersect (other) {
        const epsilon = computeEpsilon(this, other)
        const a = new CSGNode(this.clone().polygons, epsilon)
        const b = new CSGNode(other.clone().polygons, epsilon)
        a.invert()
        b.clipTo(a, epsilon)
        b.invert()
        a.clipTo(b, epsilon)
        b.clipTo(a, epsilon)
        a.build(b.allPolygons(), epsilon)
        a.invert()
        return new CSG(a.allPolygons())
    }


    toGeometry () {
        const positions = []
        const normals = []
        const uvs = []
        const indices = []
        const vertexMap = new Map()
        let vertexCount = 0

        for (const polygon of this.polygons) {
            const polyIndices = []

            for (const vertex of polygon.vertices) {
                const key = vertexKey(vertex)
                let index = vertexMap.get(key)

                if (index === undefined) {
                    index = vertexCount++
                    vertexMap.set(key, index)
                    positions.push(vertex.position.x, vertex.position.y, vertex.position.z)
                    normals.push(vertex.normal.x, vertex.normal.y, vertex.normal.z)
                    uvs.push(vertex.uv[0], vertex.uv[1])
                }

                polyIndices.push(index)
            }

            for (let i = 2; i < polyIndices.length; i++) {
                indices.push(polyIndices[0], polyIndices[i - 1], polyIndices[i])
            }
        }

        return new Geometry({positions, normals, uvs, indices}).computeTangents()
    }


    static fromGeometry (geometry) {
        const polygons = []
        const {positions, normals, uvs, indices} = geometry

        for (let i = 0; i < indices.length; i += 3) {
            const vertices = []

            for (let j = 0; j < 3; j++) {
                const idx = indices[i + j]
                vertices.push(new CSGVertex(
                    new Vec3(
                        positions[idx * 3],
                        positions[idx * 3 + 1],
                        positions[idx * 3 + 2]
                    ),
                    new Vec3(
                        normals[idx * 3],
                        normals[idx * 3 + 1],
                        normals[idx * 3 + 2]
                    ),
                    [uvs[idx * 2], uvs[idx * 2 + 1]]
                ))
            }

            const polygon = new CSGPolygon(vertices)

            if (polygon.plane.normal.lengthSq() < 0.5) {
                continue
            }

            const avgNormal = new Vec3()
                .add(vertices[0].normal)
                .add(vertices[1].normal)
                .add(vertices[2].normal)

            if (polygon.plane.normal.dot(avgNormal) < 0) {
                polygon.flip()
            }

            polygons.push(polygon)
        }

        return new CSG(polygons)
    }

}


function vertexKey (vertex) {
    const p = vertex.position
    const n = vertex.normal
    const precision = 1e5
    const px = Math.round(p.x * precision)
    const py = Math.round(p.y * precision)
    const pz = Math.round(p.z * precision)
    const nx = Math.round(n.x * precision)
    const ny = Math.round(n.y * precision)
    const nz = Math.round(n.z * precision)
    const ux = Math.round(vertex.uv[0] * precision)
    const uy = Math.round(vertex.uv[1] * precision)
    return `${px},${py},${pz},${nx},${ny},${nz},${ux},${uy}`
}


function computeEpsilon (a, b) {
    const diagA = computeDiagonal(a.polygons)
    const diagB = computeDiagonal(b.polygons)
    return BASE_EPSILON * Math.max(diagA, diagB, 1)
}


function computeDiagonal (polygons) {
    if (!polygons.length) {
        return 0
    }

    const min = new Vec3(Infinity, Infinity, Infinity)
    const max = new Vec3(-Infinity, -Infinity, -Infinity)

    for (const polygon of polygons) {
        for (const vertex of polygon.vertices) {
            min.min(vertex.position)
            max.max(vertex.position)
        }
    }

    return min.distanceTo(max)
}
