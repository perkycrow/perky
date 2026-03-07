import Matrix4 from './matrix4.js'
import Vec3 from './vec3.js'


function expectClose (actual, expected, epsilon = 1e-6) {
    expect(Math.abs(actual - expected)).toBeLessThan(epsilon)
}


function expectMatrixClose (a, b, epsilon = 1e-6) {
    for (let i = 0; i < 16; i++) {
        expect(Math.abs(a.elements[i] - b.elements[i])).toBeLessThan(epsilon)
    }
}


describe('Matrix4', () => {

    describe('constructor', () => {

        test('default is identity', () => {
            const m = new Matrix4()
            expect(m.elements[0]).toBe(1)
            expect(m.elements[5]).toBe(1)
            expect(m.elements[10]).toBe(1)
            expect(m.elements[15]).toBe(1)
            expect(m.elements[1]).toBe(0)
            expect(m.elements[4]).toBe(0)
        })

        test('with elements', () => {
            const values = new Float32Array([
                1, 2, 3, 4, 5, 6, 7, 8,
                9, 10, 11, 12, 13, 14, 15, 16
            ])
            const m = new Matrix4(values)
            for (let i = 0; i < 16; i++) {
                expect(m.elements[i]).toBe(values[i])
            }
        })

    })


    test('identity', () => {
        const m = new Matrix4([
            2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2
        ])
        m.identity()
        expect(m.elements[0]).toBe(1)
        expect(m.elements[5]).toBe(1)
        expect(m.elements[10]).toBe(1)
        expect(m.elements[15]).toBe(1)
    })


    test('clone', () => {
        const m = new Matrix4([
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16
        ])
        const c = m.clone()
        expect(c).not.toBe(m)
        expect(c.elements).not.toBe(m.elements)
        for (let i = 0; i < 16; i++) {
            expect(c.elements[i]).toBe(m.elements[i])
        }
    })


    test('copy', () => {
        const a = new Matrix4([
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16
        ])
        const b = new Matrix4()
        expect(b.copy(a)).toBe(b)
        for (let i = 0; i < 16; i++) {
            expect(b.elements[i]).toBe(a.elements[i])
        }
    })


    test('set', () => {
        const m = new Matrix4()
        m.set(
            1, 2, 3, 4,
            5, 6, 7, 8,
            9, 10, 11, 12,
            13, 14, 15, 16
        )
        expect(m.elements[0]).toBe(1)
        expect(m.elements[4]).toBe(2)
        expect(m.elements[8]).toBe(3)
        expect(m.elements[12]).toBe(4)
        expect(m.elements[1]).toBe(5)
        expect(m.elements[5]).toBe(6)
    })


    test('fromArray', () => {
        const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
        const m = new Matrix4()
        expect(m.fromArray(arr)).toBe(m)
        for (let i = 0; i < 16; i++) {
            expect(m.elements[i]).toBe(arr[i])
        }
    })


    test('fromArray with offset', () => {
        const arr = [99, 99, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
        const m = new Matrix4()
        m.fromArray(arr, 2)
        for (let i = 0; i < 16; i++) {
            expect(m.elements[i]).toBe(i)
        }
    })


    test('toArray', () => {
        const m = new Matrix4([
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
        ])
        const arr = m.toArray()
        for (let i = 0; i < 16; i++) {
            expect(arr[i]).toBe(i)
        }
    })


    describe('multiply', () => {

        test('identity * identity = identity', () => {
            const a = new Matrix4()
            const b = new Matrix4()
            a.multiply(b)
            expectMatrixClose(a, new Matrix4())
        })

        test('identity * M = M', () => {
            const m = new Matrix4()
            m.makeTranslation(3, 4, 5)
            const result = new Matrix4().multiply(m)
            expectMatrixClose(result, m)
        })

        test('translation * translation', () => {
            const a = new Matrix4().makeTranslation(1, 0, 0)
            const b = new Matrix4().makeTranslation(0, 2, 0)
            a.multiply(b)
            expect(a.elements[12]).toBe(1)
            expect(a.elements[13]).toBe(2)
            expect(a.elements[14]).toBe(0)
        })

        test('returns this', () => {
            const a = new Matrix4()
            const b = new Matrix4()
            expect(a.multiply(b)).toBe(a)
        })

    })


    test('premultiply', () => {
        const a = new Matrix4().makeTranslation(1, 0, 0)
        const b = new Matrix4().makeTranslation(0, 2, 0)
        a.premultiply(b)
        expect(a.elements[12]).toBe(1)
        expect(a.elements[13]).toBe(2)
    })


    test('multiplyScalar', () => {
        const m = new Matrix4()
        m.multiplyScalar(2)
        expect(m.elements[0]).toBe(2)
        expect(m.elements[5]).toBe(2)
        expect(m.elements[10]).toBe(2)
        expect(m.elements[15]).toBe(2)
    })


    test('determinant of identity is 1', () => {
        const m = new Matrix4()
        expect(m.determinant()).toBe(1)
    })


    test('determinant of scale', () => {
        const m = new Matrix4().makeScale(2, 3, 4)
        expectClose(m.determinant(), 24)
    })


    test('transpose', () => {
        const m = new Matrix4()
        m.set(
            1, 2, 3, 4,
            5, 6, 7, 8,
            9, 10, 11, 12,
            13, 14, 15, 16
        )
        m.transpose()
        expect(m.elements[0]).toBe(1)
        expect(m.elements[1]).toBe(2)
        expect(m.elements[2]).toBe(3)
        expect(m.elements[3]).toBe(4)
        expect(m.elements[4]).toBe(5)
        expect(m.elements[5]).toBe(6)
    })


    describe('invert', () => {

        test('invert identity is identity', () => {
            const m = new Matrix4()
            m.invert()
            expectMatrixClose(m, new Matrix4())
        })

        test('M * M^-1 = identity', () => {
            const m = new Matrix4().makeTranslation(3, -5, 7)
            const inv = m.clone().invert()
            const result = new Matrix4().multiplyMatrices(m, inv)
            expectMatrixClose(result, new Matrix4())
        })

        test('invert scale', () => {
            const m = new Matrix4().makeScale(2, 4, 8)
            m.invert()
            expectClose(m.elements[0], 0.5)
            expectClose(m.elements[5], 0.25)
            expectClose(m.elements[10], 0.125)
        })

        test('singular matrix returns identity', () => {
            const m = new Matrix4([
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ])
            m.invert()
            expectMatrixClose(m, new Matrix4())
        })

    })


    test('makeTranslation', () => {
        const m = new Matrix4().makeTranslation(10, 20, 30)
        expect(m.elements[12]).toBe(10)
        expect(m.elements[13]).toBe(20)
        expect(m.elements[14]).toBe(30)
        expect(m.elements[0]).toBe(1)
        expect(m.elements[5]).toBe(1)
        expect(m.elements[10]).toBe(1)
    })


    test('makeScale', () => {
        const m = new Matrix4().makeScale(2, 3, 4)
        expect(m.elements[0]).toBe(2)
        expect(m.elements[5]).toBe(3)
        expect(m.elements[10]).toBe(4)
        expect(m.elements[15]).toBe(1)
    })


    test('makeRotationX', () => {
        const m = new Matrix4().makeRotationX(Math.PI / 2)
        const v = new Vec3(0, 1, 0)
        m.transformPoint(v)
        expectClose(v.x, 0)
        expectClose(v.y, 0)
        expectClose(v.z, 1)
    })


    test('makeRotationY', () => {
        const m = new Matrix4().makeRotationY(Math.PI / 2)
        const v = new Vec3(1, 0, 0)
        m.transformPoint(v)
        expectClose(v.x, 0)
        expectClose(v.y, 0)
        expectClose(v.z, -1)
    })


    test('makeRotationZ', () => {
        const m = new Matrix4().makeRotationZ(Math.PI / 2)
        const v = new Vec3(1, 0, 0)
        m.transformPoint(v)
        expectClose(v.x, 0)
        expectClose(v.y, 1)
        expectClose(v.z, 0)
    })


    test('makeRotationFromQuaternion', () => {
        const halfAngle = Math.PI / 4
        const quat = {
            x: 0,
            y: Math.sin(halfAngle),
            z: 0,
            w: Math.cos(halfAngle)
        }
        const m = new Matrix4().makeRotationFromQuaternion(quat)
        const v = new Vec3(1, 0, 0)
        m.transformPoint(v)
        expectClose(v.x, 0)
        expectClose(v.y, 0)
        expectClose(v.z, -1)
    })


    describe('compose / decompose', () => {

        test('compose identity', () => {
            const m = new Matrix4().compose(
                {x: 0, y: 0, z: 0},
                {x: 0, y: 0, z: 0, w: 1},
                {x: 1, y: 1, z: 1}
            )
            expectMatrixClose(m, new Matrix4())
        })

        test('compose translation', () => {
            const m = new Matrix4().compose(
                {x: 5, y: 10, z: 15},
                {x: 0, y: 0, z: 0, w: 1},
                {x: 1, y: 1, z: 1}
            )
            expect(m.elements[12]).toBe(5)
            expect(m.elements[13]).toBe(10)
            expect(m.elements[14]).toBe(15)
        })

        test('decompose round-trip', () => {
            const pos = {x: 3, y: -7, z: 11}
            const quat = {x: 0, y: 0, z: 0, w: 1}
            const scl = {x: 2, y: 3, z: 4}

            const m = new Matrix4().compose(pos, quat, scl)

            const outPos = {x: 0, y: 0, z: 0}
            const outQuat = {x: 0, y: 0, z: 0, w: 0}
            const outScl = {x: 0, y: 0, z: 0}

            m.decompose(outPos, outQuat, outScl)

            expectClose(outPos.x, 3)
            expectClose(outPos.y, -7)
            expectClose(outPos.z, 11)
            expectClose(outScl.x, 2)
            expectClose(outScl.y, 3)
            expectClose(outScl.z, 4)
            expectClose(outQuat.w, 1)
        })

    })


    describe('makePerspective', () => {

        test('produces valid projection', () => {
            const m = new Matrix4().makePerspective(Math.PI / 4, 1, 0.1, 100)
            expect(m.elements[0]).toBeGreaterThan(0)
            expect(m.elements[5]).toBeGreaterThan(0)
            expect(m.elements[11]).toBe(-1)
            expect(m.elements[15]).toBe(0)
        })

        test('aspect ratio scales x', () => {
            const wide = new Matrix4().makePerspective(Math.PI / 4, 2, 0.1, 100)
            const square = new Matrix4().makePerspective(Math.PI / 4, 1, 0.1, 100)
            expect(wide.elements[0]).toBeLessThan(square.elements[0])
            expect(wide.elements[5]).toBe(square.elements[5])
        })

    })


    describe('makeOrthographic', () => {

        test('produces valid orthographic projection', () => {
            const m = new Matrix4().makeOrthographic(-5, 5, -5, 5, 0.1, 100)
            expectClose(m.elements[0], 2 / 10)
            expectClose(m.elements[5], 2 / 10)
            expectClose(m.elements[10], -2 / 99.9)
            expect(m.elements[15]).toBe(1)
            expect(m.elements[11]).toBe(0)
        })

        test('symmetric bounds center translation at zero', () => {
            const m = new Matrix4().makeOrthographic(-10, 10, -10, 10, 1, 50)
            expectClose(m.elements[12], 0)
            expectClose(m.elements[13], 0)
        })

        test('asymmetric bounds produce translation', () => {
            const m = new Matrix4().makeOrthographic(0, 10, 0, 10, 1, 50)
            expectClose(m.elements[12], -1)
            expectClose(m.elements[13], -1)
        })

        test('returns this', () => {
            const m = new Matrix4()
            expect(m.makeOrthographic(-1, 1, -1, 1, 0.1, 10)).toBe(m)
        })

    })


    describe('makeLookAt', () => {

        test('looking down -Z from origin', () => {
            const eye = new Vec3(0, 0, 0)
            const target = new Vec3(0, 0, -1)
            const up = new Vec3(0, 1, 0)
            const m = new Matrix4().makeLookAt(eye, target, up)
            expectMatrixClose(m, new Matrix4())
        })

        test('looking from offset', () => {
            const eye = new Vec3(0, 0, 5)
            const target = new Vec3(0, 0, 0)
            const up = new Vec3(0, 1, 0)
            const m = new Matrix4().makeLookAt(eye, target, up)
            expectClose(m.elements[14], -5)
        })

    })


    describe('transformPoint', () => {

        test('identity does nothing', () => {
            const m = new Matrix4()
            const v = new Vec3(3, 4, 5)
            m.transformPoint(v)
            expect(v.x).toBe(3)
            expect(v.y).toBe(4)
            expect(v.z).toBe(5)
        })

        test('translation moves point', () => {
            const m = new Matrix4().makeTranslation(10, 20, 30)
            const v = new Vec3(1, 2, 3)
            m.transformPoint(v)
            expectClose(v.x, 11)
            expectClose(v.y, 22)
            expectClose(v.z, 33)
        })

        test('scale scales point', () => {
            const m = new Matrix4().makeScale(2, 3, 4)
            const v = new Vec3(1, 1, 1)
            m.transformPoint(v)
            expectClose(v.x, 2)
            expectClose(v.y, 3)
            expectClose(v.z, 4)
        })

        test('returns the vec3', () => {
            const m = new Matrix4()
            const v = new Vec3(1, 2, 3)
            expect(m.transformPoint(v)).toBe(v)
        })

    })


    describe('transformDirection', () => {

        test('translation does not affect direction', () => {
            const m = new Matrix4().makeTranslation(100, 200, 300)
            const v = new Vec3(1, 0, 0)
            m.transformDirection(v)
            expectClose(v.x, 1)
            expectClose(v.y, 0)
            expectClose(v.z, 0)
        })

        test('rotation rotates direction', () => {
            const m = new Matrix4().makeRotationY(Math.PI / 2)
            const v = new Vec3(1, 0, 0)
            m.transformDirection(v)
            expectClose(v.x, 0)
            expectClose(v.z, -1)
        })

    })


    test('equals', () => {
        const a = new Matrix4().makeTranslation(1, 2, 3)
        const b = new Matrix4().makeTranslation(1, 2, 3)
        const c = new Matrix4().makeTranslation(4, 5, 6)
        expect(a.equals(b)).toBe(true)
        expect(a.equals(c)).toBe(false)
    })


    test('isMatrix4', () => {
        const m = new Matrix4()
        expect(m.isMatrix4).toBe(true)
    })

})
