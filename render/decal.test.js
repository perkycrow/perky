import Decal from './decal.js'
import Object3D from './object_3d.js'


describe('Decal', () => {

    test('extends Object3D', () => {
        const decal = new Decal()
        expect(decal).toBeInstanceOf(Object3D)
    })


    test('default values', () => {
        const decal = new Decal()
        expect(decal.material).toBe(null)
        expect(decal.width).toBe(1)
        expect(decal.height).toBe(1)
    })


    test('custom values', () => {
        const mat = {color: [1, 0, 0]}
        const decal = new Decal({
            x: 1,
            y: 2,
            z: 3,
            material: mat,
            width: 0.5,
            height: 0.3
        })
        expect(decal.position.x).toBe(1)
        expect(decal.position.y).toBe(2)
        expect(decal.position.z).toBe(3)
        expect(decal.material).toBe(mat)
        expect(decal.width).toBe(0.5)
        expect(decal.height).toBe(0.3)
    })


    test('inherits visibility and opacity', () => {
        const decal = new Decal({visible: false, opacity: 0.5})
        expect(decal.visible).toBe(false)
        expect(decal.opacity).toBe(0.5)
    })

})
