import {applyWireRotation} from './forge_rotation_gizmo.js'


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


export function sphereWirePositions (position, scale, segments = 16) {
    const cx = position.x
    const cy = position.y
    const cz = position.z
    const rx = scale.x / 2
    const ry = scale.y / 2
    const rz = scale.z / 2

    const out = new Float32Array(segments * 3 * 6)
    let offset = 0
    const step = (Math.PI * 2) / segments

    for (let i = 0; i < segments; i++) {
        const a0 = i * step
        const a1 = (i + 1) * step

        out[offset++] = cx + Math.cos(a0) * rx
        out[offset++] = cy + Math.sin(a0) * ry
        out[offset++] = cz
        out[offset++] = cx + Math.cos(a1) * rx
        out[offset++] = cy + Math.sin(a1) * ry
        out[offset++] = cz
    }

    for (let i = 0; i < segments; i++) {
        const a0 = i * step
        const a1 = (i + 1) * step

        out[offset++] = cx + Math.cos(a0) * rx
        out[offset++] = cy
        out[offset++] = cz + Math.sin(a0) * rz
        out[offset++] = cx + Math.cos(a1) * rx
        out[offset++] = cy
        out[offset++] = cz + Math.sin(a1) * rz
    }

    for (let i = 0; i < segments; i++) {
        const a0 = i * step
        const a1 = (i + 1) * step

        out[offset++] = cx
        out[offset++] = cy + Math.cos(a0) * ry
        out[offset++] = cz + Math.sin(a0) * rz
        out[offset++] = cx
        out[offset++] = cy + Math.cos(a1) * ry
        out[offset++] = cz + Math.sin(a1) * rz
    }

    return out
}


export function cylinderWirePositions (position, scale, segments = 16) {
    const cx = position.x
    const cy = position.y
    const cz = position.z
    const rx = scale.x / 2
    const rz = scale.z / 2
    const hy = scale.y / 2

    const edgeCount = segments * 2 + 4
    const out = new Float32Array(edgeCount * 6)
    let offset = 0
    const step = (Math.PI * 2) / segments

    for (let i = 0; i < segments; i++) {
        const a0 = i * step
        const a1 = (i + 1) * step

        out[offset++] = cx + Math.cos(a0) * rx
        out[offset++] = cy + hy
        out[offset++] = cz + Math.sin(a0) * rz
        out[offset++] = cx + Math.cos(a1) * rx
        out[offset++] = cy + hy
        out[offset++] = cz + Math.sin(a1) * rz
    }

    for (let i = 0; i < segments; i++) {
        const a0 = i * step
        const a1 = (i + 1) * step

        out[offset++] = cx + Math.cos(a0) * rx
        out[offset++] = cy - hy
        out[offset++] = cz + Math.sin(a0) * rz
        out[offset++] = cx + Math.cos(a1) * rx
        out[offset++] = cy - hy
        out[offset++] = cz + Math.sin(a1) * rz
    }

    for (let q = 0; q < 4; q++) {
        const angle = q * Math.PI / 2
        const px = Math.cos(angle) * rx
        const pz = Math.sin(angle) * rz
        out[offset++] = cx + px
        out[offset++] = cy - hy
        out[offset++] = cz + pz
        out[offset++] = cx + px
        out[offset++] = cy + hy
        out[offset++] = cz + pz
    }

    return out
}


export function coneWirePositions (position, scale, segments = 16) {
    const cx = position.x
    const cy = position.y
    const cz = position.z
    const rx = scale.x / 2
    const rz = scale.z / 2
    const hy = scale.y / 2

    const edgeCount = segments + 4
    const out = new Float32Array(edgeCount * 6)
    let offset = 0
    const step = (Math.PI * 2) / segments

    for (let i = 0; i < segments; i++) {
        const a0 = i * step
        const a1 = (i + 1) * step

        out[offset++] = cx + Math.cos(a0) * rx
        out[offset++] = cy - hy
        out[offset++] = cz + Math.sin(a0) * rz
        out[offset++] = cx + Math.cos(a1) * rx
        out[offset++] = cy - hy
        out[offset++] = cz + Math.sin(a1) * rz
    }

    for (let q = 0; q < 4; q++) {
        const angle = q * Math.PI / 2
        out[offset++] = cx + Math.cos(angle) * rx
        out[offset++] = cy - hy
        out[offset++] = cz + Math.sin(angle) * rz
        out[offset++] = cx
        out[offset++] = cy + hy
        out[offset++] = cz
    }

    return out
}


const WIRE_FACTORIES = {
    box: boxWirePositions,
    sphere: sphereWirePositions,
    cylinder: cylinderWirePositions,
    cone: coneWirePositions
}


export function brushWirePositions (brush) {
    const factory = WIRE_FACTORIES[brush.shape] ?? boxWirePositions
    const positions = factory(brush.position, brush.scale)

    if (brush.rotation.x !== 0 || brush.rotation.y !== 0 || brush.rotation.z !== 0) {
        applyWireRotation(positions, brush.position, brush.rotation)
    }

    return positions
}
