import {describe, test, expect, beforeEach, vi} from 'vitest'
import OrbitCamera from './orbit_camera.js'
import Vec3 from '../math/vec3.js'


function createMockCamera3d () {
    return {
        position: new Vec3(),
        lookAt: vi.fn()
    }
}


function createMockCanvas () {
    return {
        style: {},
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        setPointerCapture: vi.fn()
    }
}


function expectClose (actual, expected, epsilon = 1e-4) {
    expect(Math.abs(actual - expected)).toBeLessThan(epsilon)
}


describe('OrbitCamera', () => {

    let camera3d
    let canvas

    beforeEach(() => {
        camera3d = createMockCamera3d()
        canvas = createMockCanvas()
    })


    describe('constructor', () => {

        test('default values', () => {
            const orbit = new OrbitCamera(camera3d, canvas)

            expectClose(orbit.theta, Math.PI / 4)
            expectClose(orbit.phi, Math.acos(5 / Math.sqrt(75)))
            expectClose(orbit.radius, Math.sqrt(75))
            expect(orbit.target).toBeInstanceOf(Vec3)
        })

        test('with options', () => {
            const orbit = new OrbitCamera(camera3d, canvas, {
                theta: 0,
                phi: Math.PI / 4,
                radius: 10,
                target: new Vec3(1, 2, 3)
            })

            expect(orbit.theta).toBe(0)
            expect(orbit.phi).toBe(Math.PI / 4)
            expect(orbit.radius).toBe(10)
            expect(orbit.target.x).toBe(1)
            expect(orbit.target.y).toBe(2)
            expect(orbit.target.z).toBe(3)
        })

        test('sensitivity options affect movement', () => {
            const listeners1 = {}
            const canvas1 = createMockCanvas()
            canvas1.addEventListener = vi.fn((type, fn) => {
                listeners1[type] = fn
            })
            const camera1 = createMockCamera3d()
            const orbit1 = new OrbitCamera(camera1, canvas1, {
                theta: 0,
                phi: Math.PI / 4,
                radius: 10,
                rotateSensitivity: 0.01
            })
            orbit1.attach()

            const listeners2 = {}
            const canvas2 = createMockCanvas()
            canvas2.addEventListener = vi.fn((type, fn) => {
                listeners2[type] = fn
            })
            const camera2 = createMockCamera3d()
            const orbit2 = new OrbitCamera(camera2, canvas2, {
                theta: 0,
                phi: Math.PI / 4,
                radius: 10,
                rotateSensitivity: 0.001
            })
            orbit2.attach()

            listeners1.pointerdown({pointerId: 1, clientX: 100, clientY: 100})
            listeners1.pointermove({pointerId: 1, clientX: 200, clientY: 100, buttons: 1})

            listeners2.pointerdown({pointerId: 1, clientX: 100, clientY: 100})
            listeners2.pointermove({pointerId: 1, clientX: 200, clientY: 100, buttons: 1})

            expect(Math.abs(orbit1.theta)).toBeGreaterThan(Math.abs(orbit2.theta))
        })

    })


    describe('update', () => {

        test('positions camera from spherical coordinates', () => {
            new OrbitCamera(camera3d, canvas, {
                theta: 0,
                phi: Math.PI / 2,
                radius: 10
            })

            expectClose(camera3d.position.x, 0)
            expectClose(camera3d.position.y, 0)
            expectClose(camera3d.position.z, 10)
        })

        test('theta rotates around Y axis', () => {
            new OrbitCamera(camera3d, canvas, {
                theta: Math.PI / 2,
                phi: Math.PI / 2,
                radius: 10
            })

            expectClose(camera3d.position.x, 10)
            expectClose(camera3d.position.y, 0)
            expectClose(camera3d.position.z, 0)
        })

        test('phi controls elevation', () => {
            new OrbitCamera(camera3d, canvas, {
                theta: 0,
                phi: 0.1,
                radius: 10
            })

            expect(camera3d.position.y).toBeGreaterThan(9)
        })

        test('target offsets camera position', () => {
            new OrbitCamera(camera3d, canvas, {
                theta: 0,
                phi: Math.PI / 2,
                radius: 10,
                target: new Vec3(5, 0, 0)
            })

            expectClose(camera3d.position.x, 5)
            expectClose(camera3d.position.z, 10)
        })

        test('calls lookAt on camera', () => {
            new OrbitCamera(camera3d, canvas)

            expect(camera3d.lookAt).toHaveBeenCalled()
        })

    })


    describe('constraints', () => {

        test('phi is clamped on set', () => {
            const orbit = new OrbitCamera(camera3d, canvas)

            orbit.phi = 0
            expect(orbit.phi).toBe(0.1)

            orbit.phi = Math.PI
            expectClose(orbit.phi, Math.PI / 2 - 0.1)
        })

        test('radius is clamped on set', () => {
            const orbit = new OrbitCamera(camera3d, canvas)

            orbit.radius = 0
            expect(orbit.radius).toBe(1)

            orbit.radius = 100
            expect(orbit.radius).toBe(50)
        })

        test('theta is not clamped', () => {
            const orbit = new OrbitCamera(camera3d, canvas)

            orbit.theta = 10 * Math.PI
            expect(orbit.theta).toBe(10 * Math.PI)

            orbit.theta = -5 * Math.PI
            expect(orbit.theta).toBe(-5 * Math.PI)
        })

        test('custom constraints', () => {
            const orbit = new OrbitCamera(camera3d, canvas, {
                minRadius: 5,
                maxRadius: 20,
                minPhi: 0.5,
                maxPhi: 1.0
            })

            orbit.radius = 2
            expect(orbit.radius).toBe(5)

            orbit.radius = 30
            expect(orbit.radius).toBe(20)

            orbit.phi = 0.2
            expect(orbit.phi).toBe(0.5)

            orbit.phi = 1.5
            expect(orbit.phi).toBe(1.0)
        })

    })


    describe('interceptor', () => {

        test('interceptor blocks pointer events when returning true', () => {
            const orbit = new OrbitCamera(camera3d, canvas)
            const listeners = {}
            canvas.addEventListener = vi.fn((type, fn) => {
                listeners[type] = fn
            })
            orbit.attach()

            orbit.interceptor = () => true

            listeners.pointerdown({pointerId: 1, clientX: 100, clientY: 100})
            listeners.pointermove({pointerId: 1, clientX: 110, clientY: 110, buttons: 1})
            listeners.pointerup({pointerId: 1})

            expect(canvas.setPointerCapture).not.toHaveBeenCalled()
        })

        test('interceptor allows events when returning false', () => {
            const orbit = new OrbitCamera(camera3d, canvas)
            const listeners = {}
            canvas.addEventListener = vi.fn((type, fn) => {
                listeners[type] = fn
            })
            orbit.attach()

            orbit.interceptor = () => false

            listeners.pointerdown({pointerId: 1, clientX: 100, clientY: 100})
            expect(canvas.setPointerCapture).toHaveBeenCalledWith(1)
        })

        test('no interceptor lets events through', () => {
            const orbit = new OrbitCamera(camera3d, canvas)
            const listeners = {}
            canvas.addEventListener = vi.fn((type, fn) => {
                listeners[type] = fn
            })
            orbit.attach()

            listeners.pointerdown({pointerId: 1, clientX: 100, clientY: 100})
            expect(canvas.setPointerCapture).toHaveBeenCalledWith(1)
        })

    })


    describe('wheel zoom', () => {

        test('wheel scrolling changes radius', () => {
            const orbit = new OrbitCamera(camera3d, canvas, {radius: 10})
            const listeners = {}
            canvas.addEventListener = vi.fn((type, fn) => {
                listeners[type] = fn
            })
            orbit.attach()

            const initialRadius = orbit.radius

            listeners.wheel({deltaY: 100, preventDefault: vi.fn()})

            expect(orbit.radius).toBeGreaterThan(initialRadius)
        })

        test('wheel zoom respects constraints', () => {
            const orbit = new OrbitCamera(camera3d, canvas, {
                radius: 10,
                minRadius: 5,
                maxRadius: 15
            })
            const listeners = {}
            canvas.addEventListener = vi.fn((type, fn) => {
                listeners[type] = fn
            })
            orbit.attach()

            listeners.wheel({deltaY: 10000, preventDefault: vi.fn()})
            expect(orbit.radius).toBe(15)

            listeners.wheel({deltaY: -10000, preventDefault: vi.fn()})
            expect(orbit.radius).toBe(5)
        })

        test('wheel prevents default', () => {
            const orbit = new OrbitCamera(camera3d, canvas)
            const listeners = {}
            canvas.addEventListener = vi.fn((type, fn) => {
                listeners[type] = fn
            })
            orbit.attach()

            const preventDefault = vi.fn()
            listeners.wheel({deltaY: 100, preventDefault})

            expect(preventDefault).toHaveBeenCalled()
        })

    })


    describe('pointer orbit', () => {

        test('dragging changes theta and phi', () => {
            const orbit = new OrbitCamera(camera3d, canvas, {
                theta: 0,
                phi: Math.PI / 4,
                radius: 10
            })
            const listeners = {}
            canvas.addEventListener = vi.fn((type, fn) => {
                listeners[type] = fn
            })
            orbit.attach()

            const initialTheta = orbit.theta
            const initialPhi = orbit.phi

            listeners.pointerdown({pointerId: 1, clientX: 100, clientY: 100})
            listeners.pointermove({pointerId: 1, clientX: 200, clientY: 150, buttons: 1})

            expect(orbit.theta).not.toBe(initialTheta)
            expect(orbit.phi).not.toBe(initialPhi)
        })

        test('pointer move without prior pointerdown is ignored', () => {
            const orbit = new OrbitCamera(camera3d, canvas, {
                theta: 0,
                phi: Math.PI / 4
            })
            const listeners = {}
            canvas.addEventListener = vi.fn((type, fn) => {
                listeners[type] = fn
            })
            orbit.attach()

            const initialTheta = orbit.theta
            const initialPhi = orbit.phi

            listeners.pointermove({pointerId: 1, clientX: 200, clientY: 150, buttons: 1})

            expect(orbit.theta).toBe(initialTheta)
            expect(orbit.phi).toBe(initialPhi)
        })

    })


    describe('attach / detach', () => {

        test('attach registers event listeners', () => {
            const orbit = new OrbitCamera(camera3d, canvas)
            orbit.attach()

            expect(canvas.addEventListener).toHaveBeenCalledWith('pointerdown', expect.any(Function))
            expect(canvas.addEventListener).toHaveBeenCalledWith('pointermove', expect.any(Function))
            expect(canvas.addEventListener).toHaveBeenCalledWith('pointerup', expect.any(Function))
            expect(canvas.addEventListener).toHaveBeenCalledWith('pointercancel', expect.any(Function))
            expect(canvas.addEventListener).toHaveBeenCalledWith('wheel', expect.any(Function), {passive: false})
        })

        test('attach sets touchAction to none', () => {
            const orbit = new OrbitCamera(camera3d, canvas)
            orbit.attach()

            expect(canvas.style.touchAction).toBe('none')
        })

        test('detach removes event listeners', () => {
            const orbit = new OrbitCamera(camera3d, canvas)
            orbit.attach()
            orbit.detach()

            expect(canvas.removeEventListener).toHaveBeenCalledWith('pointerdown', expect.any(Function))
            expect(canvas.removeEventListener).toHaveBeenCalledWith('pointermove', expect.any(Function))
            expect(canvas.removeEventListener).toHaveBeenCalledWith('pointerup', expect.any(Function))
            expect(canvas.removeEventListener).toHaveBeenCalledWith('pointercancel', expect.any(Function))
            expect(canvas.removeEventListener).toHaveBeenCalledWith('wheel', expect.any(Function))
        })

    })

})
