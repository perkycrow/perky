import Light3D from './light_3d.js'
import Vec3 from '../math/vec3.js'


describe('Light3D', () => {

    test('default values', () => {
        const light = new Light3D()
        expect(light.position).toBeInstanceOf(Vec3)
        expect(light.position.x).toBe(0)
        expect(light.position.y).toBe(0)
        expect(light.position.z).toBe(0)
        expect(light.color).toEqual([1, 1, 1])
        expect(light.intensity).toBe(1)
        expect(light.radius).toBe(10)
    })


    test('with all options', () => {
        const light = new Light3D({
            x: 5,
            y: 3,
            z: -10,
            color: [1, 0.9, 0.7],
            intensity: 1.5,
            radius: 8
        })
        expect(light.position.x).toBe(5)
        expect(light.position.y).toBe(3)
        expect(light.position.z).toBe(-10)
        expect(light.color).toEqual([1, 0.9, 0.7])
        expect(light.intensity).toBe(1.5)
        expect(light.radius).toBe(8)
    })


    test('partial options keep defaults', () => {
        const light = new Light3D({x: 2, intensity: 0.5})
        expect(light.position.x).toBe(2)
        expect(light.position.y).toBe(0)
        expect(light.color).toEqual([1, 1, 1])
        expect(light.intensity).toBe(0.5)
        expect(light.radius).toBe(10)
    })

})
