import BoxGeometry from './box_geometry'
import {describe, test, expect} from 'vitest'


describe('BoxGeometry', () => {

    test('constructor with object parameters', () => {
        const geometry = new BoxGeometry({
            width: 2,
            height: 3,
            depth: 4,
            widthSegments: 5,
            heightSegments: 6,
            depthSegments: 7
        })

        expect(geometry.parameters.width).toBe(2)
        expect(geometry.parameters.height).toBe(3)
        expect(geometry.parameters.depth).toBe(4)
        expect(geometry.parameters.widthSegments).toBe(5)
        expect(geometry.parameters.heightSegments).toBe(6)
        expect(geometry.parameters.depthSegments).toBe(7)
    })


    test('constructor with size parameter', () => {
        const geometry = new BoxGeometry({
            size: 2.5
        })

        expect(geometry.parameters.width).toBe(2.5)
        expect(geometry.parameters.height).toBe(2.5)
        expect(geometry.parameters.depth).toBe(2.5)
        expect(geometry.parameters.widthSegments).toBe(1)
        expect(geometry.parameters.heightSegments).toBe(1)
        expect(geometry.parameters.depthSegments).toBe(1)
    })


    test('constructor with size and dimension overrides', () => {
        const geometry = new BoxGeometry({
            size: 3,
            width: 5,
            heightSegments: 4
        })

        expect(geometry.parameters.width).toBe(5)
        expect(geometry.parameters.height).toBe(3)
        expect(geometry.parameters.depth).toBe(3)
        expect(geometry.parameters.widthSegments).toBe(1)
        expect(geometry.parameters.heightSegments).toBe(4)
        expect(geometry.parameters.depthSegments).toBe(1)
    })


    test('constructor with partial parameters and defaults', () => {
        const geometry = new BoxGeometry({
            width: 10,
            heightSegments: 3
        })

        expect(geometry.parameters.width).toBe(10)
        expect(geometry.parameters.height).toBe(1)
        expect(geometry.parameters.depth).toBe(1)
        expect(geometry.parameters.widthSegments).toBe(1)
        expect(geometry.parameters.heightSegments).toBe(3)
        expect(geometry.parameters.depthSegments).toBe(1)
    })


    test('constructor with empty object uses defaults', () => {
        const geometry = new BoxGeometry({})

        expect(geometry.parameters.width).toBe(1)
        expect(geometry.parameters.height).toBe(1)
        expect(geometry.parameters.depth).toBe(1)
        expect(geometry.parameters.widthSegments).toBe(1)
        expect(geometry.parameters.heightSegments).toBe(1)
        expect(geometry.parameters.depthSegments).toBe(1)
    })


    test('constructor with positional arguments (legacy mode)', () => {
        const geometry = new BoxGeometry(5, 6, 7, 2, 3, 4)

        expect(geometry.parameters.width).toBe(5)
        expect(geometry.parameters.height).toBe(6)
        expect(geometry.parameters.depth).toBe(7)
        expect(geometry.parameters.widthSegments).toBe(2)
        expect(geometry.parameters.heightSegments).toBe(3)
        expect(geometry.parameters.depthSegments).toBe(4)
    })


    test('constructor with no arguments uses sensible defaults', () => {
        const geometry = new BoxGeometry()

        expect(geometry.parameters.width).toBe(1)
        expect(geometry.parameters.height).toBe(1)
        expect(geometry.parameters.depth).toBe(1)
        expect(geometry.parameters.widthSegments).toBe(1)
        expect(geometry.parameters.heightSegments).toBe(1)
        expect(geometry.parameters.depthSegments).toBe(1)
    })


    test('constructor with null parameters uses sensible defaults', () => {
        const geometry = new BoxGeometry(null)

        expect(geometry.parameters.width).toBe(1)
        expect(geometry.parameters.height).toBe(1)
        expect(geometry.parameters.depth).toBe(1)
        expect(geometry.parameters.widthSegments).toBe(1)
        expect(geometry.parameters.heightSegments).toBe(1)
        expect(geometry.parameters.depthSegments).toBe(1)
    })


    test('constructor with non-object parameters falls back to legacy mode', () => {
        const geometry = new BoxGeometry(8, 9, 10)

        expect(geometry.parameters.width).toBe(8)
        expect(geometry.parameters.height).toBe(9)
        expect(geometry.parameters.depth).toBe(10)
        expect(geometry.parameters.widthSegments).toBe(1)
        expect(geometry.parameters.heightSegments).toBe(1)
        expect(geometry.parameters.depthSegments).toBe(1)
    })


    test('constructor with dimension-only parameters', () => {
        const geometry = new BoxGeometry({
            width: 2,
            height: 4,
            depth: 6
        })

        expect(geometry.parameters.width).toBe(2)
        expect(geometry.parameters.height).toBe(4)
        expect(geometry.parameters.depth).toBe(6)
        expect(geometry.parameters.widthSegments).toBe(1)
        expect(geometry.parameters.heightSegments).toBe(1)
        expect(geometry.parameters.depthSegments).toBe(1)
    })


    test('constructor with segments-only parameters', () => {
        const geometry = new BoxGeometry({
            widthSegments: 3,
            heightSegments: 5,
            depthSegments: 7
        })

        expect(geometry.parameters.width).toBe(1)
        expect(geometry.parameters.height).toBe(1)
        expect(geometry.parameters.depth).toBe(1)
        expect(geometry.parameters.widthSegments).toBe(3)
        expect(geometry.parameters.heightSegments).toBe(5)
        expect(geometry.parameters.depthSegments).toBe(7)
    })

}) 