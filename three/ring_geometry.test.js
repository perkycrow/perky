import RingGeometry from './ring_geometry'
import {describe, test, expect} from 'vitest'


describe('RingGeometry', () => {

    test('constructor with object parameters', () => {
        const geometry = new RingGeometry({
            innerRadius: 2,
            outerRadius: 5,
            thetaSegments: 16,
            phiSegments: 2,
            thetaStart: Math.PI / 4,
            thetaLength: Math.PI
        })

        expect(geometry.parameters.innerRadius).toBe(2)
        expect(geometry.parameters.outerRadius).toBe(5)
        expect(geometry.parameters.thetaSegments).toBe(16)
        expect(geometry.parameters.phiSegments).toBe(2)
        expect(geometry.parameters.thetaStart).toBeCloseTo(Math.PI / 4)
        expect(geometry.parameters.thetaLength).toBeCloseTo(Math.PI)
    })


    test('constructor with size parameter', () => {
        const geometry = new RingGeometry({
            size: 4
        })

        expect(geometry.parameters.outerRadius).toBe(4)
        expect(geometry.parameters.innerRadius).toBe(2)
        expect(geometry.parameters.thetaSegments).toBe(32)
        expect(geometry.parameters.phiSegments).toBe(1)
    })


    test('constructor with radius parameter', () => {
        const geometry = new RingGeometry({
            radius: 3,
            innerRadius: 1
        })

        expect(geometry.parameters.outerRadius).toBe(3)
        expect(geometry.parameters.innerRadius).toBe(1)
    })


    test('constructor with segments parameter', () => {
        const geometry = new RingGeometry({
            segments: 24
        })

        expect(geometry.parameters.thetaSegments).toBe(24)
        expect(geometry.parameters.phiSegments).toBe(1)
    })


    test('constructor with size and explicit radii (explicit takes precedence)', () => {
        const geometry = new RingGeometry({
            size: 4,
            innerRadius: 0.5,
            outerRadius: 6
        })

        expect(geometry.parameters.innerRadius).toBe(0.5)
        expect(geometry.parameters.outerRadius).toBe(6)
    })


    test('constructor with radius and size (radius takes precedence for outer)', () => {
        const geometry = new RingGeometry({
            size: 4,
            radius: 3
        })

        expect(geometry.parameters.outerRadius).toBe(3)
        expect(geometry.parameters.innerRadius).toBe(2)
    })


    test('constructor with segments and explicit thetaSegments', () => {
        const geometry = new RingGeometry({
            segments: 16,
            thetaSegments: 24
        })

        expect(geometry.parameters.thetaSegments).toBe(24)
    })


    test('constructor for semicircle ring', () => {
        const geometry = new RingGeometry({
            innerRadius: 1,
            outerRadius: 2,
            thetaLength: Math.PI
        })

        expect(geometry.parameters.thetaLength).toBeCloseTo(Math.PI)
        expect(geometry.parameters.thetaStart).toBe(0)
    })


    test('constructor for quarter circle ring', () => {
        const geometry = new RingGeometry({
            innerRadius: 1,
            outerRadius: 3,
            thetaStart: Math.PI / 4,
            thetaLength: Math.PI / 2
        })

        expect(geometry.parameters.thetaStart).toBeCloseTo(Math.PI / 4)
        expect(geometry.parameters.thetaLength).toBeCloseTo(Math.PI / 2)
    })


    test('constructor with high detail', () => {
        const geometry = new RingGeometry({
            innerRadius: 0.5,
            outerRadius: 1.5,
            thetaSegments: 64,
            phiSegments: 4
        })

        expect(geometry.parameters.thetaSegments).toBe(64)
        expect(geometry.parameters.phiSegments).toBe(4)
    })


    test('constructor with minimal parameters uses defaults', () => {
        const geometry = new RingGeometry({
            innerRadius: 0.3
        })

        expect(geometry.parameters.innerRadius).toBe(0.3)
        expect(geometry.parameters.outerRadius).toBe(1)
        expect(geometry.parameters.thetaSegments).toBe(32)
        expect(geometry.parameters.phiSegments).toBe(1)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBeCloseTo(Math.PI * 2)
    })


    test('constructor with empty object uses defaults', () => {
        const geometry = new RingGeometry({})

        expect(geometry.parameters.innerRadius).toBe(0.5)
        expect(geometry.parameters.outerRadius).toBe(1)
        expect(geometry.parameters.thetaSegments).toBe(32)
        expect(geometry.parameters.phiSegments).toBe(1)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBeCloseTo(Math.PI * 2)
    })


    test('constructor with positional arguments (legacy mode)', () => {
        const geometry = new RingGeometry(1, 3, 16, 2, Math.PI / 6, Math.PI)

        expect(geometry.parameters.innerRadius).toBe(1)
        expect(geometry.parameters.outerRadius).toBe(3)
        expect(geometry.parameters.thetaSegments).toBe(16)
        expect(geometry.parameters.phiSegments).toBe(2)
        expect(geometry.parameters.thetaStart).toBeCloseTo(Math.PI / 6)
        expect(geometry.parameters.thetaLength).toBeCloseTo(Math.PI)
    })


    test('constructor with no arguments uses defaults', () => {
        const geometry = new RingGeometry()

        expect(geometry.parameters.innerRadius).toBe(0.5)
        expect(geometry.parameters.outerRadius).toBe(1)
        expect(geometry.parameters.thetaSegments).toBe(32)
    })


    test('constructor with null parameters uses defaults', () => {
        const geometry = new RingGeometry(null)

        expect(geometry.parameters.innerRadius).toBe(0.5)
        expect(geometry.parameters.outerRadius).toBe(1)
        expect(geometry.parameters.thetaSegments).toBe(32)
    })


    test('constructor with non-object parameters falls back to legacy mode', () => {
        const geometry = new RingGeometry(0.8, 2.5, 20)

        expect(geometry.parameters.innerRadius).toBe(0.8)
        expect(geometry.parameters.outerRadius).toBe(2.5)
        expect(geometry.parameters.thetaSegments).toBe(20)
    })


    test('constructor preserves original Three.js functionality', () => {
        const geometry1 = new RingGeometry({
            innerRadius: 1,
            outerRadius: 2,
            thetaSegments: 24,
            phiSegments: 2
        })

        const geometry2 = new RingGeometry(1, 2, 24, 2)

        expect(geometry1.parameters.innerRadius).toBe(geometry2.parameters.innerRadius)
        expect(geometry1.parameters.outerRadius).toBe(geometry2.parameters.outerRadius)
        expect(geometry1.parameters.thetaSegments).toBe(geometry2.parameters.thetaSegments)
        expect(geometry1.parameters.phiSegments).toBe(geometry2.parameters.phiSegments)
    })

}) 