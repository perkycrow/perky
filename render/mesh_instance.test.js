import MeshInstance from './mesh_instance.js'
import Object3D from './object_3d.js'


describe('MeshInstance', () => {

    test('extends Object3D', () => {
        const mi = new MeshInstance()
        expect(mi).toBeInstanceOf(Object3D)
    })


    test('default values', () => {
        const mi = new MeshInstance()
        expect(mi.mesh).toBe(null)
        expect(mi.texture).toBe(null)
        expect(mi.tint).toBe(null)
    })


    test('with options', () => {
        const fakeMesh = {id: 'mesh'}
        const fakeTexture = {id: 'tex'}
        const mi = new MeshInstance({
            mesh: fakeMesh,
            texture: fakeTexture,
            tint: '#ff0000',
            x: 5,
            y: 10,
            z: 15
        })
        expect(mi.mesh).toBe(fakeMesh)
        expect(mi.texture).toBe(fakeTexture)
        expect(mi.tint).toBe('#ff0000')
        expect(mi.position.x).toBe(5)
        expect(mi.position.y).toBe(10)
        expect(mi.position.z).toBe(15)
    })


    describe('renderHints', () => {

        test('returns null when no tint', () => {
            const mi = new MeshInstance()
            expect(mi.renderHints).toBe(null)
        })

        test('returns tint when set', () => {
            const mi = new MeshInstance({tint: '#ff0000'})
            expect(mi.renderHints).toEqual({tint: '#ff0000'})
        })

    })


    test('inherits Object3D transform', () => {
        const mi = new MeshInstance({x: 1, y: 2, z: 3})
        mi.updateWorldMatrix()
        expect(mi.worldMatrix.elements[12]).toBeCloseTo(1)
        expect(mi.worldMatrix.elements[13]).toBeCloseTo(2)
        expect(mi.worldMatrix.elements[14]).toBeCloseTo(3)
    })


    test('parent-child works', () => {
        const parent = new MeshInstance({x: 10, y: 0, z: 0})
        const child = new MeshInstance({x: 5, y: 0, z: 0})
        parent.addChild(child)
        parent.updateWorldMatrix()
        expect(child.worldMatrix.elements[12]).toBeCloseTo(15)
    })

})
