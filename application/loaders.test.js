import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


describe('Loaders', () => {
    let mockFetch
    let mockResponse
    let mockBlob
    let mockAudioContext
    let triggerLoad
    let triggerError
    let lastCreatedImage
    let loaders

    beforeEach(async () => {
        vi.resetModules()

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
        global.AudioContext = vi.fn().mockImplementation(() => mockAudioContext)
        global.webkitAudioContext = vi.fn().mockImplementation(() => mockAudioContext)

        loaders = await import('./loaders.js')
    })


    afterEach(() => {
        vi.restoreAllMocks()
    })


    test('loadResponse with string', async () => {
        const url = 'http://example.com'

        await loaders.loadResponse(url)

        expect(mockFetch).toHaveBeenCalledWith(url, {})
    })


    test('loadResponse with object', async () => {
        const params = {
            url: 'http://example.com',
            config: {method: 'POST'}
        }

        await loaders.loadResponse(params)

        expect(mockFetch).toHaveBeenCalledWith(params.url, params.config)
    })


    test('loadBlob success', async () => {
        const result = await loaders.loadBlob('http://example.com')

        expect(mockResponse.blob).toHaveBeenCalled()
        expect(result).toBe(mockBlob)
    })


    test('loadBlob error', async () => {
        mockResponse.ok = false
        mockResponse.status = 404

        await expect(loaders.loadBlob('http://example.com')).rejects.toThrow('HTTP Error 404')
    })


    test('loadImage success', async () => {
        triggerLoad = true
        triggerError = false
        const blob = new Blob(['test'], {type: 'image/png'})
        mockResponse.blob.mockResolvedValue(blob)
        global.URL.createObjectURL.mockReturnValue('blob:test')

        const loadPromise = loaders.loadImage('http://example.com')
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

        const loadPromise = loaders.loadImage('http://example.com')
        await expect(loadPromise).rejects.toThrow('Failed to load image')
        expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:test')
    })


    test('loadText success', async () => {
        const text = 'Hello World'
        mockResponse.text.mockResolvedValue(text)

        const result = await loaders.loadText('http://example.com')

        expect(mockResponse.text).toHaveBeenCalled()
        expect(result).toBe(text)
    })


    test('loadText error', async () => {
        mockResponse.ok = false
        mockResponse.status = 404

        await expect(loaders.loadText('http://example.com')).rejects.toThrow('HTTP Error 404')
    })


    test('loadJson success', async () => {
        const json = {message: 'Hello World'}
        mockResponse.json.mockResolvedValue(json)

        const result = await loaders.loadJson('http://example.com')

        expect(mockResponse.json).toHaveBeenCalled()
        expect(result).toEqual(json)
    })


    test('loadJson error', async () => {
        mockResponse.ok = false
        mockResponse.status = 404

        await expect(loaders.loadJson('http://example.com')).rejects.toThrow('HTTP Error 404')
    })


    test('loadArrayBuffer success', async () => {
        const buffer = new ArrayBuffer(8)
        mockResponse.arrayBuffer.mockResolvedValue(buffer)

        const result = await loaders.loadArrayBuffer('http://example.com')

        expect(mockResponse.arrayBuffer).toHaveBeenCalled()
        expect(result).toBe(buffer)
    })


    test('loadArrayBuffer error', async () => {
        mockResponse.ok = false
        mockResponse.status = 404

        await expect(loaders.loadArrayBuffer('http://example.com')).rejects.toThrow('HTTP Error 404')
    })


    test('loadAudio success', async () => {
        const buffer = new ArrayBuffer(8)
        mockResponse.arrayBuffer.mockResolvedValue(buffer)
        const audioBuffer = {duration: 10}
        mockAudioContext.decodeAudioData.mockImplementation((_, success) => {
            success(audioBuffer)
        })

        const result = await loaders.loadAudio('http://example.com')

        expect(mockAudioContext.decodeAudioData).toHaveBeenCalledWith(buffer, expect.any(Function), expect.any(Function))
        expect(result).toBe(audioBuffer)
    })


    test('loadAudio error', async () => {
        const buffer = new ArrayBuffer(8)
        mockResponse.arrayBuffer.mockResolvedValue(buffer)
        mockAudioContext.decodeAudioData.mockImplementation((_, __, error) => {
            error(new Error('Decode error'))
        })

        await expect(loaders.loadAudio('http://example.com')).rejects.toThrow('Failed to decode audio data: Decode error')
    })




    describe('Utility Functions', () => {
        test('replaceUrlFilename', () => {
            expect(loaders.replaceUrlFilename('/path/to/file.json', 'newfile.json'))
                .toBe('/path/to/newfile.json')

            expect(loaders.replaceUrlFilename('http://example.com/assets/sprite.json', 'sprite-1.json'))
                .toBe('http://example.com/assets/sprite-1.json')

            expect(loaders.replaceUrlFilename('file.json', 'other.json'))
                .toBe('other.json')
        })

        test('removeFileExtension', () => {
            expect(loaders.removeFileExtension('file.png')).toBe('file')
            expect(loaders.removeFileExtension('complex.name.jpg')).toBe('complex.name')
            expect(loaders.removeFileExtension('noextension')).toBe('noextension')
            expect(loaders.removeFileExtension('path/to/file.txt')).toBe('path/to/file')
            expect(loaders.removeFileExtension('')).toBe('')
        })
    })



})
