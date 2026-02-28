import Vec3 from '../math/vec3.js'
import {screenToRay, rayAABB} from './forge_pick.js'


export const GIZMO_LENGTH = 1.2
export const GIZMO_THICKNESS = 0.06

export const GIZMO_AXES = [
    {axis: new Vec3(1, 0, 0), color: [0.9, 0.2, 0.2]},
    {axis: new Vec3(0, 1, 0), color: [0.2, 0.9, 0.2]},
    {axis: new Vec3(0, 0, 1), color: [0.3, 0.5, 0.9]}
]


export function gizmoArrowPositions (center) {
    const positions = new Float32Array(18)
    for (let i = 0; i < 3; i++) {
        const {axis} = GIZMO_AXES[i]
        const base = i * 6
        positions[base] = center.x
        positions[base + 1] = center.y
        positions[base + 2] = center.z
        positions[base + 3] = center.x + axis.x * GIZMO_LENGTH
        positions[base + 4] = center.y + axis.y * GIZMO_LENGTH
        positions[base + 5] = center.z + axis.z * GIZMO_LENGTH
    }
    return positions
}


export function pickGizmoArrow (camera3d, clientX, clientY, canvas, center) {
    const {origin, direction} = screenToRay(camera3d, clientX, clientY, canvas)
    const half = GIZMO_THICKNESS / 2

    let closest = -1
    let closestT = Infinity

    for (let i = 0; i < 3; i++) {
        const {axis} = GIZMO_AXES[i]

        const endX = center.x + axis.x * GIZMO_LENGTH
        const endY = center.y + axis.y * GIZMO_LENGTH
        const endZ = center.z + axis.z * GIZMO_LENGTH

        const minX = Math.min(center.x, endX) - half
        const minY = Math.min(center.y, endY) - half
        const minZ = Math.min(center.z, endZ) - half
        const maxX = Math.max(center.x, endX) + half
        const maxY = Math.max(center.y, endY) + half
        const maxZ = Math.max(center.z, endZ) + half

        const t = rayAABB(origin, direction, new Vec3(minX, minY, minZ), new Vec3(maxX, maxY, maxZ))
        if (t >= 0 && t < closestT) {
            closest = i
            closestT = t
        }
    }

    return closest
}
