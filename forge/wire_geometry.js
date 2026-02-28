export function boxWirePositions (position, scale) {
    const hx = scale.x / 2
    const hy = scale.y / 2
    const hz = scale.z / 2
    const cx = position.x
    const cy = position.y
    const cz = position.z

    const x0 = cx - hx
    const x1 = cx + hx
    const y0 = cy - hy
    const y1 = cy + hy
    const z0 = cz - hz
    const z1 = cz + hz

    return new Float32Array([
        x0, y0, z0, x1, y0, z0,
        x1, y0, z0, x1, y0, z1,
        x1, y0, z1, x0, y0, z1,
        x0, y0, z1, x0, y0, z0,

        x0, y1, z0, x1, y1, z0,
        x1, y1, z0, x1, y1, z1,
        x1, y1, z1, x0, y1, z1,
        x0, y1, z1, x0, y1, z0,

        x0, y0, z0, x0, y1, z0,
        x1, y0, z0, x1, y1, z0,
        x1, y0, z1, x1, y1, z1,
        x0, y0, z1, x0, y1, z1
    ])
}
