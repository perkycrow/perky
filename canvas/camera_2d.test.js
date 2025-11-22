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
        const target = {x: 100, y: 200}
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
        const target = {x: 100, y: 200}
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


    test('isVisible with visible bounds', () => {
        camera.x = 0
        camera.y = 0
        camera.viewportWidth = 800
        camera.viewportHeight = 600
        camera.unitsInView = 10
        camera.zoom = 1

        const bounds = {minX: -1, minY: -1, maxX: 1, maxY: 1, width: 2, height: 2}
        expect(camera.isVisible(bounds)).toBe(true)
    })


    test('isVisible with bounds outside camera', () => {
        camera.x = 0
        camera.y = 0
        camera.viewportWidth = 800
        camera.viewportHeight = 600
        camera.unitsInView = 10
        camera.zoom = 1

        const bounds = {minX: 100, minY: 100, maxX: 110, maxY: 110, width: 10, height: 10}
        expect(camera.isVisible(bounds)).toBe(false)
    })


    test('isVisible with partially visible bounds', () => {
        camera.x = 0
        camera.y = 0
        camera.viewportWidth = 800
        camera.viewportHeight = 600
        camera.unitsInView = 10
        camera.zoom = 1

        const bounds = {minX: 5, minY: -1, maxX: 10, maxY: 1, width: 5, height: 2}
        expect(camera.isVisible(bounds)).toBe(true)
    })


    test('isVisible with empty bounds', () => {
        camera.x = 0
        camera.y = 0
        camera.viewportWidth = 800
        camera.viewportHeight = 600
        camera.unitsInView = 10
        camera.zoom = 1

        const bounds = {minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0}
        expect(camera.isVisible(bounds)).toBe(false)
    })


    test('rotation defaults to 0', () => {
        expect(camera.rotation).toBe(0)
    })


    test('rotation can be set', () => {
        camera.rotation = Math.PI / 4
        expect(camera.rotation).toBeCloseTo(Math.PI / 4)
    })


    test('worldToScreen with rotation', () => {
        camera.x = 0
        camera.y = 0
        camera.rotation = Math.PI / 2
        camera.viewportWidth = 800
        camera.viewportHeight = 600
        camera.unitsInView = 10
        camera.zoom = 1

        const result = camera.worldToScreen(1, 0)

        expect(result.x).toBeCloseTo(400)
        expect(result.y).toBeCloseTo(360)
    })


    test('screenToWorld with rotation', () => {
        camera.x = 0
        camera.y = 0
        camera.rotation = Math.PI / 2
        camera.viewportWidth = 800
        camera.viewportHeight = 600
        camera.unitsInView = 10
        camera.zoom = 1

        const result = camera.screenToWorld(400, 240)

        expect(result.x).toBeCloseTo(-1, 0.01)
        expect(result.y).toBeCloseTo(0, 0.01)
    })


    test('worldToScreen and screenToWorld are inverse operations with rotation', () => {
        camera.x = 5
        camera.y = 3
        camera.rotation = Math.PI / 3
        camera.viewportWidth = 800
        camera.viewportHeight = 600
        camera.unitsInView = 10
        camera.zoom = 1.5

        const worldPoint = {x: 10, y: 7}
        const screen = camera.worldToScreen(worldPoint.x, worldPoint.y)
        const backToWorld = camera.screenToWorld(screen.x, screen.y)

        expect(backToWorld.x).toBeCloseTo(worldPoint.x, 0.01)
        expect(backToWorld.y).toBeCloseTo(worldPoint.y, 0.01)
    })

})

