import Quaternion from './quaternion.js'
import Matrix4 from './matrix4.js'
import Vec3 from './vec3.js'


function expectClose (actual, expected, epsilon = 1e-6) {
    expect(Math.abs(actual - expected)).toBeLessThan(epsilon)
}


function expectVec3Close (v, expected) {
    expectClose(v.x, expected.x)
    expectClose(v.y, expected.y)
    expectClose(v.z, expected.z)
}


describe('Quaternion', () => {

    describe('constructor', () => {

        test('default is identity', () => {
            const q = new Quaternion()
            expect(q.x).toBe(0)
            expect(q.y).toBe(0)
            expect(q.z).toBe(0)
            expect(q.w).toBe(1)
        })

        test('with x, y, z, w', () => {
            const q = new Quaternion(1, 2, 3, 4)
            expect(q.x).toBe(1)
            expect(q.y).toBe(2)
            expect(q.z).toBe(3)
            expect(q.w).toBe(4)
        })

        test('with object', () => {
            const q = new Quaternion({x: 1, y: 2, z: 3, w: 4})
            expect(q.x).toBe(1)
            expect(q.w).toBe(4)
        })

        test('with array', () => {
            const q = new Quaternion([0.1, 0.2, 0.3, 0.9])
            expect(q.x).toBe(0.1)
            expect(q.w).toBe(0.9)
        })

    })


    test('set', () => {
        const q = new Quaternion()
        expect(q.set(1, 2, 3, 4)).toBe(q)
        expect(q.x).toBe(1)
        expect(q.w).toBe(4)
    })


    test('clone', () => {
        const q = new Quaternion(1, 2, 3, 4)
        const c = q.clone()
        expect(c).not.toBe(q)
        expect(c.x).toBe(1)
        expect(c.w).toBe(4)
    })


    test('copy', () => {
        const a = new Quaternion(1, 2, 3, 4)
        const b = new Quaternion()
        expect(b.copy(a)).toBe(b)
        expect(b.x).toBe(1)
        expect(b.w).toBe(4)
    })


    test('identity', () => {
        const q = new Quaternion(1, 2, 3, 4)
        q.identity()
        expect(q.x).toBe(0)
        expect(q.y).toBe(0)
        expect(q.z).toBe(0)
        expect(q.w).toBe(1)
    })


    test('length', () => {
        const q = new Quaternion(0, 0, 0, 1)
        expect(q.length()).toBe(1)
    })


    test('lengthSq', () => {
        const q = new Quaternion(1, 2, 3, 4)
        expect(q.lengthSq()).toBe(30)
    })


    test('normalize', () => {
        const q = new Quaternion(0, 0, 0, 5)
        q.normalize()
        expectClose(q.length(), 1)
        expectClose(q.w, 1)
    })


    test('normalize zero returns identity', () => {
        const q = new Quaternion(0, 0, 0, 0)
        q.normalize()
        expect(q.w).toBe(1)
    })


    test('conjugate', () => {
        const q = new Quaternion(1, 2, 3, 4)
        q.conjugate()
        expect(q.x).toBe(-1)
        expect(q.y).toBe(-2)
        expect(q.z).toBe(-3)
        expect(q.w).toBe(4)
    })


    test('invert', () => {
        const q = new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), Math.PI / 4)
        const inv = q.clone().invert()
        const result = q.clone().multiply(inv)
        expectClose(result.x, 0)
        expectClose(result.y, 0)
        expectClose(result.z, 0)
        expectClose(result.w, 1)
    })


    test('dot', () => {
        const a = new Quaternion(1, 0, 0, 0)
        const b = new Quaternion(1, 0, 0, 0)
        expect(a.dot(b)).toBe(1)
    })


    describe('multiply', () => {

        test('identity * identity = identity', () => {
            const a = new Quaternion()
            const b = new Quaternion()
            a.multiply(b)
            expect(a.w).toBe(1)
            expectClose(a.x, 0)
        })

        test('q * q^-1 = identity', () => {
            const q = new Quaternion().setFromAxisAngle(new Vec3(1, 0, 0), Math.PI / 3)
            const inv = q.clone().invert()
            const result = q.clone().multiply(inv)
            expectClose(result.w, 1)
            expectClose(result.x, 0)
            expectClose(result.y, 0)
            expectClose(result.z, 0)
        })

        test('returns this', () => {
            const a = new Quaternion()
            const b = new Quaternion()
            expect(a.multiply(b)).toBe(a)
        })

    })


    test('premultiply', () => {
        const a = new Quaternion().setFromAxisAngle(new Vec3(1, 0, 0), Math.PI / 2)
        const b = new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), Math.PI / 2)
        const ref = new Quaternion().multiplyQuaternions(b, a)
        a.premultiply(b)
        expectClose(a.x, ref.x)
        expectClose(a.y, ref.y)
        expectClose(a.z, ref.z)
        expectClose(a.w, ref.w)
    })


    describe('setFromAxisAngle', () => {

        test('zero rotation gives identity', () => {
            const q = new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), 0)
            expectClose(q.w, 1)
            expectClose(q.y, 0)
        })

        test('90 degrees around Y', () => {
            const q = new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), Math.PI / 2)
            expectClose(q.length(), 1)
            expectClose(q.y, Math.sin(Math.PI / 4))
            expectClose(q.w, Math.cos(Math.PI / 4))
        })

    })


    describe('setFromEuler', () => {

        test('zero euler gives identity', () => {
            const q = new Quaternion().setFromEuler(0, 0, 0)
            expectClose(q.w, 1)
            expectClose(q.x, 0)
        })

        test('90 degrees X rotation', () => {
            const q = new Quaternion().setFromEuler(Math.PI / 2, 0, 0, 'XYZ')
            const v = new Vec3(0, 1, 0)
            q.rotateVec3(v)
            expectVec3Close(v, {x: 0, y: 0, z: 1})
        })

    })


    describe('setFromRotationMatrix', () => {

        test('identity matrix gives identity quaternion', () => {
            const m = new Matrix4()
            const q = new Quaternion().setFromRotationMatrix(m)
            expectClose(q.w, 1)
            expectClose(q.x, 0)
        })

        test('round-trip with makeRotationFromQuaternion', () => {
            const original = new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), Math.PI / 3)
            const m = new Matrix4().makeRotationFromQuaternion(original)
            const recovered = new Quaternion().setFromRotationMatrix(m)
            expectClose(recovered.x, original.x)
            expectClose(recovered.y, original.y)
            expectClose(recovered.z, original.z)
            expectClose(recovered.w, original.w)
        })

    })


    describe('rotateVec3', () => {

        test('identity does nothing', () => {
            const q = new Quaternion()
            const v = new Vec3(1, 2, 3)
            q.rotateVec3(v)
            expectVec3Close(v, {x: 1, y: 2, z: 3})
        })

        test('90 degrees Y rotates X to -Z', () => {
            const q = new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), Math.PI / 2)
            const v = new Vec3(1, 0, 0)
            q.rotateVec3(v)
            expectVec3Close(v, {x: 0, y: 0, z: -1})
        })

        test('180 degrees X rotates Y to -Y', () => {
            const q = new Quaternion().setFromAxisAngle(new Vec3(1, 0, 0), Math.PI)
            const v = new Vec3(0, 1, 0)
            q.rotateVec3(v)
            expectVec3Close(v, {x: 0, y: -1, z: 0})
        })

        test('returns the vec3', () => {
            const q = new Quaternion()
            const v = new Vec3(1, 0, 0)
            expect(q.rotateVec3(v)).toBe(v)
        })

    })


    describe('slerp', () => {

        test('slerp t=0 returns start', () => {
            const a = new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), 0)
            const b = new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), Math.PI)
            const result = a.clone().slerp(b, 0)
            expectClose(result.x, a.x)
            expectClose(result.y, a.y)
            expectClose(result.z, a.z)
            expectClose(result.w, a.w)
        })

        test('slerp t=1 returns end', () => {
            const a = new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), 0)
            const b = new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), Math.PI / 2)
            const result = a.clone().slerp(b, 1)
            expectClose(result.x, b.x)
            expectClose(result.y, b.y)
            expectClose(result.z, b.z)
            expectClose(result.w, b.w)
        })

        test('slerp t=0.5 is halfway', () => {
            const a = new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), 0)
            const b = new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), Math.PI / 2)
            const result = a.clone().slerp(b, 0.5)
            expectClose(result.length(), 1)
        })

    })


    test('slerpQuaternions', () => {
        const a = new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), 0)
        const b = new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), Math.PI / 2)
        const result = new Quaternion().slerpQuaternions(a, b, 0.5)
        expectClose(result.length(), 1)
    })


    test('equals', () => {
        const a = new Quaternion(1, 2, 3, 4)
        const b = new Quaternion(1, 2, 3, 4)
        const c = new Quaternion(5, 6, 7, 8)
        expect(a.equals(b)).toBe(true)
        expect(a.equals(c)).toBe(false)
    })


    test('fromArray', () => {
        const q = new Quaternion()
        q.fromArray([0.1, 0.2, 0.3, 0.9])
        expect(q.x).toBe(0.1)
        expect(q.w).toBe(0.9)
    })


    test('toArray', () => {
        const q = new Quaternion(0.1, 0.2, 0.3, 0.9)
        const arr = q.toArray()
        expect(arr[0]).toBe(0.1)
        expect(arr[3]).toBe(0.9)
    })


    test('isQuaternion', () => {
        const q = new Quaternion()
        expect(q.isQuaternion).toBe(true)
    })


    test('iterator', () => {
        const q = new Quaternion(1, 2, 3, 4)
        const arr = [...q]
        expect(arr).toEqual([1, 2, 3, 4])
    })

})
