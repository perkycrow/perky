import {describe, test, expect} from 'vitest'
import Sprite from './sprite.js'
import SpriteMaterial from '../materials/sprite_material.js'
import SpriteTexture from '../textures/sprite_texture.js'
import {Texture} from 'three'


describe('Sprite', () => {

    test('constructor with default parameters creates basic sprite', () => {
        const sprite = new Sprite()

        expect(sprite.material).toBeInstanceOf(SpriteMaterial)
        expect(sprite.material.color.getHex()).toBe(0xffffff)
        expect(sprite.material.transparent).toBe(true)
        expect(sprite.material.map).toBe(null)
    })


    test('constructor with source creates sprite with optimized texture', () => {
        const mockImage = document.createElement('canvas')
        const sprite = new Sprite({
            source: mockImage
        })

        expect(sprite.material).toBeInstanceOf(SpriteMaterial)
        expect(sprite.material.map).toBeInstanceOf(SpriteTexture)
        expect(sprite.material.map.image).toBe(mockImage)
        expect(sprite.material.map.colorSpace).toBe('srgb')
    })


    test('constructor with image parameter (alias for source)', () => {
        const mockImage = document.createElement('canvas')
        const sprite = new Sprite({
            image: mockImage
        })

        expect(sprite.material.map).toBeInstanceOf(SpriteTexture)
        expect(sprite.material.map.image).toBe(mockImage)
    })


    test('constructor with texture object parameters', () => {
        const mockImage = document.createElement('canvas')
        const sprite = new Sprite({
            texture: {
                source: mockImage,
                generateMipmaps: false,
                anisotropy: 16
            }
        })

        expect(sprite.material.map).toBeInstanceOf(SpriteTexture)
        expect(sprite.material.map.image).toBe(mockImage)
        expect(sprite.material.map.generateMipmaps).toBe(false)
        expect(sprite.material.map.anisotropy).toBe(16)
    })


    test('constructor with existing Three.js texture', () => {
        const mockImage = document.createElement('canvas')
        const existingTexture = new Texture(mockImage)
        
        const sprite = new Sprite({
            texture: existingTexture
        })

        expect(sprite.material.map).toBe(existingTexture)
        expect(sprite.material.map).not.toBeInstanceOf(SpriteTexture)
    })


    test('constructor with material parameter uses it directly', () => {
        const customMaterial = new SpriteMaterial({
            color: 0xff0000
        })
        
        const sprite = new Sprite({
            material: customMaterial
        })

        expect(sprite.material).toBe(customMaterial)
        expect(sprite.material.color.getHex()).toBe(0xff0000)
    })


    test('constructor combines texture and material parameters', () => {
        const mockImage = document.createElement('canvas')
        
        const sprite = new Sprite({
            source: mockImage,
            color: 0x00ff00,
            sizeAttenuation: false,
            opacity: 0.8
        })

        expect(sprite.material.map).toBeInstanceOf(SpriteTexture)
        expect(sprite.material.map.image).toBe(mockImage)
        expect(sprite.material.color.getHex()).toBe(0x00ff00)
        expect(sprite.material.sizeAttenuation).toBe(false)
        expect(sprite.material.opacity).toBe(0.8)
    })


    test('constructor with advanced texture and material config', () => {
        const mockImage = document.createElement('canvas')
        
        const sprite = new Sprite({
            texture: {
                image: mockImage,
                generateMipmaps: true,
                anisotropy: 8
            },
            color: 0xff6600,
            rotation: Math.PI / 4,
            transparent: true
        })

        expect(sprite.material.map.generateMipmaps).toBe(true)
        expect(sprite.material.map.anisotropy).toBe(8)
        expect(sprite.material.color.getHex()).toBe(0xff6600)
        expect(sprite.material.rotation).toBe(Math.PI / 4)
    })


    test('parameter priority: texture > source > image', () => {
        const mockImage1 = document.createElement('canvas')
        const mockImage2 = document.createElement('canvas')
        const mockImage3 = document.createElement('canvas')
        
        const sprite = new Sprite({
            texture: {source: mockImage1},
            source: mockImage2,
            image: mockImage3
        })

        expect(sprite.material.map.image).toBe(mockImage1)
    })


    test('material parameter has absolute priority', () => {
        const mockImage = document.createElement('canvas')
        const customMaterial = new SpriteMaterial({
            color: 0xff00ff
        })
        
        const sprite = new Sprite({
            material: customMaterial,
            source: mockImage,
            color: 0x00ff00
        })

        expect(sprite.material).toBe(customMaterial)
        expect(sprite.material.color.getHex()).toBe(0xff00ff)
        expect(sprite.material.map).toBe(null)
    })


    test('constructor with all SpriteMaterial properties', () => {
        const sprite = new Sprite({
            color: 0x123456,
            fog: false,
            rotation: Math.PI,
            sizeAttenuation: false,
            transparent: false,
            opacity: 0.5
        })

        expect(sprite.material.color.getHex()).toBe(0x123456)
        expect(sprite.material.fog).toBe(false)
        expect(sprite.material.rotation).toBe(Math.PI)
        expect(sprite.material.sizeAttenuation).toBe(false)
        expect(sprite.material.transparent).toBe(false)
        expect(sprite.material.opacity).toBe(0.5)
    })

})
