import SphereGeometry from './sphere_geometry'
import {describe, test, expect} from 'vitest'


describe('SphereGeometry', () => {

    test('constructor with object parameters', () => {
        const geometry = new SphereGeometry({
            radius: 5,
            widthSegments: 24,
            heightSegments: 12,
            phiStart: Math.PI / 4,
            phiLength: Math.PI,
            thetaStart: Math.PI / 6,
            thetaLength: Math.PI / 2
        })

        expect(geometry.parameters.radius).toBe(5)
        expect(geometry.parameters.widthSegments).toBe(24)
        expect(geometry.parameters.heightSegments).toBe(12)
        expect(geometry.parameters.phiStart).toBeCloseTo(Math.PI / 4)
        expect(geometry.parameters.phiLength).toBeCloseTo(Math.PI)
        expect(geometry.parameters.thetaStart).toBeCloseTo(Math.PI / 6)
        expect(geometry.parameters.thetaLength).toBeCloseTo(Math.PI / 2)
    })


    test('constructor with size parameter', () => {
        const geometry = new SphereGeometry({
            size: 3
        })

        expect(geometry.parameters.radius).toBe(3)
        expect(geometry.parameters.widthSegments).toBe(32)
        expect(geometry.parameters.heightSegments).toBe(16)
    })


    test('constructor with segments parameter', () => {
        const geometry = new SphereGeometry({
            segments: 20
        })

        expect(geometry.parameters.widthSegments).toBe(20)
        expect(geometry.parameters.heightSegments).toBe(20)
        expect(geometry.parameters.radius).toBe(1)
    })


    test('constructor with size and radius (radius takes precedence)', () => {
        const geometry = new SphereGeometry({
            size: 3,
            radius: 5
        })

        expect(geometry.parameters.radius).toBe(5)
    })


    test('constructor with segments and explicit width/height segments', () => {
        const geometry = new SphereGeometry({
            segments: 16,
            widthSegments: 24,
            heightSegments: 12
        })

        expect(geometry.parameters.widthSegments).toBe(24)
        expect(geometry.parameters.heightSegments).toBe(12)
    })


    test('constructor for hemisphere (half sphere)', () => {
        const geometry = new SphereGeometry({
            radius: 2,
            thetaLength: Math.PI / 2
        })

        expect(geometry.parameters.radius).toBe(2)
        expect(geometry.parameters.thetaLength).toBeCloseTo(Math.PI / 2)
        expect(geometry.parameters.thetaStart).toBe(0)
    })


    test('constructor for sphere slice (phi section)', () => {
        const geometry = new SphereGeometry({
            radius: 1.5,
            phiStart: Math.PI / 4,
            phiLength: Math.PI / 2
        })

        expect(geometry.parameters.phiStart).toBeCloseTo(Math.PI / 4)
        expect(geometry.parameters.phiLength).toBeCloseTo(Math.PI / 2)
    })


    test('constructor for sphere wedge (both angles)', () => {
        const geometry = new SphereGeometry({
            radius: 3,
            phiStart: 0,
            phiLength: Math.PI,
            thetaStart: Math.PI / 4,
            thetaLength: Math.PI / 2
        })

        expect(geometry.parameters.phiStart).toBe(0)
        expect(geometry.parameters.phiLength).toBeCloseTo(Math.PI)
        expect(geometry.parameters.thetaStart).toBeCloseTo(Math.PI / 4)
        expect(geometry.parameters.thetaLength).toBeCloseTo(Math.PI / 2)
    })


    test('constructor with low-poly sphere', () => {
        const geometry = new SphereGeometry({
            radius: 2,
            widthSegments: 8,
            heightSegments: 6
        })

        expect(geometry.parameters.widthSegments).toBe(8)
        expect(geometry.parameters.heightSegments).toBe(6)
    })


    test('constructor with high-detail sphere', () => {
        const geometry = new SphereGeometry({
            radius: 1,
            widthSegments: 64,
            heightSegments: 32
        })

        expect(geometry.parameters.widthSegments).toBe(64)
        expect(geometry.parameters.heightSegments).toBe(32)
    })


    test('constructor with minimal parameters uses defaults', () => {
        const geometry = new SphereGeometry({
            radius: 2.5
        })

        expect(geometry.parameters.radius).toBe(2.5)
        expect(geometry.parameters.widthSegments).toBe(32)
        expect(geometry.parameters.heightSegments).toBe(16)
        expect(geometry.parameters.phiStart).toBe(0)
        expect(geometry.parameters.phiLength).toBeCloseTo(Math.PI * 2)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBeCloseTo(Math.PI)
    })


    test('constructor with empty object uses defaults', () => {
        const geometry = new SphereGeometry({})

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.widthSegments).toBe(32)
        expect(geometry.parameters.heightSegments).toBe(16)
        expect(geometry.parameters.phiStart).toBe(0)
        expect(geometry.parameters.phiLength).toBeCloseTo(Math.PI * 2)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBeCloseTo(Math.PI)
    })


    test('constructor with positional arguments (legacy mode)', () => {
        const geometry = new SphereGeometry(3, 24, 12, Math.PI / 4, Math.PI, Math.PI / 6, Math.PI / 2)

        expect(geometry.parameters.radius).toBe(3)
        expect(geometry.parameters.widthSegments).toBe(24)
        expect(geometry.parameters.heightSegments).toBe(12)
        expect(geometry.parameters.phiStart).toBeCloseTo(Math.PI / 4)
        expect(geometry.parameters.phiLength).toBeCloseTo(Math.PI)
        expect(geometry.parameters.thetaStart).toBeCloseTo(Math.PI / 6)
        expect(geometry.parameters.thetaLength).toBeCloseTo(Math.PI / 2)
    })


    test('constructor with no arguments uses defaults', () => {
        const geometry = new SphereGeometry()

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.widthSegments).toBe(32)
        expect(geometry.parameters.heightSegments).toBe(16)
    })


    test('constructor with null parameters uses defaults', () => {
        const geometry = new SphereGeometry(null)

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.widthSegments).toBe(32)
        expect(geometry.parameters.heightSegments).toBe(16)
    })


    test('constructor with non-object parameters falls back to legacy mode', () => {
        const geometry = new SphereGeometry(2, 16, 8)

        expect(geometry.parameters.radius).toBe(2)
        expect(geometry.parameters.widthSegments).toBe(16)
        expect(geometry.parameters.heightSegments).toBe(8)
    })


    test('constructor preserves original Three.js functionality', () => {
        const geometry1 = new SphereGeometry({
            radius: 2,
            widthSegments: 24,
            heightSegments: 12
        })

        const geometry2 = new SphereGeometry(2, 24, 12)

        expect(geometry1.parameters.radius).toBe(geometry2.parameters.radius)
        expect(geometry1.parameters.widthSegments).toBe(geometry2.parameters.widthSegments)
        expect(geometry1.parameters.heightSegments).toBe(geometry2.parameters.heightSegments)
    })


    test('constructor creates complete sphere by default', () => {
        const geometry = new SphereGeometry({radius: 1})

        expect(geometry.parameters.phiLength).toBeCloseTo(Math.PI * 2)
        expect(geometry.parameters.thetaLength).toBeCloseTo(Math.PI)
    })

}) 