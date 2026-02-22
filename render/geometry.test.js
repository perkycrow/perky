import Geometry from './geometry.js'


describe('Geometry', () => {

    describe('constructor', () => {

        test('accepts typed arrays', () => {
            const geo = new Geometry({
                positions: new Float32Array([0, 0, 0]),
                normals: new Float32Array([0, 1, 0]),
                uvs: new Float32Array([0, 0]),
                indices: new Uint16Array([0])
            })
            expect(geo.positions).toBeInstanceOf(Float32Array)
            expect(geo.indices).toBeInstanceOf(Uint16Array)
        })

        test('converts plain arrays to typed arrays', () => {
            const geo = new Geometry({
                positions: [1, 2, 3],
                normals: [0, 1, 0],
                uvs: [0, 0],
                indices: [0]
            })
            expect(geo.positions).toBeInstanceOf(Float32Array)
            expect(geo.normals).toBeInstanceOf(Float32Array)
            expect(geo.uvs).toBeInstanceOf(Float32Array)
            expect(geo.indices).toBeInstanceOf(Uint16Array)
        })

        test('tangents default to null', () => {
            const geo = new Geometry({
                positions: [0, 0, 0],
                normals: [0, 1, 0],
                uvs: [0, 0],
                indices: [0]
            })
            expect(geo.tangents).toBe(null)
        })

        test('accepts tangents as typed array', () => {
            const geo = new Geometry({
                positions: [0, 0, 0],
                normals: [0, 1, 0],
                uvs: [0, 0],
                indices: [0],
                tangents: new Float32Array([1, 0, 0])
            })
            expect(geo.tangents).toBeInstanceOf(Float32Array)
            expect(geo.tangents.length).toBe(3)
        })

    })


    test('vertexCount', () => {
        const geo = new Geometry({
            positions: [0, 0, 0, 1, 1, 1],
            normals: [0, 1, 0, 0, 1, 0],
            uvs: [0, 0, 1, 1],
            indices: [0, 1]
        })
        expect(geo.vertexCount).toBe(2)
    })


    test('indexCount', () => {
        const geo = new Geometry({
            positions: [0, 0, 0, 1, 1, 1, 2, 2, 2],
            normals: [0, 1, 0, 0, 1, 0, 0, 1, 0],
            uvs: [0, 0, 1, 0, 1, 1],
            indices: [0, 1, 2]
        })
        expect(geo.indexCount).toBe(3)
    })


    describe('computeTangents', () => {

        test('produces a Float32Array', () => {
            const geo = Geometry.createPlane(1, 1, 1, 1)
            geo.tangents = null
            geo.computeTangents()
            expect(geo.tangents).toBeInstanceOf(Float32Array)
            expect(geo.tangents.length).toBe(geo.vertexCount * 3)
        })

        test('returns this for chaining', () => {
            const geo = new Geometry({
                positions: [0, 0, 0, 1, 0, 0, 0, 0, 1],
                normals: [0, 1, 0, 0, 1, 0, 0, 1, 0],
                uvs: [0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2]
            })
            expect(geo.computeTangents()).toBe(geo)
        })

        test('tangents are orthogonal to normals', () => {
            const box = Geometry.createBox(1, 1, 1)
            for (let i = 0; i < box.vertexCount; i++) {
                const nx = box.normals[i * 3]
                const ny = box.normals[i * 3 + 1]
                const nz = box.normals[i * 3 + 2]
                const tx = box.tangents[i * 3]
                const ty = box.tangents[i * 3 + 1]
                const tz = box.tangents[i * 3 + 2]
                const dot = nx * tx + ny * ty + nz * tz
                expect(Math.abs(dot)).toBeLessThan(1e-5)
            }
        })

        test('tangents are unit length', () => {
            const box = Geometry.createBox(1, 1, 1)
            for (let i = 0; i < box.vertexCount; i++) {
                const tx = box.tangents[i * 3]
                const ty = box.tangents[i * 3 + 1]
                const tz = box.tangents[i * 3 + 2]
                const len = Math.sqrt(tx * tx + ty * ty + tz * tz)
                expect(Math.abs(len - 1)).toBeLessThan(1e-5)
            }
        })

    })


    describe('createBox', () => {

        test('produces 24 vertices and 36 indices', () => {
            const box = Geometry.createBox(1, 1, 1)
            expect(box.vertexCount).toBe(24)
            expect(box.indexCount).toBe(36)
        })

        test('has matching array sizes', () => {
            const box = Geometry.createBox(2, 3, 4)
            expect(box.positions.length).toBe(24 * 3)
            expect(box.normals.length).toBe(24 * 3)
            expect(box.uvs.length).toBe(24 * 2)
        })

        test('normals are unit length', () => {
            const box = Geometry.createBox(1, 1, 1)
            for (let i = 0; i < box.normals.length; i += 3) {
                const nx = box.normals[i]
                const ny = box.normals[i + 1]
                const nz = box.normals[i + 2]
                const len = Math.sqrt(nx * nx + ny * ny + nz * nz)
                expect(Math.abs(len - 1)).toBeLessThan(1e-6)
            }
        })

        test('default size is 1x1x1', () => {
            const box = Geometry.createBox()
            let maxX = -Infinity
            let maxY = -Infinity
            let maxZ = -Infinity
            for (let i = 0; i < box.positions.length; i += 3) {
                maxX = Math.max(maxX, Math.abs(box.positions[i]))
                maxY = Math.max(maxY, Math.abs(box.positions[i + 1]))
                maxZ = Math.max(maxZ, Math.abs(box.positions[i + 2]))
            }
            expect(maxX).toBe(0.5)
            expect(maxY).toBe(0.5)
            expect(maxZ).toBe(0.5)
        })

        test('indices are in range', () => {
            const box = Geometry.createBox(1, 1, 1)
            for (let i = 0; i < box.indices.length; i++) {
                expect(box.indices[i]).toBeGreaterThanOrEqual(0)
                expect(box.indices[i]).toBeLessThan(box.vertexCount)
            }
        })

        test('has tangents computed', () => {
            const box = Geometry.createBox(1, 1, 1)
            expect(box.tangents).toBeInstanceOf(Float32Array)
            expect(box.tangents.length).toBe(24 * 3)
        })

    })


    describe('createPlane', () => {

        test('1x1 plane with 1 segment produces 4 vertices and 6 indices', () => {
            const plane = Geometry.createPlane(1, 1, 1, 1)
            expect(plane.vertexCount).toBe(4)
            expect(plane.indexCount).toBe(6)
        })

        test('2x2 segments produces 9 vertices and 24 indices', () => {
            const plane = Geometry.createPlane(1, 1, 2, 2)
            expect(plane.vertexCount).toBe(9)
            expect(plane.indexCount).toBe(24)
        })

        test('normals point up', () => {
            const plane = Geometry.createPlane(1, 1, 1, 1)
            for (let i = 0; i < plane.normals.length; i += 3) {
                expect(plane.normals[i]).toBe(0)
                expect(plane.normals[i + 1]).toBe(1)
                expect(plane.normals[i + 2]).toBe(0)
            }
        })

        test('uvs span 0 to 1', () => {
            const plane = Geometry.createPlane(1, 1, 1, 1)
            const uValues = []
            const vValues = []
            for (let i = 0; i < plane.uvs.length; i += 2) {
                uValues.push(plane.uvs[i])
                vValues.push(plane.uvs[i + 1])
            }
            expect(Math.min(...uValues)).toBe(0)
            expect(Math.max(...uValues)).toBe(1)
            expect(Math.min(...vValues)).toBe(0)
            expect(Math.max(...vValues)).toBe(1)
        })

        test('indices are in range', () => {
            const plane = Geometry.createPlane(5, 5, 3, 3)
            for (let i = 0; i < plane.indices.length; i++) {
                expect(plane.indices[i]).toBeGreaterThanOrEqual(0)
                expect(plane.indices[i]).toBeLessThan(plane.vertexCount)
            }
        })

        test('has tangents computed', () => {
            const plane = Geometry.createPlane(1, 1, 1, 1)
            expect(plane.tangents).toBeInstanceOf(Float32Array)
            expect(plane.tangents.length).toBe(4 * 3)
        })

    })

})
