import {
    loadResponse,
    loadBlob,
    loadImage,
    loadText,
    loadJson,
    loadArrayBuffer,
    loadAudio,
    loadSpritesheetData,
    loadSpritesheet,
    addToSpritesheetData,
    replaceUrlFilename,
    removeFileExtension
} from './loaders'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


describe('Loaders', () => {
    let mockFetch
    let mockResponse
    let mockBlob
    let mockAudioContext
    let triggerLoad
    let triggerError
    let lastCreatedImage

    beforeEach(() => {
        mockResponse = {
            ok: true,
            blob: vi.fn(),
            text: vi.fn(),
            json: vi.fn(),
            arrayBuffer: vi.fn()
        }
        mockFetch = vi.fn().mockResolvedValue(mockResponse)
        global.fetch = mockFetch

        mockBlob = new Blob(['test'], {type: 'text/plain'})
        mockResponse.blob.mockResolvedValue(mockBlob)

        global.Image = vi.fn(() => {
            const img = {}
            function triggerOnload () {
                if (img.onload) {
                    img.onload()
                }
            }
            function triggerOnerror () {
                if (img.onerror) {
                    img.onerror()
                }
            }
            Object.defineProperty(img, 'src', {
                set () {
                    if (triggerLoad) {
                        setTimeout(triggerOnload, 0)
                    }
                    if (triggerError) {
                        setTimeout(triggerOnerror, 0)
                    }
                }
            })
            img.onload = null
            img.onerror = null
            lastCreatedImage = img
            return img
        })

        global.URL = {
            createObjectURL: vi.fn(),
            revokeObjectURL: vi.fn()
        }

        mockAudioContext = {
            decodeAudioData: vi.fn(),
            close: vi.fn()
        }
        global.AudioContext = vi.fn(() => mockAudioContext)
        global.webkitAudioContext = vi.fn(() => mockAudioContext)
    })


    afterEach(() => {
        vi.restoreAllMocks()
    })


    test('loadResponse with string', async () => {
        const url = 'http://example.com'
        
        await loadResponse(url)
        
        expect(mockFetch).toHaveBeenCalledWith(url, {})
    })


    test('loadResponse with object', async () => {
        const params = {
            url: 'http://example.com',
            config: {method: 'POST'}
        }
        
        await loadResponse(params)
        
        expect(mockFetch).toHaveBeenCalledWith(params.url, params.config)
    })


    test('loadBlob success', async () => {
        const result = await loadBlob('http://example.com')
        
        expect(mockResponse.blob).toHaveBeenCalled()
        expect(result).toBe(mockBlob)
    })


    test('loadBlob error', async () => {
        mockResponse.ok = false
        mockResponse.status = 404
        
        await expect(loadBlob('http://example.com')).rejects.toThrow('HTTP Error: 404')
    })


    test('loadImage success', async () => {
        triggerLoad = true
        triggerError = false
        const blob = new Blob(['test'], {type: 'image/png'})
        mockResponse.blob.mockResolvedValue(blob)
        global.URL.createObjectURL.mockReturnValue('blob:test')
        
        const loadPromise = loadImage('http://example.com')
        const result = await loadPromise
        
        expect(global.URL.createObjectURL).toHaveBeenCalledWith(blob)
        expect(result).toBe(lastCreatedImage)
    })


    test('loadImage error', async () => {
        triggerLoad = false
        triggerError = true
        const blob = new Blob(['test'], {type: 'image/png'})
        mockResponse.blob.mockResolvedValue(blob)
        global.URL.createObjectURL.mockReturnValue('blob:test')
        
        const loadPromise = loadImage('http://example.com')
        await expect(loadPromise).rejects.toThrow('Failed to load image')
        expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:test')
    })


    test('loadText success', async () => {
        const text = 'Hello World'
        mockResponse.text.mockResolvedValue(text)
        
        const result = await loadText('http://example.com')
        
        expect(mockResponse.text).toHaveBeenCalled()
        expect(result).toBe(text)
    })


    test('loadText error', async () => {
        mockResponse.ok = false
        mockResponse.status = 404
        
        await expect(loadText('http://example.com')).rejects.toThrow('HTTP Error: 404')
    })


    test('loadJson success', async () => {
        const json = {message: 'Hello World'}
        mockResponse.json.mockResolvedValue(json)
        
        const result = await loadJson('http://example.com')
        
        expect(mockResponse.json).toHaveBeenCalled()
        expect(result).toEqual(json)
    })


    test('loadJson error', async () => {
        mockResponse.ok = false
        mockResponse.status = 404
        
        await expect(loadJson('http://example.com')).rejects.toThrow('HTTP Error: 404')
    })


    test('loadArrayBuffer success', async () => {
        const buffer = new ArrayBuffer(8)
        mockResponse.arrayBuffer.mockResolvedValue(buffer)
        
        const result = await loadArrayBuffer('http://example.com')
        
        expect(mockResponse.arrayBuffer).toHaveBeenCalled()
        expect(result).toBe(buffer)
    })


    test('loadArrayBuffer error', async () => {
        mockResponse.ok = false
        mockResponse.status = 404
        
        await expect(loadArrayBuffer('http://example.com')).rejects.toThrow('HTTP Error: 404')
    })


    test('loadAudio success', async () => {
        const buffer = new ArrayBuffer(8)
        mockResponse.arrayBuffer.mockResolvedValue(buffer)
        const audioBuffer = {duration: 10}
        mockAudioContext.decodeAudioData.mockImplementation((_, success) => {
            success(audioBuffer)
        })
        
        const result = await loadAudio('http://example.com')
        
        expect(mockAudioContext.decodeAudioData).toHaveBeenCalledWith(buffer, expect.any(Function), expect.any(Function))
        expect(mockAudioContext.close).toHaveBeenCalled()
        expect(result).toBe(audioBuffer)
    })


    test('loadAudio error', async () => {
        const buffer = new ArrayBuffer(8)
        mockResponse.arrayBuffer.mockResolvedValue(buffer)
        mockAudioContext.decodeAudioData.mockImplementation((_, __, error) => {
            error(new Error('Decode error'))
        })
        
        await expect(loadAudio('http://example.com')).rejects.toThrow('Failed to decode audio data: Decode error')
        expect(mockAudioContext.close).toHaveBeenCalled()
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

    describe('Utility Functions', () => {
        test('replaceUrlFilename', () => {
            expect(replaceUrlFilename('/path/to/file.json', 'newfile.json'))
                .toBe('/path/to/newfile.json')

            expect(replaceUrlFilename('http://example.com/assets/sprite.json', 'sprite-1.json'))
                .toBe('http://example.com/assets/sprite-1.json')

            expect(replaceUrlFilename('file.json', 'other.json'))
                .toBe('other.json')
        })

        test('removeFileExtension', () => {
            expect(removeFileExtension('file.png')).toBe('file')
            expect(removeFileExtension('complex.name.jpg')).toBe('complex.name')
            expect(removeFileExtension('noextension')).toBe('noextension')
            expect(removeFileExtension('path/to/file.txt')).toBe('path/to/file')
            expect(removeFileExtension('')).toBe('')
        })
    })

    describe('loadSpritesheet', () => {
        beforeEach(() => {
            global.Image = vi.fn(() => {
                const img = {}
                Object.defineProperty(img, 'src', {
                    set () {
                        if (img.onload) {
                            setTimeout(img.onload, 0)
                        }
                    }
                })
                img.onload = null
                img.onerror = null
                return img
            })
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
    })

})
