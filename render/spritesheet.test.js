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
        const sheet = new Spritesheet(mockImage, mockData)
        expect(sheet.image).toBe(mockImage)
        expect(sheet.data).toBe(mockData)
    })

    test('getFrame retrieves frame by name', () => {
        const sheet = new Spritesheet(mockImage, mockData)
        const frame = sheet.getFrame('frame1')
        expect(frame).toBeDefined()
        expect(frame.filename).toBe('frame1')
        expect(frame.image).toBe(mockImage)
    })

    test('getFrame returns undefined for non-existent frame', () => {
        const sheet = new Spritesheet(mockImage, mockData)
        const frame = sheet.getFrame('non-existent')
        expect(frame).toBeUndefined()
    })

    test('getFrames retrieves multiple frames by names', () => {
        const sheet = new Spritesheet(mockImage, mockData)
        const frames = sheet.getFrames(['frame1', 'frame2'])
        expect(frames).toHaveLength(2)
        expect(frames[0].filename).toBe('frame1')
        expect(frames[1].filename).toBe('frame2')
    })

    test('getFrames returns all frames without arguments', () => {
        const sheet = new Spritesheet(mockImage, mockData)
        const frames = sheet.getFrames()
        expect(frames).toHaveLength(2)
    })

    test('listFrames returns all frame names', () => {
        const sheet = new Spritesheet(mockImage, mockData)
        const names = sheet.listFrames()
        expect(names).toEqual(['frame1', 'frame2'])
    })
})
