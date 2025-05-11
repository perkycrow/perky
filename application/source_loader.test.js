import SourceLoader from './source_loader'
import PerkyModule from '../core/perky_module'
import {vi, beforeEach, afterEach, describe, test, expect} from 'vitest'


describe('SourceLoader', () => {
    let loader
    let loaders
    let sourceDescriptors

    beforeEach(() => {
        loaders = {
            image: vi.fn().mockResolvedValue('loaded image'),
            audio: vi.fn().mockResolvedValue('loaded audio'),
            text: vi.fn().mockResolvedValue('loaded text')
        }

        sourceDescriptors = [
            {type: 'image', id: 'logo', url: '/assets/logo.png'},
            {type: 'audio', id: 'music', url: '/assets/music.mp3'},
            {type: 'text', id: 'config', url: '/assets/config.json'}
        ]

        loader = new SourceLoader(sourceDescriptors, loaders)
    })


    afterEach(() => {
        vi.clearAllMocks()
    })


    test('constructor', () => {
        expect(loader).toBeInstanceOf(PerkyModule)
        expect(loader.sourceDescriptors).toBe(sourceDescriptors)
        expect(loader.loadingPromises).toEqual({})
    })


    test('sourceCount', () => {
        expect(loader.sourceCount).toBe(3)
    })


    test('loadedCount', () => {
        sourceDescriptors[0].source = 'image data'
        sourceDescriptors[0].loaded = true
        sourceDescriptors[1].source = 'audio data'
        sourceDescriptors[1].loaded = true
        
        expect(loader.loadedCount).toBe(2)
    })


    test('progress', () => {
        expect(loader.progress).toBe(0)
        
        sourceDescriptors[0].source = 'image data'
        sourceDescriptors[0].loaded = true
        
        expect(loader.progress).toBe(1 / 3)

        sourceDescriptors[1].source = 'audio data'
        sourceDescriptors[1].loaded = true
        
        expect(loader.progress).toBe(2 / 3)

        sourceDescriptors[2].source = 'text data'
        sourceDescriptors[2].loaded = true
        
        expect(loader.progress).toBe(1)
    })


    test('load', async () => {
        const emitSpy = vi.spyOn(loader, 'emit')
        const loadSourceSpy = vi.spyOn(loader, 'loadSource')
            .mockResolvedValueOnce({type: 'image', id: 'logo', loaded: true})
            .mockResolvedValueOnce({type: 'audio', id: 'music', loaded: true})
            .mockResolvedValueOnce({type: 'text', id: 'config', loaded: true})

        const result = await loader.load()

        expect(loader.loading).toBe(false)
        expect(loadSourceSpy).toHaveBeenCalledTimes(3)
        expect(emitSpy).toHaveBeenCalledWith('complete', sourceDescriptors)
        expect(result).toBe(sourceDescriptors)
    })


    test('load already loading', async () => {
        loader.loading = true
        
        const result = await loader.load()
        
        expect(result).toBe(false)
    })


    test('loadSource already loaded', async () => {
        const sourceDescriptor = {type: 'image', id: 'logo', loaded: true, source: 'image data'}
        
        const result = await loader.loadSource(sourceDescriptor)
        
        expect(result).toBe(sourceDescriptor)
        expect(loaders.image).not.toHaveBeenCalled()
    })


    test('loadSource already loading', async () => {
        const sourceKey = 'image:logo'
        const sourceDescriptor = {type: 'image', id: 'logo'}
        const loadPromise = Promise.resolve(sourceDescriptor)

        loader.loadingPromises[sourceKey] = loadPromise

        const originalLoadSource = loader.loadSource.bind(loader)
        loader.loadSource = vi.fn().mockImplementation(descriptor => {
            if (descriptor.type + ':' + descriptor.id === sourceKey) {
                return loader.loadingPromises[sourceKey]
            }
            return originalLoadSource(descriptor)
        })
        
        const result = await loader.loadSource(sourceDescriptor)
        
        expect(result).toBe(sourceDescriptor)
        expect(loader.loadSource).toHaveBeenCalledWith(sourceDescriptor)
    })


    test('loadSource no loader', async () => {
        const sourceDescriptor = {type: 'video', id: 'intro'}
        
        await expect(loader.loadSource(sourceDescriptor)).rejects.toThrow('No loader found for source type: video')
    })


    test('loadSource with url', async () => {
        const emitSpy = vi.spyOn(loader, 'emit')
        const sourceDescriptor = {type: 'image', id: 'logo', url: '/assets/logo.png'}
        
        const result = await loader.loadSource(sourceDescriptor)
        
        expect(loaders.image).toHaveBeenCalledWith(sourceDescriptor.url)
        expect(sourceDescriptor.source).toBe('loaded image')
        expect(emitSpy).toHaveBeenCalledWith('progress', expect.any(Number), {
            sourceDescriptor, 
            source: 'loaded image'
        })
        expect(result).toBe(sourceDescriptor)
    })


    test('loadSource without url', async () => {
        const sourceDescriptor = {type: 'image', id: 'logo'}
        
        await loader.loadSource(sourceDescriptor)
        
        expect(loaders.image).toHaveBeenCalledWith(sourceDescriptor)
    })


    test('loadSource error', async () => {
        const emitSpy = vi.spyOn(loader, 'emit')
        const sourceDescriptor = {type: 'image', id: 'logo', url: '/assets/logo.png'}
        const error = new Error('Loading failed')
        loaders.image.mockRejectedValueOnce(error)
        
        await expect(loader.loadSource(sourceDescriptor)).rejects.toThrow('Loading failed')
        expect(emitSpy).toHaveBeenCalledWith('error', sourceDescriptor, error)
        expect(loader.loadingPromises['image:logo']).toBeUndefined()
    })

})
