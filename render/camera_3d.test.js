import Camera3D from './camera_3d.js'
import Vec3 from '../math/vec3.js'
import Matrix4 from '../math/matrix4.js'


function expectClose (actual, expected, epsilon = 1e-5) {
    expect(Math.abs(actual - expected)).toBeLessThan(epsilon)
}


describe('Camera3D', () => {

    describe('constructor', () => {

        test('default values', () => {
            const cam = new Camera3D()
            expect(cam.position.x).toBe(0)
            expect(cam.position.y).toBe(0)
            expect(cam.position.z).toBe(0)
            expectClose(cam.fov, Math.PI / 4)
            expect(cam.aspect).toBe(1)
            expectClose(cam.near, 0.1)
            expect(cam.far).toBe(100)
        })

        test('with options', () => {
            const cam = new Camera3D({x: 1, y: 2, z: 3, fov: Math.PI / 3, aspect: 16 / 9, near: 0.5, far: 500})
            expect(cam.position.x).toBe(1)
            expect(cam.position.y).toBe(2)
            expect(cam.position.z).toBe(3)
            expectClose(cam.fov, Math.PI / 3)
            expectClose(cam.aspect, 16 / 9)
            expectClose(cam.near, 0.5)
            expect(cam.far).toBe(500)
        })

    })


    test('setPosition', () => {
        const cam = new Camera3D()
        expect(cam.setPosition(5, 10, 15)).toBe(cam)
        expect(cam.position.x).toBe(5)
        expect(cam.position.y).toBe(10)
        expect(cam.position.z).toBe(15)
    })


    test('setFov', () => {
        const cam = new Camera3D()
        expect(cam.setFov(Math.PI / 3)).toBe(cam)
        expectClose(cam.fov, Math.PI / 3)
    })


    test('setAspect', () => {
        const cam = new Camera3D()
        expect(cam.setAspect(2)).toBe(cam)
        expect(cam.aspect).toBe(2)
    })


    test('setNearFar', () => {
        const cam = new Camera3D()
        expect(cam.setNearFar(1, 1000)).toBe(cam)
        expect(cam.near).toBe(1)
        expect(cam.far).toBe(1000)
    })


    describe('viewMatrix', () => {

        test('at origin looking forward is identity', () => {
            const cam = new Camera3D()
            const view = cam.viewMatrix
            expect(view).toBeInstanceOf(Matrix4)
            const identity = new Matrix4()
            for (let i = 0; i < 16; i++) {
                expectClose(view.elements[i], identity.elements[i])
            }
        })

        test('offset camera translates view', () => {
            const cam = new Camera3D({z: 5})
            const view = cam.viewMatrix
            expectClose(view.elements[14], -5)
        })

    })


    describe('projectionMatrix', () => {

        test('returns a perspective matrix', () => {
            const cam = new Camera3D()
            const proj = cam.projectionMatrix
            expect(proj).toBeInstanceOf(Matrix4)
            expect(proj.elements[0]).toBeGreaterThan(0)
            expect(proj.elements[5]).toBeGreaterThan(0)
            expect(proj.elements[11]).toBe(-1)
            expect(proj.elements[15]).toBe(0)
        })

        test('aspect ratio affects horizontal scale', () => {
            const square = new Camera3D({aspect: 1})
            const wide = new Camera3D({aspect: 2})
            expect(wide.projectionMatrix.elements[0]).toBeLessThan(square.projectionMatrix.elements[0])
        })

    })


    describe('lookAt', () => {

        test('looking at a target', () => {
            const cam = new Camera3D({z: 5})
            cam.lookAt(new Vec3(0, 0, 0))
            expectClose(cam.viewMatrix.elements[14], -5)
        })

        test('returns this', () => {
            const cam = new Camera3D()
            expect(cam.lookAt(new Vec3(0, 0, -1))).toBe(cam)
        })

    })


    test('update forces recalculation', () => {
        const cam = new Camera3D()
        expectClose(cam.viewMatrix.elements[14], 0)
        cam.position.set(0, 0, 10)
        cam.markDirty()
        cam.update()
        expectClose(cam.viewMatrix.elements[14], -10)
    })


    test('lazy evaluation only computes when dirty', () => {
        const cam = new Camera3D({z: 3})
        const view1 = cam.viewMatrix
        const view2 = cam.viewMatrix
        expect(view1).toBe(view2)
    })

})
