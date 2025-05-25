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

})
