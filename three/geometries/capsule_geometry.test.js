import CapsuleGeometry from './capsule_geometry'
import {describe, test, expect} from 'vitest'


describe('CapsuleGeometry', () => {

    test('constructor with object parameters', () => {
        const geometry = new CapsuleGeometry({
            radius: 2,
            height: 3,
            capSegments: 6,
            radialSegments: 12,
            heightSegments: 4
        })

        expect(geometry.parameters.radius).toBe(2)
        expect(geometry.parameters.height).toBe(3)
        expect(geometry.parameters.capSegments).toBe(6)
        expect(geometry.parameters.radialSegments).toBe(12)
        expect(geometry.parameters.heightSegments).toBe(4)
    })


    test('constructor with size parameter', () => {
        const geometry = new CapsuleGeometry({
            size: 2.5
        })

        expect(geometry.parameters.radius).toBe(2.5)
        expect(geometry.parameters.height).toBe(5)
        expect(geometry.parameters.capSegments).toBe(4)
        expect(geometry.parameters.radialSegments).toBe(8)
        expect(geometry.parameters.heightSegments).toBe(1)
    })


    test('constructor with size and parameter overrides', () => {
        const geometry = new CapsuleGeometry({
            size: 1.5,
            height: 10,
            radialSegments: 16
        })

        expect(geometry.parameters.radius).toBe(1.5)
        expect(geometry.parameters.height).toBe(10)
        expect(geometry.parameters.capSegments).toBe(4)
        expect(geometry.parameters.radialSegments).toBe(16)
        expect(geometry.parameters.heightSegments).toBe(1)
    })


    test('constructor with partial parameters and defaults', () => {
        const geometry = new CapsuleGeometry({
            radius: 3,
            capSegments: 8
        })

        expect(geometry.parameters.radius).toBe(3)
        expect(geometry.parameters.height).toBe(1)
        expect(geometry.parameters.capSegments).toBe(8)
        expect(geometry.parameters.radialSegments).toBe(8)
        expect(geometry.parameters.heightSegments).toBe(1)
    })


    test('constructor with empty object uses defaults', () => {
        const geometry = new CapsuleGeometry({})

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.height).toBe(1)
        expect(geometry.parameters.capSegments).toBe(4)
        expect(geometry.parameters.radialSegments).toBe(8)
        expect(geometry.parameters.heightSegments).toBe(1)
    })


    test('constructor with positional arguments (legacy mode)', () => {
        const geometry = new CapsuleGeometry(2, 4, 6, 10, 3)

        expect(geometry.parameters.radius).toBe(2)
        expect(geometry.parameters.height).toBe(4)
        expect(geometry.parameters.capSegments).toBe(6)
        expect(geometry.parameters.radialSegments).toBe(10)
        expect(geometry.parameters.heightSegments).toBe(3)
    })


    test('constructor with no arguments uses sensible defaults', () => {
        const geometry = new CapsuleGeometry()

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.height).toBe(1)
        expect(geometry.parameters.capSegments).toBe(4)
        expect(geometry.parameters.radialSegments).toBe(8)
        expect(geometry.parameters.heightSegments).toBe(1)
    })


    test('constructor with null parameters uses sensible defaults', () => {
        const geometry = new CapsuleGeometry(null)

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.height).toBe(1)
        expect(geometry.parameters.capSegments).toBe(4)
        expect(geometry.parameters.radialSegments).toBe(8)
        expect(geometry.parameters.heightSegments).toBe(1)
    })


    test('constructor with non-object parameters falls back to legacy mode', () => {
        const geometry = new CapsuleGeometry(1.5, 3, 5)

        expect(geometry.parameters.radius).toBe(1.5)
        expect(geometry.parameters.height).toBe(3)
        expect(geometry.parameters.capSegments).toBe(5)
        expect(geometry.parameters.radialSegments).toBe(8)
        expect(geometry.parameters.heightSegments).toBe(1)
    })


    test('constructor with radius and height only', () => {
        const geometry = new CapsuleGeometry({
            radius: 2.5,
            height: 5
        })

        expect(geometry.parameters.radius).toBe(2.5)
        expect(geometry.parameters.height).toBe(5)
        expect(geometry.parameters.capSegments).toBe(4)
        expect(geometry.parameters.radialSegments).toBe(8)
        expect(geometry.parameters.heightSegments).toBe(1)
    })


    test('constructor with segments-only parameters', () => {
        const geometry = new CapsuleGeometry({
            capSegments: 6,
            radialSegments: 12,
            heightSegments: 3
        })

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.height).toBe(1)
        expect(geometry.parameters.capSegments).toBe(6)
        expect(geometry.parameters.radialSegments).toBe(12)
        expect(geometry.parameters.heightSegments).toBe(3)
    })


    test('size parameter creates proportional capsule', () => {
        const geometry = new CapsuleGeometry({
            size: 4
        })

        expect(geometry.parameters.radius).toBe(4)
        expect(geometry.parameters.height).toBe(8)
    })

}) 