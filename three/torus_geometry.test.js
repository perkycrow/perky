import TorusGeometry from './torus_geometry'
import {describe, test, expect} from 'vitest'


describe('TorusGeometry', () => {

    test('constructor with object parameters', () => {
        const geometry = new TorusGeometry({
            radius: 5,
            tube: 2,
            radialSegments: 16,
            tubularSegments: 64,
            arc: Math.PI * 1.5
        })

        expect(geometry.parameters.radius).toBe(5)
        expect(geometry.parameters.tube).toBe(2)
        expect(geometry.parameters.radialSegments).toBe(16)
        expect(geometry.parameters.tubularSegments).toBe(64)
        expect(geometry.parameters.arc).toBeCloseTo(Math.PI * 1.5)
    })


    test('constructor with size parameter', () => {
        const geometry = new TorusGeometry({
            size: 3
        })

        expect(geometry.parameters.radius).toBe(3)
        expect(geometry.parameters.tube).toBeCloseTo(1.2)
        expect(geometry.parameters.radialSegments).toBe(12)
        expect(geometry.parameters.tubularSegments).toBe(48)
    })


    test('constructor with segments parameter', () => {
        const geometry = new TorusGeometry({
            segments: 20
        })

        expect(geometry.parameters.radialSegments).toBe(20)
        expect(geometry.parameters.tubularSegments).toBe(20)
        expect(geometry.parameters.radius).toBe(1)
    })


    test('constructor with size and explicit tube (tube takes precedence)', () => {
        const geometry = new TorusGeometry({
            size: 4,
            tube: 1
        })

        expect(geometry.parameters.radius).toBe(4)
        expect(geometry.parameters.tube).toBe(1)
    })


    test('constructor with size and explicit radius (radius takes precedence)', () => {
        const geometry = new TorusGeometry({
            size: 3,
            radius: 5
        })

        expect(geometry.parameters.radius).toBe(5)
        expect(geometry.parameters.tube).toBeCloseTo(1.2)
    })


    test('constructor with segments and explicit radial/tubular segments', () => {
        const geometry = new TorusGeometry({
            segments: 16,
            radialSegments: 24,
            tubularSegments: 32
        })

        expect(geometry.parameters.radialSegments).toBe(24)
        expect(geometry.parameters.tubularSegments).toBe(32)
    })


    test('constructor for half torus (semicircle)', () => {
        const geometry = new TorusGeometry({
            radius: 2,
            tube: 0.5,
            arc: Math.PI
        })

        expect(geometry.parameters.arc).toBeCloseTo(Math.PI)
        expect(geometry.parameters.radius).toBe(2)
        expect(geometry.parameters.tube).toBe(0.5)
    })


    test('constructor for quarter torus', () => {
        const geometry = new TorusGeometry({
            radius: 3,
            tube: 1,
            arc: Math.PI / 2
        })

        expect(geometry.parameters.arc).toBeCloseTo(Math.PI / 2)
    })


    test('constructor for thick torus', () => {
        const geometry = new TorusGeometry({
            radius: 2,
            tube: 1.5
        })

        expect(geometry.parameters.radius).toBe(2)
        expect(geometry.parameters.tube).toBe(1.5)
    })


    test('constructor for thin torus', () => {
        const geometry = new TorusGeometry({
            radius: 5,
            tube: 0.2
        })

        expect(geometry.parameters.radius).toBe(5)
        expect(geometry.parameters.tube).toBe(0.2)
    })


    test('constructor with low detail', () => {
        const geometry = new TorusGeometry({
            radius: 1,
            radialSegments: 6,
            tubularSegments: 12
        })

        expect(geometry.parameters.radialSegments).toBe(6)
        expect(geometry.parameters.tubularSegments).toBe(12)
    })


    test('constructor with high detail', () => {
        const geometry = new TorusGeometry({
            radius: 1,
            radialSegments: 32,
            tubularSegments: 128
        })

        expect(geometry.parameters.radialSegments).toBe(32)
        expect(geometry.parameters.tubularSegments).toBe(128)
    })


    test('constructor with minimal parameters uses defaults', () => {
        const geometry = new TorusGeometry({
            radius: 2.5
        })

        expect(geometry.parameters.radius).toBe(2.5)
        expect(geometry.parameters.tube).toBe(0.4)
        expect(geometry.parameters.radialSegments).toBe(12)
        expect(geometry.parameters.tubularSegments).toBe(48)
        expect(geometry.parameters.arc).toBeCloseTo(Math.PI * 2)
    })


    test('constructor with empty object uses defaults', () => {
        const geometry = new TorusGeometry({})

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.tube).toBe(0.4)
        expect(geometry.parameters.radialSegments).toBe(12)
        expect(geometry.parameters.tubularSegments).toBe(48)
        expect(geometry.parameters.arc).toBeCloseTo(Math.PI * 2)
    })


    test('constructor with positional arguments (legacy mode)', () => {
        const geometry = new TorusGeometry(3, 1, 16, 64, Math.PI)

        expect(geometry.parameters.radius).toBe(3)
        expect(geometry.parameters.tube).toBe(1)
        expect(geometry.parameters.radialSegments).toBe(16)
        expect(geometry.parameters.tubularSegments).toBe(64)
        expect(geometry.parameters.arc).toBeCloseTo(Math.PI)
    })


    test('constructor with no arguments uses defaults', () => {
        const geometry = new TorusGeometry()

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.tube).toBe(0.4)
        expect(geometry.parameters.radialSegments).toBe(12)
        expect(geometry.parameters.tubularSegments).toBe(48)
    })


    test('constructor with null parameters uses defaults', () => {
        const geometry = new TorusGeometry(null)

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.tube).toBe(0.4)
        expect(geometry.parameters.radialSegments).toBe(12)
        expect(geometry.parameters.tubularSegments).toBe(48)
    })


    test('constructor with non-object parameters falls back to legacy mode', () => {
        const geometry = new TorusGeometry(2, 0.8, 8, 24)

        expect(geometry.parameters.radius).toBe(2)
        expect(geometry.parameters.tube).toBe(0.8)
        expect(geometry.parameters.radialSegments).toBe(8)
        expect(geometry.parameters.tubularSegments).toBe(24)
    })


    test('constructor preserves original Three.js functionality', () => {
        const geometry1 = new TorusGeometry({
            radius: 3,
            tube: 1,
            radialSegments: 16,
            tubularSegments: 32
        })

        const geometry2 = new TorusGeometry(3, 1, 16, 32)

        expect(geometry1.parameters.radius).toBe(geometry2.parameters.radius)
        expect(geometry1.parameters.tube).toBe(geometry2.parameters.tube)
        expect(geometry1.parameters.radialSegments).toBe(geometry2.parameters.radialSegments)
        expect(geometry1.parameters.tubularSegments).toBe(geometry2.parameters.tubularSegments)
    })


    test('constructor creates complete torus by default', () => {
        const geometry = new TorusGeometry({radius: 1})

        expect(geometry.parameters.arc).toBeCloseTo(Math.PI * 2)
    })

}) 