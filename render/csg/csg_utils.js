export default function filterDegeneratePolygons (polygons, epsilon) {
    const minArea = epsilon * epsilon
    const result = []

    for (const polygon of polygons) {
        if (polygon.vertices.length < 3) {
            continue
        }
        if (polygonAreaSq(polygon) > minArea) {
            result.push(polygon)
        }
    }

    return result
}


function polygonAreaSq (polygon) {
    const vertices = polygon.vertices
    const a = vertices[0].position
    let crossX = 0
    let crossY = 0
    let crossZ = 0

    for (let i = 1; i < vertices.length - 1; i++) {
        const b = vertices[i].position
        const c = vertices[i + 1].position
        const abx = b.x - a.x
        const aby = b.y - a.y
        const abz = b.z - a.z
        const acx = c.x - a.x
        const acy = c.y - a.y
        const acz = c.z - a.z
        crossX += aby * acz - abz * acy
        crossY += abz * acx - abx * acz
        crossZ += abx * acy - aby * acx
    }

    return crossX * crossX + crossY * crossY + crossZ * crossZ
}
