import Spritesheet from './spritesheet'
import {vi, beforeEach, describe, test, expect} from 'vitest'


describe('Spritesheet', () => {
    let mockImage1
    let mockImage2
    let spritesheetData

    beforeEach(() => {
        mockImage1 = {width: 100, height: 50}
        mockImage2 = {width: 200, height: 100}
        
        spritesheetData = {
            frames: [
                {
                    filename: 'sprite1.png',
                    imageName: 'sprite1',
                    baseImage: 'sheet1.png',
                    frame: {x: 0, y: 0, w: 50, h: 50}
                },
                {
                    filename: 'sprite2.png', 
                    imageName: 'sprite2',
                    baseImage: 'sheet1.png',
                    frame: {x: 50, y: 0, w: 50, h: 50}
                },
                {
                    filename: 'sprite3.png',
                    imageName: 'sprite3', 
                    baseImage: 'sheet2.png',
                    frame: {x: 0, y: 0, w: 100, h: 100}
                }
            ],
            meta: [
                {image: 'sheet1.png', size: {w: 100, h: 50}},
                {image: 'sheet2.png', size: {w: 200, h: 100}}
            ]
        }
    })


    test('constructor', () => {
        const spritesheet = new Spritesheet(spritesheetData)
        
        expect(spritesheet.getFrameCount()).toBe(3)
        expect(spritesheet.metadata).toEqual(spritesheetData.meta)
        expect(spritesheet.hasFrame('sprite1')).toBe(true)
        expect(spritesheet.hasFrame('sprite1.png')).toBe(true)
    })


    test('empty constructor', () => {
        const spritesheet = new Spritesheet()
        
        expect(spritesheet.getFrameCount()).toBe(0)
        expect(spritesheet.metadata).toEqual([])
    })


    test('addImage', () => {
        const spritesheet = new Spritesheet(spritesheetData)
        
        spritesheet.addImage('sheet1.png', mockImage1)
        spritesheet.addImage('sheet2.png', mockImage2)
        
        expect(spritesheet.getImage('sheet1.png')).toBe(mockImage1)
        expect(spritesheet.getImage('sheet2.png')).toBe(mockImage2)
        
        // Check that frames are updated with correct images
        const frame1 = spritesheet.getFrame('sprite1')
        const frame3 = spritesheet.getFrame('sprite3')
        
        expect(frame1.image).toBe(mockImage1)
        expect(frame3.image).toBe(mockImage2)
    })


    test('getFrame', () => {
        const spritesheet = new Spritesheet(spritesheetData)
        
        // By name
        const frame1 = spritesheet.getFrame('sprite1')
        expect(frame1.imageName).toBe('sprite1')
        expect(frame1.frame).toEqual({x: 0, y: 0, w: 50, h: 50})
        
        // By filename  
        const frame2 = spritesheet.getFrame('sprite2.png')
        expect(frame2.imageName).toBe('sprite2')
        
        // By index
        const frame3 = spritesheet.getFrame(2)
        expect(frame3.imageName).toBe('sprite3')
        
        // Invalid
        expect(spritesheet.getFrame('nonexistent')).toBe(null)
        expect(spritesheet.getFrame(10)).toBe(null)
        expect(spritesheet.getFrame({})).toBe(null)
    })


    test('getFrameByName', () => {
        const spritesheet = new Spritesheet(spritesheetData)
        
        const frame = spritesheet.getFrameByName('sprite2')
        expect(frame.imageName).toBe('sprite2')
        expect(frame.baseImage).toBe('sheet1.png')
    })


    test('getFrameByIndex', () => {
        const spritesheet = new Spritesheet(spritesheetData)
        
        const frame = spritesheet.getFrameByIndex(0)
        expect(frame.imageName).toBe('sprite1')
        
        expect(spritesheet.getFrameByIndex(10)).toBeUndefined()
    })


    test('getAllFrames', () => {
        const spritesheet = new Spritesheet(spritesheetData)
        
        const frames = spritesheet.getAllFrames()
        expect(frames).toHaveLength(3)
        expect(frames[0].imageName).toBe('sprite1')
    })


    test('getFrameNames', () => {
        const spritesheet = new Spritesheet(spritesheetData)
        
        const names = spritesheet.getFrameNames()
        expect(names).toContain('sprite1')
        expect(names).toContain('sprite1.png')
        expect(names).toContain('sprite2')
        expect(names).toContain('sprite2.png')
    })


    test('hasFrame', () => {
        const spritesheet = new Spritesheet(spritesheetData)
        
        expect(spritesheet.hasFrame('sprite1')).toBe(true)
        expect(spritesheet.hasFrame('sprite1.png')).toBe(true)
        expect(spritesheet.hasFrame('nonexistent')).toBe(false)
    })


    test('image management', () => {
        const spritesheet = new Spritesheet(spritesheetData)
        
        spritesheet.addImage('sheet1.png', mockImage1)
        spritesheet.addImage('sheet2.png', mockImage2)
        
        const images = spritesheet.getAllImages()
        expect(images).toHaveLength(2)
        expect(images).toContain(mockImage1)
        expect(images).toContain(mockImage2)
        
        const keys = spritesheet.getImageKeys()
        expect(keys).toContain('sheet1.png')
        expect(keys).toContain('sheet2.png')
    })


    test('extractFrame', () => {
        const spritesheet = new Spritesheet(spritesheetData)
        spritesheet.addImage('sheet1.png', mockImage1)
        
        const mockContext = {drawImage: vi.fn()}
        const mockCanvas = {
            width: 0, 
            height: 0,
            getContext: vi.fn(() => mockContext)
        }
        
        global.document = {
            createElement: vi.fn(() => mockCanvas)
        }
        
        const result = spritesheet.extractFrame('sprite1')
        
        expect(result.width).toBe(50)
        expect(result.height).toBe(50)
        expect(mockContext.drawImage).toHaveBeenCalledWith(
            mockImage1, 0, 0, 50, 50, 0, 0, 50, 50
        )
    })


    test('extractFrame with no image', () => {
        const spritesheet = new Spritesheet(spritesheetData)
        
        const result = spritesheet.extractFrame('sprite1')
        expect(result).toBe(null)
    })


    test('extractFrame with nonexistent frame', () => {
        const spritesheet = new Spritesheet(spritesheetData)
        
        const result = spritesheet.extractFrame('nonexistent')
        expect(result).toBe(null)
    })

})
