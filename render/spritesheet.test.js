import {describe, it, expect} from 'vitest'
import Spritesheet from './spritesheet'

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

    it('should initialize with image and data', () => {
        const sheet = new Spritesheet(mockImage, mockData)
        expect(sheet.image).toBe(mockImage)
        expect(sheet.data).toBe(mockData)
    })

    it('should retrieve a single frame by name', () => {
        const sheet = new Spritesheet(mockImage, mockData)
        const frame = sheet.getFrame('frame1')
        expect(frame).toBeDefined()
        expect(frame.filename).toBe('frame1')
        expect(frame.image).toBe(mockImage)
    })

    it('should return undefined for non-existent frame', () => {
        const sheet = new Spritesheet(mockImage, mockData)
        const frame = sheet.getFrame('non-existent')
        expect(frame).toBeUndefined()
    })

    it('should retrieve multiple frames by names', () => {
        const sheet = new Spritesheet(mockImage, mockData)
        const frames = sheet.getFrames(['frame1', 'frame2'])
        expect(frames).toHaveLength(2)
        expect(frames[0].filename).toBe('frame1')
        expect(frames[1].filename).toBe('frame2')
    })

    it('should return all frames when getFrames is called without arguments', () => {
        const sheet = new Spritesheet(mockImage, mockData)
        const frames = sheet.getFrames()
        expect(frames).toHaveLength(2)
    })

    it('should list all frame names', () => {
        const sheet = new Spritesheet(mockImage, mockData)
        const names = sheet.listFrames()
        expect(names).toEqual(['frame1', 'frame2'])
    })
})
