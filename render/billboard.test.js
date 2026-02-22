import Billboard from './billboard.js'
import Object3D from './object_3d.js'


describe('Billboard', () => {

    test('extends Object3D', () => {
        const bb = new Billboard()
        expect(bb).toBeInstanceOf(Object3D)
    })


    test('default values', () => {
        const bb = new Billboard()
        expect(bb.material).toBe(null)
        expect(bb.width).toBe(1)
        expect(bb.height).toBe(1)
    })


    test('custom values', () => {
        const mat = {color: [1, 0, 0]}
        const bb = new Billboard({
            x: 1,
            y: 2,
            z: 3,
            material: mat,
            width: 0.5,
            height: 0.3
        })
        expect(bb.position.x).toBe(1)
        expect(bb.position.y).toBe(2)
        expect(bb.position.z).toBe(3)
        expect(bb.material).toBe(mat)
        expect(bb.width).toBe(0.5)
        expect(bb.height).toBe(0.3)
    })


    test('inherits visibility and opacity', () => {
        const bb = new Billboard({visible: false, opacity: 0.5})
        expect(bb.visible).toBe(false)
        expect(bb.opacity).toBe(0.5)
    })

})
