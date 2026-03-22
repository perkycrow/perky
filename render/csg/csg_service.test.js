import {describe, test, expect} from 'vitest'
import {vi} from 'vitest'
import CSGService from './csg_service.js'
import Geometry from '../geometry.js'


describe('CSGService', () => {

    test('serviceMethods', () => {
        expect(CSGService.serviceMethods).toEqual(['operate'])
    })


    function makeReq (params) {
        return {params}
    }


    function makeRes () {
        return {send: vi.fn(), error: vi.fn()}
    }


    function serializeGeometry (geometry) {
        return {
            positions: geometry.positions,
            normals: geometry.normals,
            uvs: geometry.uvs,
            indices: geometry.indices
        }
    }


    test('subtract', () => {
        const service = new CSGService()
        const a = serializeGeometry(Geometry.createBox(2, 2, 2))
        const b = serializeGeometry(Geometry.createBox(1, 1, 1))
        const res = makeRes()

        service.operate(makeReq({operation: 'subtract', a, b}), res)

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.error).not.toHaveBeenCalled()

        const result = res.send.mock.calls[0][0]
        expect(result.positions).toBeInstanceOf(Float32Array)
        expect(result.normals).toBeInstanceOf(Float32Array)
        expect(result.uvs).toBeInstanceOf(Float32Array)
        expect(result.indices).toBeInstanceOf(Uint16Array)
        expect(result.tangents).toBeInstanceOf(Float32Array)
        expect(result.indices.length / 3).toBeGreaterThan(12)
    })


    test('union', () => {
        const service = new CSGService()
        const a = serializeGeometry(Geometry.createBox())
        const b = serializeGeometry(Geometry.createBox())
        b.positions = offsetPositions(b.positions, 0.5, 0, 0)
        const res = makeRes()

        service.operate(makeReq({operation: 'union', a, b}), res)

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.error).not.toHaveBeenCalled()
    })


    test('intersect', () => {
        const service = new CSGService()
        const a = serializeGeometry(Geometry.createBox(2, 2, 2))
        const b = serializeGeometry(Geometry.createBox(1, 1, 1))
        const res = makeRes()

        service.operate(makeReq({operation: 'intersect', a, b}), res)

        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.error).not.toHaveBeenCalled()
    })


    test('error on missing geometry', () => {
        const service = new CSGService()
        const res = makeRes()

        service.operate(makeReq({operation: 'subtract', a: null, b: null}), res)

        expect(res.error).toHaveBeenCalledWith('Missing geometry data (a or b)')
    })


    test('error on invalid operation', () => {
        const service = new CSGService()
        const a = serializeGeometry(Geometry.createBox())
        const b = serializeGeometry(Geometry.createBox())
        const res = makeRes()

        service.operate(makeReq({operation: 'explode', a, b}), res)

        expect(res.error).toHaveBeenCalledWith('Invalid operation: explode')
    })


    test('result has valid indices', () => {
        const service = new CSGService()
        const a = serializeGeometry(Geometry.createBox(2, 2, 2))
        const b = serializeGeometry(Geometry.createBox(1, 1, 1))
        const res = makeRes()

        service.operate(makeReq({operation: 'subtract', a, b}), res)

        const result = res.send.mock.calls[0][0]
        const vertexCount = result.positions.length / 3

        for (let i = 0; i < result.indices.length; i++) {
            expect(result.indices[i]).toBeLessThan(vertexCount)
        }
    })

})


function offsetPositions (positions, dx, dy, dz) {
    const result = new Float32Array(positions.length)
    for (let i = 0; i < result.length; i += 3) {
        result[i] = positions[i] + dx
        result[i + 1] = positions[i + 1] + dy
        result[i + 2] = positions[i + 2] + dz
    }
    return result
}
