import {describe, test, expect, beforeEach, vi} from 'vitest'
import Camera2D from './camera_2d'


describe(Camera2D, () => {

    let camera

    beforeEach(() => {
        camera = new Camera2D()
    })


    test('constructor defaults', () => {
        expect(camera.x).toBe(0)
        expect(camera.y).toBe(0)
        expect(camera.zoom).toBe(1)
        expect(camera.unitsInView).toBe(10)
        expect(camera.viewportWidth).toBe(800)
        expect(camera.viewportHeight).toBe(600)
        expect(camera.followTarget).toBe(null)
        expect(camera.followSpeed).toBe(0.1)
    })


    test('constructor with options', () => {
        const cam = new Camera2D({
            x: 10,
            y: 20,
            zoom: 2,
            unitsInView: 5,
            viewportWidth: 1024,
            viewportHeight: 768
        })

        expect(cam.x).toBe(10)
        expect(cam.y).toBe(20)
        expect(cam.zoom).toBe(2)
        expect(cam.unitsInView).toBe(5)
        expect(cam.viewportWidth).toBe(1024)
        expect(cam.viewportHeight).toBe(768)
    })


    test('pixelsPerUnit', () => {
        camera.unitsInView = 10
        camera.viewportHeight = 600
        camera.zoom = 1

        expect(camera.pixelsPerUnit).toBe(60)

        camera.zoom = 2
        expect(camera.pixelsPerUnit).toBe(120)
    })


    test('setUnitsInView', () => {
        const result = camera.setUnitsInView(5)

        expect(camera.unitsInView).toBe(5)
        expect(result).toBe(camera)
    })


    test('setZoom', () => {
        const result = camera.setZoom(2)

        expect(camera.zoom).toBe(2)
        expect(result).toBe(camera)
    })


    test('setPosition', () => {
        const result = camera.setPosition(10, 20)

        expect(camera.x).toBe(10)
        expect(camera.y).toBe(20)
        expect(result).toBe(camera)
    })


    test('follow', () => {
        const target = { x: 100, y: 200 }
        const result = camera.follow(target, 0.2)

        expect(camera.followTarget).toBe(target)
        expect(camera.followSpeed).toBe(0.2)
        expect(result).toBe(camera)
    })


    test('update without follow', () => {
        camera.x = 10
        camera.y = 20

        camera.update()

        expect(camera.x).toBe(10)
        expect(camera.y).toBe(20)
    })


    test('update with follow', () => {
        const target = { x: 100, y: 200 }
        camera.follow(target, 0.1)
        camera.x = 0
        camera.y = 0

        camera.update()

        expect(camera.x).toBeCloseTo(10)
        expect(camera.y).toBeCloseTo(20)
    })


    test('worldToScreen', () => {
        camera.x = 0
        camera.y = 0
        camera.unitsInView = 10
        camera.viewportWidth = 800
        camera.viewportHeight = 600
        camera.zoom = 1

        const result = camera.worldToScreen(0, 0)
        expect(result.x).toBe(400)
        expect(result.y).toBe(300)

        const result2 = camera.worldToScreen(5, 5)
        expect(result2.x).toBeCloseTo(700)
        expect(result2.y).toBeCloseTo(0)
    })


    test('screenToWorld', () => {
        camera.x = 0
        camera.y = 0
        camera.unitsInView = 10
        camera.viewportWidth = 800
        camera.viewportHeight = 600
        camera.zoom = 1

        const result = camera.screenToWorld(400, 300)
        expect(result.x).toBeCloseTo(0)
        expect(result.y).toBeCloseTo(0)

        const result2 = camera.screenToWorld(700, 0)
        expect(result2.x).toBeCloseTo(5)
        expect(result2.y).toBeCloseTo(5)
    })


    test('applyToContext', () => {
        const ctx = {
            translate: vi.fn(),
            scale: vi.fn()
        }

        camera.viewportWidth = 800
        camera.viewportHeight = 600
        camera.unitsInView = 10
        camera.zoom = 1
        camera.x = 5
        camera.y = 10

        camera.applyToContext(ctx)

        expect(ctx.translate).toHaveBeenCalledTimes(2)
        expect(ctx.translate).toHaveBeenNthCalledWith(1, 400, 300)
        expect(ctx.translate).toHaveBeenNthCalledWith(2, -5, -10)
        expect(ctx.scale).toHaveBeenCalledWith(60, -60)
    })

})

