import PolyhedronGeometry from './polyhedron_geometry'
import {describe, test, expect} from 'vitest'


describe('PolyhedronGeometry', () => {

    const cubeVertices = [
        -1, -1, -1,    1, -1, -1,    1,  1, -1,    -1,  1, -1,
        -1, -1,  1,    1, -1,  1,    1,  1,  1,    -1,  1,  1
    ]

    const cubeIndices = [
        2, 1, 0,    0, 3, 2,
        0, 4, 7,    7, 3, 0,
        0, 1, 5,    5, 4, 0,
        1, 2, 6,    6, 5, 1,
        2, 3, 7,    7, 6, 2,
        4, 5, 6,    6, 7, 4
    ]


    test('constructor with object parameters', () => {
        const geometry = new PolyhedronGeometry({
            vertices: cubeVertices,
            indices: cubeIndices,
            radius: 5,
            detail: 2
        })

        expect(geometry.parameters.vertices).toEqual(cubeVertices)
        expect(geometry.parameters.indices).toEqual(cubeIndices)
        expect(geometry.parameters.radius).toBe(5)
        expect(geometry.parameters.detail).toBe(2)
    })


    test('constructor with size parameter', () => {
        const geometry = new PolyhedronGeometry({
            vertices: cubeVertices,
            indices: cubeIndices,
            size: 3
        })

        expect(geometry.parameters.radius).toBe(3)
        expect(geometry.parameters.detail).toBe(0)
    })


    test('constructor with size and radius (radius takes precedence)', () => {
        const geometry = new PolyhedronGeometry({
            vertices: cubeVertices,
            indices: cubeIndices,
            size: 3,
            radius: 5
        })

        expect(geometry.parameters.radius).toBe(5)
    })


    test('constructor with minimal parameters', () => {
        const geometry = new PolyhedronGeometry({
            vertices: cubeVertices,
            indices: cubeIndices
        })

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.detail).toBe(0)
    })


    test('constructor with custom detail level', () => {
        const geometry = new PolyhedronGeometry({
            vertices: cubeVertices,
            indices: cubeIndices,
            detail: 3
        })

        expect(geometry.parameters.detail).toBe(3)
    })


    test('constructor with tetrahedron vertices', () => {
        const tetraVertices = [
            1, 1, 1,
            -1, -1, 1,
            -1, 1, -1,
            1, -1, -1
        ]

        const tetraIndices = [
            2, 1, 0,
            0, 3, 2,
            1, 3, 0,
            2, 3, 1
        ]

        const geometry = new PolyhedronGeometry({
            vertices: tetraVertices,
            indices: tetraIndices,
            radius: 2
        })

        expect(geometry.parameters.vertices).toEqual(tetraVertices)
        expect(geometry.parameters.indices).toEqual(tetraIndices)
        expect(geometry.parameters.radius).toBe(2)
    })


    test('constructor with positional arguments (legacy mode)', () => {
        const geometry = new PolyhedronGeometry(cubeVertices, cubeIndices, 4, 1)

        expect(geometry.parameters.vertices).toEqual(cubeVertices)
        expect(geometry.parameters.indices).toEqual(cubeIndices)
        expect(geometry.parameters.radius).toBe(4)
        expect(geometry.parameters.detail).toBe(1)
    })


    test('constructor throws error for missing vertices', () => {
        expect(() => {
            new PolyhedronGeometry({
                indices: cubeIndices
            })
        }).toThrow('PolyhedronGeometry requires a vertices array parameter')
    })


    test('constructor throws error for missing indices', () => {
        expect(() => {
            new PolyhedronGeometry({
                vertices: cubeVertices
            })
        }).toThrow('PolyhedronGeometry requires an indices array parameter')
    })


    test('constructor throws error for non-array vertices', () => {
        expect(() => {
            new PolyhedronGeometry({
                vertices: 'not an array',
                indices: cubeIndices
            })
        }).toThrow('PolyhedronGeometry requires a vertices array parameter')
    })


    test('constructor throws error for non-array indices', () => {
        expect(() => {
            new PolyhedronGeometry({
                vertices: cubeVertices,
                indices: 'not an array'
            })
        }).toThrow('PolyhedronGeometry requires an indices array parameter')
    })


    test('constructor throws error for no arguments', () => {
        expect(() => {
            new PolyhedronGeometry()
        }).toThrow('PolyhedronGeometry requires vertices and indices parameters')
    })


    test('constructor throws error for null parameters', () => {
        expect(() => {
            new PolyhedronGeometry(null)
        }).toThrow('PolyhedronGeometry requires vertices and indices parameters')
    })


    test('constructor with array as first parameter uses legacy mode', () => {
        const geometry = new PolyhedronGeometry(cubeVertices, cubeIndices, 3)

        expect(geometry.parameters.vertices).toEqual(cubeVertices)
        expect(geometry.parameters.indices).toEqual(cubeIndices)
        expect(geometry.parameters.radius).toBe(3)
    })


    test('constructor preserves original Three.js functionality', () => {
        const geometry1 = new PolyhedronGeometry({
            vertices: cubeVertices,
            indices: cubeIndices,
            radius: 2,
            detail: 1
        })

        const geometry2 = new PolyhedronGeometry(cubeVertices, cubeIndices, 2, 1)

        expect(geometry1.parameters.radius).toBe(geometry2.parameters.radius)
        expect(geometry1.parameters.detail).toBe(geometry2.parameters.detail)
    })

}) 