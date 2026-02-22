import {describe, test, expect} from 'vitest'
import Brush from './brush.js'


describe('Brush', () => {

    test('constructor defaults', () => {
        const brush = new Brush()
        expect(brush.shape).toBe('box')
        expect(brush.operation).toBe('union')
        expect(brush.position.x).toBe(0)
        expect(brush.rotation.x).toBe(0)
        expect(brush.scale.x).toBe(1)
        expect(brush.enabled).toBe(true)
    })


    test('constructor with options', () => {
        const brush = new Brush({
            shape: 'sphere',
            operation: 'subtract',
            x: 1,
            y: 2,
            z: 3,
            rx: 0.1,
            ry: 0.2,
            rz: 0.3,
            sx: 2,
            sy: 3,
            sz: 4,
            params: {segments: 8, rings: 6},
            enabled: false
        })
        expect(brush.shape).toBe('sphere')
        expect(brush.operation).toBe('subtract')
        expect(brush.position.x).toBe(1)
        expect(brush.position.y).toBe(2)
        expect(brush.rotation.z).toBe(0.3)
        expect(brush.scale.y).toBe(3)
        expect(brush.params.segments).toBe(8)
        expect(brush.enabled).toBe(false)
    })


    test('createGeometry box', () => {
        const brush = new Brush({shape: 'box'})
        const geo = brush.createGeometry()
        expect(geo).not.toBeNull()
        expect(geo.vertexCount).toBe(24)
        expect(geo.indexCount).toBe(36)
    })


    test('createGeometry sphere', () => {
        const brush = new Brush({shape: 'sphere', params: {segments: 8, rings: 6}})
        const geo = brush.createGeometry()
        expect(geo).not.toBeNull()
        expect(geo.vertexCount).toBeGreaterThan(0)
    })


    test('createGeometry cylinder', () => {
        const geo = new Brush({shape: 'cylinder'}).createGeometry()
        expect(geo).not.toBeNull()
        expect(geo.vertexCount).toBeGreaterThan(0)
    })


    test('createGeometry cone', () => {
        const geo = new Brush({shape: 'cone'}).createGeometry()
        expect(geo).not.toBeNull()
        expect(geo.vertexCount).toBeGreaterThan(0)
    })


    test('createGeometry unknown shape returns null', () => {
        const geo = new Brush({shape: 'teapot'}).createGeometry()
        expect(geo).toBeNull()
    })


    test('createGeometry applies translation', () => {
        const brush = new Brush({x: 5, y: 0, z: 0})
        const geo = brush.createGeometry()
        let minX = Infinity
        for (let i = 0; i < geo.positions.length; i += 3) {
            if (geo.positions[i] < minX) {
                minX = geo.positions[i]
            }
        }
        expect(minX).toBeCloseTo(4.5, 3)
    })


    test('createGeometry applies scale', () => {
        const brush = new Brush({sx: 2, sy: 1, sz: 1})
        const geo = brush.createGeometry()
        let maxX = -Infinity
        for (let i = 0; i < geo.positions.length; i += 3) {
            if (geo.positions[i] > maxX) {
                maxX = geo.positions[i]
            }
        }
        expect(maxX).toBeCloseTo(1, 3)
    })


    test('createGeometry applies rotation', () => {
        const brush = new Brush({rx: 0, ry: 0, rz: Math.PI / 2})
        const geo = brush.createGeometry()
        let maxY = -Infinity
        for (let i = 0; i < geo.positions.length; i += 3) {
            if (geo.positions[i + 1] > maxY) {
                maxY = geo.positions[i + 1]
            }
        }
        expect(maxY).toBeCloseTo(0.5, 2)
    })


    test('createGeometry normals stay unit length after transform', () => {
        const brush = new Brush({sx: 2, sy: 0.5, sz: 3, rx: 0.5, ry: 1.0, rz: 0.3})
        const geo = brush.createGeometry()
        for (let i = 0; i < geo.normals.length; i += 3) {
            const len = Math.sqrt(
                geo.normals[i] ** 2 + geo.normals[i + 1] ** 2 + geo.normals[i + 2] ** 2
            )
            expect(len).toBeCloseTo(1, 3)
        }
    })


    test('toCSG', () => {
        const csg = new Brush().toCSG()
        expect(csg).not.toBeNull()
        expect(csg.polygons.length).toBe(12)
    })


    test('toCSG unknown shape returns null', () => {
        const csg = new Brush({shape: 'teapot'}).toCSG()
        expect(csg).toBeNull()
    })


    test('toJSON and fromJSON round-trip', () => {
        const original = new Brush({
            shape: 'sphere',
            operation: 'subtract',
            x: 1,
            y: 2,
            z: 3,
            rx: 0.1,
            ry: 0.2,
            rz: 0.3,
            sx: 2,
            sy: 3,
            sz: 4,
            params: {segments: 12},
            enabled: false
        })
        const json = original.toJSON()
        const restored = Brush.fromJSON(json)
        expect(restored.shape).toBe('sphere')
        expect(restored.operation).toBe('subtract')
        expect(restored.position.x).toBe(1)
        expect(restored.rotation.y).toBe(0.2)
        expect(restored.scale.z).toBe(4)
        expect(restored.params.segments).toBe(12)
        expect(restored.enabled).toBe(false)
    })


    test('clone is independent', () => {
        const a = new Brush({x: 1, y: 2, z: 3})
        const b = a.clone()
        b.position.x = 99
        expect(a.position.x).toBe(1)
    })

})
