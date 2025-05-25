import Vec4 from './vec4'


describe('Vec4', () => {

    test('constructor with x, y, z and w', () => {
        const vec = new Vec4(1, 2, 3, 4)
        expect(vec.x).toBe(1)
        expect(vec.y).toBe(2)
        expect(vec.z).toBe(3)
        expect(vec.w).toBe(4)
    })


    test('constructor with object', () => {
        const vec = new Vec4({x: 3, y: 4, z: 5, w: 6})
        expect(vec.x).toBe(3)
        expect(vec.y).toBe(4)
        expect(vec.z).toBe(5)
        expect(vec.w).toBe(6)
    })


    test('constructor with array', () => {
        const vec = new Vec4([7, 8, 9, 10])
        expect(vec.x).toBe(7)
        expect(vec.y).toBe(8)
        expect(vec.z).toBe(9)
        expect(vec.w).toBe(10)
    })


    test('constructor with no parameters', () => {
        const vec = new Vec4()
        expect(vec.x).toBe(0)
        expect(vec.y).toBe(0)
        expect(vec.z).toBe(0)
        expect(vec.w).toBe(1)
    })


    test('constructor with only x', () => {
        const vec = new Vec4(5)
        expect(vec.x).toBe(5)
        expect(vec.y).toBe(0)
        expect(vec.z).toBe(0)
        expect(vec.w).toBe(1)
    })

})
