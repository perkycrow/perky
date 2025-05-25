import Vec3 from './vec3'


describe('Vec3', () => {

    test('constructor with x, y and z', () => {
        const vec = new Vec3(1, 2, 3)
        expect(vec.x).toBe(1)
        expect(vec.y).toBe(2)
        expect(vec.z).toBe(3)
    })


    test('constructor with object', () => {
        const vec = new Vec3({x: 3, y: 4, z: 5})
        expect(vec.x).toBe(3)
        expect(vec.y).toBe(4)
        expect(vec.z).toBe(5)
    })


    test('constructor with no parameters', () => {
        const vec = new Vec3()
        expect(vec.x).toBe(0)
        expect(vec.y).toBe(0)
        expect(vec.z).toBe(0)
    })


    test('constructor with only x', () => {
        const vec = new Vec3(5)
        expect(vec.x).toBe(5)
        expect(vec.y).toBe(0)
        expect(vec.z).toBe(0)
    })

}) 