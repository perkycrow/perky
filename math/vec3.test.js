import Vec3 from './vec3.js'


describe('Vec3', () => {

    describe('constructor', () => {

        test('with x, y and z', () => {
            const vec = new Vec3(1, 2, 3)
            expect(vec.x).toBe(1)
            expect(vec.y).toBe(2)
            expect(vec.z).toBe(3)
        })

        test('with object', () => {
            const vec = new Vec3({x: 3, y: 4, z: 5})
            expect(vec.x).toBe(3)
            expect(vec.y).toBe(4)
            expect(vec.z).toBe(5)
        })

        test('with array', () => {
            const vec = new Vec3([7, 8, 9])
            expect(vec.x).toBe(7)
            expect(vec.y).toBe(8)
            expect(vec.z).toBe(9)
        })

        test('with no parameters', () => {
            const vec = new Vec3()
            expect(vec.x).toBe(0)
            expect(vec.y).toBe(0)
            expect(vec.z).toBe(0)
        })

        test('with only x', () => {
            const vec = new Vec3(5)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(0)
            expect(vec.z).toBe(0)
        })

        test('with x and y', () => {
            const vec = new Vec3(5, 6)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(6)
            expect(vec.z).toBe(0)
        })

    })


    describe('setters', () => {

        test('set', () => {
            const vec = new Vec3()
            expect(vec.set(3, 4, 5)).toBe(vec)
            expect(vec.x).toBe(3)
            expect(vec.y).toBe(4)
            expect(vec.z).toBe(5)
        })

        test('setX', () => {
            const vec = new Vec3(1, 2, 3)
            expect(vec.setX(5)).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(2)
            expect(vec.z).toBe(3)
        })

        test('setY', () => {
            const vec = new Vec3(1, 2, 3)
            expect(vec.setY(6)).toBe(vec)
            expect(vec.x).toBe(1)
            expect(vec.y).toBe(6)
            expect(vec.z).toBe(3)
        })

        test('setZ', () => {
            const vec = new Vec3(1, 2, 3)
            expect(vec.setZ(7)).toBe(vec)
            expect(vec.x).toBe(1)
            expect(vec.y).toBe(2)
            expect(vec.z).toBe(7)
        })

        test('setScalar', () => {
            const vec = new Vec3()
            expect(vec.setScalar(7)).toBe(vec)
            expect(vec.x).toBe(7)
            expect(vec.y).toBe(7)
            expect(vec.z).toBe(7)
        })

        test('setComponent', () => {
            const vec = new Vec3(1, 2, 3)
            expect(vec.setComponent(0, 10)).toBe(vec)
            expect(vec.x).toBe(10)
            expect(vec.setComponent(1, 20)).toBe(vec)
            expect(vec.y).toBe(20)
            expect(vec.setComponent(2, 30)).toBe(vec)
            expect(vec.z).toBe(30)
        })

        test('setComponent throws on invalid index', () => {
            const vec = new Vec3()
            expect(() => {
                vec.setComponent(3, 5)
            }).toThrow('index out of range: 3')
        })

    })


    describe('copy and clone', () => {

        test('copy', () => {
            const vec1 = new Vec3(1, 2, 3)
            const vec2 = new Vec3(4, 5, 6)
            expect(vec1.copy(vec2)).toBe(vec1)
            expect(vec1.x).toBe(4)
            expect(vec1.y).toBe(5)
            expect(vec1.z).toBe(6)
        })

        test('clone', () => {
            const vec1 = new Vec3(5, 6, 7)
            const vec2 = vec1.clone()
            expect(vec2).not.toBe(vec1)
            expect(vec2.x).toBe(5)
            expect(vec2.y).toBe(6)
            expect(vec2.z).toBe(7)
        })

    })


    describe('addition', () => {

        test('add', () => {
            const vec = new Vec3(1, 2, 3)
            expect(vec.add(new Vec3(4, 5, 6))).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(7)
            expect(vec.z).toBe(9)
        })

        test('addScalar', () => {
            const vec = new Vec3(1, 2, 3)
            expect(vec.addScalar(5)).toBe(vec)
            expect(vec.x).toBe(6)
            expect(vec.y).toBe(7)
            expect(vec.z).toBe(8)
        })

        test('addVectors', () => {
            const vec = new Vec3()
            expect(vec.addVectors(new Vec3(1, 2, 3), new Vec3(4, 5, 6))).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(7)
            expect(vec.z).toBe(9)
        })

        test('addScaledVector', () => {
            const vec = new Vec3(1, 2, 3)
            expect(vec.addScaledVector(new Vec3(2, 3, 4), 2)).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(8)
            expect(vec.z).toBe(11)
        })

    })


    describe('subtraction', () => {

        test('sub', () => {
            const vec = new Vec3(5, 7, 9)
            expect(vec.sub(new Vec3(2, 3, 4))).toBe(vec)
            expect(vec.x).toBe(3)
            expect(vec.y).toBe(4)
            expect(vec.z).toBe(5)
        })

        test('subScalar', () => {
            const vec = new Vec3(10, 20, 30)
            expect(vec.subScalar(5)).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(15)
            expect(vec.z).toBe(25)
        })

        test('subVectors', () => {
            const vec = new Vec3()
            expect(vec.subVectors(new Vec3(8, 10, 12), new Vec3(3, 4, 5))).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(6)
            expect(vec.z).toBe(7)
        })

    })


    describe('multiplication', () => {

        test('multiply', () => {
            const vec = new Vec3(2, 3, 4)
            expect(vec.multiply(new Vec3(4, 5, 6))).toBe(vec)
            expect(vec.x).toBe(8)
            expect(vec.y).toBe(15)
            expect(vec.z).toBe(24)
        })

        test('multiplyScalar', () => {
            const vec = new Vec3(3, 4, 5)
            expect(vec.multiplyScalar(2)).toBe(vec)
            expect(vec.x).toBe(6)
            expect(vec.y).toBe(8)
            expect(vec.z).toBe(10)
        })

        test('multiplyVectors', () => {
            const vec = new Vec3()
            expect(vec.multiplyVectors(new Vec3(2, 3, 4), new Vec3(5, 6, 7))).toBe(vec)
            expect(vec.x).toBe(10)
            expect(vec.y).toBe(18)
            expect(vec.z).toBe(28)
        })

    })


    describe('division', () => {

        test('divide', () => {
            const vec = new Vec3(12, 20, 30)
            expect(vec.divide(new Vec3(3, 4, 5))).toBe(vec)
            expect(vec.x).toBe(4)
            expect(vec.y).toBe(5)
            expect(vec.z).toBe(6)
        })

        test('divideScalar', () => {
            const vec = new Vec3(10, 20, 30)
            expect(vec.divideScalar(2)).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(10)
            expect(vec.z).toBe(15)
        })

    })


    describe('vector operations', () => {

        test('dot', () => {
            const vec1 = new Vec3(2, 3, 4)
            const vec2 = new Vec3(5, 6, 7)
            expect(vec1.dot(vec2)).toBe(56)
        })

        test('cross', () => {
            const vec = new Vec3(1, 0, 0)
            expect(vec.cross(new Vec3(0, 1, 0))).toBe(vec)
            expect(vec.x).toBe(0)
            expect(vec.y).toBe(0)
            expect(vec.z).toBe(1)
        })

        test('crossVectors', () => {
            const vec = new Vec3()
            expect(vec.crossVectors(new Vec3(1, 0, 0), new Vec3(0, 1, 0))).toBe(vec)
            expect(vec.x).toBe(0)
            expect(vec.y).toBe(0)
            expect(vec.z).toBe(1)
        })

        test('lengthSq', () => {
            const vec = new Vec3(2, 3, 6)
            expect(vec.lengthSq()).toBe(49)
        })

        test('length', () => {
            const vec = new Vec3(2, 3, 6)
            expect(vec.length()).toBe(7)
        })

        test('manhattanLength', () => {
            const vec = new Vec3(3, -4, 5)
            expect(vec.manhattanLength()).toBe(12)
        })

        test('normalize', () => {
            const vec = new Vec3(0, 0, 5)
            expect(vec.normalize()).toBe(vec)
            expect(vec.x).toBeCloseTo(0)
            expect(vec.y).toBeCloseTo(0)
            expect(vec.z).toBeCloseTo(1)
            expect(vec.length()).toBeCloseTo(1)
        })

        test('normalize zero vector', () => {
            const vec = new Vec3(0, 0, 0)
            expect(vec.normalize()).toBe(vec)
            expect(vec.x).toBe(0)
            expect(vec.y).toBe(0)
            expect(vec.z).toBe(0)
        })

        test('setLength', () => {
            const vec = new Vec3(0, 0, 5)
            expect(vec.setLength(10)).toBe(vec)
            expect(vec.length()).toBeCloseTo(10)
            expect(vec.x).toBeCloseTo(0)
            expect(vec.y).toBeCloseTo(0)
            expect(vec.z).toBeCloseTo(10)
        })

    })


    describe('angles', () => {

        test('angleTo', () => {
            const vec1 = new Vec3(1, 0, 0)
            const vec2 = new Vec3(0, 1, 0)
            expect(vec1.angleTo(vec2)).toBeCloseTo(Math.PI / 2)
        })

        test('angleTo parallel vectors', () => {
            const vec1 = new Vec3(1, 0, 0)
            const vec2 = new Vec3(2, 0, 0)
            expect(vec1.angleTo(vec2)).toBeCloseTo(0)
        })

        test('angleTo opposite vectors', () => {
            const vec1 = new Vec3(1, 0, 0)
            const vec2 = new Vec3(-1, 0, 0)
            expect(vec1.angleTo(vec2)).toBeCloseTo(Math.PI)
        })

    })


    describe('distance', () => {

        test('distanceTo', () => {
            const vec1 = new Vec3(1, 2, 3)
            const vec2 = new Vec3(4, 6, 3)
            expect(vec1.distanceTo(vec2)).toBe(5)
        })

        test('distanceToSquared', () => {
            const vec1 = new Vec3(1, 2, 3)
            const vec2 = new Vec3(4, 6, 3)
            expect(vec1.distanceToSquared(vec2)).toBe(25)
        })

        test('manhattanDistanceTo', () => {
            const vec1 = new Vec3(1, 2, 3)
            const vec2 = new Vec3(4, 6, 8)
            expect(vec1.manhattanDistanceTo(vec2)).toBe(12)
        })

    })


    describe('interpolation', () => {

        test('lerp', () => {
            const vec = new Vec3(0, 0, 0)
            expect(vec.lerp(new Vec3(10, 20, 30), 0.5)).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(10)
            expect(vec.z).toBe(15)
        })

        test('lerp at 0', () => {
            const vec = new Vec3(1, 2, 3)
            vec.lerp(new Vec3(10, 20, 30), 0)
            expect(vec.x).toBe(1)
            expect(vec.y).toBe(2)
            expect(vec.z).toBe(3)
        })

        test('lerp at 1', () => {
            const vec = new Vec3(1, 2, 3)
            vec.lerp(new Vec3(10, 20, 30), 1)
            expect(vec.x).toBe(10)
            expect(vec.y).toBe(20)
            expect(vec.z).toBe(30)
        })

        test('lerpVectors', () => {
            const vec = new Vec3()
            expect(vec.lerpVectors(new Vec3(0, 0, 0), new Vec3(10, 20, 30), 0.5)).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(10)
            expect(vec.z).toBe(15)
        })

    })


    describe('comparison', () => {

        test('equals with Vec3', () => {
            const vec1 = new Vec3(1, 2, 3)
            const vec2 = new Vec3(1, 2, 3)
            const vec3 = new Vec3(4, 5, 6)
            expect(vec1.equals(vec2)).toBe(true)
            expect(vec1.equals(vec3)).toBe(false)
        })

        test('equals with object', () => {
            const vec1 = new Vec3(1, 2, 3)
            const vec4 = {x: 1, y: 2, z: 3}
            expect(vec1.equals(vec4)).toBe(true)
        })

    })


    describe('array conversion', () => {

        test('fromArray', () => {
            const vec = new Vec3()
            expect(vec.fromArray([5, 6, 7])).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(6)
            expect(vec.z).toBe(7)
        })

        test('fromArray with offset', () => {
            const vec = new Vec3()
            vec.fromArray([1, 2, 3, 4, 5], 2)
            expect(vec.x).toBe(3)
            expect(vec.y).toBe(4)
            expect(vec.z).toBe(5)
        })

        test('toArray', () => {
            const vec = new Vec3(7, 8, 9)
            const arr = vec.toArray()
            expect(arr).toEqual([7, 8, 9])
        })

        test('toArray with existing array', () => {
            const vec = new Vec3(9, 10, 11)
            const arr = [1, 2, 3, 4, 5]
            expect(vec.toArray(arr, 2)).toBe(arr)
            expect(arr).toEqual([1, 2, 9, 10, 11])
        })

    })


    describe('negation and min/max', () => {

        test('negate', () => {
            const vec = new Vec3(3, -4, 5)
            expect(vec.negate()).toBe(vec)
            expect(vec.x).toBe(-3)
            expect(vec.y).toBe(4)
            expect(vec.z).toBe(-5)
        })

        test('min', () => {
            const vec = new Vec3(5, 2, 7)
            expect(vec.min(new Vec3(3, 4, 6))).toBe(vec)
            expect(vec.x).toBe(3)
            expect(vec.y).toBe(2)
            expect(vec.z).toBe(6)
        })

        test('max', () => {
            const vec = new Vec3(5, 2, 7)
            expect(vec.max(new Vec3(3, 4, 6))).toBe(vec)
            expect(vec.x).toBe(5)
            expect(vec.y).toBe(4)
            expect(vec.z).toBe(7)
        })

    })


    describe('clamping', () => {

        test('clamp', () => {
            const vec = new Vec3(15, -5, 25)
            expect(vec.clamp(new Vec3(0, 0, 0), new Vec3(10, 10, 10))).toBe(vec)
            expect(vec.x).toBe(10)
            expect(vec.y).toBe(0)
            expect(vec.z).toBe(10)
        })

        test('clampScalar', () => {
            const vec = new Vec3(15, -5, 7)
            expect(vec.clampScalar(0, 10)).toBe(vec)
            expect(vec.x).toBe(10)
            expect(vec.y).toBe(0)
            expect(vec.z).toBe(7)
        })

        test('clampLength min', () => {
            const vec = new Vec3(1, 0, 0)
            vec.clampLength(5, 10)
            expect(vec.length()).toBeCloseTo(5)
        })

        test('clampLength max', () => {
            const vec = new Vec3(20, 0, 0)
            vec.clampLength(5, 10)
            expect(vec.length()).toBeCloseTo(10)
        })

        test('clampLength in range', () => {
            const vec = new Vec3(7, 0, 0)
            vec.clampLength(5, 10)
            expect(vec.length()).toBeCloseTo(7)
        })

    })


    describe('rounding', () => {

        test('floor', () => {
            const vec = new Vec3(1.7, 2.3, 3.9)
            expect(vec.floor()).toBe(vec)
            expect(vec.x).toBe(1)
            expect(vec.y).toBe(2)
            expect(vec.z).toBe(3)
        })

        test('ceil', () => {
            const vec = new Vec3(1.3, 2.7, 3.1)
            expect(vec.ceil()).toBe(vec)
            expect(vec.x).toBe(2)
            expect(vec.y).toBe(3)
            expect(vec.z).toBe(4)
        })

        test('round', () => {
            const vec = new Vec3(1.4, 2.6, 3.5)
            expect(vec.round()).toBe(vec)
            expect(vec.x).toBe(1)
            expect(vec.y).toBe(3)
            expect(vec.z).toBe(4)
        })

        test('roundToZero positive', () => {
            const vec = new Vec3(1.9, 2.9, 3.9)
            expect(vec.roundToZero()).toBe(vec)
            expect(vec.x).toBe(1)
            expect(vec.y).toBe(2)
            expect(vec.z).toBe(3)
        })

        test('roundToZero negative', () => {
            const vec = new Vec3(-1.9, -2.9, -3.9)
            vec.roundToZero()
            expect(vec.x).toBe(-1)
            expect(vec.y).toBe(-2)
            expect(vec.z).toBe(-3)
        })

    })


    describe('random', () => {

        test('random', () => {
            const vec = new Vec3()
            expect(vec.random()).toBe(vec)
            expect(vec.x).toBeGreaterThanOrEqual(0)
            expect(vec.x).toBeLessThan(1)
            expect(vec.y).toBeGreaterThanOrEqual(0)
            expect(vec.y).toBeLessThan(1)
            expect(vec.z).toBeGreaterThanOrEqual(0)
            expect(vec.z).toBeLessThan(1)
        })

        test('randomDirection', () => {
            const vec = new Vec3()
            expect(vec.randomDirection()).toBe(vec)
            expect(vec.length()).toBeCloseTo(1)
        })

    })


    describe('component access', () => {

        test('getComponent', () => {
            const vec = new Vec3(5, 7, 9)
            expect(vec.getComponent(0)).toBe(5)
            expect(vec.getComponent(1)).toBe(7)
            expect(vec.getComponent(2)).toBe(9)
        })

        test('getComponent throws on invalid index', () => {
            const vec = new Vec3()
            expect(() => {
                vec.getComponent(3)
            }).toThrow('index out of range: 3')
        })

    })


    describe('projection', () => {

        test('projectOnVector', () => {
            const vec = new Vec3(1, 1, 0)
            const target = new Vec3(1, 0, 0)
            expect(vec.projectOnVector(target)).toBe(vec)
            expect(vec.x).toBeCloseTo(1)
            expect(vec.y).toBeCloseTo(0)
            expect(vec.z).toBeCloseTo(0)
        })

        test('projectOnPlane', () => {
            const vec = new Vec3(1, 1, 1)
            const normal = new Vec3(0, 1, 0)
            expect(vec.projectOnPlane(normal)).toBe(vec)
            expect(vec.x).toBeCloseTo(1)
            expect(vec.y).toBeCloseTo(0)
            expect(vec.z).toBeCloseTo(1)
        })

    })


    describe('reflection', () => {

        test('reflect', () => {
            const vec = new Vec3(1, -1, 0)
            const normal = new Vec3(0, 1, 0)
            expect(vec.reflect(normal)).toBe(vec)
            expect(vec.x).toBeCloseTo(1)
            expect(vec.y).toBeCloseTo(1)
            expect(vec.z).toBeCloseTo(0)
        })

    })


    describe('rotation', () => {

        test('applyAxisAngle', () => {
            const vec = new Vec3(1, 0, 0)
            const axis = new Vec3(0, 0, 1)
            expect(vec.applyAxisAngle(axis, Math.PI / 2)).toBe(vec)
            expect(vec.x).toBeCloseTo(0)
            expect(vec.y).toBeCloseTo(1)
            expect(vec.z).toBeCloseTo(0)
        })

    })


    describe('type checking', () => {

        test('isVector3', () => {
            const vec = new Vec3()
            expect(vec.isVector3).toBe(true)
        })

    })


    describe('iteration', () => {

        test('iterator', () => {
            const vec = new Vec3(3, 4, 5)
            const [x, y, z] = vec
            expect(x).toBe(3)
            expect(y).toBe(4)
            expect(z).toBe(5)
        })

        test('spread operator', () => {
            const vec = new Vec3(5, 6, 7)
            const arr = [...vec]
            expect(arr).toEqual([5, 6, 7])
        })

    })

})