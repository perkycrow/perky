import {describe, test, expect} from 'vitest'
import Spritesheet from './spritesheet.js'

describe('Spritesheet', () => {
    const mockImage = {width: 100, height: 100}
    const mockData = {
        frames: [
            {
                filename: 'frame1',
                frame: {x: 0, y: 0, w: 10, h: 10}
            },
            {
                filename: 'frame2',
                frame: {x: 10, y: 0, w: 10, h: 10}
            }
        ],
        meta: {}
    }

    test('initializes with image and data', () => {
        const sheet = new Spritesheet({image: mockImage, data: mockData})
        expect(sheet.images[0]).toBe(mockImage)
        expect(sheet.data).toBe(mockData)
    })

    test('getFrame retrieves frame by name', () => {
        const sheet = new Spritesheet({image: mockImage, data: mockData})
        const frame = sheet.getFrame('frame1')
        expect(frame).toBeDefined()
        expect(frame.filename).toBe('frame1')
        expect(frame.image).toBe(mockImage)
    })

    test('getFrame returns null for non-existent frame', () => {
        const sheet = new Spritesheet({image: mockImage, data: mockData})
        const frame = sheet.getFrame('non-existent')
        expect(frame).toBeNull()
    })

    test('getFrames retrieves multiple frames by names', () => {
        const sheet = new Spritesheet({image: mockImage, data: mockData})
        const frames = sheet.getFrames(['frame1', 'frame2'])
        expect(frames).toHaveLength(2)
        expect(frames[0].filename).toBe('frame1')
        expect(frames[1].filename).toBe('frame2')
    })

    test('getFrames returns all frames without arguments', () => {
        const sheet = new Spritesheet({image: mockImage, data: mockData})
        const frames = sheet.getFrames()
        expect(frames).toHaveLength(2)
    })

    test('listFrames returns all frame names', () => {
        const sheet = new Spritesheet({image: mockImage, data: mockData})
        const names = sheet.listFrames()
        expect(names).toEqual(['frame1', 'frame2'])
    })


    test('getRegion retrieves region by name', () => {
        const sheet = new Spritesheet({image: mockImage, data: mockData})
        const region = sheet.getRegion('frame1')
        expect(region).not.toBeNull()
        expect(region.x).toBe(0)
        expect(region.y).toBe(0)
        expect(region.width).toBe(10)
        expect(region.height).toBe(10)
    })


    test('getRegion returns null for non-existent frame', () => {
        const sheet = new Spritesheet({image: mockImage, data: mockData})
        const region = sheet.getRegion('non-existent')
        expect(region).toBeNull()
    })


    test('getRegions retrieves multiple regions by names', () => {
        const sheet = new Spritesheet({image: mockImage, data: mockData})
        const regions = sheet.getRegions(['frame1', 'frame2'])
        expect(regions).toHaveLength(2)
        expect(regions[0].x).toBe(0)
        expect(regions[1].x).toBe(10)
    })


    describe('animations', () => {
        const mockDataWithAnimations = {
            frames: [
                {filename: 'walk_0', frame: {x: 0, y: 0, w: 10, h: 10}},
                {filename: 'walk_1', frame: {x: 10, y: 0, w: 10, h: 10}},
                {filename: 'idle_0', frame: {x: 20, y: 0, w: 10, h: 10}}
            ],
            animations: {
                walk: ['walk_0', 'walk_1'],
                idle: ['idle_0']
            },
            meta: {}
        }


        test('getAnimation returns animation frame names', () => {
            const sheet = new Spritesheet({image: mockImage, data: mockDataWithAnimations})
            const anim = sheet.getAnimation('walk')
            expect(anim).toEqual(['walk_0', 'walk_1'])
        })


        test('getAnimation returns null for non-existent animation', () => {
            const sheet = new Spritesheet({image: mockImage, data: mockDataWithAnimations})
            const anim = sheet.getAnimation('non-existent')
            expect(anim).toBeNull()
        })


        test('getAnimationRegions returns regions for animation', () => {
            const sheet = new Spritesheet({image: mockImage, data: mockDataWithAnimations})
            const regions = sheet.getAnimationRegions('walk')
            expect(regions).toHaveLength(2)
            expect(regions[0].x).toBe(0)
            expect(regions[1].x).toBe(10)
        })


        test('getAnimationRegions returns empty array for non-existent animation', () => {
            const sheet = new Spritesheet({image: mockImage, data: mockDataWithAnimations})
            const regions = sheet.getAnimationRegions('non-existent')
            expect(regions).toEqual([])
        })


        test('listAnimations returns all animation names', () => {
            const sheet = new Spritesheet({image: mockImage, data: mockDataWithAnimations})
            const names = sheet.listAnimations()
            expect(names).toContain('walk')
            expect(names).toContain('idle')
            expect(names).toHaveLength(2)
        })


        test('listAnimations returns empty array when no animations', () => {
            const sheet = new Spritesheet({image: mockImage, data: mockData})
            const names = sheet.listAnimations()
            expect(names).toEqual([])
        })

    })
})
