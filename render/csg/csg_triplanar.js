export default function applyTriplanarUVs (polygons, uvScale = 1) {
    for (const polygon of polygons) {
        if (!hasCollapsedUVs(polygon)) {
            continue
        }

        const n = polygon.plane.normal
        const ax = Math.abs(n.x)
        const ay = Math.abs(n.y)
        const az = Math.abs(n.z)

        for (const vertex of polygon.vertices) {
            const p = vertex.position

            if (ax >= ay && ax >= az) {
                vertex.uv[0] = p.z * uvScale
                vertex.uv[1] = p.y * uvScale
            } else if (ay >= ax && ay >= az) {
                vertex.uv[0] = p.x * uvScale
                vertex.uv[1] = p.z * uvScale
            } else {
                vertex.uv[0] = p.x * uvScale
                vertex.uv[1] = p.y * uvScale
            }
        }
    }
}


function hasCollapsedUVs (polygon) {
    if (polygon.vertices.length < 2) {
        return false
    }

    const first = polygon.vertices[0].uv
    let maxDiff = 0

    for (let i = 1; i < polygon.vertices.length; i++) {
        const uv = polygon.vertices[i].uv
        const du = Math.abs(uv[0] - first[0])
        const dv = Math.abs(uv[1] - first[1])
        if (du > maxDiff) {
            maxDiff = du
        }
        if (dv > maxDiff) {
            maxDiff = dv
        }
    }

    return maxDiff < 1e-4
}
