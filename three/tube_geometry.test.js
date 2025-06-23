import TubeGeometry from './tube_geometry'
import {QuadraticBezierCurve3, CubicBezierCurve3, CatmullRomCurve3, Vector3} from 'three'
import {describe, test, expect} from 'vitest'


describe('TubeGeometry', () => {

    const simpleCurve = new QuadraticBezierCurve3(
        new Vector3(-2, 0, 0),
        new Vector3(0, 2, 0),
        new Vector3(2, 0, 0)
    )

    const cubicCurve = new CubicBezierCurve3(
        new Vector3(-3, 0, 0),
        new Vector3(-1, 2, 0),
        new Vector3(1, -2, 0),
        new Vector3(3, 0, 0)
    )

    const splineCurve = new CatmullRomCurve3([
        new Vector3(-2, 0, 0),
        new Vector3(-1, 1, 0),
        new Vector3(0, 0, 1),
        new Vector3(1, -1, 0),
        new Vector3(2, 0, 0)
    ])


    test('constructor with object parameters', () => {
        const geometry = new TubeGeometry({
            path: simpleCurve,
            tubularSegments: 32,
            radius: 2,
            radialSegments: 12,
            closed: true
        })

        expect(geometry.parameters.path).toBe(simpleCurve)
        expect(geometry.parameters.tubularSegments).toBe(32)
        expect(geometry.parameters.radius).toBe(2)
        expect(geometry.parameters.radialSegments).toBe(12)
        expect(geometry.parameters.closed).toBe(true)
    })


    test('constructor with cubic bezier curve', () => {
        const geometry = new TubeGeometry({
            path: cubicCurve,
            radius: 1.5,
            tubularSegments: 48
        })

        expect(geometry.parameters.path).toBe(cubicCurve)
        expect(geometry.parameters.radius).toBe(1.5)
        expect(geometry.parameters.tubularSegments).toBe(48)
    })


    test('constructor with catmull-rom spline', () => {
        const geometry = new TubeGeometry({
            path: splineCurve,
            radius: 0.8,
            closed: true
        })

        expect(geometry.parameters.path).toBe(splineCurve)
        expect(geometry.parameters.radius).toBe(0.8)
        expect(geometry.parameters.closed).toBe(true)
    })


    test('constructor with size parameter', () => {
        const geometry = new TubeGeometry({
            path: simpleCurve,
            size: 3
        })

        expect(geometry.parameters.radius).toBe(3)
        expect(geometry.parameters.tubularSegments).toBe(64)
        expect(geometry.parameters.radialSegments).toBe(8)
    })


    test('constructor with segments parameter', () => {
        const geometry = new TubeGeometry({
            path: simpleCurve,
            segments: 24
        })

        expect(geometry.parameters.tubularSegments).toBe(24)
        expect(geometry.parameters.radialSegments).toBe(3)
    })


    test('constructor with size and radius (radius takes precedence)', () => {
        const geometry = new TubeGeometry({
            path: simpleCurve,
            size: 2,
            radius: 4
        })

        expect(geometry.parameters.radius).toBe(4)
    })


    test('constructor with segments and explicit segment counts', () => {
        const geometry = new TubeGeometry({
            path: simpleCurve,
            segments: 32,
            tubularSegments: 48,
            radialSegments: 16
        })

        expect(geometry.parameters.tubularSegments).toBe(48)
        expect(geometry.parameters.radialSegments).toBe(16)
    })


    test('constructor with default curve when no path provided', () => {
        const geometry = new TubeGeometry({
            radius: 1.5
        })

        expect(geometry.parameters.path).toBeDefined()
        expect(geometry.parameters.radius).toBe(1.5)
        expect(geometry.parameters.tubularSegments).toBe(64)
        expect(geometry.parameters.radialSegments).toBe(8)
        expect(geometry.parameters.closed).toBe(false)
    })


    test('constructor for closed tube', () => {
        const geometry = new TubeGeometry({
            path: splineCurve,
            closed: true
        })

        expect(geometry.parameters.closed).toBe(true)
    })


    test('constructor for open tube (default)', () => {
        const geometry = new TubeGeometry({
            path: simpleCurve
        })

        expect(geometry.parameters.closed).toBe(false)
    })


    test('constructor with high detail', () => {
        const geometry = new TubeGeometry({
            path: simpleCurve,
            tubularSegments: 128,
            radialSegments: 24
        })

        expect(geometry.parameters.tubularSegments).toBe(128)
        expect(geometry.parameters.radialSegments).toBe(24)
    })


    test('constructor with low detail', () => {
        const geometry = new TubeGeometry({
            path: simpleCurve,
            tubularSegments: 8,
            radialSegments: 4
        })

        expect(geometry.parameters.tubularSegments).toBe(8)
        expect(geometry.parameters.radialSegments).toBe(4)
    })


    test('constructor with minimal parameters uses defaults', () => {
        const geometry = new TubeGeometry({
            path: simpleCurve
        })

        expect(geometry.parameters.path).toBe(simpleCurve)
        expect(geometry.parameters.tubularSegments).toBe(64)
        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.radialSegments).toBe(8)
        expect(geometry.parameters.closed).toBe(false)
    })


    test('constructor with empty object uses defaults with default curve', () => {
        const geometry = new TubeGeometry({})

        expect(geometry.parameters.path).toBeDefined()
        expect(geometry.parameters.tubularSegments).toBe(64)
        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.radialSegments).toBe(8)
        expect(geometry.parameters.closed).toBe(false)
    })


    test('constructor with positional arguments (legacy mode)', () => {
        const geometry = new TubeGeometry(simpleCurve, 32, 2, 12, true)

        expect(geometry.parameters.path).toBeDefined()
        expect(geometry.parameters.tubularSegments).toBe(32)
        expect(geometry.parameters.radius).toBe(2)
        expect(geometry.parameters.radialSegments).toBe(12)
        expect(geometry.parameters.closed).toBe(true)
    })


    test('constructor with no arguments uses defaults', () => {
        const geometry = new TubeGeometry()

        expect(geometry.parameters.path).toBeDefined()
        expect(geometry.parameters.tubularSegments).toBe(64)
        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.radialSegments).toBe(8)
        expect(geometry.parameters.closed).toBe(false)
    })


    test('constructor with null parameters uses defaults', () => {
        const geometry = new TubeGeometry(null)

        expect(geometry.parameters.path).toBeDefined()
        expect(geometry.parameters.tubularSegments).toBe(64)
        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.radialSegments).toBe(8)
        expect(geometry.parameters.closed).toBe(false)
    })


    test('constructor preserves original Three.js functionality', () => {
        const geometry1 = new TubeGeometry({
            path: simpleCurve,
            tubularSegments: 32,
            radius: 2,
            radialSegments: 12
        })

        const geometry2 = new TubeGeometry(simpleCurve, 32, 2, 12)

        expect(geometry1.parameters.path).toBe(simpleCurve)
        expect(geometry1.parameters.tubularSegments).toBe(geometry2.parameters.tubularSegments)
        expect(geometry1.parameters.radius).toBe(geometry2.parameters.radius)
        expect(geometry1.parameters.radialSegments).toBe(geometry2.parameters.radialSegments)
    })


    test('constructor has tangents, normals, and binormals arrays', () => {
        const geometry = new TubeGeometry({
            path: simpleCurve
        })

        expect(geometry.tangents).toBeDefined()
        expect(geometry.normals).toBeDefined()
        expect(geometry.binormals).toBeDefined()
        expect(Array.isArray(geometry.tangents)).toBe(true)
        expect(Array.isArray(geometry.normals)).toBe(true)
        expect(Array.isArray(geometry.binormals)).toBe(true)
    })

}) 