import Vec2 from './vec2'


describe('Vec2', () => {

    test('constructor with x and y', () => {
        const vec = new Vec2(1, 2)
        expect(vec.x).toBe(1)
        expect(vec.y).toBe(2)
    })


    test('constructor with object', () => {
        const vec = new Vec2({x: 3, y: 4})
        expect(vec.x).toBe(3)
        expect(vec.y).toBe(4)
    })


    test('constructor with array', () => {
        const vec = new Vec2([7, 8])
        expect(vec.x).toBe(7)
        expect(vec.y).toBe(8)
    })


    test('constructor with no parameters', () => {
        const vec = new Vec2()
        expect(vec.x).toBe(0)
        expect(vec.y).toBe(0)
    })


    test('constructor with only x', () => {
        const vec = new Vec2(5)
        expect(vec.x).toBe(5)
        expect(vec.y).toBe(0)
    })


    test('equals method', () => {
        const vec1 = new Vec2(1, 2)
        const vec2 = new Vec2(1, 2)
        const vec3 = new Vec2(3, 4)
        const vec4 = {x: 1, y: 2, z: 0} // Object with extra property

        expect(vec1.equals(vec2)).toBe(true)
        expect(vec1.equals(vec3)).toBe(false)
        expect(vec1.equals(vec4)).toBe(true)
    })

})
