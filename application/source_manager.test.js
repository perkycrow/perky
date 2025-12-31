import SourceManager from './source_manager'
import SourceLoader from './source_loader'
import PerkyModule from '../core/perky_module'
import {vi, beforeEach, describe, test, expect} from 'vitest'


describe('SourceManager', () => {
    let manager
    let manifest
    let loaders

    beforeEach(() => {
        loaders = {
            image: vi.fn().mockResolvedValue('loaded image'),
            audio: vi.fn().mockResolvedValue('loaded audio')
        }

        manifest = {
            getAsset: vi.fn(),
            getAssetsByTag: vi.fn(),
            getAllAssets: vi.fn()
        }

        manager = new SourceManager({loaders, manifest})
    })


    test('constructor', () => {
        expect(manager).toBeInstanceOf(PerkyModule)
        expect(manager.manifest).toBe(manifest)
    })


    test('loadAsset success', async () => {
        const asset = {type: 'image', id: 'logo', url: '/assets/logo.png'}
        manifest.getAsset.mockReturnValueOnce(asset)

        const result = await manager.loadAsset('logo')

        expect(manifest.getAsset).toHaveBeenCalledWith('logo')
        expect(result).toBeInstanceOf(SourceLoader)
        expect(result.assets).toEqual([asset])
    })


    test('loadAsset not found', async () => {
        manifest.getAsset.mockReturnValueOnce(null)

        await expect(manager.loadAsset('nonexistent')).rejects.toThrow('Asset not found: nonexistent')
        expect(manifest.getAsset).toHaveBeenCalledWith('nonexistent')
    })


    test('loadTag success', async () => {
        const assets = [
            {type: 'image', id: 'logo', url: '/assets/logo.png', tags: ['ui']},
            {type: 'image', id: 'background', url: '/assets/bg.png', tags: ['ui']}
        ]
        manifest.getAssetsByTag.mockReturnValueOnce(assets)

        const result = await manager.loadTag('ui')

        expect(manifest.getAssetsByTag).toHaveBeenCalledWith('ui')
        expect(result).toBeInstanceOf(SourceLoader)
        expect(result.assets).toBe(assets)
    })


    test('loadTag empty result', async () => {
        manifest.getAssetsByTag.mockReturnValueOnce([])

        const result = await manager.loadTag('nonexistent')

        expect(manifest.getAssetsByTag).toHaveBeenCalledWith('nonexistent')
        expect(result).toBeInstanceOf(SourceLoader)
        expect(result.assets).toEqual([])
    })


    test('loadAll success', async () => {
        const assets = [
            {type: 'image', id: 'logo', url: '/assets/logo.png'},
            {type: 'audio', id: 'music', url: '/assets/music.mp3'}
        ]
        manifest.getAllAssets.mockReturnValueOnce(assets)

        const result = await manager.loadAll()

        expect(manifest.getAllAssets).toHaveBeenCalled()
        expect(result).toBeInstanceOf(SourceLoader)
        expect(result.assets).toBe(assets)
    })


    test('loadAll empty result', async () => {
        manifest.getAllAssets.mockReturnValueOnce([])

        const result = await manager.loadAll()

        expect(manifest.getAllAssets).toHaveBeenCalled()
        expect(result).toBeInstanceOf(SourceLoader)
        expect(result.assets).toEqual([])
    })

})
