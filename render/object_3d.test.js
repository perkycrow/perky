import Object3D from './object_3d.js'
import Matrix4 from '../math/matrix4.js'


function expectClose (actual, expected, epsilon = 1e-5) {
    expect(Math.abs(actual - expected)).toBeLessThan(epsilon)
}


describe('Object3D', () => {

    describe('constructor', () => {

        test('default values', () => {
            const obj = new Object3D()
            expect(obj.position.x).toBe(0)
            expect(obj.position.y).toBe(0)
            expect(obj.position.z).toBe(0)
            expect(obj.scale.x).toBe(1)
            expect(obj.scale.y).toBe(1)
            expect(obj.scale.z).toBe(1)
            expect(obj.visible).toBe(true)
            expect(obj.depth).toBe(0)
        })

        test('with options', () => {
            const obj = new Object3D({x: 1, y: 2, z: 3, scaleX: 2, scaleY: 3, scaleZ: 4, visible: false, depth: 5})
            expect(obj.position.x).toBe(1)
            expect(obj.position.y).toBe(2)
            expect(obj.position.z).toBe(3)
            expect(obj.scale.x).toBe(2)
            expect(obj.scale.y).toBe(3)
            expect(obj.scale.z).toBe(4)
            expect(obj.visible).toBe(false)
            expect(obj.depth).toBe(5)
        })

    })


    describe('parent-child', () => {

        test('addChild sets parent', () => {
            const parent = new Object3D()
            const child = new Object3D()
            parent.addChild(child)
            expect(child.parent).toBe(parent)
            expect(parent.children.length).toBe(1)
            expect(parent.children[0]).toBe(child)
        })

        test('removeChild clears parent', () => {
            const parent = new Object3D()
            const child = new Object3D()
            parent.addChild(child)
            parent.removeChild(child)
            expect(child.parent).toBe(null)
            expect(parent.children.length).toBe(0)
        })

        test('addChild removes from previous parent', () => {
            const parent1 = new Object3D()
            const parent2 = new Object3D()
            const child = new Object3D()
            parent1.addChild(child)
            parent2.addChild(child)
            expect(parent1.children.length).toBe(0)
            expect(parent2.children.length).toBe(1)
            expect(child.parent).toBe(parent2)
        })

        test('addChild returns this', () => {
            const parent = new Object3D()
            const child = new Object3D()
            expect(parent.addChild(child)).toBe(parent)
        })

        test('removeChild of non-child is safe', () => {
            const parent = new Object3D()
            const other = new Object3D()
            parent.removeChild(other)
            expect(parent.children.length).toBe(0)
        })

    })


    describe('updateLocalMatrix', () => {

        test('identity transform produces identity matrix', () => {
            const obj = new Object3D()
            obj.updateLocalMatrix()
            const identity = new Matrix4()
            for (let i = 0; i < 16; i++) {
                expectClose(obj.localMatrix.elements[i], identity.elements[i])
            }
        })

        test('translation is in the matrix', () => {
            const obj = new Object3D({x: 5, y: 10, z: 15})
            obj.updateLocalMatrix()
            expectClose(obj.localMatrix.elements[12], 5)
            expectClose(obj.localMatrix.elements[13], 10)
            expectClose(obj.localMatrix.elements[14], 15)
        })

    })


    describe('updateWorldMatrix', () => {

        test('root object world = local', () => {
            const obj = new Object3D({x: 3, y: 4, z: 5})
            obj.updateWorldMatrix()
            expectClose(obj.worldMatrix.elements[12], 3)
            expectClose(obj.worldMatrix.elements[13], 4)
            expectClose(obj.worldMatrix.elements[14], 5)
        })

        test('child world = parent * child local', () => {
            const parent = new Object3D({x: 10, y: 0, z: 0})
            const child = new Object3D({x: 5, y: 0, z: 0})
            parent.addChild(child)

            parent.updateWorldMatrix()

            expectClose(child.worldMatrix.elements[12], 15)
        })

        test('nested hierarchy composes correctly', () => {
            const a = new Object3D({x: 1, y: 0, z: 0})
            const b = new Object3D({x: 2, y: 0, z: 0})
            const c = new Object3D({x: 3, y: 0, z: 0})
            a.addChild(b)
            b.addChild(c)

            a.updateWorldMatrix()

            expectClose(c.worldMatrix.elements[12], 6)
        })

        test('dirty flag prevents unnecessary recomputation', () => {
            const obj = new Object3D({x: 1, y: 2, z: 3})
            obj.updateWorldMatrix()
            const ref = obj.worldMatrix.elements[12]

            obj.position.set(99, 99, 99)
            obj.updateWorldMatrix()
            expect(obj.worldMatrix.elements[12]).toBe(ref)
        })

        test('markDirty triggers recomputation', () => {
            const obj = new Object3D({x: 1, y: 2, z: 3})
            obj.updateWorldMatrix()

            obj.position.set(99, 0, 0)
            obj.markDirty()
            obj.updateWorldMatrix()
            expectClose(obj.worldMatrix.elements[12], 99)
        })

        test('markDirty propagates to children', () => {
            const parent = new Object3D({x: 10, y: 0, z: 0})
            const child = new Object3D({x: 5, y: 0, z: 0})
            parent.addChild(child)
            parent.updateWorldMatrix()

            parent.position.set(20, 0, 0)
            parent.markDirty()
            parent.updateWorldMatrix()

            expectClose(child.worldMatrix.elements[12], 25)
        })

    })


    describe('getSortedChildren', () => {

        test('sorts by depth', () => {
            const parent = new Object3D()
            const a = new Object3D({depth: 3})
            const b = new Object3D({depth: 1})
            const c = new Object3D({depth: 2})
            parent.addChild(a)
            parent.addChild(b)
            parent.addChild(c)

            const sorted = parent.getSortedChildren()
            expect(sorted[0]).toBe(b)
            expect(sorted[1]).toBe(c)
            expect(sorted[2]).toBe(a)
        })

        test('returns children directly if 0 or 1', () => {
            const parent = new Object3D()
            expect(parent.getSortedChildren()).toBe(parent.children)

            const child = new Object3D()
            parent.addChild(child)
            expect(parent.getSortedChildren()).toBe(parent.children)
        })

    })

})
