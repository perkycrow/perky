import SpriteMaterial from './sprite_material'
import SpriteTexture from '../textures/sprite_texture'
import {describe, test, expect} from 'vitest'
import {Texture, Color} from 'three'


describe('SpriteMaterial', () => {

    test('constructor with default values', () => {
        const material = new SpriteMaterial()

        expect(material.color.getHex()).toBe(0xffffff)
        expect(material.fog).toBe(true)
        expect(material.rotation).toBe(0)
        expect(material.sizeAttenuation).toBe(true)
        expect(material.transparent).toBe(true)
        expect(material.map).toBe(null)
    })


    test('constructor with custom basic parameters', () => {
        const material = new SpriteMaterial({
            color: 0xff0000,
            fog: false,
            rotation: Math.PI / 2,
            sizeAttenuation: false,
            transparent: false
        })

        expect(material.color.getHex()).toBe(0xff0000)
        expect(material.fog).toBe(false)
        expect(material.rotation).toBe(Math.PI / 2)
        expect(material.sizeAttenuation).toBe(false)
        expect(material.transparent).toBe(false)
    })


    test('constructor with map parameter has priority', () => {
        const mockImage = document.createElement('canvas')
        const existingTexture = new Texture(mockImage)
        const textureParams = {image: mockImage}

        const material = new SpriteMaterial({
            map: existingTexture,
            texture: textureParams
        })

        expect(material.map).toBe(existingTexture)
        expect(material.map).not.toBeInstanceOf(SpriteTexture)
    })


    test('constructor with texture as Three.js Texture instance', () => {
        const mockImage = document.createElement('canvas')
        const existingTexture = new Texture(mockImage)

        const material = new SpriteMaterial({
            texture: existingTexture
        })

        expect(material.map).toBe(existingTexture)
        expect(material.map).not.toBeInstanceOf(SpriteTexture)
    })


    test('constructor with texture as object creates SpriteTexture', () => {
        const mockImage = document.createElement('canvas')

        const material = new SpriteMaterial({
            texture: {
                image: mockImage,
                anisotropy: 8
            }
        })

        expect(material.map).toBeInstanceOf(SpriteTexture)
        expect(material.map.image).toBe(mockImage)
        expect(material.map.anisotropy).toBe(8)
    })


    test('constructor with texture as empty object creates default SpriteTexture', () => {
        const material = new SpriteMaterial({
            texture: {}
        })

        expect(material.map).toBeInstanceOf(SpriteTexture)
        expect(material.map.colorSpace).toBe('srgb')
        expect(material.map.generateMipmaps).toBe(true)
    })


    test('constructor without map or texture keeps null map', () => {
        const material = new SpriteMaterial({
            color: 0x00ff00
        })

        expect(material.map).toBe(null)
        expect(material.color.getHex()).toBe(0x00ff00)
    })


    test('constructor with alphaMap', () => {
        const mockImage = document.createElement('canvas')
        const alphaTexture = new Texture(mockImage)

        const material = new SpriteMaterial({
            alphaMap: alphaTexture
        })

        expect(material.alphaMap).toBe(alphaTexture)
    })


    test('constructor with additional material properties', () => {
        const material = new SpriteMaterial({
            opacity: 0.5,
            blending: 2,
            side: 2
        })

        expect(material.opacity).toBe(0.5)
        expect(material.blending).toBe(2)
        expect(material.side).toBe(2)
    })


    test('constructor combines texture creation with material properties', () => {
        const mockImage = document.createElement('canvas')

        const material = new SpriteMaterial({
            texture: {
                image: mockImage,
                generateMipmaps: false
            },
            color: 0x123456,
            rotation: Math.PI,
            opacity: 0.8
        })

        expect(material.map).toBeInstanceOf(SpriteTexture)
        expect(material.map.image).toBe(mockImage)
        expect(material.map.generateMipmaps).toBe(false)
        expect(material.color.getHex()).toBe(0x123456)
        expect(material.rotation).toBe(Math.PI)
        expect(material.opacity).toBe(0.8)
    })


    test('constructor with Color instance', () => {
        const customColor = new Color(0.5, 0.7, 0.9)

        const material = new SpriteMaterial({
            color: customColor
        })

        expect(material.color.r).toBe(0.5)
        expect(material.color.g).toBe(0.7)
        expect(material.color.b).toBe(0.9)
    })


    test('constructor with complex texture parameters', () => {
        const mockImage = document.createElement('canvas')

        const material = new SpriteMaterial({
            texture: {
                source: mockImage,
                generateMipmaps: true,
                anisotropy: 16,
                colorSpace: 'srgb'
            }
        })

        expect(material.map).toBeInstanceOf(SpriteTexture)
        expect(material.map.image).toBe(mockImage)
        expect(material.map.generateMipmaps).toBe(true)
        expect(material.map.anisotropy).toBe(16)
    })


    test('SpriteMaterial with SpriteTexture parameters creates optimized sprite setup', () => {
        const mockCanvas = document.createElement('canvas')
        
        const material = new SpriteMaterial({
            texture: {
                image: mockCanvas,
                generateMipmaps: true,
                anisotropy: 16
            },
            color: 0xff6600,
            rotation: Math.PI / 4
        })

        expect(material.map).toBeInstanceOf(SpriteTexture)
        expect(material.map.image).toBe(mockCanvas)
        expect(material.map.colorSpace).toBe('srgb')
        expect(material.map.generateMipmaps).toBe(true)
        expect(material.map.anisotropy).toBe(16)
        
        expect(material.color.getHex()).toBe(0xff6600)
        expect(material.rotation).toBe(Math.PI / 4)
        expect(material.transparent).toBe(true)
    })


    test('Complete sprite creation workflow', () => {
        const mockImage = document.createElement('canvas')
        
        const spriteTexture = new SpriteTexture({
            source: mockImage,
            generateMipmaps: false,
            anisotropy: 8
        })
        
        const spriteMaterial = new SpriteMaterial({
            texture: spriteTexture,
            color: 0x00ff00,
            sizeAttenuation: false
        })
        
        expect(spriteMaterial.map).toBe(spriteTexture)
        expect(spriteMaterial.map.image).toBe(mockImage)
        expect(spriteMaterial.map.generateMipmaps).toBe(false)
        expect(spriteMaterial.color.getHex()).toBe(0x00ff00)
        expect(spriteMaterial.sizeAttenuation).toBe(false)
    })


    test('Comparison with manual Three.js approach', () => {
        const mockCanvas = document.createElement('canvas')
        
        const manualTexture = new Texture(mockCanvas)
        manualTexture.colorSpace = 'srgb'
        manualTexture.generateMipmaps = true
        manualTexture.needsUpdate = true
        
        const autoMaterial = new SpriteMaterial({
            texture: {
                image: mockCanvas
            }
        })
        
        expect(autoMaterial.map.image).toBe(mockCanvas)
        expect(autoMaterial.map.colorSpace).toBe(manualTexture.colorSpace)
        expect(autoMaterial.map.generateMipmaps).toBe(manualTexture.generateMipmaps)
        expect(autoMaterial.map).toBeInstanceOf(SpriteTexture)
    })


    test('Flexibility: mix and match approaches', () => {
        const mockImage = document.createElement('canvas')
        
        const customTexture = new SpriteTexture({
            source: mockImage,
            anisotropy: false
        })
        
        const material = new SpriteMaterial({
            map: customTexture,
            texture: {
                anisotropy: 16
            },
            color: 0xff00ff,
            opacity: 0.7
        })
        
        expect(material.map).toBe(customTexture)
        expect(material.map.anisotropy).toBe(1)
        expect(material.color.getHex()).toBe(0xff00ff)
        expect(material.opacity).toBe(0.7)
    })

}) 