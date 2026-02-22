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
        expect(light.direction).toBe(null)
        expect(light.angle).toBe(30)
        expect(light.penumbra).toBe(0.15)
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


describe('spotlight', () => {

    test('creates spotlight with direction', () => {
        const light = new Light3D({direction: [0, -1, 0]})
        expect(light.direction).toBeInstanceOf(Vec3)
        expect(light.direction.x).toBe(0)
        expect(light.direction.y).toBe(-1)
        expect(light.direction.z).toBe(0)
    })


    test('custom angle and penumbra', () => {
        const light = new Light3D({
            direction: [1, 0, 0],
            angle: 45,
            penumbra: 0.3
        })
        expect(light.angle).toBe(45)
        expect(light.penumbra).toBe(0.3)
    })


    test('direction defaults components to 0 except y to -1', () => {
        const light = new Light3D({direction: [0]})
        expect(light.direction.x).toBe(0)
        expect(light.direction.y).toBe(-1)
        expect(light.direction.z).toBe(0)
    })

})
