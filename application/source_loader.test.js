import SourceLoader from './source_loader'
import PerkyModule from '../core/perky_module'
import {vi, beforeEach, afterEach, describe, test, expect} from 'vitest'


describe('SourceLoader', () => {
    let loader
    let loaders
    let assets

    beforeEach(() => {
        loaders = {
            image: vi.fn().mockResolvedValue('loaded image'),
            audio: vi.fn().mockResolvedValue('loaded audio'),
            text: vi.fn().mockResolvedValue('loaded text')
        }

        assets = [
            {type: 'image', id: 'logo', url: '/assets/logo.png'},
            {type: 'audio', id: 'music', url: '/assets/music.mp3'},
            {type: 'text', id: 'config', url: '/assets/config.json'}
        ]

        loader = new SourceLoader(assets, loaders)
    })


    afterEach(() => {
        vi.clearAllMocks()
    })


    test('constructor', () => {
        expect(loader).toBeInstanceOf(PerkyModule)
        expect(loader.assets).toBe(assets)
        expect(loader.progress).toBe(0)
    })


    test('assetCount', () => {
        expect(loader.assetCount).toBe(3)
    })


    test('loadedCount', () => {
        assets[0].source = 'image data'
        assets[0].loaded = true
        assets[1].source = 'audio data'
        assets[1].loaded = true

        expect(loader.loadedCount).toBe(2)
    })


    test('progress', () => {
        expect(loader.progress).toBe(0)

        assets[0].source = 'image data'
        assets[0].loaded = true

        expect(loader.progress).toBe(1 / 3)

        assets[1].source = 'audio data'
        assets[1].loaded = true

        expect(loader.progress).toBe(2 / 3)

        assets[2].source = 'text data'
        assets[2].loaded = true

        expect(loader.progress).toBe(1)
    })


    test('load', async () => {
        const emitSpy = vi.spyOn(loader, 'emit')
        const loadAssetSpy = vi.spyOn(loader, 'loadAsset')
            .mockResolvedValueOnce({type: 'image', id: 'logo', loaded: true})
            .mockResolvedValueOnce({type: 'audio', id: 'music', loaded: true})
            .mockResolvedValueOnce({type: 'text', id: 'config', loaded: true})

        const result = await loader.load()

        expect(loader.loading).toBe(false)
        expect(loadAssetSpy).toHaveBeenCalledTimes(3)
        expect(emitSpy).toHaveBeenCalledWith('complete', assets)
        expect(result).toBe(assets)
    })


    test('load already loading', async () => {
        loader.loading = true

        const result = await loader.load()

        expect(result).toBe(false)
    })


    test('loadAsset already loaded', async () => {
        const asset = {type: 'image', id: 'logo', loaded: true, source: 'image data'}

        const result = await loader.loadAsset(asset)

        expect(result).toBe(asset)
        expect(loaders.image).not.toHaveBeenCalled()
    })


    test('loadAsset already loading', async () => {
        const asset = {type: 'image', id: 'logo', url: '/assets/logo.png'}

        const loadPromise1 = loader.loadAsset(asset)
        const loadPromise2 = loader.loadAsset(asset)

        const result1 = await loadPromise1
        const result2 = await loadPromise2

        expect(result1).toBe(result2)
        expect(loaders.image).toHaveBeenCalledTimes(1)
        expect(result1.source).toBe('loaded image')
    })


    test('loadAsset no loader', async () => {
        const asset = {type: 'video', id: 'intro'}

        await expect(loader.loadAsset(asset)).rejects.toThrow('No loader found for asset type: video')
    })


    test('loadAsset with url', async () => {
        const emitSpy = vi.spyOn(loader, 'emit')
        const asset = {type: 'image', id: 'logo', url: '/assets/logo.png'}

        const result = await loader.loadAsset(asset)

        expect(loaders.image).toHaveBeenCalledWith({
            url: asset.url,
            config: {}
        })
        expect(asset.source).toBe('loaded image')
        expect(emitSpy).toHaveBeenCalledWith('progress', expect.any(Number), {
            asset,
            source: 'loaded image'
        })
        expect(result).toBe(asset)
    })


    test('loadAsset without url', async () => {
        const asset = {type: 'image', id: 'logo'}

        await loader.loadAsset(asset)

        expect(loaders.image).toHaveBeenCalledWith(asset)
    })


    test('loadAsset error', async () => {
        const emitSpy = vi.spyOn(loader, 'emit')
        const asset = {type: 'image', id: 'logo', url: '/assets/logo.png'}
        const error = new Error('Loading failed')
        loaders.image.mockRejectedValueOnce(error)

        await expect(loader.loadAsset(asset)).rejects.toThrow('Loading failed')
        expect(emitSpy).toHaveBeenCalledWith('error', asset, error)

        loaders.image.mockResolvedValueOnce('loaded image after error')
        const result = await loader.loadAsset(asset)
        expect(result.source).toBe('loaded image after error')
    })

})
