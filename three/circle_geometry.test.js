import CircleGeometry from './circle_geometry'
import {describe, test, expect} from 'vitest'


describe('CircleGeometry', () => {

    test('constructor with object parameters', () => {
        const geometry = new CircleGeometry({
            radius: 5,
            segments: 16,
            thetaStart: Math.PI / 4,
            thetaLength: Math.PI
        })

        expect(geometry.parameters.radius).toBe(5)
        expect(geometry.parameters.segments).toBe(16)
        expect(geometry.parameters.thetaStart).toBe(Math.PI / 4)
        expect(geometry.parameters.thetaLength).toBe(Math.PI)
    })


    test('constructor with size parameter', () => {
        const geometry = new CircleGeometry({
            size: 3
        })

        expect(geometry.parameters.radius).toBe(3)
        expect(geometry.parameters.segments).toBe(32)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })


    test('constructor with size and parameter overrides', () => {
        const geometry = new CircleGeometry({
            size: 2.5,
            segments: 64,
            thetaLength: Math.PI
        })

        expect(geometry.parameters.radius).toBe(2.5)
        expect(geometry.parameters.segments).toBe(64)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI)
    })


    test('constructor with radius override after size', () => {
        const geometry = new CircleGeometry({
            size: 2,
            radius: 4
        })

        expect(geometry.parameters.radius).toBe(4)
        expect(geometry.parameters.segments).toBe(32)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })


    test('constructor with partial parameters and defaults', () => {
        const geometry = new CircleGeometry({
            radius: 7,
            segments: 8
        })

        expect(geometry.parameters.radius).toBe(7)
        expect(geometry.parameters.segments).toBe(8)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })


    test('constructor with empty object uses defaults', () => {
        const geometry = new CircleGeometry({})

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.segments).toBe(32)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })


    test('constructor with positional arguments (legacy mode)', () => {
        const geometry = new CircleGeometry(3, 24, Math.PI / 6, Math.PI)

        expect(geometry.parameters.radius).toBe(3)
        expect(geometry.parameters.segments).toBe(24)
        expect(geometry.parameters.thetaStart).toBe(Math.PI / 6)
        expect(geometry.parameters.thetaLength).toBe(Math.PI)
    })


    test('constructor with no arguments uses sensible defaults', () => {
        const geometry = new CircleGeometry()

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.segments).toBe(32)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })


    test('constructor with null parameters uses sensible defaults', () => {
        const geometry = new CircleGeometry(null)

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.segments).toBe(32)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })


    test('constructor with non-object parameters falls back to legacy mode', () => {
        const geometry = new CircleGeometry(4, 16)

        expect(geometry.parameters.radius).toBe(4)
        expect(geometry.parameters.segments).toBe(16)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })


    test('constructor for half circle', () => {
        const geometry = new CircleGeometry({
            radius: 2,
            thetaLength: Math.PI
        })

        expect(geometry.parameters.radius).toBe(2)
        expect(geometry.parameters.segments).toBe(32)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI)
    })


    test('constructor for quarter circle', () => {
        const geometry = new CircleGeometry({
            radius: 1.5,
            thetaStart: Math.PI / 2,
            thetaLength: Math.PI / 2
        })

        expect(geometry.parameters.radius).toBe(1.5)
        expect(geometry.parameters.segments).toBe(32)
        expect(geometry.parameters.thetaStart).toBe(Math.PI / 2)
        expect(geometry.parameters.thetaLength).toBe(Math.PI / 2)
    })


    test('constructor for polygon (low segments)', () => {
        const geometry = new CircleGeometry({
            radius: 3,
            segments: 6
        })

        expect(geometry.parameters.radius).toBe(3)
        expect(geometry.parameters.segments).toBe(6)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })


    test('constructor with only segments parameter', () => {
        const geometry = new CircleGeometry({
            segments: 128
        })

        expect(geometry.parameters.radius).toBe(1)
        expect(geometry.parameters.segments).toBe(128)
        expect(geometry.parameters.thetaStart).toBe(0)
        expect(geometry.parameters.thetaLength).toBe(Math.PI * 2)
    })

}) 