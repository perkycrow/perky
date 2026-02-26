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
    const a = polygon.vertices[0].position
    const b = polygon.vertices[1].position
    const c = polygon.vertices[2].position
    const abx = b.x - a.x
    const aby = b.y - a.y
    const abz = b.z - a.z
    const acx = c.x - a.x
    const acy = c.y - a.y
    const acz = c.z - a.z
    const cx = aby * acz - abz * acy
    const cy = abz * acx - abx * acz
    const cz = abx * acy - aby * acx
    return cx * cx + cy * cy + cz * cz
}
