import {loadSpritesheet, loadSpritesheetData, addToSpritesheetData} from './loaders'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


describe('Three Loaders', () => {
    let mockFetch
    let mockResponse
    let mockBlob
    let triggerLoad

    beforeEach(() => {
        mockResponse = {
            ok: true,
            blob: vi.fn(),
            json: vi.fn()
        }
        mockFetch = vi.fn().mockResolvedValue(mockResponse)
        global.fetch = mockFetch

        mockBlob = new Blob(['test'], {type: 'text/plain'})
        mockResponse.blob.mockResolvedValue(mockBlob)

        global.Image = vi.fn(() => {
            const img = {}
            Object.defineProperty(img, 'src', {
                set () {
                    if (img.onload && triggerLoad) {
                        setTimeout(img.onload, 0)
                    }
                }
            })
            img.onload = null
            img.onerror = null
            return img
        })

        global.URL = {
            createObjectURL: vi.fn().mockReturnValue('blob:test'),
            revokeObjectURL: vi.fn()
        }

        triggerLoad = true
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    test('loadSpritesheet success', async () => {
        const spritesheetJson = {
            frames: [
                {filename: 'sprite1.png', frame: {x: 0, y: 0, w: 50, h: 50}}
            ],
            meta: {
                image: 'spritesheet.png'
            }
        }

        mockResponse.json.mockResolvedValue(spritesheetJson)
        mockResponse.blob.mockResolvedValue(mockBlob)

        const result = await loadSpritesheet('http://example.com/spritesheet.json')

        expect(result.getFrameCount()).toBe(1)
        expect(result.hasFrame('sprite1')).toBe(true)
        expect(result.getImage('spritesheet.png')).toBeDefined()
        expect(mockFetch).toHaveBeenCalledTimes(2) // JSON + image
    })

    test('loadSpritesheet with multipacks', async () => {
        const baseJson = {
            frames: [
                {filename: 'sprite1.png', frame: {x: 0, y: 0, w: 50, h: 50}}
            ],
            meta: {
                image: 'sheet1.png',
                related_multi_packs: ['sheet2.json']
            }
        }

        const multipackJson = {
            frames: [
                {filename: 'sprite2.png', frame: {x: 0, y: 0, w: 50, h: 50}}
            ],
            meta: {
                image: 'sheet2.png'
            }
        }

        mockResponse.json
            .mockResolvedValueOnce(baseJson)
            .mockResolvedValueOnce(multipackJson)
        mockResponse.blob.mockResolvedValue(mockBlob)

        const result = await loadSpritesheet('http://example.com/sheet1.json')

        expect(result.getFrameCount()).toBe(2)
        expect(result.hasFrame('sprite1')).toBe(true)
        expect(result.hasFrame('sprite2')).toBe(true)
        expect(result.getImage('sheet1.png')).toBeDefined()
        expect(result.getImage('sheet2.png')).toBeDefined()
    })

    describe('Spritesheet Data Loading', () => {
        test('loadSpritesheetData without multipacks', async () => {
            const spritesheetJson = {
                frames: [
                    {filename: 'sprite1.png', frame: {x: 0, y: 0, w: 100, h: 100}},
                    {filename: 'sprite2.png', frame: {x: 100, y: 0, w: 100, h: 100}}
                ],
                meta: {
                    image: 'spritesheet.png',
                    size: {w: 200, h: 100}
                }
            }
            mockResponse.json.mockResolvedValue(spritesheetJson)

            const result = await loadSpritesheetData('http://example.com/spritesheet.json')

            expect(result.frames).toHaveLength(2)
            expect(result.frames[0].baseImage).toBe('spritesheet.png')
            expect(result.frames[0].imageName).toBe('sprite1')
            expect(result.meta).toHaveLength(1)
            expect(result.meta[0]).toEqual(spritesheetJson.meta)
        })

        test('loadSpritesheetData with multipacks', async () => {
            const baseJson = {
                frames: [
                    {filename: 'sprite1.png', frame: {x: 0, y: 0, w: 100, h: 100}}
                ],
                meta: {
                    image: 'spritesheet-0.png',
                    related_multi_packs: ['spritesheet-1.json']
                }
            }
            const multipackJson = {
                frames: [
                    {filename: 'sprite2.png', frame: {x: 0, y: 0, w: 100, h: 100}}
                ],
                meta: {
                    image: 'spritesheet-1.png'
                }
            }

            mockResponse.json
                .mockResolvedValueOnce(baseJson)
                .mockResolvedValueOnce(multipackJson)

            const result = await loadSpritesheetData('http://example.com/spritesheet-0.json')

            expect(mockFetch).toHaveBeenCalledTimes(2)
            expect(mockFetch).toHaveBeenNthCalledWith(1, 'http://example.com/spritesheet-0.json', {})
            expect(mockFetch).toHaveBeenNthCalledWith(2, 'http://example.com/spritesheet-1.json', {})
            expect(result.frames).toHaveLength(2)
            expect(result.frames[0].baseImage).toBe('spritesheet-0.png')
            expect(result.frames[1].baseImage).toBe('spritesheet-1.png')
            expect(result.meta).toHaveLength(2)
        })

        test('addToSpritesheetData', () => {
            const spritesheetData = {frames: [], meta: []}
            const newData = {
                frames: [
                    {filename: 'test.png', frame: {x: 0, y: 0, w: 50, h: 50}},
                    {filename: 'example.jpg', frame: {x: 50, y: 0, w: 50, h: 50}}
                ],
                meta: {
                    image: 'texture.png',
                    size: {w: 100, h: 50}
                }
            }

            addToSpritesheetData(spritesheetData, newData)

            expect(spritesheetData.frames).toHaveLength(2)
            expect(spritesheetData.frames[0].baseImage).toBe('texture.png')
            expect(spritesheetData.frames[0].imageName).toBe('test')
            expect(spritesheetData.frames[1].imageName).toBe('example')
            expect(spritesheetData.meta).toHaveLength(1)
            expect(spritesheetData.meta[0]).toEqual(newData.meta)
        })

        test('addToSpritesheetData without meta image', () => {
            const spritesheetData = {frames: [], meta: []}
            const newData = {
                frames: [{filename: 'test.png', frame: {x: 0, y: 0, w: 50, h: 50}}],
                meta: {size: {w: 100, h: 50}}
            }

            addToSpritesheetData(spritesheetData, newData)

            expect(spritesheetData.frames[0].baseImage).toBeUndefined()
            expect(spritesheetData.frames[0].imageName).toBe('test')
        })
    })

}) 