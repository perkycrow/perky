import {
    gizmoArrowPositions,
    pickGizmoArrow,
    GIZMO_AXES,
    GIZMO_LENGTH,
    GIZMO_THICKNESS
} from './forge_gizmo.js'
import Vec3 from '../math/vec3.js'
import Camera3D from '../render/camera_3d.js'


describe('GIZMO_AXES', () => {

    test('has 3 axes', () => {
        expect(GIZMO_AXES.length).toBe(3)
    })


    test('X axis is red', () => {
        expect(GIZMO_AXES[0].axis.x).toBe(1)
        expect(GIZMO_AXES[0].color[0]).toBeGreaterThan(0.5)
    })


    test('Y axis is green', () => {
        expect(GIZMO_AXES[1].axis.y).toBe(1)
        expect(GIZMO_AXES[1].color[1]).toBeGreaterThan(0.5)
    })


    test('Z axis is blue', () => {
        expect(GIZMO_AXES[2].axis.z).toBe(1)
        expect(GIZMO_AXES[2].color[2]).toBeGreaterThan(0.5)
    })

})


describe('gizmoArrowPositions', () => {

    test('returns Float32Array with 18 elements', () => {
        const positions = gizmoArrowPositions(new Vec3(0, 0, 0))
        expect(positions).toBeInstanceOf(Float32Array)
        expect(positions.length).toBe(18)
    })


    test('X arrow starts at center and ends at GIZMO_LENGTH along X', () => {
        const center = new Vec3(1, 2, 3)
        const positions = gizmoArrowPositions(center)

        expect(positions[0]).toBe(1)
        expect(positions[1]).toBe(2)
        expect(positions[2]).toBe(3)

        expect(positions[3]).toBeCloseTo(1 + GIZMO_LENGTH)
        expect(positions[4]).toBeCloseTo(2)
        expect(positions[5]).toBeCloseTo(3)
    })


    test('Y arrow starts at center and ends at GIZMO_LENGTH along Y', () => {
        const center = new Vec3(0, 0, 0)
        const positions = gizmoArrowPositions(center)

        expect(positions[6]).toBe(0)
        expect(positions[7]).toBe(0)
        expect(positions[8]).toBe(0)

        expect(positions[9]).toBeCloseTo(0)
        expect(positions[10]).toBeCloseTo(GIZMO_LENGTH)
        expect(positions[11]).toBeCloseTo(0)
    })


    test('Z arrow starts at center and ends at GIZMO_LENGTH along Z', () => {
        const center = new Vec3(0, 0, 0)
        const positions = gizmoArrowPositions(center)

        expect(positions[12]).toBe(0)
        expect(positions[13]).toBe(0)
        expect(positions[14]).toBe(0)

        expect(positions[15]).toBeCloseTo(0)
        expect(positions[16]).toBeCloseTo(0)
        expect(positions[17]).toBeCloseTo(GIZMO_LENGTH)
    })

})


describe('pickGizmoArrow', () => {

    function createCamera () {
        return new Camera3D({
            x: 5,
            y: 5,
            z: 5,
            fov: Math.PI / 4,
            aspect: 1,
            near: 0.1,
            far: 100
        })
    }

    function createCanvas () {
        return {getBoundingClientRect: () => ({left: 0, top: 0, width: 400, height: 400})}
    }


    test('returns -1 when missing all arrows', () => {
        const camera = createCamera()
        const canvas = createCanvas()
        const result = pickGizmoArrow({camera3d: camera, clientX: 0, clientY: 0, canvas, center: new Vec3(0, 0, 0)})
        expect(result).toBe(-1)
    })


    test('exports GIZMO_LENGTH constant', () => {
        expect(typeof GIZMO_LENGTH).toBe('number')
        expect(GIZMO_LENGTH).toBeGreaterThan(0)
    })


    test('exports GIZMO_THICKNESS constant', () => {
        expect(typeof GIZMO_THICKNESS).toBe('number')
        expect(GIZMO_THICKNESS).toBeGreaterThan(0)
    })

})
