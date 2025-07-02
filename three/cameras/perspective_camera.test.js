import PerspectiveCamera from './perspective_camera'
import {describe, test, expect} from 'vitest'


describe('PerspectiveCamera', () => {

    test('constructor with object parameters', () => {
        const camera = new PerspectiveCamera({
            fov: 45,
            aspect: 16 / 9,
            near: 0.5,
            far: 1000
        })

        expect(camera.fov).toBe(45)
        expect(camera.aspect).toBeCloseTo(16 / 9)
        expect(camera.near).toBe(0.5)
        expect(camera.far).toBe(1000)
    })


    test('constructor with width and height', () => {
        const camera = new PerspectiveCamera({
            width: 1920,
            height: 1080
        })

        expect(camera.fov).toBe(50)
        expect(camera.aspect).toBeCloseTo(1920 / 1080)
        expect(camera.near).toBe(0.1)
        expect(camera.far).toBe(2000)
    })


    test('constructor with width, height and custom fov', () => {
        const camera = new PerspectiveCamera({
            width: 800,
            height: 600,
            fov: 75,
            far: 500
        })

        expect(camera.fov).toBe(75)
        expect(camera.aspect).toBeCloseTo(800 / 600)
        expect(camera.near).toBe(0.1)
        expect(camera.far).toBe(500)
    })


    test('constructor with width, height and aspect override', () => {
        const camera = new PerspectiveCamera({
            width: 1920,
            height: 1080,
            aspect: 2.0
        })

        expect(camera.aspect).toBe(2.0)
        expect(camera.fov).toBe(50)
        expect(camera.near).toBe(0.1)
        expect(camera.far).toBe(2000)
    })


    test('constructor with only some parameters and defaults', () => {
        const camera = new PerspectiveCamera({
            fov: 60,
            aspect: 4 / 3
        })

        expect(camera.fov).toBe(60)
        expect(camera.aspect).toBeCloseTo(4 / 3)
        expect(camera.near).toBe(0.1)
        expect(camera.far).toBe(2000)
    })


    test('constructor with empty object uses defaults', () => {
        const camera = new PerspectiveCamera({})

        expect(camera.fov).toBe(50)
        expect(camera.aspect).toBe(1)
        expect(camera.near).toBe(0.1)
        expect(camera.far).toBe(2000)
    })


    test('constructor with positional arguments (legacy mode)', () => {
        const camera = new PerspectiveCamera(75, 16 / 9, 0.5, 1500)

        expect(camera.fov).toBe(75)
        expect(camera.aspect).toBeCloseTo(16 / 9)
        expect(camera.near).toBe(0.5)
        expect(camera.far).toBe(1500)
    })


    test('constructor with no arguments uses sensible defaults', () => {
        const camera = new PerspectiveCamera()

        expect(camera.fov).toBe(50)
        expect(camera.aspect).toBe(1)
        expect(camera.near).toBe(0.1)
        expect(camera.far).toBe(2000)
    })


    test('constructor with null parameters uses sensible defaults', () => {
        const camera = new PerspectiveCamera(null)

        expect(camera.fov).toBe(50)
        expect(camera.aspect).toBe(1)
        expect(camera.near).toBe(0.1)
        expect(camera.far).toBe(2000)
    })


    test('constructor with non-object parameters falls back to legacy mode', () => {
        const camera = new PerspectiveCamera(90, 2.0)

        expect(camera.fov).toBe(90)
        expect(camera.aspect).toBe(2.0)
    })


    test('square aspect ratio from equal width and height', () => {
        const camera = new PerspectiveCamera({
            width: 512,
            height: 512
        })

        expect(camera.aspect).toBe(1)
    })


    test('portrait aspect ratio', () => {
        const camera = new PerspectiveCamera({
            width: 480,
            height: 800
        })

        expect(camera.aspect).toBe(0.6)
    })

})
