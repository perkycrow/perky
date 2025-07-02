import PlaneGeometry from './plane_geometry'
import {describe, test, expect} from 'vitest'


describe('PlaneGeometry', () => {

    test('constructor with object parameters', () => {
        const geometry = new PlaneGeometry({
            width: 5,
            height: 3,
            widthSegments: 10,
            heightSegments: 6
        })

        expect(geometry.parameters.width).toBe(5)
        expect(geometry.parameters.height).toBe(3)
        expect(geometry.parameters.widthSegments).toBe(10)
        expect(geometry.parameters.heightSegments).toBe(6)
    })


    test('constructor with size parameter', () => {
        const geometry = new PlaneGeometry({
            size: 4
        })

        expect(geometry.parameters.width).toBe(4)
        expect(geometry.parameters.height).toBe(4)
        expect(geometry.parameters.widthSegments).toBe(1)
        expect(geometry.parameters.heightSegments).toBe(1)
    })


    test('constructor with segments parameter', () => {
        const geometry = new PlaneGeometry({
            width: 2,
            height: 3,
            segments: 8
        })

        expect(geometry.parameters.width).toBe(2)
        expect(geometry.parameters.height).toBe(3)
        expect(geometry.parameters.widthSegments).toBe(8)
        expect(geometry.parameters.heightSegments).toBe(8)
    })


    test('constructor with size and segments', () => {
        const geometry = new PlaneGeometry({
            size: 6,
            segments: 12
        })

        expect(geometry.parameters.width).toBe(6)
        expect(geometry.parameters.height).toBe(6)
        expect(geometry.parameters.widthSegments).toBe(12)
        expect(geometry.parameters.heightSegments).toBe(12)
    })


    test('constructor with size and dimension overrides', () => {
        const geometry = new PlaneGeometry({
            size: 3,
            width: 8,
            heightSegments: 5
        })

        expect(geometry.parameters.width).toBe(8)
        expect(geometry.parameters.height).toBe(3)
        expect(geometry.parameters.widthSegments).toBe(1)
        expect(geometry.parameters.heightSegments).toBe(5)
    })


    test('constructor with segments and specific overrides', () => {
        const geometry = new PlaneGeometry({
            width: 4,
            height: 2,
            segments: 10,
            widthSegments: 15
        })

        expect(geometry.parameters.width).toBe(4)
        expect(geometry.parameters.height).toBe(2)
        expect(geometry.parameters.widthSegments).toBe(15)
        expect(geometry.parameters.heightSegments).toBe(10)
    })


    test('constructor with partial parameters and defaults', () => {
        const geometry = new PlaneGeometry({
            width: 7,
            heightSegments: 4
        })

        expect(geometry.parameters.width).toBe(7)
        expect(geometry.parameters.height).toBe(1)
        expect(geometry.parameters.widthSegments).toBe(1)
        expect(geometry.parameters.heightSegments).toBe(4)
    })


    test('constructor with empty object uses defaults', () => {
        const geometry = new PlaneGeometry({})

        expect(geometry.parameters.width).toBe(1)
        expect(geometry.parameters.height).toBe(1)
        expect(geometry.parameters.widthSegments).toBe(1)
        expect(geometry.parameters.heightSegments).toBe(1)
    })


    test('constructor with positional arguments (legacy mode)', () => {
        const geometry = new PlaneGeometry(8, 4, 16, 8)

        expect(geometry.parameters.width).toBe(8)
        expect(geometry.parameters.height).toBe(4)
        expect(geometry.parameters.widthSegments).toBe(16)
        expect(geometry.parameters.heightSegments).toBe(8)
    })


    test('constructor with no arguments uses sensible defaults', () => {
        const geometry = new PlaneGeometry()

        expect(geometry.parameters.width).toBe(1)
        expect(geometry.parameters.height).toBe(1)
        expect(geometry.parameters.widthSegments).toBe(1)
        expect(geometry.parameters.heightSegments).toBe(1)
    })


    test('constructor with null parameters uses sensible defaults', () => {
        const geometry = new PlaneGeometry(null)

        expect(geometry.parameters.width).toBe(1)
        expect(geometry.parameters.height).toBe(1)
        expect(geometry.parameters.widthSegments).toBe(1)
        expect(geometry.parameters.heightSegments).toBe(1)
    })


    test('constructor with non-object parameters falls back to legacy mode', () => {
        const geometry = new PlaneGeometry(6, 3, 12, 6)

        expect(geometry.parameters.width).toBe(6)
        expect(geometry.parameters.height).toBe(3)
        expect(geometry.parameters.widthSegments).toBe(12)
        expect(geometry.parameters.heightSegments).toBe(6)
    })


    test('constructor for square plane', () => {
        const geometry = new PlaneGeometry({
            size: 5,
            segments: 20
        })

        expect(geometry.parameters.width).toBe(5)
        expect(geometry.parameters.height).toBe(5)
        expect(geometry.parameters.widthSegments).toBe(20)
        expect(geometry.parameters.heightSegments).toBe(20)
    })


    test('constructor for rectangular plane', () => {
        const geometry = new PlaneGeometry({
            width: 10,
            height: 2
        })

        expect(geometry.parameters.width).toBe(10)
        expect(geometry.parameters.height).toBe(2)
        expect(geometry.parameters.widthSegments).toBe(1)
        expect(geometry.parameters.heightSegments).toBe(1)
    })


    test('constructor for high detail plane', () => {
        const geometry = new PlaneGeometry({
            width: 4,
            height: 4,
            widthSegments: 64,
            heightSegments: 64
        })

        expect(geometry.parameters.width).toBe(4)
        expect(geometry.parameters.height).toBe(4)
        expect(geometry.parameters.widthSegments).toBe(64)
        expect(geometry.parameters.heightSegments).toBe(64)
    })


    test('constructor with different segment densities', () => {
        const geometry = new PlaneGeometry({
            width: 6,
            height: 3,
            widthSegments: 30,
            heightSegments: 15
        })

        expect(geometry.parameters.width).toBe(6)
        expect(geometry.parameters.height).toBe(3)
        expect(geometry.parameters.widthSegments).toBe(30)
        expect(geometry.parameters.heightSegments).toBe(15)
    })

}) 