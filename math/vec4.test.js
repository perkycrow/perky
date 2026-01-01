import Vec4 from './vec4.js'


describe('Vec4', () => {

    describe('constructor', () => {

        test('with x, y, z and w', () => {
            const vec = new Vec4(1, 2, 3, 4)
            expect(vec.x).toBe(1)
            expect(vec.y).toBe(2)
            expect(vec.z).toBe(3)
            expect(vec.w).toBe(4)
        })

        test('with object', () => {
            const vec = new Vec4({x: 3, y: 4, z: 5, w: 6})
            expect(vec.x).toBe(3)
            expect(vec.y).toBe(4)
            expect(vec.z).toBe(5)
            expect(vec.w).toBe(6)
        })

        test('with array', () => {
            const vec = new Vec4([7, 8, 9, 10])
            expect(vec.x).toBe(7)
            expect(vec.y).toBe(8)
            expect(vec.z).toBe(9)
            expect(vec.w).toBe(10)
        })

        test('with no parameters defaults w to 1', () => {
            const vec = new Vec4()
            expect(vec.x).toBe(0)
            expect(vec.y).toBe(0)
            expect(vec.z).toBe(0)
            expect(vec.w).toBe(1)
        })

        test('with only x', () => {
            const vec = new Vec4(5)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(0)
            expect(vec.z).toBe(0)
            expect(vec.w).toBe(1)
        })

        test('with x, y and z', () => {
            const vec = new Vec4(5, 6, 7)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(6)
            expect(vec.z).toBe(7)
            expect(vec.w).toBe(1)
        })

    })


    describe('setters', () => {

        test('set', () => {
            const vec = new Vec4()
            expect(vec.set(3, 4, 5, 6)).toBe(vec)
            expect(vec.x).toBe(3)
            expect(vec.y).toBe(4)
            expect(vec.z).toBe(5)
            expect(vec.w).toBe(6)
        })

        test('setX', () => {
            const vec = new Vec4(1, 2, 3, 4)
            expect(vec.setX(5)).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(2)
            expect(vec.z).toBe(3)
            expect(vec.w).toBe(4)
        })

        test('setY', () => {
            const vec = new Vec4(1, 2, 3, 4)
            expect(vec.setY(6)).toBe(vec)
            expect(vec.x).toBe(1)
            expect(vec.y).toBe(6)
            expect(vec.z).toBe(3)
            expect(vec.w).toBe(4)
        })

        test('setZ', () => {
            const vec = new Vec4(1, 2, 3, 4)
            expect(vec.setZ(7)).toBe(vec)
            expect(vec.x).toBe(1)
            expect(vec.y).toBe(2)
            expect(vec.z).toBe(7)
            expect(vec.w).toBe(4)
        })

        test('setW', () => {
            const vec = new Vec4(1, 2, 3, 4)
            expect(vec.setW(8)).toBe(vec)
            expect(vec.x).toBe(1)
            expect(vec.y).toBe(2)
            expect(vec.z).toBe(3)
            expect(vec.w).toBe(8)
        })

        test('setScalar', () => {
            const vec = new Vec4()
            expect(vec.setScalar(7)).toBe(vec)
            expect(vec.x).toBe(7)
            expect(vec.y).toBe(7)
            expect(vec.z).toBe(7)
            expect(vec.w).toBe(7)
        })

        test('setComponent', () => {
            const vec = new Vec4(1, 2, 3, 4)
            expect(vec.setComponent(0, 10)).toBe(vec)
            expect(vec.x).toBe(10)
            expect(vec.setComponent(1, 20)).toBe(vec)
            expect(vec.y).toBe(20)
            expect(vec.setComponent(2, 30)).toBe(vec)
            expect(vec.z).toBe(30)
            expect(vec.setComponent(3, 40)).toBe(vec)
            expect(vec.w).toBe(40)
        })

        test('setComponent throws on invalid index', () => {
            const vec = new Vec4()
            expect(() => {
                vec.setComponent(4, 5)
            }).toThrow('index out of range: 4')
        })

    })


    describe('copy and clone', () => {

        test('copy', () => {
            const vec1 = new Vec4(1, 2, 3, 4)
            const vec2 = new Vec4(5, 6, 7, 8)
            expect(vec1.copy(vec2)).toBe(vec1)
            expect(vec1.x).toBe(5)
            expect(vec1.y).toBe(6)
            expect(vec1.z).toBe(7)
            expect(vec1.w).toBe(8)
        })

        test('copy from Vec3', () => {
            const vec1 = new Vec4(1, 2, 3, 4)
            const vec3 = {x: 5, y: 6, z: 7}
            expect(vec1.copy(vec3)).toBe(vec1)
            expect(vec1.x).toBe(5)
            expect(vec1.y).toBe(6)
            expect(vec1.z).toBe(7)
            expect(vec1.w).toBe(1)
        })

        test('clone', () => {
            const vec1 = new Vec4(5, 6, 7, 8)
            const vec2 = vec1.clone()
            expect(vec2).not.toBe(vec1)
            expect(vec2.x).toBe(5)
            expect(vec2.y).toBe(6)
            expect(vec2.z).toBe(7)
            expect(vec2.w).toBe(8)
        })

    })


    describe('addition', () => {

        test('add', () => {
            const vec = new Vec4(1, 2, 3, 4)
            expect(vec.add(new Vec4(5, 6, 7, 8))).toBe(vec)
            expect(vec.x).toBe(6)
            expect(vec.y).toBe(8)
            expect(vec.z).toBe(10)
            expect(vec.w).toBe(12)
        })

        test('addScalar', () => {
            const vec = new Vec4(1, 2, 3, 4)
            expect(vec.addScalar(5)).toBe(vec)
            expect(vec.x).toBe(6)
            expect(vec.y).toBe(7)
            expect(vec.z).toBe(8)
            expect(vec.w).toBe(9)
        })

        test('addVectors', () => {
            const vec = new Vec4()
            expect(vec.addVectors(new Vec4(1, 2, 3, 4), new Vec4(5, 6, 7, 8))).toBe(vec)
            expect(vec.x).toBe(6)
            expect(vec.y).toBe(8)
            expect(vec.z).toBe(10)
            expect(vec.w).toBe(12)
        })

        test('addScaledVector', () => {
            const vec = new Vec4(1, 2, 3, 4)
            expect(vec.addScaledVector(new Vec4(2, 3, 4, 5), 2)).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(8)
            expect(vec.z).toBe(11)
            expect(vec.w).toBe(14)
        })

    })


    describe('subtraction', () => {

        test('sub', () => {
            const vec = new Vec4(10, 12, 14, 16)
            expect(vec.sub(new Vec4(2, 3, 4, 5))).toBe(vec)
            expect(vec.x).toBe(8)
            expect(vec.y).toBe(9)
            expect(vec.z).toBe(10)
            expect(vec.w).toBe(11)
        })

        test('subScalar', () => {
            const vec = new Vec4(10, 20, 30, 40)
            expect(vec.subScalar(5)).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(15)
            expect(vec.z).toBe(25)
            expect(vec.w).toBe(35)
        })

        test('subVectors', () => {
            const vec = new Vec4()
            expect(vec.subVectors(new Vec4(10, 12, 14, 16), new Vec4(3, 4, 5, 6))).toBe(vec)
            expect(vec.x).toBe(7)
            expect(vec.y).toBe(8)
            expect(vec.z).toBe(9)
            expect(vec.w).toBe(10)
        })

    })


    describe('multiplication', () => {

        test('multiply', () => {
            const vec = new Vec4(2, 3, 4, 5)
            expect(vec.multiply(new Vec4(4, 5, 6, 7))).toBe(vec)
            expect(vec.x).toBe(8)
            expect(vec.y).toBe(15)
            expect(vec.z).toBe(24)
            expect(vec.w).toBe(35)
        })

        test('multiplyScalar', () => {
            const vec = new Vec4(3, 4, 5, 6)
            expect(vec.multiplyScalar(2)).toBe(vec)
            expect(vec.x).toBe(6)
            expect(vec.y).toBe(8)
            expect(vec.z).toBe(10)
            expect(vec.w).toBe(12)
        })

    })


    describe('division', () => {

        test('divide', () => {
            const vec = new Vec4(12, 20, 30, 42)
            expect(vec.divide(new Vec4(3, 4, 5, 6))).toBe(vec)
            expect(vec.x).toBe(4)
            expect(vec.y).toBe(5)
            expect(vec.z).toBe(6)
            expect(vec.w).toBe(7)
        })

        test('divideScalar', () => {
            const vec = new Vec4(10, 20, 30, 40)
            expect(vec.divideScalar(2)).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(10)
            expect(vec.z).toBe(15)
            expect(vec.w).toBe(20)
        })

    })


    describe('vector operations', () => {

        test('dot', () => {
            const vec1 = new Vec4(1, 2, 3, 4)
            const vec2 = new Vec4(5, 6, 7, 8)
            expect(vec1.dot(vec2)).toBe(70)
        })

        test('lengthSq', () => {
            const vec = new Vec4(1, 2, 2, 4)
            expect(vec.lengthSq()).toBe(25)
        })

        test('length', () => {
            const vec = new Vec4(1, 2, 2, 4)
            expect(vec.length()).toBe(5)
        })

        test('manhattanLength', () => {
            const vec = new Vec4(3, -4, 5, -6)
            expect(vec.manhattanLength()).toBe(18)
        })

        test('normalize', () => {
            const vec = new Vec4(0, 0, 0, 5)
            expect(vec.normalize()).toBe(vec)
            expect(vec.x).toBeCloseTo(0)
            expect(vec.y).toBeCloseTo(0)
            expect(vec.z).toBeCloseTo(0)
            expect(vec.w).toBeCloseTo(1)
            expect(vec.length()).toBeCloseTo(1)
        })

        test('normalize zero vector', () => {
            const vec = new Vec4(0, 0, 0, 0)
            expect(vec.normalize()).toBe(vec)
            expect(vec.x).toBe(0)
            expect(vec.y).toBe(0)
            expect(vec.z).toBe(0)
            expect(vec.w).toBe(0)
        })

        test('setLength', () => {
            const vec = new Vec4(0, 0, 0, 5)
            expect(vec.setLength(10)).toBe(vec)
            expect(vec.length()).toBeCloseTo(10)
            expect(vec.w).toBeCloseTo(10)
        })

    })


    describe('interpolation', () => {

        test('lerp', () => {
            const vec = new Vec4(0, 0, 0, 0)
            expect(vec.lerp(new Vec4(10, 20, 30, 40), 0.5)).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(10)
            expect(vec.z).toBe(15)
            expect(vec.w).toBe(20)
        })

        test('lerp at 0', () => {
            const vec = new Vec4(1, 2, 3, 4)
            vec.lerp(new Vec4(10, 20, 30, 40), 0)
            expect(vec.x).toBe(1)
            expect(vec.y).toBe(2)
            expect(vec.z).toBe(3)
            expect(vec.w).toBe(4)
        })

        test('lerp at 1', () => {
            const vec = new Vec4(1, 2, 3, 4)
            vec.lerp(new Vec4(10, 20, 30, 40), 1)
            expect(vec.x).toBe(10)
            expect(vec.y).toBe(20)
            expect(vec.z).toBe(30)
            expect(vec.w).toBe(40)
        })

        test('lerpVectors', () => {
            const vec = new Vec4()
            expect(vec.lerpVectors(new Vec4(0, 0, 0, 0), new Vec4(10, 20, 30, 40), 0.5)).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(10)
            expect(vec.z).toBe(15)
            expect(vec.w).toBe(20)
        })

    })


    describe('comparison', () => {

        test('equals with Vec4', () => {
            const vec1 = new Vec4(1, 2, 3, 4)
            const vec2 = new Vec4(1, 2, 3, 4)
            const vec3 = new Vec4(5, 6, 7, 8)
            expect(vec1.equals(vec2)).toBe(true)
            expect(vec1.equals(vec3)).toBe(false)
        })

        test('equals with object', () => {
            const vec1 = new Vec4(1, 2, 3, 4)
            const obj = {x: 1, y: 2, z: 3, w: 4}
            expect(vec1.equals(obj)).toBe(true)
        })

    })


    describe('array conversion', () => {

        test('fromArray', () => {
            const vec = new Vec4()
            expect(vec.fromArray([5, 6, 7, 8])).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(6)
            expect(vec.z).toBe(7)
            expect(vec.w).toBe(8)
        })

        test('fromArray with offset', () => {
            const vec = new Vec4()
            vec.fromArray([1, 2, 3, 4, 5, 6], 2)
            expect(vec.x).toBe(3)
            expect(vec.y).toBe(4)
            expect(vec.z).toBe(5)
            expect(vec.w).toBe(6)
        })

        test('toArray', () => {
            const vec = new Vec4(7, 8, 9, 10)
            const arr = vec.toArray()
            expect(arr).toEqual([7, 8, 9, 10])
        })

        test('toArray with existing array', () => {
            const vec = new Vec4(9, 10, 11, 12)
            const arr = [1, 2, 3, 4, 5, 6]
            expect(vec.toArray(arr, 2)).toBe(arr)
            expect(arr).toEqual([1, 2, 9, 10, 11, 12])
        })

    })


    describe('negation and min/max', () => {

        test('negate', () => {
            const vec = new Vec4(3, -4, 5, -6)
            expect(vec.negate()).toBe(vec)
            expect(vec.x).toBe(-3)
            expect(vec.y).toBe(4)
            expect(vec.z).toBe(-5)
            expect(vec.w).toBe(6)
        })

        test('min', () => {
            const vec = new Vec4(5, 2, 7, 3)
            expect(vec.min(new Vec4(3, 4, 6, 5))).toBe(vec)
            expect(vec.x).toBe(3)
            expect(vec.y).toBe(2)
            expect(vec.z).toBe(6)
            expect(vec.w).toBe(3)
        })

        test('max', () => {
            const vec = new Vec4(5, 2, 7, 3)
            expect(vec.max(new Vec4(3, 4, 6, 5))).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(4)
            expect(vec.z).toBe(7)
            expect(vec.w).toBe(5)
        })

    })


    describe('clamping', () => {

        test('clamp', () => {
            const vec = new Vec4(15, -5, 25, -10)
            expect(vec.clamp(new Vec4(0, 0, 0, 0), new Vec4(10, 10, 10, 10))).toBe(vec)
            expect(vec.x).toBe(10)
            expect(vec.y).toBe(0)
            expect(vec.z).toBe(10)
            expect(vec.w).toBe(0)
        })

        test('clampScalar', () => {
            const vec = new Vec4(15, -5, 7, 12)
            expect(vec.clampScalar(0, 10)).toBe(vec)
            expect(vec.x).toBe(10)
            expect(vec.y).toBe(0)
            expect(vec.z).toBe(7)
            expect(vec.w).toBe(10)
        })

        test('clampLength min', () => {
            const vec = new Vec4(1, 0, 0, 0)
            vec.clampLength(5, 10)
            expect(vec.length()).toBeCloseTo(5)
        })

        test('clampLength max', () => {
            const vec = new Vec4(20, 0, 0, 0)
            vec.clampLength(5, 10)
            expect(vec.length()).toBeCloseTo(10)
        })

        test('clampLength in range', () => {
            const vec = new Vec4(7, 0, 0, 0)
            vec.clampLength(5, 10)
            expect(vec.length()).toBeCloseTo(7)
        })

    })


    describe('rounding', () => {

        test('floor', () => {
            const vec = new Vec4(1.7, 2.3, 3.9, 4.1)
            expect(vec.floor()).toBe(vec)
            expect(vec.x).toBe(1)
            expect(vec.y).toBe(2)
            expect(vec.z).toBe(3)
            expect(vec.w).toBe(4)
        })

        test('ceil', () => {
            const vec = new Vec4(1.3, 2.7, 3.1, 4.9)
            expect(vec.ceil()).toBe(vec)
            expect(vec.x).toBe(2)
            expect(vec.y).toBe(3)
            expect(vec.z).toBe(4)
            expect(vec.w).toBe(5)
        })

        test('round', () => {
            const vec = new Vec4(1.4, 2.6, 3.5, 4.4)
            expect(vec.round()).toBe(vec)
            expect(vec.x).toBe(1)
            expect(vec.y).toBe(3)
            expect(vec.z).toBe(4)
            expect(vec.w).toBe(4)
        })

        test('roundToZero positive', () => {
            const vec = new Vec4(1.9, 2.9, 3.9, 4.9)
            expect(vec.roundToZero()).toBe(vec)
            expect(vec.x).toBe(1)
            expect(vec.y).toBe(2)
            expect(vec.z).toBe(3)
            expect(vec.w).toBe(4)
        })

        test('roundToZero negative', () => {
            const vec = new Vec4(-1.9, -2.9, -3.9, -4.9)
            vec.roundToZero()
            expect(vec.x).toBe(-1)
            expect(vec.y).toBe(-2)
            expect(vec.z).toBe(-3)
            expect(vec.w).toBe(-4)
        })

    })


    test('random', () => {
        const vec = new Vec4()
        expect(vec.random()).toBe(vec)
        expect(vec.x).toBeGreaterThanOrEqual(0)
        expect(vec.x).toBeLessThan(1)
        expect(vec.y).toBeGreaterThanOrEqual(0)
        expect(vec.y).toBeLessThan(1)
        expect(vec.z).toBeGreaterThanOrEqual(0)
        expect(vec.z).toBeLessThan(1)
        expect(vec.w).toBeGreaterThanOrEqual(0)
        expect(vec.w).toBeLessThan(1)
    })


    describe('component access', () => {

        test('getComponent', () => {
            const vec = new Vec4(5, 7, 9, 11)
            expect(vec.getComponent(0)).toBe(5)
            expect(vec.getComponent(1)).toBe(7)
            expect(vec.getComponent(2)).toBe(9)
            expect(vec.getComponent(3)).toBe(11)
        })

        test('getComponent throws on invalid index', () => {
            const vec = new Vec4()
            expect(() => {
                vec.getComponent(4)
            }).toThrow('index out of range: 4')
        })

    })


    describe('aliases', () => {

        test('width getter', () => {
            const vec = new Vec4(10, 20, 30, 40)
            expect(vec.width).toBe(30)
        })

        test('width setter', () => {
            const vec = new Vec4()
            vec.width = 15
            expect(vec.z).toBe(15)
        })

        test('height getter', () => {
            const vec = new Vec4(10, 20, 30, 40)
            expect(vec.height).toBe(40)
        })

        test('height setter', () => {
            const vec = new Vec4()
            vec.height = 25
            expect(vec.w).toBe(25)
        })

    })


    test('isVector4', () => {
        const vec = new Vec4()
        expect(vec.isVector4).toBe(true)
    })


    describe('iteration', () => {

        test('iterator', () => {
            const vec = new Vec4(3, 4, 5, 6)
            const [x, y, z, w] = vec
            expect(x).toBe(3)
            expect(y).toBe(4)
            expect(z).toBe(5)
            expect(w).toBe(6)
        })

        test('spread operator', () => {
            const vec = new Vec4(5, 6, 7, 8)
            const arr = [...vec]
            expect(arr).toEqual([5, 6, 7, 8])
        })

    })

})
