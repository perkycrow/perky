import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import Sprite from './sprite.js'
import SpriteMaterial from '../materials/sprite_material.js'
import SpriteTexture from '../textures/sprite_texture.js'
import ThreeSpritesheet from '../three_spritesheet.js'
import Spritesheet from '../spritesheet.js'
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
        const threeTexture = new Texture()
        const sprite = new Sprite({
            texture: threeTexture
        })

        expect(sprite.material.map).toBe(threeTexture)
    })


    test('constructor with material parameter uses it directly', () => {
        const customMaterial = new SpriteMaterial({color: 0xff0000})
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
            transparent: false
        })

        expect(sprite.material).toBeInstanceOf(SpriteMaterial)
        expect(sprite.material.map).toBeInstanceOf(SpriteTexture)
        expect(sprite.material.map.image).toBe(mockImage)
        expect(sprite.material.color.getHex()).toBe(0x00ff00)
        expect(sprite.material.transparent).toBe(false)
    })


    test('constructor with advanced texture and material config', () => {
        const mockImage = document.createElement('canvas')
        const sprite = new Sprite({
            texture: {
                source: mockImage,
                generateMipmaps: false,
                colorSpace: 'srgb-linear'
            },
            color: 0xff00ff,
            fog: false,
            rotation: Math.PI / 2,
            sizeAttenuation: false
        })

        expect(sprite.material.map.generateMipmaps).toBe(false)
        expect(sprite.material.map.colorSpace).toBe('srgb-linear')
        expect(sprite.material.color.getHex()).toBe(0xff00ff)
        expect(sprite.material.fog).toBe(false)
        expect(sprite.material.rotation).toBe(Math.PI / 2)
        expect(sprite.material.sizeAttenuation).toBe(false)
    })


    test('parameter priority: texture > source > image', () => {
        const textureImage = document.createElement('canvas')
        const sourceImage = document.createElement('canvas')
        const imageImage = document.createElement('canvas')

        const sprite = new Sprite({
            texture: {source: textureImage},
            source: sourceImage,
            image: imageImage
        })

        expect(sprite.material.map.image).toBe(textureImage)
    })


    test('material parameter has absolute priority', () => {
        const customMaterial = new SpriteMaterial({color: 0x123456})
        const mockImage = document.createElement('canvas')

        const sprite = new Sprite({
            material: customMaterial,
            source: mockImage,
            color: 0xff0000
        })

        expect(sprite.material).toBe(customMaterial)
        expect(sprite.material.color.getHex()).toBe(0x123456)
        expect(sprite.material.map).toBe(null)
    })


    test('constructor with all SpriteMaterial properties', () => {
        const mockImage = document.createElement('canvas')
        const sprite = new Sprite({
            source: mockImage,
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


describe('Sprite ThreeSpritesheet functionality', () => {
    let mockSpritesheet
    let threeSpritesheet
    let mockImage

    beforeEach(() => {
        mockImage = {
            width: 100,
            height: 100
        }

        // Setup mock spritesheet
        const spritesheetData = {
            frames: [
                {
                    filename: 'test1.png',
                    imageName: 'test1',
                    baseImage: 'sheet.png',
                    frame: {x: 0, y: 0, w: 50, h: 50}
                },
                {
                    filename: 'test2.png',
                    imageName: 'test2',
                    baseImage: 'sheet.png',
                    frame: {x: 50, y: 0, w: 50, h: 50}
                }
            ],
            meta: [{image: 'sheet.png'}]
        }
        
        mockSpritesheet = new Spritesheet(spritesheetData)
        mockSpritesheet.addImage('sheet.png', mockImage)
        
        threeSpritesheet = new ThreeSpritesheet(mockSpritesheet)
    })

    afterEach(() => {
        threeSpritesheet.dispose()
        vi.restoreAllMocks()
    })

    test('constructor with spritesheet and frame', () => {
        const sprite = new Sprite({
            spritesheet: threeSpritesheet,
            frame: 'test1'
        })
        
        expect(sprite.material).toBeInstanceOf(SpriteMaterial)
        expect(sprite.threeSpritesheet).toBe(threeSpritesheet)
        expect(sprite.currentFrame).toBe('test1')
    })

    test('constructor with invalid spritesheet frame', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        const sprite = new Sprite({
            spritesheet: threeSpritesheet,
            frame: 'nonexistent'
        })
        
        expect(consoleSpy).toHaveBeenCalledWith('Frame nonexistent not found in spritesheet')
        expect(sprite.threeSpritesheet).toBeUndefined()
        
        consoleSpy.mockRestore()
    })

    test('setFrame success', () => {
        const sprite = new Sprite({
            spritesheet: threeSpritesheet,
            frame: 'test1'
        })
        
        const result = sprite.setFrame('test2')
        
        expect(result).toBe(sprite)
        expect(sprite.currentFrame).toBe('test2')
    })

    test('setFrame on non-spritesheet sprite', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const sprite = new Sprite()
        
        const result = sprite.setFrame('test1')
        
        expect(result).toBe(sprite)
        expect(consoleSpy).toHaveBeenCalledWith('Cannot set frame: sprite was not created from a spritesheet')
        
        consoleSpy.mockRestore()
    })

    test('getFrame returns current frame', () => {
        const sprite = new Sprite({
            spritesheet: threeSpritesheet,
            frame: 'test1'
        })
        
        expect(sprite.getFrame()).toBe('test1')
        
        const regularSprite = new Sprite()
        expect(regularSprite.getFrame()).toBeNull()
    })

    test('getSpritesheet returns ThreeSpritesheet instance', () => {
        const sprite = new Sprite({
            spritesheet: threeSpritesheet,
            frame: 'test1'
        })
        
        expect(sprite.getSpritesheet()).toBe(threeSpritesheet)
        
        const regularSprite = new Sprite()
        expect(regularSprite.getSpritesheet()).toBeNull()
    })

    test('hasFrame checks frame existence', () => {
        const sprite = new Sprite({
            spritesheet: threeSpritesheet,
            frame: 'test1'
        })
        
        expect(sprite.hasFrame('test1')).toBe(true)
        expect(sprite.hasFrame('test2')).toBe(true)
        expect(sprite.hasFrame('nonexistent')).toBe(false)
        
        const regularSprite = new Sprite()
        expect(regularSprite.hasFrame('test1')).toBe(false)
    })

    test('getFrameNames returns available frames', () => {
        const sprite = new Sprite({
            spritesheet: threeSpritesheet,
            frame: 'test1'
        })
        
        const names = sprite.getFrameNames()
        expect(names).toContain('test1')
        expect(names).toContain('test2')
        
        const regularSprite = new Sprite()
        expect(regularSprite.getFrameNames()).toEqual([])
    })

})
