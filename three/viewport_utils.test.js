import {describe, test, expect, beforeEach, vi} from 'vitest'
import {screenToWorld, worldToScreen, getViewDimensions, getScreenBounds} from './viewport_utils'

function createMockContainer (width = 800, height = 600) {
    const container = {
        clientWidth: width,
        clientHeight: height,
        getBoundingClientRect: vi.fn(() => ({
            left: 0,
            top: 0,
            width,
            height
        }))
    }
    return container
}

function createMockOrthographicCamera (width = 20, height = 15) {
    return {
        isOrthographicCamera: true,
        isPerspectiveCamera: false,
        left: -width / 2,
        right: width / 2,
        top: height / 2,
        bottom: -height / 2
    }
}

function createMockPerspectiveCamera (fov = 75, aspect = 1) {
    return {
        isOrthographicCamera: false,
        isPerspectiveCamera: true,
        fov,
        aspect,
        position: {z: 10}
    }
}


describe('viewport_utils', () => {
    let container
    let orthographicCamera
    let perspectiveCamera


    beforeEach(() => {
        container = createMockContainer()
        orthographicCamera = createMockOrthographicCamera()
        perspectiveCamera = createMockPerspectiveCamera()
    })


    describe('screenToWorld', () => {

        test('converts screen coordinates to world coordinates for orthographic camera', () => {
            const centerWorld = screenToWorld({
                container,
                screenX: 400,
                screenY: 300,
                camera: orthographicCamera
            })

            expect(centerWorld.x).toBeCloseTo(0, 1)
            expect(centerWorld.y).toBeCloseTo(0, 1)
            expect(centerWorld.z).toBe(0)
        })


        test('handles depth parameter', () => {
            const worldWithDepth = screenToWorld({
                container,
                screenX: 400,
                screenY: 300,
                camera: orthographicCamera,
                depth: 5
            })

            expect(worldWithDepth.z).toBe(5)
        })


        test('works with perspective camera', () => {
            const centerWorld = screenToWorld({
                container,
                screenX: 400,
                screenY: 300,
                camera: perspectiveCamera
            })

            expect(centerWorld.x).toBeCloseTo(0, 1)
            expect(centerWorld.y).toBeCloseTo(0, 1)
            expect(centerWorld.z).toBe(0)
        })


        test('handles missing camera gracefully', () => {
            const result = screenToWorld({
                container,
                screenX: 400,
                screenY: 300,
                camera: null
            })

            expect(result).toEqual({x: 0, y: 0, z: 0})
        })


        test('handles missing container rect gracefully', () => {
            const badContainer = {
                clientWidth: 800,
                clientHeight: 600,
                getBoundingClientRect: () => null
            }

            const result = screenToWorld({
                container: badContainer,
                screenX: 400,
                screenY: 300,
                camera: orthographicCamera
            })

            expect(result).toEqual({x: 0, y: 0, z: 0})
        })

    })


    describe('worldToScreen', () => {

        test('converts world coordinates to screen coordinates for orthographic camera', () => {
            const screenPos = worldToScreen({
                container,
                worldX: 0,
                worldY: 0,
                camera: orthographicCamera
            })

            expect(screenPos.x).toBeCloseTo(400, 1)
            expect(screenPos.y).toBeCloseTo(300, 1)
        })


        test('works with perspective camera', () => {
            const screenPos = worldToScreen({
                container,
                worldX: 0,
                worldY: 0,
                camera: perspectiveCamera
            })

            expect(screenPos.x).toBeCloseTo(400, 1)
            expect(screenPos.y).toBeCloseTo(300, 1)
        })


        test('handles missing camera gracefully', () => {
            const result = worldToScreen({
                container,
                worldX: 0,
                worldY: 0,
                camera: null
            })

            expect(result).toEqual({x: 0, y: 0})
        })


        test('handles missing container rect gracefully', () => {
            const badContainer = {
                clientWidth: 800,
                clientHeight: 600,
                getBoundingClientRect: () => null
            }

            const result = worldToScreen({
                container: badContainer,
                worldX: 0,
                worldY: 0,
                camera: orthographicCamera
            })

            expect(result).toEqual({x: 0, y: 0})
        })

    })


    describe('getViewDimensions', () => {

        test('returns view dimensions for orthographic camera', () => {
            const dimensions = getViewDimensions({
                container,
                camera: orthographicCamera
            })

            expect(dimensions.height).toBe(15)
            expect(dimensions.width).toBeCloseTo(20, 1)
        })


        test('returns view dimensions for perspective camera', () => {
            const dimensions = getViewDimensions({
                container,
                camera: perspectiveCamera
            })

            expect(dimensions.width).toBeGreaterThan(0)
            expect(dimensions.height).toBeGreaterThan(0)
        })


        test('handles missing camera gracefully', () => {
            const result = getViewDimensions({
                container,
                camera: null
            })

            expect(result).toEqual({width: 0, height: 0})
        })

    })


    describe('getScreenBounds', () => {

        test('returns screen bounds for orthographic camera', () => {
            const bounds = getScreenBounds({
                container,
                camera: orthographicCamera
            })

            expect(bounds.top).toBe(7.5)
            expect(bounds.bottom).toBe(-7.5)
            expect(bounds.left).toBeCloseTo(-10, 1)
            expect(bounds.right).toBeCloseTo(10, 1)
        })


        test('returns zero bounds for missing camera', () => {
            const bounds = getScreenBounds({
                container,
                camera: null
            })

            expect(bounds).toEqual({left: 0, right: 0, top: 0, bottom: 0})
        })

    })


    describe('round-trip conversions', () => {

        test('screenToWorld and worldToScreen are inverse operations', () => {
            const originalWorld = {x: 5, y: 3}
            
            const screenPos = worldToScreen({
                container,
                worldX: originalWorld.x,
                worldY: originalWorld.y,
                camera: orthographicCamera
            })

            const backToWorld = screenToWorld({
                container,
                screenX: screenPos.x,
                screenY: screenPos.y,
                camera: orthographicCamera
            })

            expect(backToWorld.x).toBeCloseTo(originalWorld.x, 2)
            expect(backToWorld.y).toBeCloseTo(originalWorld.y, 2)
        })

    })

})
