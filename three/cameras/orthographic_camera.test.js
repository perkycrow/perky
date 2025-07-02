import OrthographicCamera from './orthographic_camera'
import {describe, test, expect} from 'vitest'


describe('OrthographicCamera', () => {

    test('constructor with object parameters', () => {
        const camera = new OrthographicCamera({
            left: -100,
            right: 100,
            top: 50,
            bottom: -50,
            near: 0.1,
            far: 2000
        })

        expect(camera.left).toBe(-100)
        expect(camera.right).toBe(100)
        expect(camera.top).toBe(50)
        expect(camera.bottom).toBe(-50)
        expect(camera.near).toBe(0.1)
        expect(camera.far).toBe(2000)
    })


    test('constructor with width and height', () => {
        const camera = new OrthographicCamera({
            width: 200,
            height: 100
        })

        expect(camera.left).toBe(-100)
        expect(camera.right).toBe(100)
        expect(camera.top).toBe(50)
        expect(camera.bottom).toBe(-50)
        expect(camera.near).toBe(0.1)
        expect(camera.far).toBe(2000)
    })


    test('constructor with width, height and custom near/far', () => {
        const camera = new OrthographicCamera({
            width: 400,
            height: 300,
            near: 0.5,
            far: 500
        })

        expect(camera.left).toBe(-200)
        expect(camera.right).toBe(200)
        expect(camera.top).toBe(150)
        expect(camera.bottom).toBe(-150)
        expect(camera.near).toBe(0.5)
        expect(camera.far).toBe(500)
    })


    test('constructor with width, height and partial overrides', () => {
        const camera = new OrthographicCamera({
            width: 200,
            height: 100,
            left: -50,
            top: 75
        })

        expect(camera.left).toBe(-50)
        expect(camera.right).toBe(100)
        expect(camera.top).toBe(75)
        expect(camera.bottom).toBe(-50)
        expect(camera.near).toBe(0.1)
        expect(camera.far).toBe(2000)
    })


    test('constructor with only some parameters and defaults', () => {
        const camera = new OrthographicCamera({
            left: -10,
            right: 10,
            top: 5,
            bottom: -5
        })

        expect(camera.left).toBe(-10)
        expect(camera.right).toBe(10)
        expect(camera.top).toBe(5)
        expect(camera.bottom).toBe(-5)
        expect(camera.near).toBe(0.1)
        expect(camera.far).toBe(2000)
    })


    test('constructor with empty object uses defaults', () => {
        const camera = new OrthographicCamera({})

        expect(camera.near).toBe(0.1)
        expect(camera.far).toBe(2000)
    })


    test('constructor with positional arguments (legacy mode)', () => {
        const camera = new OrthographicCamera(-100, 100, 50, -50, 0.1, 2000)

        expect(camera.left).toBe(-100)
        expect(camera.right).toBe(100)
        expect(camera.top).toBe(50)
        expect(camera.bottom).toBe(-50)
        expect(camera.near).toBe(0.1)
        expect(camera.far).toBe(2000)
    })


    test('constructor with no arguments uses sensible defaults', () => {
        const camera = new OrthographicCamera()

        expect(camera.left).toBe(-1)
        expect(camera.right).toBe(1)
        expect(camera.top).toBe(1)
        expect(camera.bottom).toBe(-1)
        expect(camera.near).toBe(0.1)
        expect(camera.far).toBe(2000)
    })


    test('constructor with null parameters uses sensible defaults', () => {
        const camera = new OrthographicCamera(null)

        expect(camera.left).toBe(-1)
        expect(camera.right).toBe(1)
        expect(camera.top).toBe(1)
        expect(camera.bottom).toBe(-1)
        expect(camera.near).toBe(0.1)
        expect(camera.far).toBe(2000)
    })


    test('constructor with non-object parameters falls back to legacy mode', () => {
        const camera = new OrthographicCamera(-50, 50, 25, -25)

        expect(camera.left).toBe(-50)
        expect(camera.right).toBe(50)
        expect(camera.top).toBe(25)
        expect(camera.bottom).toBe(-25)
    })

}) 