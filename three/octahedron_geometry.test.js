import OctahedronGeometry from './octahedron_geometry'
import {describe, test, expect} from 'vitest'


describe('OctahedronGeometry', () => {

    test('constructor with object parameters', () => {
        const geometry = new OctahedronGeometry({
            radius: 5,
            detail: 2
        })

        expect(geometry.parameters.radius).toBe(5)
        expect(geometry.parameters.detail).toBe(2)
    })


    test('constructor with size parameter', () => {
        const geometry = new OctahedronGeometry({
            size: 3
        })

        expect(geometry.parameters.radius).toBe(3)
        expect(geometry.parameters.detail).toBe(0)
    })


    test('constructor with size and radius override', () => {
        const geometry = new OctahedronGeometry({
            size: 2,
            radius: 4
        })

        expect(geometry.parameters.radius).toBe(4)
        expect(geometry.parameters.detail).toBe(0)
    })


    test('constructor with size and detail', () => {
        const geometry = new OctahedronGeometry({
            size: 2.5,
            detail: 1
        })

        expect(geometry.parameters.radius).toBe(2.5)
        expect(geometry.parameters.detail).toBe(1)
    })


    test('constructor with partial parameters and defaults', () => {
        const geometry = new OctahedronGeometry({
            radius: 7
        })

        expect(geometry.parameters.radius).toBe(7)
        expect(geometry.parameters.detail).toBe(0)
    })


    test('constructor with detail only', () => {
        const geometry = new OctahedronGeometry({
            detail: 3
        })

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.detail).toBe(3)
    })


    test('constructor with empty object uses defaults', () => {
        const geometry = new OctahedronGeometry({})

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.detail).toBe(0)
    })


    test('constructor with positional arguments (legacy mode)', () => {
        const geometry = new OctahedronGeometry(3, 2)

        expect(geometry.parameters.radius).toBe(3)
        expect(geometry.parameters.detail).toBe(2)
    })


    test('constructor with no arguments uses sensible defaults', () => {
        const geometry = new OctahedronGeometry()

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.detail).toBe(0)
    })


    test('constructor with null parameters uses sensible defaults', () => {
        const geometry = new OctahedronGeometry(null)

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.detail).toBe(0)
    })


    test('constructor with non-object parameters falls back to legacy mode', () => {
        const geometry = new OctahedronGeometry(4, 1)

        expect(geometry.parameters.radius).toBe(4)
        expect(geometry.parameters.detail).toBe(1)
    })


    test('constructor with single positional argument', () => {
        const geometry = new OctahedronGeometry(6)

        expect(geometry.parameters.radius).toBe(6)
        expect(geometry.parameters.detail).toBe(0)
    })


    test('constructor for low detail octahedron', () => {
        const geometry = new OctahedronGeometry({
            radius: 2,
            detail: 0
        })

        expect(geometry.parameters.radius).toBe(2)
        expect(geometry.parameters.detail).toBe(0)
    })


    test('constructor for high detail octahedron (sphere-like)', () => {
        const geometry = new OctahedronGeometry({
            radius: 1.5,
            detail: 4
        })

        expect(geometry.parameters.radius).toBe(1.5)
        expect(geometry.parameters.detail).toBe(4)
    })


    test('constructor for medium detail octahedron', () => {
        const geometry = new OctahedronGeometry({
            radius: 3,
            detail: 2
        })

        expect(geometry.parameters.radius).toBe(3)
        expect(geometry.parameters.detail).toBe(2)
    })


    test('size parameter creates standard octahedron', () => {
        const geometry = new OctahedronGeometry({
            size: 8
        })

        expect(geometry.parameters.radius).toBe(8)
        expect(geometry.parameters.detail).toBe(0)
    })

}) 