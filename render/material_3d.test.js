import Material3D from './material_3d.js'


describe('Material3D', () => {

    test('default values', () => {
        const mat = new Material3D()
        expect(mat.texture).toBe(null)
        expect(mat.color).toEqual([1, 1, 1])
        expect(mat.emissive).toEqual([0, 0, 0])
        expect(mat.opacity).toBe(1)
        expect(mat.unlit).toBe(false)
    })


    test('with all options', () => {
        const tex = {id: 'tex'}
        const mat = new Material3D({
            texture: tex,
            color: [0.5, 0.3, 0.1],
            emissive: [1, 0.9, 0.6],
            opacity: 0.8,
            unlit: true
        })
        expect(mat.texture).toBe(tex)
        expect(mat.color).toEqual([0.5, 0.3, 0.1])
        expect(mat.emissive).toEqual([1, 0.9, 0.6])
        expect(mat.opacity).toBe(0.8)
        expect(mat.unlit).toBe(true)
    })


    test('partial options keep defaults', () => {
        const mat = new Material3D({color: [0.8, 0.8, 0.8]})
        expect(mat.texture).toBe(null)
        expect(mat.color).toEqual([0.8, 0.8, 0.8])
        expect(mat.emissive).toEqual([0, 0, 0])
        expect(mat.opacity).toBe(1)
        expect(mat.unlit).toBe(false)
    })

})
