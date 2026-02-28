import Vec3 from '../math/vec3.js'
import Matrix4 from '../math/matrix4.js'


export function screenToRay (camera3d, clientX, clientY, canvas) {
    const rect = canvas.getBoundingClientRect()
    const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1
    const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1

    const invMatrix = new Matrix4()
        .multiplyMatrices(camera3d.projectionMatrix, camera3d.viewMatrix)
        .invert()

    const near = new Vec3(ndcX, ndcY, -1)
    const far = new Vec3(ndcX, ndcY, 1)

    invMatrix.transformPoint(near)
    invMatrix.transformPoint(far)

    const direction = far.sub(near).normalize()

    return {origin: near, direction}
}


export function rayAABB (origin, direction, min, max) {
    let tmin = -Infinity
    let tmax = Infinity

    for (let i = 0; i < 3; i++) {
        const o = origin.getComponent(i)
        const d = direction.getComponent(i)
        const lo = min.getComponent(i)
        const hi = max.getComponent(i)

        if (Math.abs(d) < 1e-12) {
            if (o < lo || o > hi) {
                return -1
            }
            continue
        }

        let t1 = (lo - o) / d
        let t2 = (hi - o) / d

        if (t1 > t2) {
            const tmp = t1
            t1 = t2
            t2 = tmp
        }

        tmin = Math.max(tmin, t1)
        tmax = Math.min(tmax, t2)

        if (tmin > tmax) {
            return -1
        }
    }

    if (tmax < 0) {
        return -1
    }

    return tmin >= 0 ? tmin : tmax
}


export function brushAABB (brush) {
    const p = brush.position
    const s = brush.scale
    const hx = s.x / 2
    const hy = s.y / 2
    const hz = s.z / 2
    return {
        min: new Vec3(p.x - hx, p.y - hy, p.z - hz),
        max: new Vec3(p.x + hx, p.y + hy, p.z + hz)
    }
}


export function pickBrush (camera3d, clientX, clientY, canvas, brushSet) {
    const {origin, direction} = screenToRay(camera3d, clientX, clientY, canvas)

    let closest = -1
    let closestT = Infinity

    for (let i = 0; i < brushSet.count; i++) {
        const brush = brushSet.get(i)
        if (!brush.enabled) {
            continue
        }
        const {min, max} = brushAABB(brush)
        const t = rayAABB(origin, direction, min, max)
        if (t >= 0 && t < closestT) {
            closest = i
            closestT = t
        }
    }

    return closest
}


export function rayHorizontalPlane (origin, direction, planeY) {
    if (Math.abs(direction.y) < 1e-12) {
        return null
    }

    const t = (planeY - origin.y) / direction.y
    if (t < 0) {
        return null
    }

    return new Vec3(
        origin.x + direction.x * t,
        planeY,
        origin.z + direction.z * t
    )
}
