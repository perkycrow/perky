import Sprite3D from './sprite_3d.js'
import Object3D from './object_3d.js'
import Material3D from './material_3d.js'


describe('Sprite3D', () => {

    test('extends Object3D', () => {
        const sprite = new Sprite3D()
        expect(sprite).toBeInstanceOf(Object3D)
    })


    test('default values', () => {
        const sprite = new Sprite3D()
        expect(sprite.texture).toBe(null)
        expect(sprite.material).toBe(null)
        expect(sprite.width).toBe(1)
        expect(sprite.height).toBe(1)
        expect(sprite.castShadow).toBe(false)
        expect(sprite.anchorX).toBe(0.5)
        expect(sprite.anchorY).toBe(0.0)
    })


    test('with options', () => {
        const tex = {id: 'tex'}
        const sprite = new Sprite3D({
            texture: tex,
            width: 2,
            height: 3,
            castShadow: true,
            anchorX: 0.0,
            anchorY: 0.5,
            x: 1,
            y: 2,
            z: 3
        })
        expect(sprite.texture).toBe(tex)
        expect(sprite.width).toBe(2)
        expect(sprite.height).toBe(3)
        expect(sprite.castShadow).toBe(true)
        expect(sprite.anchorX).toBe(0.0)
        expect(sprite.anchorY).toBe(0.5)
        expect(sprite.position.x).toBe(1)
        expect(sprite.position.y).toBe(2)
        expect(sprite.position.z).toBe(3)
    })

})


describe('activeTexture', () => {

    test('returns texture when no material', () => {
        const tex = {id: 'tex'}
        const sprite = new Sprite3D({texture: tex})
        expect(sprite.activeTexture).toBe(tex)
    })


    test('returns material texture when material is set', () => {
        const matTex = {id: 'matTex'}
        const mat = new Material3D({texture: matTex})
        const sprite = new Sprite3D({texture: {id: 'direct'}, material: mat})
        expect(sprite.activeTexture).toBe(matTex)
    })


    test('returns null when neither is set', () => {
        const sprite = new Sprite3D()
        expect(sprite.activeTexture).toBe(null)
    })

})


describe('renderHints', () => {

    test('returns null when no material', () => {
        const sprite = new Sprite3D()
        expect(sprite.renderHints).toBe(null)
    })


    test('returns material when set', () => {
        const mat = new Material3D({roughness: 0.8})
        const sprite = new Sprite3D({material: mat})
        expect(sprite.renderHints).toEqual({material: mat})
    })

})


describe('transform', () => {

    test('inherits Object3D transform', () => {
        const sprite = new Sprite3D({x: 1, y: 2, z: 3})
        sprite.updateWorldMatrix()
        expect(sprite.worldMatrix.elements[12]).toBeCloseTo(1)
        expect(sprite.worldMatrix.elements[13]).toBeCloseTo(2)
        expect(sprite.worldMatrix.elements[14]).toBeCloseTo(3)
    })


    test('parent-child works', () => {
        const parent = new Object3D({x: 10})
        const child = new Sprite3D({x: 5})
        parent.addChild(child)
        parent.updateWorldMatrix()
        expect(child.worldMatrix.elements[12]).toBeCloseTo(15)
    })

})
