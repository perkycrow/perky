import Vec3 from '../math/vec3.js'
import Quaternion from '../math/quaternion.js'
import {screenToRay} from './forge_pick.js'


export const ROTATION_RING_RADIUS = 1.0
export const ROTATION_RING_SEGMENTS = 48
export const ROTATION_RING_TOLERANCE = 0.15

export const ROTATION_AXES = [
    {axis: new Vec3(1, 0, 0), color: [0.9, 0.2, 0.2], u: new Vec3(0, 1, 0), v: new Vec3(0, 0, 1)},
    {axis: new Vec3(0, 1, 0), color: [0.2, 0.9, 0.2], u: new Vec3(0, 0, 1), v: new Vec3(1, 0, 0)},
    {axis: new Vec3(0, 0, 1), color: [0.3, 0.5, 0.9], u: new Vec3(1, 0, 0), v: new Vec3(0, 1, 0)}
]


export function rotationRingPositions (center, radius = ROTATION_RING_RADIUS) {
    const segments = ROTATION_RING_SEGMENTS
    const positions = new Float32Array(3 * segments * 6)
    let offset = 0
    const step = (Math.PI * 2) / segments

    for (let a = 0; a < 3; a++) {
        const {u, v} = ROTATION_AXES[a]

        for (let i = 0; i < segments; i++) {
            const a0 = i * step
            const a1 = (i + 1) * step

            positions[offset++] = center.x + (Math.cos(a0) * u.x + Math.sin(a0) * v.x) * radius
            positions[offset++] = center.y + (Math.cos(a0) * u.y + Math.sin(a0) * v.y) * radius
            positions[offset++] = center.z + (Math.cos(a0) * u.z + Math.sin(a0) * v.z) * radius
            positions[offset++] = center.x + (Math.cos(a1) * u.x + Math.sin(a1) * v.x) * radius
            positions[offset++] = center.y + (Math.cos(a1) * u.y + Math.sin(a1) * v.y) * radius
            positions[offset++] = center.z + (Math.cos(a1) * u.z + Math.sin(a1) * v.z) * radius
        }
    }

    return positions
}


export function pickRotationRing (params) {
    const {camera3d, clientX, clientY, canvas, center, radius = ROTATION_RING_RADIUS} = params
    const {origin, direction} = screenToRay(camera3d, clientX, clientY, canvas)

    let closest = -1
    let closestDist = Infinity

    for (let i = 0; i < 3; i++) {
        const {axis} = ROTATION_AXES[i]

        const denom = axis.x * direction.x + axis.y * direction.y + axis.z * direction.z
        if (Math.abs(denom) < 1e-12) {
            continue
        }

        const diffX = center.x - origin.x
        const diffY = center.y - origin.y
        const diffZ = center.z - origin.z
        const t = (diffX * axis.x + diffY * axis.y + diffZ * axis.z) / denom
        if (t < 0) {
            continue
        }

        const hitX = origin.x + direction.x * t - center.x
        const hitY = origin.y + direction.y * t - center.y
        const hitZ = origin.z + direction.z * t - center.z
        const dist = Math.sqrt(hitX * hitX + hitY * hitY + hitZ * hitZ)
        const ringDist = Math.abs(dist - radius)

        if (ringDist < ROTATION_RING_TOLERANCE && ringDist < closestDist) {
            closest = i
            closestDist = ringDist
        }
    }

    return closest
}


export function rayPlaneAngle (params) {
    const {origin, direction, center, axisIndex} = params
    const {axis, u, v} = ROTATION_AXES[axisIndex]

    const denom = axis.x * direction.x + axis.y * direction.y + axis.z * direction.z
    if (Math.abs(denom) < 1e-12) {
        return null
    }

    const diffX = center.x - origin.x
    const diffY = center.y - origin.y
    const diffZ = center.z - origin.z
    const t = (diffX * axis.x + diffY * axis.y + diffZ * axis.z) / denom
    if (t < 0) {
        return null
    }

    const hitX = origin.x + direction.x * t - center.x
    const hitY = origin.y + direction.y * t - center.y
    const hitZ = origin.z + direction.z * t - center.z

    const uComp = hitX * u.x + hitY * u.y + hitZ * u.z
    const vComp = hitX * v.x + hitY * v.y + hitZ * v.z

    return Math.atan2(vComp, uComp)
}


const _quat = new Quaternion()
const _v = new Vec3()


export function applyWireRotation (positions, center, rotation) {
    _quat.setFromEuler(rotation.x, rotation.y, rotation.z)

    for (let i = 0; i < positions.length; i += 3) {
        _v.x = positions[i] - center.x
        _v.y = positions[i + 1] - center.y
        _v.z = positions[i + 2] - center.z

        _quat.rotateVec3(_v)

        positions[i] = _v.x + center.x
        positions[i + 1] = _v.y + center.y
        positions[i + 2] = _v.z + center.z
    }
}
