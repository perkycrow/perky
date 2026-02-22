import {describe, test, expect} from 'vitest'
import CSGNode from './csg_node.js'
import CSGPolygon from './csg_polygon.js'
import CSGVertex from './csg_vertex.js'
import Vec3 from '../../math/vec3.js'


describe('CSGNode', () => {

    function makeTriangle (z = 0) {
        return new CSGPolygon([
            new CSGVertex(new Vec3(0, 0, z), new Vec3(0, 0, 1), [0, 0]),
            new CSGVertex(new Vec3(1, 0, z), new Vec3(0, 0, 1), [1, 0]),
            new CSGVertex(new Vec3(0, 1, z), new Vec3(0, 0, 1), [0, 1])
        ])
    }


    test('constructor empty', () => {
        const node = new CSGNode()
        expect(node.plane).toBeNull()
        expect(node.front).toBeNull()
        expect(node.back).toBeNull()
        expect(node.polygons).toHaveLength(0)
    })


    test('build single polygon', () => {
        const node = new CSGNode([makeTriangle()], 1e-5)
        expect(node.plane).not.toBeNull()
        expect(node.allPolygons()).toHaveLength(1)
    })


    test('build multiple polygons', () => {
        const polygons = [makeTriangle(0), makeTriangle(5)]
        const node = new CSGNode(polygons, 1e-5)
        expect(node.allPolygons()).toHaveLength(2)
    })


    test('invert flips plane', () => {
        const node = new CSGNode([makeTriangle()], 1e-5)
        const originalNz = node.plane.normal.z
        node.invert()
        expect(node.plane.normal.z).toBe(-originalNz)
    })


    test('invert flips polygon normals', () => {
        const node = new CSGNode([makeTriangle()], 1e-5)
        node.invert()
        const polygon = node.allPolygons()[0]
        expect(polygon.plane.normal.z).toBeCloseTo(-1, 5)
    })


    test('clone is independent', () => {
        const node = new CSGNode([makeTriangle()], 1e-5)
        const c = node.clone()
        c.polygons[0].vertices[0].position.x = 99
        expect(node.polygons[0].vertices[0].position.x).toBe(0)
    })


    test('allPolygons collects from tree', () => {
        const p1 = makeTriangle(0)
        const p2 = makeTriangle(5)
        const p3 = makeTriangle(-5)
        const node = new CSGNode([p1, p2, p3], 1e-5)
        expect(node.allPolygons()).toHaveLength(3)
    })


    test('clipPolygons removes back polygons at leaf', () => {
        const node = new CSGNode([makeTriangle(0)], 1e-5)
        const behind = makeTriangle(-5)
        const result = node.clipPolygons([behind], 1e-5)
        expect(result).toHaveLength(0)
    })


    test('clipPolygons keeps front polygons', () => {
        const node = new CSGNode([makeTriangle(0)], 1e-5)
        const inFront = makeTriangle(5)
        const result = node.clipPolygons([inFront], 1e-5)
        expect(result).toHaveLength(1)
    })

})
