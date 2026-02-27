import {describe, test, expect} from 'vitest'
import filterDegeneratePolygons from './csg_utils.js'
import CSGPolygon from './csg_polygon.js'
import CSGVertex from './csg_vertex.js'
import Vec3 from '../../math/vec3.js'


describe('filterDegeneratePolygons', () => {

    function vertex (x, y, z) {
        return new CSGVertex(new Vec3(x, y, z), new Vec3(0, 0, 1), [0, 0])
    }


    test('keeps valid triangles', () => {
        const polygon = new CSGPolygon([vertex(0, 0, 0), vertex(1, 0, 0), vertex(0, 1, 0)])
        const result = filterDegeneratePolygons([polygon], 1e-5)
        expect(result).toHaveLength(1)
    })


    test('removes zero-area triangle', () => {
        const polygon = new CSGPolygon([vertex(0, 0, 0), vertex(1, 0, 0), vertex(2, 0, 0)])
        const result = filterDegeneratePolygons([polygon], 1e-5)
        expect(result).toHaveLength(0)
    })


    test('removes near-zero-area triangle', () => {
        const polygon = new CSGPolygon([vertex(0, 0, 0), vertex(1, 0, 0), vertex(0.5, 1e-8, 0)])
        const result = filterDegeneratePolygons([polygon], 1e-5)
        expect(result).toHaveLength(0)
    })


    test('removes polygon with less than 3 vertices', () => {
        const polygon = new CSGPolygon([vertex(0, 0, 0), vertex(1, 0, 0)], {normal: new Vec3(0, 0, 1), w: 0})
        const result = filterDegeneratePolygons([polygon], 1e-5)
        expect(result).toHaveLength(0)
    })


    test('mixed valid and degenerate', () => {
        const valid = new CSGPolygon([vertex(0, 0, 0), vertex(1, 0, 0), vertex(0, 1, 0)])
        const degenerate = new CSGPolygon([vertex(0, 0, 0), vertex(1, 0, 0), vertex(2, 0, 0)])
        const result = filterDegeneratePolygons([valid, degenerate], 1e-5)
        expect(result).toHaveLength(1)
    })


    test('empty input returns empty', () => {
        expect(filterDegeneratePolygons([], 1e-5)).toHaveLength(0)
    })


    test('keeps polygon with collinear first 3 vertices but valid area', () => {
        const polygon = new CSGPolygon([
            vertex(0, 0, 0),
            vertex(0, 1, 0),
            vertex(0, 2, 0),
            vertex(1, 2, 0),
            vertex(1, 1, 0),
            vertex(1, 0, 0)
        ])
        const result = filterDegeneratePolygons([polygon], 1e-5)
        expect(result).toHaveLength(1)
    })

})
