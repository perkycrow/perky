import SpriteSheetManager from './spritesheet_manager.js'
import PerkyModule from '../core/perky_module.js'
import Spritesheet from '../application/spritesheet.js'
import SpriteTexture from './textures/sprite_texture.js'
import SpriteMaterial from './materials/sprite_material.js'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


describe('SpriteSheetManager', () => {

    let manager
    let mockSpritesheet
    let mockImage


    beforeEach(() => {
        manager = new SpriteSheetManager()
        
        mockImage = {
            width: 100,
            height: 100
        }
        
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
        
        vi.spyOn(PerkyModule.prototype, 'emit')
    })


    afterEach(() => {
        vi.restoreAllMocks()
    })


    test('constructor', () => {
        expect(manager).toBeInstanceOf(PerkyModule)
        expect(manager.getAllSpritesheets()).toHaveLength(0)
        expect(manager.getSpritesheetIds()).toHaveLength(0)
    })


    test('registerSpritesheet success', () => {
        const result = manager.registerSpritesheet('test', mockSpritesheet)
        
        expect(result).toBe(true)
        expect(manager.getSpritesheet('test')).toBe(mockSpritesheet)
        expect(manager.emit).toHaveBeenCalledWith('spritesheet:registered', 'test', mockSpritesheet)
    })


    test('registerSpritesheet duplicate', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        manager.registerSpritesheet('test', mockSpritesheet)
        const result = manager.registerSpritesheet('test', mockSpritesheet)
        
        expect(result).toBe(false)
        expect(consoleSpy).toHaveBeenCalledWith('Spritesheet test already registered')
        
        consoleSpy.mockRestore()
    })


    test('unregisterSpritesheet success', () => {
        manager.registerSpritesheet('test', mockSpritesheet)
        const result = manager.unregisterSpritesheet('test')
        
        expect(result).toBe(true)
        expect(manager.getSpritesheet('test')).toBeUndefined()
        expect(manager.emit).toHaveBeenCalledWith('spritesheet:unregistered', 'test', mockSpritesheet)
    })


    test('unregisterSpritesheet non-existent', () => {
        const result = manager.unregisterSpritesheet('nonexistent')
        
        expect(result).toBe(false)
    })


    test('getFrame', () => {
        manager.registerSpritesheet('test', mockSpritesheet)
        
        const frame = manager.getFrame('test', 'test1')
        expect(frame).toBeDefined()
        expect(frame.imageName).toBe('test1')
        
        const noFrame = manager.getFrame('test', 'nonexistent')
        expect(noFrame).toBeNull()
        
        const noSpritesheet = manager.getFrame('nonexistent', 'test1')
        expect(noSpritesheet).toBeNull()
    })


    test('getTextureForFrame', () => {
        manager.registerSpritesheet('test', mockSpritesheet)
        
        const texture = manager.getTextureForFrame('test', 'test1')
        expect(texture).toBeInstanceOf(SpriteTexture)
        
        const noTexture = manager.getTextureForFrame('test', 'nonexistent')
        expect(noTexture).toBeNull()
    })


    test('getMaterialForFrame', () => {
        manager.registerSpritesheet('test', mockSpritesheet)
        
        const material = manager.getMaterialForFrame('test', 'test1')
        expect(material).toBeInstanceOf(SpriteMaterial)

        const sameMaterial = manager.getMaterialForFrame('test', 'test1')
        expect(sameMaterial).toBe(material)

        const differentMaterial = manager.getMaterialForFrame('test', 'test1', {color: 0xff0000})
        expect(differentMaterial).not.toBe(material)
    })


    test('createFrameTexture', () => {
        manager.registerSpritesheet('test', mockSpritesheet)

        const texture = manager.createFrameTexture('test', 'test1')
        expect(texture).toBeDefined()
        expect(texture.offset.x).toBe(0)
        expect(texture.offset.y).toBe(0)
        expect(texture.repeat.x).toBe(0.5)
        expect(texture.repeat.y).toBe(0.5)
        
        const noTexture = manager.createFrameTexture('test', 'nonexistent')
        expect(noTexture).toBeNull()
    })


    test('hasFrame', () => {
        manager.registerSpritesheet('test', mockSpritesheet)
        
        expect(manager.hasFrame('test', 'test1')).toBe(true)
        expect(manager.hasFrame('test', 'nonexistent')).toBe(false)
        expect(manager.hasFrame('nonexistent', 'test1')).toBe(false)
    })


    test('getFrameNames', () => {
        manager.registerSpritesheet('test', mockSpritesheet)
        
        const names = manager.getFrameNames('test')
        expect(names).toContain('test1')
        expect(names).toContain('test2')
        
        const noNames = manager.getFrameNames('nonexistent')
        expect(noNames).toEqual([])
    })


    test('getAllSpritesheets', () => {
        expect(manager.getAllSpritesheets()).toHaveLength(0)
        
        manager.registerSpritesheet('test1', mockSpritesheet)
        manager.registerSpritesheet('test2', mockSpritesheet)
        
        expect(manager.getAllSpritesheets()).toHaveLength(2)
    })


    test('getSpritesheetIds', () => {
        expect(manager.getSpritesheetIds()).toHaveLength(0)
        
        manager.registerSpritesheet('test1', mockSpritesheet)
        manager.registerSpritesheet('test2', mockSpritesheet)
        
        const ids = manager.getSpritesheetIds()
        expect(ids).toContain('test1')
        expect(ids).toContain('test2')
    })


    test('singleton pattern', () => {
        const instance1 = SpriteSheetManager.getInstance()
        const instance2 = SpriteSheetManager.getInstance()
        
        expect(instance1).toBe(instance2)
        expect(instance1).toBeInstanceOf(SpriteSheetManager)
    })


    test('texture creation events', () => {
        manager.registerSpritesheet('test', mockSpritesheet)
        
        expect(manager.emit).toHaveBeenCalledWith('texture:created', 'sheet.png', expect.any(SpriteTexture))
    })


    test('unregister cleans up resources', () => {
        manager.registerSpritesheet('test', mockSpritesheet)

        let texture = manager.getTextureForFrame('test', 'test1')
        expect(texture).not.toBeNull()

        const result = manager.unregisterSpritesheet('test')
        expect(result).toBe(true)

        texture = manager.getTextureForFrame('test', 'test1')
        expect(texture).toBeNull()
    })

})
