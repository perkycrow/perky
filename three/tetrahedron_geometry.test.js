import TetrahedronGeometry from './tetrahedron_geometry'
import {describe, test, expect} from 'vitest'


describe('TetrahedronGeometry', () => {

    test('constructor with object parameters', () => {
        const geometry = new TetrahedronGeometry({
            radius: 3,
            detail: 2
        })

        expect(geometry.parameters.radius).toBe(3)
        expect(geometry.parameters.detail).toBe(2)
    })


    test('constructor with size parameter', () => {
        const geometry = new TetrahedronGeometry({
            size: 2.5
        })

        expect(geometry.parameters.radius).toBe(2.5)
        expect(geometry.parameters.detail).toBe(0)
    })


    test('constructor with size and radius (radius takes precedence)', () => {
        const geometry = new TetrahedronGeometry({
            size: 2,
            radius: 4
        })

        expect(geometry.parameters.radius).toBe(4)
    })


    test('constructor with detail level 0 (perfect tetrahedron)', () => {
        const geometry = new TetrahedronGeometry({
            radius: 1,
            detail: 0
        })

        expect(geometry.parameters.detail).toBe(0)
        expect(geometry.parameters.radius).toBe(1)
    })


    test('constructor with detail level 1 (subdivided)', () => {
        const geometry = new TetrahedronGeometry({
            radius: 2,
            detail: 1
        })

        expect(geometry.parameters.detail).toBe(1)
        expect(geometry.parameters.radius).toBe(2)
    })


    test('constructor with detail level 3 (highly subdivided)', () => {
        const geometry = new TetrahedronGeometry({
            radius: 1.5,
            detail: 3
        })

        expect(geometry.parameters.detail).toBe(3)
        expect(geometry.parameters.radius).toBe(1.5)
    })


    test('constructor with minimal parameters uses defaults', () => {
        const geometry = new TetrahedronGeometry({
            radius: 0.8
        })

        expect(geometry.parameters.radius).toBe(0.8)
        expect(geometry.parameters.detail).toBe(0)
    })


    test('constructor with empty object uses defaults', () => {
        const geometry = new TetrahedronGeometry({})

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.detail).toBe(0)
    })


    test('constructor with positional arguments (legacy mode)', () => {
        const geometry = new TetrahedronGeometry(2.5, 1)

        expect(geometry.parameters.radius).toBe(2.5)
        expect(geometry.parameters.detail).toBe(1)
    })


    test('constructor with no arguments uses defaults', () => {
        const geometry = new TetrahedronGeometry()

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.detail).toBe(0)
    })


    test('constructor with null parameters uses defaults', () => {
        const geometry = new TetrahedronGeometry(null)

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.detail).toBe(0)
    })


    test('constructor with non-object parameters falls back to legacy mode', () => {
        const geometry = new TetrahedronGeometry(3, 2)

        expect(geometry.parameters.radius).toBe(3)
        expect(geometry.parameters.detail).toBe(2)
    })


    test('constructor preserves original Three.js functionality', () => {
        const geometry1 = new TetrahedronGeometry({
            radius: 2,
            detail: 1
        })

        const geometry2 = new TetrahedronGeometry(2, 1)

        expect(geometry1.parameters.radius).toBe(geometry2.parameters.radius)
        expect(geometry1.parameters.detail).toBe(geometry2.parameters.detail)
    })


    test('constructor creates simple tetrahedron by default', () => {
        const geometry = new TetrahedronGeometry({radius: 1})

        expect(geometry.parameters.detail).toBe(0)
    })


    test('constructor with large detail value', () => {
        const geometry = new TetrahedronGeometry({
            radius: 1,
            detail: 5
        })

        expect(geometry.parameters.detail).toBe(5)
        expect(geometry.parameters.radius).toBe(1)
    })

}) 