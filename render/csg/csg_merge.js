import CSGPolygon from './csg_polygon.js'


export default function mergeCoplanarPolygons (polygons, epsilon) {
    const groups = groupByPlane(polygons, epsilon)
    const result = []

    for (const group of groups) {
        if (group.length < 2) {
            result.push(...group)
            continue
        }
        mergeGroup(group, epsilon, result)
    }

    return result
}


function planeKey (polygon, epsilon) {
    const n = polygon.plane.normal
    const w = polygon.plane.w
    const s = Math.round(1 / epsilon)
    const nx = Math.round(n.x * s)
    const ny = Math.round(n.y * s)
    const nz = Math.round(n.z * s)
    const pw = Math.round(w * s)
    return `${nx},${ny},${nz},${pw}`
}


function groupByPlane (polygons, epsilon) {
    const map = new Map()
    for (const polygon of polygons) {
        const key = planeKey(polygon, epsilon)
        let group = map.get(key)
        if (!group) {
            group = []
            map.set(key, group)
        }
        group.push(polygon)
    }
    return [...map.values()]
}


function posKey (p) {
    const s = 1e5
    return `${Math.round(p.x * s)},${Math.round(p.y * s)},${Math.round(p.z * s)}`
}


function mergeGroup (group, epsilon, result) {
    const merged = new Array(group.length).fill(false)

    for (let i = 0; i < group.length; i++) {
        if (merged[i]) {
            continue
        }

        let current = group[i]

        for (let j = i + 1; j < group.length; j++) {
            if (merged[j]) {
                continue
            }

            const combined = tryMerge(current, group[j])
            if (combined) {
                current = combined
                merged[j] = true
            }
        }

        result.push(current)
    }
}


function tryMerge (a, b) {
    const sharedEdge = findSharedEdge(a, b)
    if (!sharedEdge) {
        return null
    }

    const vertices = buildMergedVertices(a, b, sharedEdge)
    if (!vertices || vertices.length < 3) {
        return null
    }

    if (!isConvex(vertices, a.plane.normal)) {
        return null
    }

    return new CSGPolygon(vertices, {
        normal: a.plane.normal.clone(),
        w: a.plane.w
    })
}


function findSharedEdge (a, b) {
    for (let i = 0; i < a.vertices.length; i++) {
        const ai = posKey(a.vertices[i].position)
        const aj = posKey(a.vertices[(i + 1) % a.vertices.length].position)

        for (let j = 0; j < b.vertices.length; j++) {
            const bi = posKey(b.vertices[j].position)
            const bj = posKey(b.vertices[(j + 1) % b.vertices.length].position)

            if (ai === bj && aj === bi) {
                return {aIndex: i, bIndex: j}
            }
        }
    }

    return null
}


function buildMergedVertices (a, b, {aIndex, bIndex}) {
    const vertices = []

    for (let k = 0; k < a.vertices.length; k++) {
        const idx = (aIndex + 1 + k) % a.vertices.length
        if (idx === aIndex) {
            break
        }
        vertices.push(a.vertices[idx])
    }

    for (let k = 0; k < b.vertices.length; k++) {
        const idx = (bIndex + 1 + k) % b.vertices.length
        if (idx === bIndex) {
            break
        }
        vertices.push(b.vertices[idx])
    }

    return vertices
}


function isConvex (vertices, planeNormal) {
    for (let i = 0; i < vertices.length; i++) {
        const a = vertices[i].position
        const b = vertices[(i + 1) % vertices.length].position
        const c = vertices[(i + 2) % vertices.length].position
        const ex = b.x - a.x
        const ey = b.y - a.y
        const ez = b.z - a.z
        const fx = c.x - b.x
        const fy = c.y - b.y
        const fz = c.z - b.z
        const cx = ey * fz - ez * fy
        const cy = ez * fx - ex * fz
        const cz = ex * fy - ey * fx
        const dot = cx * planeNormal.x + cy * planeNormal.y + cz * planeNormal.z

        if (dot < -1e-8) {
            return false
        }
    }

    return true
}
