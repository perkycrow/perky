import CSGPolygon from './csg_polygon.js'


export default function suppressTJunctions (polygons, epsilon) {
    const positions = collectPositions(polygons)
    let changed = false

    const result = polygons.map(polygon => {
        const newVertices = []

        for (let i = 0; i < polygon.vertices.length; i++) {
            const a = polygon.vertices[i]
            const b = polygon.vertices[(i + 1) % polygon.vertices.length]
            newVertices.push(a)

            const midpoints = findMidpoints(a.position, b.position, positions, epsilon)
            if (midpoints.length > 0) {
                changed = true
                for (const {t} of midpoints) {
                    newVertices.push(a.interpolate(b, t))
                }
            }
        }

        if (newVertices.length > polygon.vertices.length) {
            return new CSGPolygon(newVertices, {
                normal: polygon.plane.normal.clone(),
                w: polygon.plane.w
            })
        }

        return polygon
    })

    return changed ? result : polygons
}


function collectPositions (polygons) {
    const map = new Map()
    for (const polygon of polygons) {
        for (const vertex of polygon.vertices) {
            const p = vertex.position
            const key = posKey(p)
            if (!map.has(key)) {
                map.set(key, p)
            }
        }
    }
    return [...map.values()]
}


function posKey (p) {
    const s = 1e5
    return `${Math.round(p.x * s)},${Math.round(p.y * s)},${Math.round(p.z * s)}`
}


function findMidpoints (a, b, positions, epsilon) {
    const dx = b.x - a.x
    const dy = b.y - a.y
    const dz = b.z - a.z
    const edgeLenSq = dx * dx + dy * dy + dz * dz

    if (edgeLenSq < epsilon * epsilon) {
        return []
    }

    const epsSq = epsilon * epsilon
    const results = []

    for (const p of positions) {
        const apx = p.x - a.x
        const apy = p.y - a.y
        const apz = p.z - a.z

        const t = (apx * dx + apy * dy + apz * dz) / edgeLenSq

        if (t <= epsilon || t >= 1 - epsilon) {
            continue
        }

        const projX = a.x + dx * t - p.x
        const projY = a.y + dy * t - p.y
        const projZ = a.z + dz * t - p.z
        const distSq = projX * projX + projY * projY + projZ * projZ

        if (distSq < epsSq) {
            results.push({t})
        }
    }

    results.sort((x, y) => x.t - y.t)
    return results
}
