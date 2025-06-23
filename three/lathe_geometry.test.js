import LatheGeometry from './lathe_geometry'
import {Vector2} from 'three'
import {describe, test, expect} from 'vitest'


describe('LatheGeometry', () => {

    test('constructor with object parameters', () => {
        const points = [
            new Vector2(0, -1),
            new Vector2(1, 0),
            new Vector2(0, 1)
        ]
        const geometry = new LatheGeometry({
            points,
            segments: 16,
            phiStart: Math.PI / 4,
            phiLength: Math.PI
        })

        expect(geometry.parameters.points).toBe(points)
        expect(geometry.parameters.segments).toBe(16)
        expect(geometry.parameters.phiStart).toBe(Math.PI / 4)
        expect(geometry.parameters.phiLength).toBe(Math.PI)
    })


    test('constructor with points only', () => {
        const points = [
            new Vector2(0.5, -2),
            new Vector2(1.5, -1),
            new Vector2(1, 0),
            new Vector2(1.5, 1),
            new Vector2(0.5, 2)
        ]
        const geometry = new LatheGeometry({
            points
        })

        expect(geometry.parameters.points).toBe(points)
        expect(geometry.parameters.segments).toBe(12)
        expect(geometry.parameters.phiStart).toBe(0)
        expect(geometry.parameters.phiLength).toBe(Math.PI * 2)
    })


    test('constructor with segments only uses default points', () => {
        const geometry = new LatheGeometry({
            segments: 24
        })

        expect(geometry.parameters.points).toHaveLength(3)
        expect(geometry.parameters.segments).toBe(24)
        expect(geometry.parameters.phiStart).toBe(0)
        expect(geometry.parameters.phiLength).toBe(Math.PI * 2)
    })


    test('constructor with partial parameters and defaults', () => {
        const points = [
            new Vector2(0.2, -1),
            new Vector2(0.8, 0),
            new Vector2(0.2, 1)
        ]
        const geometry = new LatheGeometry({
            points,
            phiLength: Math.PI / 2
        })

        expect(geometry.parameters.points).toBe(points)
        expect(geometry.parameters.segments).toBe(12)
        expect(geometry.parameters.phiStart).toBe(0)
        expect(geometry.parameters.phiLength).toBe(Math.PI / 2)
    })


    test('constructor with empty object uses defaults', () => {
        const geometry = new LatheGeometry({})

        expect(geometry.parameters.points).toHaveLength(3)
        expect(geometry.parameters.segments).toBe(12)
        expect(geometry.parameters.phiStart).toBe(0)
        expect(geometry.parameters.phiLength).toBe(Math.PI * 2)
        
        // Check default diamond shape
        expect(geometry.parameters.points[0].x).toBe(0)
        expect(geometry.parameters.points[0].y).toBe(-0.5)
        expect(geometry.parameters.points[1].x).toBe(0.5)
        expect(geometry.parameters.points[1].y).toBe(0)
        expect(geometry.parameters.points[2].x).toBe(0)
        expect(geometry.parameters.points[2].y).toBe(0.5)
    })


    test('constructor with positional arguments (legacy mode)', () => {
        const points = [
            new Vector2(0.3, -1.5),
            new Vector2(1.2, 0),
            new Vector2(0.3, 1.5)
        ]
        const geometry = new LatheGeometry(points, 20, Math.PI / 6, Math.PI)

        expect(geometry.parameters.points).toBe(points)
        expect(geometry.parameters.segments).toBe(20)
        expect(geometry.parameters.phiStart).toBe(Math.PI / 6)
        expect(geometry.parameters.phiLength).toBe(Math.PI)
    })


    test('constructor with no arguments uses sensible defaults', () => {
        const geometry = new LatheGeometry()

        expect(geometry.parameters.points).toHaveLength(3)
        expect(geometry.parameters.segments).toBe(12)
        expect(geometry.parameters.phiStart).toBe(0)
        expect(geometry.parameters.phiLength).toBe(Math.PI * 2)
    })


    test('constructor with null parameters uses sensible defaults', () => {
        const geometry = new LatheGeometry(null)

        expect(geometry.parameters.points).toHaveLength(3)
        expect(geometry.parameters.segments).toBe(12)
        expect(geometry.parameters.phiStart).toBe(0)
        expect(geometry.parameters.phiLength).toBe(Math.PI * 2)
    })


    test('constructor with array as first parameter falls back to legacy mode', () => {
        const points = [
            new Vector2(0.1, -1),
            new Vector2(0.6, -0.5),
            new Vector2(1, 0),
            new Vector2(0.6, 0.5),
            new Vector2(0.1, 1)
        ]
        const geometry = new LatheGeometry(points, 16)

        expect(geometry.parameters.points).toBe(points)
        expect(geometry.parameters.segments).toBe(16)
        expect(geometry.parameters.phiStart).toBe(0)
        expect(geometry.parameters.phiLength).toBe(Math.PI * 2)
    })


    test('constructor for half revolution (semicircle)', () => {
        const points = [
            new Vector2(0, -1),
            new Vector2(1, 0),
            new Vector2(0, 1)
        ]
        const geometry = new LatheGeometry({
            points,
            phiLength: Math.PI
        })

        expect(geometry.parameters.points).toBe(points)
        expect(geometry.parameters.phiLength).toBe(Math.PI)
    })


    test('constructor for quarter revolution', () => {
        const points = [
            new Vector2(0.5, -2),
            new Vector2(1.5, 0),
            new Vector2(0.5, 2)
        ]
        const geometry = new LatheGeometry({
            points,
            segments: 8,
            phiStart: Math.PI / 4,
            phiLength: Math.PI / 2
        })

        expect(geometry.parameters.phiStart).toBe(Math.PI / 4)
        expect(geometry.parameters.phiLength).toBe(Math.PI / 2)
        expect(geometry.parameters.segments).toBe(8)
    })


    test('constructor for vase-like shape', () => {
        const points = [
            new Vector2(0.1, -2),
            new Vector2(0.8, -1.5),
            new Vector2(1.2, -1),
            new Vector2(1, 0),
            new Vector2(1.5, 1),
            new Vector2(0.8, 1.5),
            new Vector2(0.3, 2)
        ]
        const geometry = new LatheGeometry({
            points,
            segments: 32
        })

        expect(geometry.parameters.points).toBe(points)
        expect(geometry.parameters.segments).toBe(32)
    })


    test('constructor with high detail lathe', () => {
        const points = []
        for (let i = 0; i < 10; i++) {
            points.push(new Vector2(Math.sin(i * 0.2) * 0.5 + 0.5, (i - 5) * 0.4))
        }
        
        const geometry = new LatheGeometry({
            points,
            segments: 64
        })

        expect(geometry.parameters.points).toHaveLength(10)
        expect(geometry.parameters.segments).toBe(64)
    })

}) 