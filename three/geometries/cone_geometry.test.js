import ConeGeometry from './cone_geometry'
import {describe, test, expect} from 'vitest'


describe('ConeGeometry', () => {

    test('constructor with object parameters', () => {
        const geometry = new ConeGeometry({
            radius: 3,
            height: 8,
            radialSegments: 16,
            heightSegments: 4,
            openEnded: true,
            thetaStart: Math.PI / 4,
            thetaLength: Math.PI
        })

        expect(geometry.parameters.radius).toBe(3)
        expect(geometry.parameters.height).toBe(8)
        expect(geometry.parameters.radialSegments).toBe(16)
        expect(geometry.parameters.heightSegments).toBe(4)
        expect(geometry.parameters.openEnded).toBe(true)
        expect(geometry.parameters.thetaStart).toBe(Math.PI / 4)
        expect(geometry.parameters.thetaLength).toBe(Math.PI)
    })


    test('constructor with size parameter', () => {
        const geometry = new ConeGeometry({
            size: 2.5
        })

        expect(geometry.parameters.radius).toBe(2.5)
        expect(geometry.parameters.height).toBe(5)
        expect(geometry.parameters.radialSegments).toBe(32)
        expect(geometry.parameters.heightSegments).toBe(1)
        expect(geometry.parameters.openEnded).toBe(false)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })


    test('constructor with size and parameter overrides', () => {
        const geometry = new ConeGeometry({
            size: 1.5,
            height: 12,
            radialSegments: 64,
            openEnded: true
        })

        expect(geometry.parameters.radius).toBe(1.5)
        expect(geometry.parameters.height).toBe(12)
        expect(geometry.parameters.radialSegments).toBe(64)
        expect(geometry.parameters.heightSegments).toBe(1)
        expect(geometry.parameters.openEnded).toBe(true)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })


    test('constructor with partial parameters and defaults', () => {
        const geometry = new ConeGeometry({
            radius: 4,
            heightSegments: 3
        })

        expect(geometry.parameters.radius).toBe(4)
        expect(geometry.parameters.height).toBe(1)
        expect(geometry.parameters.radialSegments).toBe(32)
        expect(geometry.parameters.heightSegments).toBe(3)
        expect(geometry.parameters.openEnded).toBe(false)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })


    test('constructor with empty object uses defaults', () => {
        const geometry = new ConeGeometry({})

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.height).toBe(1)
        expect(geometry.parameters.radialSegments).toBe(32)
        expect(geometry.parameters.heightSegments).toBe(1)
        expect(geometry.parameters.openEnded).toBe(false)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })


    test('constructor with positional arguments (legacy mode)', () => {
        const geometry = new ConeGeometry(2.5, 6, 24, 2, true, Math.PI / 6, Math.PI)

        expect(geometry.parameters.radius).toBe(2.5)
        expect(geometry.parameters.height).toBe(6)
        expect(geometry.parameters.radialSegments).toBe(24)
        expect(geometry.parameters.heightSegments).toBe(2)
        expect(geometry.parameters.openEnded).toBe(true)
        expect(geometry.parameters.thetaStart).toBe(Math.PI / 6)
        expect(geometry.parameters.thetaLength).toBe(Math.PI)
    })


    test('constructor with no arguments uses sensible defaults', () => {
        const geometry = new ConeGeometry()

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.height).toBe(1)
        expect(geometry.parameters.radialSegments).toBe(32)
        expect(geometry.parameters.heightSegments).toBe(1)
        expect(geometry.parameters.openEnded).toBe(false)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })


    test('constructor with null parameters uses sensible defaults', () => {
        const geometry = new ConeGeometry(null)

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.height).toBe(1)
        expect(geometry.parameters.radialSegments).toBe(32)
        expect(geometry.parameters.heightSegments).toBe(1)
        expect(geometry.parameters.openEnded).toBe(false)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })


    test('constructor with non-object parameters falls back to legacy mode', () => {
        const geometry = new ConeGeometry(3, 7, 16)

        expect(geometry.parameters.radius).toBe(3)
        expect(geometry.parameters.height).toBe(7)
        expect(geometry.parameters.radialSegments).toBe(16)
        expect(geometry.parameters.heightSegments).toBe(1)
        expect(geometry.parameters.openEnded).toBe(false)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })


    test('constructor with open ended cone', () => {
        const geometry = new ConeGeometry({
            radius: 2,
            height: 5,
            openEnded: true
        })

        expect(geometry.parameters.radius).toBe(2)
        expect(geometry.parameters.height).toBe(5)
        expect(geometry.parameters.openEnded).toBe(true)
    })


    test('constructor for cone sector', () => {
        const geometry = new ConeGeometry({
            radius: 3,
            height: 6,
            thetaLength: Math.PI
        })

        expect(geometry.parameters.radius).toBe(3)
        expect(geometry.parameters.height).toBe(6)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI)
    })


    test('constructor with low poly cone', () => {
        const geometry = new ConeGeometry({
            radius: 2,
            height: 4,
            radialSegments: 8
        })

        expect(geometry.parameters.radius).toBe(2)
        expect(geometry.parameters.height).toBe(4)
        expect(geometry.parameters.radialSegments).toBe(8)
    })


    test('constructor with high detail cone', () => {
        const geometry = new ConeGeometry({
            radius: 1,
            height: 3,
            radialSegments: 64,
            heightSegments: 8
        })

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.height).toBe(3)
        expect(geometry.parameters.radialSegments).toBe(64)
        expect(geometry.parameters.heightSegments).toBe(8)
    })


    test('size parameter creates proportional cone', () => {
        const geometry = new ConeGeometry({
            size: 3
        })

        expect(geometry.parameters.radius).toBe(3)
        expect(geometry.parameters.height).toBe(6)
    })

}) 