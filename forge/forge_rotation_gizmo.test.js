import Vec3 from '../math/vec3.js'
import {
    rotationRingPositions,
    pickRotationRing,
    rayPlaneAngle,
    applyWireRotation,
    ROTATION_RING_RADIUS,
    ROTATION_RING_SEGMENTS,
    ROTATION_RING_TOLERANCE,
    ROTATION_AXES
} from './forge_rotation_gizmo.js'


test('ROTATION_RING_TOLERANCE', () => {
    expect(ROTATION_RING_TOLERANCE).toBe(0.15)
})


describe('rotationRingPositions', () => {

    test('returns Float32Array with correct size', () => {
        const positions = rotationRingPositions(new Vec3(0, 0, 0))
        expect(positions).toBeInstanceOf(Float32Array)
        expect(positions.length).toBe(3 * ROTATION_RING_SEGMENTS * 6)
    })


    test('custom radius changes extents', () => {
        const positions = rotationRingPositions(new Vec3(0, 0, 0), 2.0)
        const {maxDist} = getMaxDistance(positions, new Vec3(0, 0, 0))
        expect(maxDist).toBeCloseTo(2.0, 1)
    })


    test('offset center shifts all vertices', () => {
        const center = new Vec3(3, 4, 5)
        const positions = rotationRingPositions(center)
        const {maxDist} = getMaxDistance(positions, center)
        expect(maxDist).toBeCloseTo(ROTATION_RING_RADIUS, 1)
    })


    test('Y-axis ring lies in XZ plane', () => {
        const positions = rotationRingPositions(new Vec3(0, 0, 0))
        const yRingStart = ROTATION_RING_SEGMENTS * 6
        const yRingEnd = ROTATION_RING_SEGMENTS * 2 * 6

        for (let i = yRingStart; i < yRingEnd; i += 3) {
            expect(positions[i + 1]).toBeCloseTo(0, 5)
        }
    })


    test('X-axis ring lies in YZ plane', () => {
        const positions = rotationRingPositions(new Vec3(0, 0, 0))
        const xRingEnd = ROTATION_RING_SEGMENTS * 6

        for (let i = 0; i < xRingEnd; i += 3) {
            expect(positions[i]).toBeCloseTo(0, 5)
        }
    })


    test('Z-axis ring lies in XY plane', () => {
        const positions = rotationRingPositions(new Vec3(0, 0, 0))
        const zRingStart = ROTATION_RING_SEGMENTS * 2 * 6

        for (let i = zRingStart; i < positions.length; i += 3) {
            expect(positions[i + 2]).toBeCloseTo(0, 5)
        }
    })

})


describe('pickRotationRing', () => {

    test('returns -1 when ray misses all rings', () => {
        const result = pickRotationRing({
            camera3d: mockCamera(),
            clientX: 0,
            clientY: 0,
            canvas: mockCanvas(),
            center: new Vec3(100, 100, 100)
        })
        expect(result).toBe(-1)
    })


    test('picks Y-axis ring from above', () => {
        const origin = new Vec3(ROTATION_RING_RADIUS, 5, 0)
        const direction = new Vec3(0, -1, 0)
        const center = new Vec3(0, 0, 0)

        const result = pickFromRay(origin, direction, center)
        expect(result).toBe(1)
    })


    test('picks X-axis ring from side', () => {
        const origin = new Vec3(5, ROTATION_RING_RADIUS, 0)
        const direction = new Vec3(-1, 0, 0)
        const center = new Vec3(0, 0, 0)

        const result = pickFromRay(origin, direction, center)
        expect(result).toBe(0)
    })


    test('picks Z-axis ring from front', () => {
        const origin = new Vec3(ROTATION_RING_RADIUS, 0, 5)
        const direction = new Vec3(0, 0, -1)
        const center = new Vec3(0, 0, 0)

        const result = pickFromRay(origin, direction, center)
        expect(result).toBe(2)
    })


    test('returns -1 when hit is far from ring radius', () => {
        const origin = new Vec3(0, 5, 0)
        const direction = new Vec3(0, -1, 0)
        const center = new Vec3(0, 0, 0)

        const result = pickFromRay(origin, direction, center)
        expect(result).toBe(-1)
    })

})


describe('rayPlaneAngle', () => {

    test('returns angle for Y-axis at positive Z', () => {
        const origin = new Vec3(0, 5, 1)
        const direction = new Vec3(0, -1, 0)
        const center = new Vec3(0, 0, 0)

        const angle = rayPlaneAngle({origin, direction, center, axisIndex: 1})
        expect(angle).toBeCloseTo(0, 2)
    })


    test('returns PI/2 for Y-axis at positive X', () => {
        const origin = new Vec3(1, 5, 0)
        const direction = new Vec3(0, -1, 0)
        const center = new Vec3(0, 0, 0)

        const angle = rayPlaneAngle({origin, direction, center, axisIndex: 1})
        expect(angle).toBeCloseTo(Math.PI / 2, 2)
    })


    test('returns null when ray is parallel to plane', () => {
        const origin = new Vec3(0, 1, 0)
        const direction = new Vec3(1, 0, 0)
        const center = new Vec3(0, 0, 0)

        const angle = rayPlaneAngle({origin, direction, center, axisIndex: 1})
        expect(angle).toBeNull()
    })


    test('returns null when ray points away', () => {
        const origin = new Vec3(0, 5, 0)
        const direction = new Vec3(0, 1, 0)
        const center = new Vec3(0, 0, 0)

        const angle = rayPlaneAngle({origin, direction, center, axisIndex: 1})
        expect(angle).toBeNull()
    })


    test('handles offset center', () => {
        const center = new Vec3(3, 0, 4)
        const origin = new Vec3(3, 5, 5)
        const direction = new Vec3(0, -1, 0)

        const angle = rayPlaneAngle({origin, direction, center, axisIndex: 1})
        expect(angle).toBeCloseTo(0, 2)
    })

})


describe('applyWireRotation', () => {

    test('rotates box wireframe 90 degrees around Y', () => {
        const positions = new Float32Array([
            1, 0, 0,
            0, 0, 1,
            -1, 0, 0
        ])
        const center = new Vec3(0, 0, 0)
        const rotation = new Vec3(0, Math.PI / 2, 0)

        applyWireRotation(positions, center, rotation)

        expect(positions[0]).toBeCloseTo(0, 5)
        expect(positions[1]).toBeCloseTo(0, 5)
        expect(positions[2]).toBeCloseTo(-1, 5)
    })


    test('respects center offset', () => {
        const positions = new Float32Array([
            6, 0, 5
        ])
        const center = new Vec3(5, 0, 5)
        const rotation = new Vec3(0, Math.PI / 2, 0)

        applyWireRotation(positions, center, rotation)

        expect(positions[0]).toBeCloseTo(5, 5)
        expect(positions[1]).toBeCloseTo(0, 5)
        expect(positions[2]).toBeCloseTo(4, 5)
    })


    test('identity rotation leaves positions unchanged', () => {
        const original = [1, 2, 3, 4, 5, 6]
        const positions = new Float32Array(original)
        const center = new Vec3(0, 0, 0)
        const rotation = new Vec3(0, 0, 0)

        applyWireRotation(positions, center, rotation)

        for (let i = 0; i < original.length; i++) {
            expect(positions[i]).toBeCloseTo(original[i], 5)
        }
    })

})


function getMaxDistance (positions, center) {
    let maxDist = 0
    for (let i = 0; i < positions.length; i += 3) {
        const dx = positions[i] - center.x
        const dy = positions[i + 1] - center.y
        const dz = positions[i + 2] - center.z
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (dist > maxDist) {
            maxDist = dist
        }
    }
    return {maxDist}
}


function pickFromRay (origin, direction, center, radius = ROTATION_RING_RADIUS) {
    let closest = -1
    let closestDist = Infinity

    for (let i = 0; i < 3; i++) {
        const a = ROTATION_AXES[i].axis

        const denom = a.x * direction.x + a.y * direction.y + a.z * direction.z
        if (Math.abs(denom) < 1e-12) {
            continue
        }

        const diffX = center.x - origin.x
        const diffY = center.y - origin.y
        const diffZ = center.z - origin.z
        const t = (diffX * a.x + diffY * a.y + diffZ * a.z) / denom
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


function mockCamera () {
    return {
        projectionMatrix: {elements: new Float32Array(16).fill(0)},
        viewMatrix: {elements: new Float32Array(16).fill(0)}
    }
}


function mockCanvas () {
    return {
        getBoundingClientRect: () => ({left: 0, top: 0, width: 800, height: 600})
    }
}
