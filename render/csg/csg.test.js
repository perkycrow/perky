import {describe, test, expect} from 'vitest'
import CSG from './csg.js'
import Geometry from '../geometry.js'


function computeVolume (geometry) {
    const {positions, indices} = geometry
    let volume = 0
    for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i]
        const b = indices[i + 1]
        const c = indices[i + 2]
        const ax = positions[a * 3]
        const ay = positions[a * 3 + 1]
        const az = positions[a * 3 + 2]
        const bx = positions[b * 3]
        const by = positions[b * 3 + 1]
        const bz = positions[b * 3 + 2]
        const cx = positions[c * 3]
        const cy = positions[c * 3 + 1]
        const cz = positions[c * 3 + 2]
        volume += (ax * (by * cz - bz * cy) + bx * (cy * az - cz * ay) + cx * (ay * bz - az * by)) / 6
    }
    return Math.abs(volume)
}


describe('CSG', () => {

    function offsetGeometry (geometry, dx, dy, dz) {
        const positions = new Float32Array(geometry.positions.length)
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] = geometry.positions[i] + dx
            positions[i + 1] = geometry.positions[i + 1] + dy
            positions[i + 2] = geometry.positions[i + 2] + dz
        }
        return new Geometry({
            positions,
            normals: new Float32Array(geometry.normals),
            uvs: new Float32Array(geometry.uvs),
            indices: new Uint16Array(geometry.indices)
        })
    }


    test('fromGeometry preserves triangle count', () => {
        const box = Geometry.createBox()
        const csg = CSG.fromGeometry(box)
        expect(csg.polygons).toHaveLength(12)
    })


    test('toGeometry round-trip', () => {
        const box = Geometry.createBox()
        const csg = CSG.fromGeometry(box)
        const result = csg.toGeometry()
        expect(result.vertexCount).toBe(box.vertexCount)
        expect(result.indexCount).toBe(box.indexCount)
    })


    test('toGeometry produces tangents', () => {
        const box = Geometry.createBox()
        const result = CSG.fromGeometry(box).toGeometry()
        expect(result.tangents).not.toBeNull()
        expect(result.tangents.length).toBe(result.vertexCount * 3)
    })


    test('clone', () => {
        const a = CSG.fromGeometry(Geometry.createBox())
        const b = a.clone()
        b.polygons[0].vertices[0].position.x = 99
        expect(a.polygons[0].vertices[0].position.x).not.toBe(99)
    })


    test('subtract produces more faces', () => {
        const a = CSG.fromGeometry(Geometry.createBox(2, 2, 2))
        const b = CSG.fromGeometry(Geometry.createBox(1, 1, 1))
        const result = a.subtract(b)
        const geometry = result.toGeometry()
        expect(geometry.indexCount / 3).toBeGreaterThan(12)
    })


    test('subtract result has valid indices', () => {
        const a = CSG.fromGeometry(Geometry.createBox(2, 2, 2))
        const b = CSG.fromGeometry(Geometry.createBox(1, 1, 1))
        const geometry = a.subtract(b).toGeometry()
        for (let i = 0; i < geometry.indices.length; i++) {
            expect(geometry.indices[i]).toBeLessThan(geometry.vertexCount)
        }
    })


    test('subtract result has unit normals', () => {
        const a = CSG.fromGeometry(Geometry.createBox(2, 2, 2))
        const b = CSG.fromGeometry(Geometry.createBox(1, 1, 1))
        const geometry = a.subtract(b).toGeometry()
        for (let i = 0; i < geometry.vertexCount; i++) {
            const nx = geometry.normals[i * 3]
            const ny = geometry.normals[i * 3 + 1]
            const nz = geometry.normals[i * 3 + 2]
            const len = Math.sqrt(nx * nx + ny * ny + nz * nz)
            expect(len).toBeCloseTo(1, 3)
        }
    })


    test('union of offset boxes', () => {
        const geoA = Geometry.createBox()
        const geoB = offsetGeometry(Geometry.createBox(), 0.5, 0, 0)
        const a = CSG.fromGeometry(geoA)
        const b = CSG.fromGeometry(geoB)
        const result = a.union(b)
        const geometry = result.toGeometry()
        expect(geometry.indexCount).toBeGreaterThan(0)
        expect(geometry.vertexCount).toBeGreaterThan(0)
    })


    test('union result has valid indices', () => {
        const geoA = Geometry.createBox()
        const geoB = offsetGeometry(Geometry.createBox(), 0.5, 0, 0)
        const geometry = CSG.fromGeometry(geoA).union(CSG.fromGeometry(geoB)).toGeometry()
        for (let i = 0; i < geometry.indices.length; i++) {
            expect(geometry.indices[i]).toBeLessThan(geometry.vertexCount)
        }
    })


    test('intersect of overlapping boxes', () => {
        const a = CSG.fromGeometry(Geometry.createBox(2, 2, 2))
        const b = CSG.fromGeometry(Geometry.createBox(1, 1, 1))
        const result = a.intersect(b)
        const geometry = result.toGeometry()
        expect(geometry.indexCount).toBeGreaterThan(0)
    })


    test('intersect result has valid indices', () => {
        const a = CSG.fromGeometry(Geometry.createBox(2, 2, 2))
        const b = CSG.fromGeometry(Geometry.createBox(1, 1, 1))
        const geometry = a.intersect(b).toGeometry()
        for (let i = 0; i < geometry.indices.length; i++) {
            expect(geometry.indices[i]).toBeLessThan(geometry.vertexCount)
        }
    })


    test('intersect result has unit normals', () => {
        const a = CSG.fromGeometry(Geometry.createBox(2, 2, 2))
        const b = CSG.fromGeometry(Geometry.createBox(1, 1, 1))
        const geometry = a.intersect(b).toGeometry()
        for (let i = 0; i < geometry.vertexCount; i++) {
            const nx = geometry.normals[i * 3]
            const ny = geometry.normals[i * 3 + 1]
            const nz = geometry.normals[i * 3 + 2]
            const len = Math.sqrt(nx * nx + ny * ny + nz * nz)
            expect(len).toBeCloseTo(1, 3)
        }
    })


    test('subtract does not modify originals', () => {
        const a = CSG.fromGeometry(Geometry.createBox(2, 2, 2))
        const b = CSG.fromGeometry(Geometry.createBox(1, 1, 1))
        const originalCount = a.polygons.length
        a.subtract(b)
        expect(a.polygons).toHaveLength(originalCount)
    })


    test('subtract with sphere', () => {
        const box = CSG.fromGeometry(Geometry.createBox(2, 2, 2))
        const sphere = CSG.fromGeometry(Geometry.createSphere(0.4, 8, 6))
        const result = box.subtract(sphere)
        const geometry = result.toGeometry()
        expect(geometry.indexCount / 3).toBeGreaterThan(12)
        for (let i = 0; i < geometry.indices.length; i++) {
            expect(geometry.indices[i]).toBeLessThan(geometry.vertexCount)
        }
    })


    test('union of touching boxes preserves volume', () => {
        const geoA = Geometry.createBox(1, 1, 1)
        const geoB = offsetGeometry(Geometry.createBox(1, 1, 1), 0, 1, 0)
        const geometry = CSG.fromGeometry(geoA).union(CSG.fromGeometry(geoB)).toGeometry()

        expect(computeVolume(geometry)).toBeCloseTo(2, 1)
        expect(geometry.indexCount).toBeGreaterThan(0)
    })

})
