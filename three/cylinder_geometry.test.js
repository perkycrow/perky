import CylinderGeometry from './cylinder_geometry'
import {describe, test, expect} from 'vitest'


describe('CylinderGeometry', () => {

    test('constructor with object parameters', () => {
        const geometry = new CylinderGeometry({
            radiusTop: 2,
            radiusBottom: 3,
            height: 8,
            radialSegments: 16,
            heightSegments: 4,
            openEnded: true,
            thetaStart: Math.PI / 4,
            thetaLength: Math.PI
        })

        expect(geometry.parameters.radiusTop).toBe(2)
        expect(geometry.parameters.radiusBottom).toBe(3)
        expect(geometry.parameters.height).toBe(8)
        expect(geometry.parameters.radialSegments).toBe(16)
        expect(geometry.parameters.heightSegments).toBe(4)
        expect(geometry.parameters.openEnded).toBe(true)
        expect(geometry.parameters.thetaStart).toBe(Math.PI / 4)
        expect(geometry.parameters.thetaLength).toBe(Math.PI)
    })


    test('constructor with size parameter', () => {
        const geometry = new CylinderGeometry({
            size: 2.5
        })

        expect(geometry.parameters.radiusTop).toBe(2.5)
        expect(geometry.parameters.radiusBottom).toBe(2.5)
        expect(geometry.parameters.height).toBe(5)
        expect(geometry.parameters.radialSegments).toBe(32)
        expect(geometry.parameters.heightSegments).toBe(1)
        expect(geometry.parameters.openEnded).toBe(false)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })


    test('constructor with radius parameter', () => {
        const geometry = new CylinderGeometry({
            radius: 3,
            height: 6
        })

        expect(geometry.parameters.radiusTop).toBe(3)
        expect(geometry.parameters.radiusBottom).toBe(3)
        expect(geometry.parameters.height).toBe(6)
        expect(geometry.parameters.radialSegments).toBe(32)
        expect(geometry.parameters.heightSegments).toBe(1)
        expect(geometry.parameters.openEnded).toBe(false)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })


    test('constructor with size and radius overrides', () => {
        const geometry = new CylinderGeometry({
            size: 2,
            radius: 3,
            radiusTop: 1
        })

        expect(geometry.parameters.radiusTop).toBe(1)
        expect(geometry.parameters.radiusBottom).toBe(3)
        expect(geometry.parameters.height).toBe(4)
    })


    test('constructor with size and parameter overrides', () => {
        const geometry = new CylinderGeometry({
            size: 1.5,
            height: 12,
            radialSegments: 64,
            openEnded: true
        })

        expect(geometry.parameters.radiusTop).toBe(1.5)
        expect(geometry.parameters.radiusBottom).toBe(1.5)
        expect(geometry.parameters.height).toBe(12)
        expect(geometry.parameters.radialSegments).toBe(64)
        expect(geometry.parameters.heightSegments).toBe(1)
        expect(geometry.parameters.openEnded).toBe(true)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })


    test('constructor with partial parameters and defaults', () => {
        const geometry = new CylinderGeometry({
            radiusTop: 2,
            radiusBottom: 4,
            heightSegments: 3
        })

        expect(geometry.parameters.radiusTop).toBe(2)
        expect(geometry.parameters.radiusBottom).toBe(4)
        expect(geometry.parameters.height).toBe(1)
        expect(geometry.parameters.radialSegments).toBe(32)
        expect(geometry.parameters.heightSegments).toBe(3)
        expect(geometry.parameters.openEnded).toBe(false)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })


    test('constructor with empty object uses defaults', () => {
        const geometry = new CylinderGeometry({})

        expect(geometry.parameters.radiusTop).toBe(1)
        expect(geometry.parameters.radiusBottom).toBe(1)
        expect(geometry.parameters.height).toBe(1)
        expect(geometry.parameters.radialSegments).toBe(32)
        expect(geometry.parameters.heightSegments).toBe(1)
        expect(geometry.parameters.openEnded).toBe(false)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })


    test('constructor with positional arguments (legacy mode)', () => {
        const geometry = new CylinderGeometry(1.5, 2.5, 6, 24, 2, true, Math.PI / 6, Math.PI)

        expect(geometry.parameters.radiusTop).toBe(1.5)
        expect(geometry.parameters.radiusBottom).toBe(2.5)
        expect(geometry.parameters.height).toBe(6)
        expect(geometry.parameters.radialSegments).toBe(24)
        expect(geometry.parameters.heightSegments).toBe(2)
        expect(geometry.parameters.openEnded).toBe(true)
        expect(geometry.parameters.thetaStart).toBe(Math.PI / 6)
        expect(geometry.parameters.thetaLength).toBe(Math.PI)
    })


    test('constructor with no arguments uses sensible defaults', () => {
        const geometry = new CylinderGeometry()

        expect(geometry.parameters.radiusTop).toBe(1)
        expect(geometry.parameters.radiusBottom).toBe(1)
        expect(geometry.parameters.height).toBe(1)
        expect(geometry.parameters.radialSegments).toBe(32)
        expect(geometry.parameters.heightSegments).toBe(1)
        expect(geometry.parameters.openEnded).toBe(false)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })


    test('constructor with null parameters uses sensible defaults', () => {
        const geometry = new CylinderGeometry(null)

        expect(geometry.parameters.radiusTop).toBe(1)
        expect(geometry.parameters.radiusBottom).toBe(1)
        expect(geometry.parameters.height).toBe(1)
        expect(geometry.parameters.radialSegments).toBe(32)
        expect(geometry.parameters.heightSegments).toBe(1)
        expect(geometry.parameters.openEnded).toBe(false)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })


    test('constructor with non-object parameters falls back to legacy mode', () => {
        const geometry = new CylinderGeometry(2, 3, 7, 16)

        expect(geometry.parameters.radiusTop).toBe(2)
        expect(geometry.parameters.radiusBottom).toBe(3)
        expect(geometry.parameters.height).toBe(7)
        expect(geometry.parameters.radialSegments).toBe(16)
        expect(geometry.parameters.heightSegments).toBe(1)
        expect(geometry.parameters.openEnded).toBe(false)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })


    test('constructor for cone shape (radiusTop = 0)', () => {
        const geometry = new CylinderGeometry({
            radiusTop: 0,
            radiusBottom: 3,
            height: 6
        })

        expect(geometry.parameters.radiusTop).toBe(0)
        expect(geometry.parameters.radiusBottom).toBe(3)
        expect(geometry.parameters.height).toBe(6)
    })


    test('constructor for inverted cone (radiusBottom = 0)', () => {
        const geometry = new CylinderGeometry({
            radiusTop: 3,
            radiusBottom: 0,
            height: 6
        })

        expect(geometry.parameters.radiusTop).toBe(3)
        expect(geometry.parameters.radiusBottom).toBe(0)
        expect(geometry.parameters.height).toBe(6)
    })


    test('constructor with open ended cylinder', () => {
        const geometry = new CylinderGeometry({
            radius: 2,
            height: 5,
            openEnded: true
        })

        expect(geometry.parameters.radiusTop).toBe(2)
        expect(geometry.parameters.radiusBottom).toBe(2)
        expect(geometry.parameters.height).toBe(5)
        expect(geometry.parameters.openEnded).toBe(true)
    })


    test('constructor for cylinder sector', () => {
        const geometry = new CylinderGeometry({
            radius: 3,
            height: 6,
            thetaLength: Math.PI
        })

        expect(geometry.parameters.radiusTop).toBe(3)
        expect(geometry.parameters.radiusBottom).toBe(3)
        expect(geometry.parameters.height).toBe(6)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI)
    })


    test('constructor with low poly cylinder', () => {
        const geometry = new CylinderGeometry({
            radius: 2,
            height: 4,
            radialSegments: 8
        })

        expect(geometry.parameters.radiusTop).toBe(2)
        expect(geometry.parameters.radiusBottom).toBe(2)
        expect(geometry.parameters.height).toBe(4)
        expect(geometry.parameters.radialSegments).toBe(8)
    })


    test('constructor with high detail cylinder', () => {
        const geometry = new CylinderGeometry({
            radius: 1,
            height: 3,
            radialSegments: 64,
            heightSegments: 8
        })

        expect(geometry.parameters.radiusTop).toBe(1)
        expect(geometry.parameters.radiusBottom).toBe(1)
        expect(geometry.parameters.height).toBe(3)
        expect(geometry.parameters.radialSegments).toBe(64)
        expect(geometry.parameters.heightSegments).toBe(8)
    })


    test('size parameter creates proportional cylinder', () => {
        const geometry = new CylinderGeometry({
            size: 3
        })

        expect(geometry.parameters.radiusTop).toBe(3)
        expect(geometry.parameters.radiusBottom).toBe(3)
        expect(geometry.parameters.height).toBe(6)
    })

}) 