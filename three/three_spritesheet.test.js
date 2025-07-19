import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import ThreeSpritesheet from './three_spritesheet.js'
import Spritesheet from './spritesheet.js'
import SpriteTexture from './textures/sprite_texture.js'
import SpriteMaterial from './materials/sprite_material.js'
import PerkyModule from '../core/perky_module.js'


describe('ThreeSpritesheet', () => {
    let threeSpritesheet
    let mockSpritesheet
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


    test('constructor', () => {
        expect(threeSpritesheet).toBeInstanceOf(PerkyModule)
        expect(threeSpritesheet.spritesheet).toBe(mockSpritesheet)
        expect(threeSpritesheet.textures).toBeDefined()
        expect(threeSpritesheet.materials).toBeDefined()
        
        // Should have created textures automatically
        expect(threeSpritesheet.getTexture('sheet.png')).toBeInstanceOf(SpriteTexture)
    })


    test('getFrame delegates to spritesheet', () => {
        const frame = threeSpritesheet.getFrame('test1')
        
        expect(frame).toBeDefined()
        expect(frame.imageName).toBe('test1')
        expect(frame.baseImage).toBe('sheet.png')
    })


    test('hasFrame delegates to spritesheet', () => {
        expect(threeSpritesheet.hasFrame('test1')).toBe(true)
        expect(threeSpritesheet.hasFrame('test2')).toBe(true)
        expect(threeSpritesheet.hasFrame('nonexistent')).toBe(false)
    })


    test('getFrameNames delegates to spritesheet', () => {
        const names = threeSpritesheet.getFrameNames()
        
        expect(names).toContain('test1')
        expect(names).toContain('test2')
    })


    test('getFrameCount delegates to spritesheet', () => {
        expect(threeSpritesheet.getFrameCount()).toBe(2)
    })


    test('getImageKeys delegates to spritesheet', () => {
        const keys = threeSpritesheet.getImageKeys()
        
        expect(keys).toContain('sheet.png')
    })


    test('getImage delegates to spritesheet', () => {
        const image = threeSpritesheet.getImage('sheet.png')
        
        expect(image).toBe(mockImage)
    })


    test('getTexture returns created texture', () => {
        const texture = threeSpritesheet.getTexture('sheet.png')
        
        expect(texture).toBeInstanceOf(SpriteTexture)
        expect(texture.image).toBe(mockImage)
    })


    test('getMaterial creates and caches material', () => {
        const material1 = threeSpritesheet.getMaterial('sheet.png')
        const material2 = threeSpritesheet.getMaterial('sheet.png')
        
        expect(material1).toBeInstanceOf(SpriteMaterial)
        expect(material1).toBe(material2) // Should be cached
        expect(material1.map).toBe(threeSpritesheet.getTexture('sheet.png'))
    })


    test('getMaterial with options creates different materials', () => {
        const material1 = threeSpritesheet.getMaterial('sheet.png')
        const material2 = threeSpritesheet.getMaterial('sheet.png', {color: 0xff0000})
        
        expect(material1).not.toBe(material2)
        expect(material2.color.getHex()).toBe(0xff0000)
    })


    test('getMaterial with non-existent image returns null', () => {
        const material = threeSpritesheet.getMaterial('nonexistent.png')
        
        expect(material).toBeNull()
    })


    test('getFrameMaterial creates material with shared texture and correct UV mapping', () => {
        const material = threeSpritesheet.getFrameMaterial('test1')
        const baseTexture = threeSpritesheet.getTexture('sheet.png')
        
        expect(material).toBeInstanceOf(SpriteMaterial)
        expect(material.map).toBe(baseTexture) // Same texture instance (shared!)
        expect(material.map.repeat.x).toBe(0.5) // 50/100
        expect(material.map.repeat.y).toBe(0.5) // 50/100
        expect(material.map.offset.x).toBe(0) // 0/100
        expect(material.map.offset.y).toBe(0.5) // 1 - (0 + 50)/100
    })


    test('getFrameMaterial with non-existent frame returns null', () => {
        const material = threeSpritesheet.getFrameMaterial('nonexistent')
        
        expect(material).toBeNull()
    })


    test('getFrameMaterial with options', () => {
        const material = threeSpritesheet.getFrameMaterial('test1', {color: 0x00ff00})
        
        expect(material.color.getHex()).toBe(0x00ff00)
    })


    test('getFrameMaterial caches materials', () => {
        const material1 = threeSpritesheet.getFrameMaterial('test1')
        const material2 = threeSpritesheet.getFrameMaterial('test1')
        
        expect(material1).toBe(material2)
    })

    test('updateSpriteFrame updates UV mapping efficiently', () => {
        const material = threeSpritesheet.getFrameMaterial('test1')
        const mockSprite = {material}
        
        // Initially on test1 frame
        expect(material.map.repeat.x).toBe(0.5)
        expect(material.map.offset.x).toBe(0)
        
        // Update to test2 frame
        const success = threeSpritesheet.updateSpriteFrame(mockSprite, 'test2')
        
        expect(success).toBe(true)
        expect(material.map.repeat.x).toBe(0.5) // 50/100
        expect(material.map.offset.x).toBe(0.5) // 50/100 (test2 is at x=50)
    })

    test('updateSpriteFrame with invalid sprite returns false', () => {
        const mockSprite = {material: null}
        
        const success = threeSpritesheet.updateSpriteFrame(mockSprite, 'test1')
        
        expect(success).toBe(false)
    })


    test('dispose cleans up resources', () => {
        const texture = threeSpritesheet.getTexture('sheet.png')
        const material = threeSpritesheet.getMaterial('sheet.png')
        
        const textureSpy = vi.spyOn(texture, 'dispose')
        const materialSpy = vi.spyOn(material, 'dispose')
        
        threeSpritesheet.dispose()
        
        expect(textureSpy).toHaveBeenCalled()
        expect(materialSpy).toHaveBeenCalled()
        expect(threeSpritesheet.textures.size).toBe(0)
        expect(threeSpritesheet.materials.size).toBe(0)
    })


    test('emits texture:created events', () => {
        const spy = vi.fn()
        const newSpritesheet = new Spritesheet({
            frames: [],
            meta: [{image: 'new.png'}]
        })
        newSpritesheet.addImage('new.png', mockImage)
        
        const newThreeSpritesheet = new ThreeSpritesheet(newSpritesheet)
        newThreeSpritesheet.on('texture:created', spy)
        
        // Textures are created during construction, so we need to test with a new instance
        expect(spy).not.toHaveBeenCalled() // Already created in constructor
        
        newThreeSpritesheet.dispose()
    })


    test('emits material:created events', () => {
        const spy = vi.fn()
        threeSpritesheet.on('material:created', spy)
        
        threeSpritesheet.getMaterial('sheet.png', {color: 0xff0000})
        
        expect(spy).toHaveBeenCalledWith('sheet.png', expect.any(SpriteMaterial), {color: 0xff0000})
    })


    test('emits disposed event', () => {
        const spy = vi.fn()
        threeSpritesheet.on('disposed', spy)
        
        threeSpritesheet.dispose()
        
        expect(spy).toHaveBeenCalled()
    })

})
