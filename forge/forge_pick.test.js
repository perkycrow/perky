import {describe, test, expect} from 'vitest'
import {screenToRay, rayAABB, brushAABB, pickBrush, rayHorizontalPlane} from './forge_pick.js'
import Camera3D from '../render/camera_3d.js'
import Vec3 from '../math/vec3.js'
import Brush from '../render/csg/brush.js'
import BrushSet from '../render/csg/brush_set.js'


function createCanvas (width = 800, height = 600) {
    return {
        getBoundingClientRect () {
            return {left: 0, top: 0, width, height}
        }
    }
}


describe('forge_pick', () => {

    test('screenToRay center of screen looks forward', () => {
        const camera = new Camera3D({z: 5, fov: Math.PI / 4, aspect: 1})
        const canvas = createCanvas(100, 100)
        const {origin, direction} = screenToRay(camera, 50, 50, canvas)

        expect(origin.z).toBeGreaterThan(0)
        expect(direction.z).toBeLessThan(0)
        expect(Math.abs(direction.x)).toBeLessThan(0.01)
        expect(Math.abs(direction.y)).toBeLessThan(0.01)
    })


    test('screenToRay off-center ray diverges', () => {
        const camera = new Camera3D({z: 5, fov: Math.PI / 4, aspect: 1})
        const canvas = createCanvas(100, 100)
        const {direction: left} = screenToRay(camera, 0, 50, canvas)
        const {direction: right} = screenToRay(camera, 100, 50, canvas)

        expect(left.x).toBeLessThan(0)
        expect(right.x).toBeGreaterThan(0)
    })


    test('rayAABB hit', () => {
        const origin = new Vec3(0, 0, 5)
        const direction = new Vec3(0, 0, -1)
        const min = new Vec3(-1, -1, -1)
        const max = new Vec3(1, 1, 1)

        const t = rayAABB(origin, direction, min, max)
        expect(t).toBeCloseTo(4, 5)
    })


    test('rayAABB miss', () => {
        const origin = new Vec3(5, 5, 5)
        const direction = new Vec3(0, 0, -1)
        const min = new Vec3(-1, -1, -1)
        const max = new Vec3(1, 1, 1)

        const t = rayAABB(origin, direction, min, max)
        expect(t).toBe(-1)
    })


    test('rayAABB ray behind box', () => {
        const origin = new Vec3(0, 0, -5)
        const direction = new Vec3(0, 0, -1)
        const min = new Vec3(-1, -1, -1)
        const max = new Vec3(1, 1, 1)

        const t = rayAABB(origin, direction, min, max)
        expect(t).toBe(-1)
    })


    test('rayAABB origin inside box', () => {
        const origin = new Vec3(0, 0, 0)
        const direction = new Vec3(0, 0, -1)
        const min = new Vec3(-1, -1, -1)
        const max = new Vec3(1, 1, 1)

        const t = rayAABB(origin, direction, min, max)
        expect(t).toBeGreaterThanOrEqual(0)
    })


    test('rayAABB parallel to face', () => {
        const origin = new Vec3(0, 0, 5)
        const direction = new Vec3(1, 0, 0)
        const min = new Vec3(-1, -1, -1)
        const max = new Vec3(1, 1, 1)

        const t = rayAABB(origin, direction, min, max)
        expect(t).toBe(-1)
    })


    test('brushAABB default box', () => {
        const brush = new Brush({shape: 'box', x: 2, y: 3, z: 4})
        const {min, max} = brushAABB(brush)

        expect(min.x).toBeCloseTo(1.5)
        expect(min.y).toBeCloseTo(2.5)
        expect(min.z).toBeCloseTo(3.5)
        expect(max.x).toBeCloseTo(2.5)
        expect(max.y).toBeCloseTo(3.5)
        expect(max.z).toBeCloseTo(4.5)
    })


    test('brushAABB scaled box', () => {
        const brush = new Brush({shape: 'box', x: 0, y: 0, z: 0, sx: 2, sy: 4, sz: 6})
        const {min, max} = brushAABB(brush)

        expect(min.x).toBeCloseTo(-1)
        expect(min.y).toBeCloseTo(-2)
        expect(min.z).toBeCloseTo(-3)
        expect(max.x).toBeCloseTo(1)
        expect(max.y).toBeCloseTo(2)
        expect(max.z).toBeCloseTo(3)
    })


    test('pickBrush picks closest', () => {
        const brushSet = new BrushSet()
        brushSet.add(new Brush({shape: 'box', x: 0, y: 0.5, z: 0}))
        brushSet.add(new Brush({shape: 'box', x: 0, y: 0.5, z: 3}))

        const camera = new Camera3D({x: 0, y: 2, z: 8, fov: Math.PI / 4, aspect: 1})
        camera.lookAt(new Vec3(0, 0.5, 0))
        const canvas = createCanvas(100, 100)

        const index = pickBrush(camera, 50, 50, canvas, brushSet)
        expect(index).toBe(1)
    })


    test('pickBrush returns -1 on miss', () => {
        const brushSet = new BrushSet()
        brushSet.add(new Brush({shape: 'box', x: 5, y: 0.5, z: 0}))

        const camera = new Camera3D({x: 0, y: 2, z: 8, fov: Math.PI / 4, aspect: 1})
        camera.lookAt(new Vec3(0, 0.5, 0))
        const canvas = createCanvas(100, 100)

        const index = pickBrush(camera, 50, 50, canvas, brushSet)
        expect(index).toBe(-1)
    })


    test('pickBrush skips disabled brushes', () => {
        const brushSet = new BrushSet()
        brushSet.add(new Brush({shape: 'box', x: 0, y: 0.5, z: 0, enabled: false}))

        const camera = new Camera3D({x: 0, y: 2, z: 5, fov: Math.PI / 4, aspect: 1})
        camera.lookAt(new Vec3(0, 0.5, 0))
        const canvas = createCanvas(100, 100)

        const index = pickBrush(camera, 50, 50, canvas, brushSet)
        expect(index).toBe(-1)
    })


    test('rayHorizontalPlane basic intersection', () => {
        const origin = new Vec3(0, 5, 0)
        const direction = new Vec3(0, -1, 0)
        const hit = rayHorizontalPlane(origin, direction, 2)

        expect(hit).not.toBeNull()
        expect(hit.x).toBeCloseTo(0)
        expect(hit.y).toBeCloseTo(2)
        expect(hit.z).toBeCloseTo(0)
    })


    test('rayHorizontalPlane angled ray', () => {
        const origin = new Vec3(0, 5, 0)
        const direction = new Vec3(1, -1, 0).normalize()
        const hit = rayHorizontalPlane(origin, direction, 0)

        expect(hit).not.toBeNull()
        expect(hit.x).toBeCloseTo(5)
        expect(hit.y).toBeCloseTo(0)
    })


    test('rayHorizontalPlane parallel ray returns null', () => {
        const origin = new Vec3(0, 5, 0)
        const direction = new Vec3(1, 0, 0)
        const hit = rayHorizontalPlane(origin, direction, 0)

        expect(hit).toBeNull()
    })


    test('rayHorizontalPlane plane behind ray returns null', () => {
        const origin = new Vec3(0, 5, 0)
        const direction = new Vec3(0, 1, 0)
        const hit = rayHorizontalPlane(origin, direction, 0)

        expect(hit).toBeNull()
    })

})
