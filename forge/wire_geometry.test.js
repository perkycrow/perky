import {boxWirePositions, sphereWirePositions, cylinderWirePositions, coneWirePositions, brushWirePositions} from './wire_geometry.js'
import Vec3 from '../math/vec3.js'


describe('boxWirePositions', () => {

    test('returns Float32Array with 72 elements', () => {
        const positions = boxWirePositions(new Vec3(0, 0, 0), new Vec3(1, 1, 1))
        expect(positions).toBeInstanceOf(Float32Array)
        expect(positions.length).toBe(72)
    })


    test('unit box at origin has correct corners', () => {
        const positions = boxWirePositions(new Vec3(0, 0, 0), new Vec3(1, 1, 1))

        expect(positions[0]).toBe(-0.5)
        expect(positions[1]).toBe(-0.5)
        expect(positions[2]).toBe(-0.5)

        expect(positions[3]).toBe(0.5)
        expect(positions[4]).toBe(-0.5)
        expect(positions[5]).toBe(-0.5)
    })


    test('offset box shifts all vertices', () => {
        const positions = boxWirePositions(new Vec3(2, 3, 4), new Vec3(1, 1, 1))

        expect(positions[0]).toBe(1.5)
        expect(positions[1]).toBe(2.5)
        expect(positions[2]).toBe(3.5)

        expect(positions[3]).toBe(2.5)
        expect(positions[4]).toBe(2.5)
        expect(positions[5]).toBe(3.5)
    })


    test('scaled box has correct extents', () => {
        const positions = boxWirePositions(new Vec3(0, 0, 0), new Vec3(2, 4, 6))

        const xs = []
        const ys = []
        const zs = []
        for (let i = 0; i < positions.length; i += 3) {
            xs.push(positions[i])
            ys.push(positions[i + 1])
            zs.push(positions[i + 2])
        }

        expect(Math.min(...xs)).toBe(-1)
        expect(Math.max(...xs)).toBe(1)
        expect(Math.min(...ys)).toBe(-2)
        expect(Math.max(...ys)).toBe(2)
        expect(Math.min(...zs)).toBe(-3)
        expect(Math.max(...zs)).toBe(3)
    })


    test('has 12 edges (24 vertices)', () => {
        const positions = boxWirePositions(new Vec3(0, 0, 0), new Vec3(1, 1, 1))
        expect(positions.length / 3).toBe(24)
    })

})


describe('sphereWirePositions', () => {

    test('returns Float32Array with correct size', () => {
        const positions = sphereWirePositions(new Vec3(0, 0, 0), new Vec3(1, 1, 1))
        expect(positions).toBeInstanceOf(Float32Array)
        expect(positions.length).toBe(16 * 3 * 6)
    })


    test('custom segments changes size', () => {
        const positions = sphereWirePositions(new Vec3(0, 0, 0), new Vec3(1, 1, 1), 8)
        expect(positions.length).toBe(8 * 3 * 6)
    })


    test('unit sphere at origin has correct extents', () => {
        const positions = sphereWirePositions(new Vec3(0, 0, 0), new Vec3(2, 2, 2))
        const {minX, maxX, minY, maxY, minZ, maxZ} = getExtents(positions)

        expect(minX).toBeCloseTo(-1, 2)
        expect(maxX).toBeCloseTo(1, 2)
        expect(minY).toBeCloseTo(-1, 2)
        expect(maxY).toBeCloseTo(1, 2)
        expect(minZ).toBeCloseTo(-1, 2)
        expect(maxZ).toBeCloseTo(1, 2)
    })


    test('offset sphere shifts all vertices', () => {
        const positions = sphereWirePositions(new Vec3(3, 4, 5), new Vec3(2, 2, 2))
        const {minX, maxX, minY, maxY, minZ, maxZ} = getExtents(positions)

        expect(minX).toBeCloseTo(2, 2)
        expect(maxX).toBeCloseTo(4, 2)
        expect(minY).toBeCloseTo(3, 2)
        expect(maxY).toBeCloseTo(5, 2)
        expect(minZ).toBeCloseTo(4, 2)
        expect(maxZ).toBeCloseTo(6, 2)
    })


    test('non-uniform scale creates ellipsoid', () => {
        const positions = sphereWirePositions(new Vec3(0, 0, 0), new Vec3(4, 2, 6))
        const {minX, maxX, minY, maxY, minZ, maxZ} = getExtents(positions)

        expect(minX).toBeCloseTo(-2, 2)
        expect(maxX).toBeCloseTo(2, 2)
        expect(minY).toBeCloseTo(-1, 2)
        expect(maxY).toBeCloseTo(1, 2)
        expect(minZ).toBeCloseTo(-3, 2)
        expect(maxZ).toBeCloseTo(3, 2)
    })

})


describe('cylinderWirePositions', () => {

    test('returns Float32Array with correct size', () => {
        const positions = cylinderWirePositions(new Vec3(0, 0, 0), new Vec3(1, 1, 1))
        expect(positions).toBeInstanceOf(Float32Array)
        expect(positions.length).toBe((16 * 2 + 4) * 6)
    })


    test('custom segments changes size', () => {
        const positions = cylinderWirePositions(new Vec3(0, 0, 0), new Vec3(1, 1, 1), 8)
        expect(positions.length).toBe((8 * 2 + 4) * 6)
    })


    test('unit cylinder at origin has correct extents', () => {
        const positions = cylinderWirePositions(new Vec3(0, 0, 0), new Vec3(2, 4, 2))
        const {minX, maxX, minY, maxY, minZ, maxZ} = getExtents(positions)

        expect(minX).toBeCloseTo(-1, 2)
        expect(maxX).toBeCloseTo(1, 2)
        expect(minY).toBeCloseTo(-2, 2)
        expect(maxY).toBeCloseTo(2, 2)
        expect(minZ).toBeCloseTo(-1, 2)
        expect(maxZ).toBeCloseTo(1, 2)
    })


    test('offset cylinder shifts all vertices', () => {
        const positions = cylinderWirePositions(new Vec3(1, 2, 3), new Vec3(2, 2, 2))
        const {minX, maxX, minY, maxY, minZ, maxZ} = getExtents(positions)

        expect(minX).toBeCloseTo(0, 2)
        expect(maxX).toBeCloseTo(2, 2)
        expect(minY).toBeCloseTo(1, 2)
        expect(maxY).toBeCloseTo(3, 2)
        expect(minZ).toBeCloseTo(2, 2)
        expect(maxZ).toBeCloseTo(4, 2)
    })

})


describe('coneWirePositions', () => {

    test('returns Float32Array with correct size', () => {
        const positions = coneWirePositions(new Vec3(0, 0, 0), new Vec3(1, 1, 1))
        expect(positions).toBeInstanceOf(Float32Array)
        expect(positions.length).toBe((16 + 4) * 6)
    })


    test('custom segments changes size', () => {
        const positions = coneWirePositions(new Vec3(0, 0, 0), new Vec3(1, 1, 1), 8)
        expect(positions.length).toBe((8 + 4) * 6)
    })


    test('unit cone at origin has correct extents', () => {
        const positions = coneWirePositions(new Vec3(0, 0, 0), new Vec3(2, 4, 2))
        const {minX, maxX, minY, maxY, minZ, maxZ} = getExtents(positions)

        expect(minX).toBeCloseTo(-1, 2)
        expect(maxX).toBeCloseTo(1, 2)
        expect(minY).toBeCloseTo(-2, 2)
        expect(maxY).toBeCloseTo(2, 2)
        expect(minZ).toBeCloseTo(-1, 2)
        expect(maxZ).toBeCloseTo(1, 2)
    })


    test('apex is at top center', () => {
        const positions = coneWirePositions(new Vec3(0, 0, 0), new Vec3(2, 4, 2))

        let hasApex = false
        for (let i = 0; i < positions.length; i += 3) {
            if (positions[i] === 0 && positions[i + 1] === 2 && positions[i + 2] === 0) {
                hasApex = true
                break
            }
        }
        expect(hasApex).toBe(true)
    })

})


describe('brushWirePositions', () => {

    test('dispatches to box for box shape', () => {
        const brush = {shape: 'box', position: new Vec3(0, 0, 0), scale: new Vec3(1, 1, 1), rotation: new Vec3(0, 0, 0)}
        const positions = brushWirePositions(brush)
        expect(positions.length).toBe(72)
    })


    test('dispatches to sphere for sphere shape', () => {
        const brush = {shape: 'sphere', position: new Vec3(0, 0, 0), scale: new Vec3(1, 1, 1), rotation: new Vec3(0, 0, 0)}
        const positions = brushWirePositions(brush)
        expect(positions.length).toBe(16 * 3 * 6)
    })


    test('dispatches to cylinder for cylinder shape', () => {
        const brush = {shape: 'cylinder', position: new Vec3(0, 0, 0), scale: new Vec3(1, 1, 1), rotation: new Vec3(0, 0, 0)}
        const positions = brushWirePositions(brush)
        expect(positions.length).toBe((16 * 2 + 4) * 6)
    })


    test('dispatches to cone for cone shape', () => {
        const brush = {shape: 'cone', position: new Vec3(0, 0, 0), scale: new Vec3(1, 1, 1), rotation: new Vec3(0, 0, 0)}
        const positions = brushWirePositions(brush)
        expect(positions.length).toBe((16 + 4) * 6)
    })


    test('falls back to box for unknown shape', () => {
        const brush = {shape: 'unknown', position: new Vec3(0, 0, 0), scale: new Vec3(1, 1, 1), rotation: new Vec3(0, 0, 0)}
        const positions = brushWirePositions(brush)
        expect(positions.length).toBe(72)
    })


    test('applies rotation to box wireframe', () => {
        const brush = {shape: 'box', position: new Vec3(0, 0, 0), scale: new Vec3(2, 1, 1), rotation: new Vec3(0, Math.PI / 2, 0)}
        const positions = brushWirePositions(brush)
        const {minX, maxX, minZ, maxZ} = getExtents(positions)

        expect(maxX).toBeCloseTo(0.5, 2)
        expect(minX).toBeCloseTo(-0.5, 2)
        expect(maxZ).toBeCloseTo(1, 2)
        expect(minZ).toBeCloseTo(-1, 2)
    })


    test('no rotation leaves wireframe unchanged', () => {
        const brush = {shape: 'box', position: new Vec3(0, 0, 0), scale: new Vec3(2, 1, 1), rotation: new Vec3(0, 0, 0)}
        const positions = brushWirePositions(brush)
        const {minX, maxX, minZ, maxZ} = getExtents(positions)

        expect(maxX).toBeCloseTo(1, 2)
        expect(minX).toBeCloseTo(-1, 2)
        expect(maxZ).toBeCloseTo(0.5, 2)
        expect(minZ).toBeCloseTo(-0.5, 2)
    })

})


function getExtents (positions) {
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    let minZ = Infinity
    let maxZ = -Infinity

    for (let i = 0; i < positions.length; i += 3) {
        minX = Math.min(minX, positions[i])
        maxX = Math.max(maxX, positions[i])
        minY = Math.min(minY, positions[i + 1])
        maxY = Math.max(maxY, positions[i + 1])
        minZ = Math.min(minZ, positions[i + 2])
        maxZ = Math.max(maxZ, positions[i + 2])
    }

    return {minX, maxX, minY, maxY, minZ, maxZ}
}
