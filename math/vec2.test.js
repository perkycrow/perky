import Vec2 from './vec2.js'


describe('Vec2', () => {

    describe('constructor', () => {

        test('with x and y', () => {
            const vec = new Vec2(1, 2)
            expect(vec.x).toBe(1)
            expect(vec.y).toBe(2)
        })

        test('with object', () => {
            const vec = new Vec2({x: 3, y: 4})
            expect(vec.x).toBe(3)
            expect(vec.y).toBe(4)
        })

        test('with array', () => {
            const vec = new Vec2([7, 8])
            expect(vec.x).toBe(7)
            expect(vec.y).toBe(8)
        })

        test('with no parameters', () => {
            const vec = new Vec2()
            expect(vec.x).toBe(0)
            expect(vec.y).toBe(0)
        })

        test('with only x', () => {
            const vec = new Vec2(5)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(0)
        })

    })


    describe('setters', () => {

        test('set', () => {
            const vec = new Vec2()
            expect(vec.set(3, 4)).toBe(vec)
            expect(vec.x).toBe(3)
            expect(vec.y).toBe(4)
        })

        test('setX', () => {
            const vec = new Vec2(1, 2)
            expect(vec.setX(5)).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(2)
        })

        test('setY', () => {
            const vec = new Vec2(1, 2)
            expect(vec.setY(6)).toBe(vec)
            expect(vec.x).toBe(1)
            expect(vec.y).toBe(6)
        })

        test('setScalar', () => {
            const vec = new Vec2()
            expect(vec.setScalar(7)).toBe(vec)
            expect(vec.x).toBe(7)
            expect(vec.y).toBe(7)
        })

        test('setComponent', () => {
            const vec = new Vec2(1, 2)
            expect(vec.setComponent(0, 10)).toBe(vec)
            expect(vec.x).toBe(10)
            expect(vec.setComponent(1, 20)).toBe(vec)
            expect(vec.y).toBe(20)
        })

        test('setComponent throws on invalid index', () => {
            const vec = new Vec2()
            expect(() => {
                vec.setComponent(2, 5)
            }).toThrow('index out of range: 2')
        })

    })


    describe('copy and clone', () => {

        test('copy', () => {
            const vec1 = new Vec2(1, 2)
            const vec2 = new Vec2(3, 4)
            expect(vec1.copy(vec2)).toBe(vec1)
            expect(vec1.x).toBe(3)
            expect(vec1.y).toBe(4)
        })

        test('clone', () => {
            const vec1 = new Vec2(5, 6)
            const vec2 = vec1.clone()
            expect(vec2).not.toBe(vec1)
            expect(vec2.x).toBe(5)
            expect(vec2.y).toBe(6)
        })

    })


    describe('addition', () => {

        test('add', () => {
            const vec = new Vec2(1, 2)
            expect(vec.add(new Vec2(3, 4))).toBe(vec)
            expect(vec.x).toBe(4)
            expect(vec.y).toBe(6)
        })

        test('addScalar', () => {
            const vec = new Vec2(1, 2)
            expect(vec.addScalar(5)).toBe(vec)
            expect(vec.x).toBe(6)
            expect(vec.y).toBe(7)
        })

        test('addVectors', () => {
            const vec = new Vec2()
            expect(vec.addVectors(new Vec2(1, 2), new Vec2(3, 4))).toBe(vec)
            expect(vec.x).toBe(4)
            expect(vec.y).toBe(6)
        })

        test('addScaledVector', () => {
            const vec = new Vec2(1, 2)
            expect(vec.addScaledVector(new Vec2(2, 3), 2)).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(8)
        })

    })


    describe('subtraction', () => {

        test('sub', () => {
            const vec = new Vec2(5, 7)
            expect(vec.sub(new Vec2(2, 3))).toBe(vec)
            expect(vec.x).toBe(3)
            expect(vec.y).toBe(4)
        })

        test('subScalar', () => {
            const vec = new Vec2(10, 20)
            expect(vec.subScalar(5)).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(15)
        })

        test('subVectors', () => {
            const vec = new Vec2()
            expect(vec.subVectors(new Vec2(8, 10), new Vec2(3, 4))).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(6)
        })

    })


    describe('multiplication', () => {

        test('multiply', () => {
            const vec = new Vec2(2, 3)
            expect(vec.multiply(new Vec2(4, 5))).toBe(vec)
            expect(vec.x).toBe(8)
            expect(vec.y).toBe(15)
        })

        test('multiplyScalar', () => {
            const vec = new Vec2(3, 4)
            expect(vec.multiplyScalar(2)).toBe(vec)
            expect(vec.x).toBe(6)
            expect(vec.y).toBe(8)
        })

    })


    describe('division', () => {

        test('divide', () => {
            const vec = new Vec2(12, 20)
            expect(vec.divide(new Vec2(3, 4))).toBe(vec)
            expect(vec.x).toBe(4)
            expect(vec.y).toBe(5)
        })

        test('divideScalar', () => {
            const vec = new Vec2(10, 20)
            expect(vec.divideScalar(2)).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(10)
        })

    })


    describe('vector operations', () => {

        test('dot', () => {
            const vec1 = new Vec2(2, 3)
            const vec2 = new Vec2(4, 5)
            expect(vec1.dot(vec2)).toBe(23)
        })

        test('cross', () => {
            const vec1 = new Vec2(2, 3)
            const vec2 = new Vec2(4, 5)
            expect(vec1.cross(vec2)).toBe(-2)
        })

        test('lengthSq', () => {
            const vec = new Vec2(3, 4)
            expect(vec.lengthSq()).toBe(25)
        })

        test('length', () => {
            const vec = new Vec2(3, 4)
            expect(vec.length()).toBe(5)
        })

        test('manhattanLength', () => {
            const vec = new Vec2(3, -4)
            expect(vec.manhattanLength()).toBe(7)
        })

        test('normalize', () => {
            const vec = new Vec2(3, 4)
            expect(vec.normalize()).toBe(vec)
            expect(vec.x).toBeCloseTo(0.6)
            expect(vec.y).toBeCloseTo(0.8)
            expect(vec.length()).toBeCloseTo(1)
        })

        test('normalize zero vector', () => {
            const vec = new Vec2(0, 0)
            expect(vec.normalize()).toBe(vec)
            expect(vec.x).toBe(0)
            expect(vec.y).toBe(0)
        })

        test('setLength', () => {
            const vec = new Vec2(3, 4)
            expect(vec.setLength(10)).toBe(vec)
            expect(vec.length()).toBeCloseTo(10)
            expect(vec.x).toBeCloseTo(6)
            expect(vec.y).toBeCloseTo(8)
        })

    })


    describe('angles', () => {

        test('angle', () => {
            const vec = new Vec2(1, 0)
            expect(vec.angle()).toBeCloseTo(0)
            const vec2 = new Vec2(0, 1)
            expect(vec2.angle()).toBeCloseTo(Math.PI / 2)
        })

        test('angleTo', () => {
            const vec1 = new Vec2(1, 0)
            const vec2 = new Vec2(0, 1)
            expect(vec1.angleTo(vec2)).toBeCloseTo(Math.PI / 2)
        })

        test('angleTo parallel vectors', () => {
            const vec1 = new Vec2(1, 0)
            const vec2 = new Vec2(2, 0)
            expect(vec1.angleTo(vec2)).toBeCloseTo(0)
        })

    })


    describe('distance', () => {

        test('distanceTo', () => {
            const vec1 = new Vec2(1, 2)
            const vec2 = new Vec2(4, 6)
            expect(vec1.distanceTo(vec2)).toBe(5)
        })

        test('distanceToSquared', () => {
            const vec1 = new Vec2(1, 2)
            const vec2 = new Vec2(4, 6)
            expect(vec1.distanceToSquared(vec2)).toBe(25)
        })

        test('manhattanDistanceTo', () => {
            const vec1 = new Vec2(1, 2)
            const vec2 = new Vec2(4, 6)
            expect(vec1.manhattanDistanceTo(vec2)).toBe(7)
        })

    })


    describe('interpolation', () => {

        test('lerp', () => {
            const vec = new Vec2(0, 0)
            expect(vec.lerp(new Vec2(10, 20), 0.5)).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(10)
        })

        test('lerp at 0', () => {
            const vec = new Vec2(1, 2)
            vec.lerp(new Vec2(10, 20), 0)
            expect(vec.x).toBe(1)
            expect(vec.y).toBe(2)
        })

        test('lerp at 1', () => {
            const vec = new Vec2(1, 2)
            vec.lerp(new Vec2(10, 20), 1)
            expect(vec.x).toBe(10)
            expect(vec.y).toBe(20)
        })

        test('lerpVectors', () => {
            const vec = new Vec2()
            expect(vec.lerpVectors(new Vec2(0, 0), new Vec2(10, 20), 0.5)).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(10)
        })

    })


    describe('comparison', () => {

        test('equals with Vec2', () => {
            const vec1 = new Vec2(1, 2)
            const vec2 = new Vec2(1, 2)
            const vec3 = new Vec2(3, 4)
            expect(vec1.equals(vec2)).toBe(true)
            expect(vec1.equals(vec3)).toBe(false)
        })

        test('equals with object', () => {
            const vec1 = new Vec2(1, 2)
            const vec4 = {x: 1, y: 2, z: 0}
            expect(vec1.equals(vec4)).toBe(true)
        })

    })


    describe('array conversion', () => {

        test('fromArray', () => {
            const vec = new Vec2()
            expect(vec.fromArray([5, 6])).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(6)
        })

        test('fromArray with offset', () => {
            const vec = new Vec2()
            vec.fromArray([1, 2, 3, 4], 2)
            expect(vec.x).toBe(3)
            expect(vec.y).toBe(4)
        })

        test('toArray', () => {
            const vec = new Vec2(7, 8)
            const arr = vec.toArray()
            expect(arr).toEqual([7, 8])
        })

        test('toArray with existing array', () => {
            const vec = new Vec2(9, 10)
            const arr = [1, 2, 3, 4]
            expect(vec.toArray(arr, 2)).toBe(arr)
            expect(arr).toEqual([1, 2, 9, 10])
        })

    })


    describe('negation and min/max', () => {

        test('negate', () => {
            const vec = new Vec2(3, -4)
            expect(vec.negate()).toBe(vec)
            expect(vec.x).toBe(-3)
            expect(vec.y).toBe(4)
        })

        test('min', () => {
            const vec = new Vec2(5, 2)
            expect(vec.min(new Vec2(3, 4))).toBe(vec)
            expect(vec.x).toBe(3)
            expect(vec.y).toBe(2)
        })

        test('max', () => {
            const vec = new Vec2(5, 2)
            expect(vec.max(new Vec2(3, 4))).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(4)
        })

    })


    describe('clamping', () => {

        test('clamp', () => {
            const vec = new Vec2(15, -5)
            expect(vec.clamp(new Vec2(0, 0), new Vec2(10, 10))).toBe(vec)
            expect(vec.x).toBe(10)
            expect(vec.y).toBe(0)
        })

        test('clampScalar', () => {
            const vec = new Vec2(15, -5)
            expect(vec.clampScalar(0, 10)).toBe(vec)
            expect(vec.x).toBe(10)
            expect(vec.y).toBe(0)
        })

        test('clampLength min', () => {
            const vec = new Vec2(1, 0)
            vec.clampLength(5, 10)
            expect(vec.length()).toBeCloseTo(5)
        })

        test('clampLength max', () => {
            const vec = new Vec2(20, 0)
            vec.clampLength(5, 10)
            expect(vec.length()).toBeCloseTo(10)
        })

        test('clampLength in range', () => {
            const vec = new Vec2(7, 0)
            vec.clampLength(5, 10)
            expect(vec.length()).toBeCloseTo(7)
        })

    })


    describe('rounding', () => {

        test('floor', () => {
            const vec = new Vec2(1.7, 2.3)
            expect(vec.floor()).toBe(vec)
            expect(vec.x).toBe(1)
            expect(vec.y).toBe(2)
        })

        test('ceil', () => {
            const vec = new Vec2(1.3, 2.7)
            expect(vec.ceil()).toBe(vec)
            expect(vec.x).toBe(2)
            expect(vec.y).toBe(3)
        })

        test('round', () => {
            const vec = new Vec2(1.4, 2.6)
            expect(vec.round()).toBe(vec)
            expect(vec.x).toBe(1)
            expect(vec.y).toBe(3)
        })

        test('roundToZero positive', () => {
            const vec = new Vec2(1.9, 2.9)
            expect(vec.roundToZero()).toBe(vec)
            expect(vec.x).toBe(1)
            expect(vec.y).toBe(2)
        })

        test('roundToZero negative', () => {
            const vec = new Vec2(-1.9, -2.9)
            vec.roundToZero()
            expect(vec.x).toBe(-1)
            expect(vec.y).toBe(-2)
        })

    })


    describe('rotation', () => {

        test('rotateAround', () => {
            const vec = new Vec2(1, 0)
            const center = new Vec2(0, 0)
            expect(vec.rotateAround(center, Math.PI / 2)).toBe(vec)
            expect(vec.x).toBeCloseTo(0)
            expect(vec.y).toBeCloseTo(1)
        })

        test('rotateAround with offset center', () => {
            const vec = new Vec2(2, 1)
            const center = new Vec2(1, 1)
            vec.rotateAround(center, Math.PI / 2)
            expect(vec.x).toBeCloseTo(1)
            expect(vec.y).toBeCloseTo(2)
        })

    })


    describe('random and component access', () => {

        test('random', () => {
            const vec = new Vec2()
            expect(vec.random()).toBe(vec)
            expect(vec.x).toBeGreaterThanOrEqual(0)
            expect(vec.x).toBeLessThan(1)
            expect(vec.y).toBeGreaterThanOrEqual(0)
            expect(vec.y).toBeLessThan(1)
        })

        test('getComponent', () => {
            const vec = new Vec2(5, 7)
            expect(vec.getComponent(0)).toBe(5)
            expect(vec.getComponent(1)).toBe(7)
        })

        test('getComponent throws on invalid index', () => {
            const vec = new Vec2()
            expect(() => {
                vec.getComponent(2)
            }).toThrow('index out of range: 2')
        })

    })


    describe('aliases', () => {

        test('width getter', () => {
            const vec = new Vec2(10, 20)
            expect(vec.width).toBe(10)
        })

        test('width setter', () => {
            const vec = new Vec2()
            vec.width = 15
            expect(vec.x).toBe(15)
        })

        test('height getter', () => {
            const vec = new Vec2(10, 20)
            expect(vec.height).toBe(20)
        })

        test('height setter', () => {
            const vec = new Vec2()
            vec.height = 25
            expect(vec.y).toBe(25)
        })

    })


    test('isVector2', () => {
        const vec = new Vec2()
        expect(vec.isVector2).toBe(true)
    })


    describe('iteration', () => {

        test('iterator', () => {
            const vec = new Vec2(3, 4)
            const [x, y] = vec
            expect(x).toBe(3)
            expect(y).toBe(4)
        })

        test('spread operator', () => {
            const vec = new Vec2(5, 6)
            const arr = [...vec]
            expect(arr).toEqual([5, 6])
        })

    })

})
