import {boxWirePositions} from './wire_geometry.js'
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
