import {describe, test, expect, vi} from 'vitest'
import {
    loadManifest,
    buildTextureSystem,
    collectAssets,
    collectAnimators,
    collectScenes,
    getStudioConfig,
    getBackgroundImage
} from './launcher.js'


vi.mock('../application/source_manager.js', () => ({
    default: vi.fn().mockImplementation(() => ({
        loadAll: vi.fn().mockResolvedValue()
    }))
}))


describe('loadManifest', () => {

    test('returns a manifest', async () => {
        const manifestData = {assets: {}}

        const result = await loadManifest(manifestData)

        expect(result).toBeDefined()
        expect(typeof result.getAsset).toBe('function')
    })


    test('rewrites asset urls with basePath', async () => {
        const manifestData = {
            assets: {
                sprite: {type: 'image', url: './sprite.png'}
            }
        }

        const result = await loadManifest(manifestData, '/game/')

        const asset = result.getAsset('sprite')
        expect(asset.url).toBe('/game/sprite.png')
    })


    test('preserves urls when no basePath', async () => {
        const manifestData = {
            assets: {
                sprite: {type: 'image', url: './sprite.png'}
            }
        }

        const result = await loadManifest(manifestData)

        const asset = result.getAsset('sprite')
        expect(asset.url).toBe('./sprite.png')
    })

})


describe('buildTextureSystem', () => {

    test('returns a texture system', () => {
        const manifest = {
            getAssetsByType: vi.fn(() => [])
        }

        const result = buildTextureSystem(manifest)

        expect(result).toBeDefined()
        expect(typeof result.getSpritesheet).toBe('function')
    })


    test('registers spritesheets from manifest', () => {
        const manifest = {
            getAssetsByType: vi.fn((type) => {
                if (type === 'spritesheet') {
                    return [{id: 'sprites', source: {frames: {}}}]
                }
                return []
            })
        }

        const result = buildTextureSystem(manifest)

        expect(manifest.getAssetsByType).toHaveBeenCalledWith('spritesheet')
        expect(result.getSpritesheet('sprites')).toBeDefined()
    })

})


describe('collectAssets', () => {

    test('returns empty object when no assets of type', () => {
        const manifest = {
            getAssetsByType: vi.fn(() => [])
        }

        const result = collectAssets(manifest, 'animator')

        expect(manifest.getAssetsByType).toHaveBeenCalledWith('animator')
        expect(result).toEqual({})
    })


    test('collects assets by type', () => {
        const source = {data: 'test'}
        const manifest = {
            getAssetsByType: vi.fn(() => [
                {id: 'item1', source},
                {id: 'item2', source: {other: 'data'}}
            ])
        }

        const result = collectAssets(manifest, 'custom')

        expect(manifest.getAssetsByType).toHaveBeenCalledWith('custom')
        expect(result).toEqual({
            item1: source,
            item2: {other: 'data'}
        })
    })


    test('skips assets without source', () => {
        const manifest = {
            getAssetsByType: vi.fn(() => [
                {id: 'item1', source: {data: 'test'}},
                {id: 'item2', source: null}
            ])
        }

        const result = collectAssets(manifest, 'custom')

        expect(result).toEqual({item1: {data: 'test'}})
    })

})


describe('collectAnimators', () => {

    test('returns empty object when no animators', () => {
        const manifest = {
            getAssetsByType: vi.fn(() => [])
        }

        const result = collectAnimators(manifest)

        expect(result).toEqual({})
    })


    test('collects animators from manifest', () => {
        const animatorSource = {animations: {idle: {}}}
        const manifest = {
            getAssetsByType: vi.fn(() => [
                {id: 'player', source: animatorSource}
            ])
        }

        const result = collectAnimators(manifest)

        expect(result).toEqual({player: animatorSource})
    })


    test('skips animators without source', () => {
        const manifest = {
            getAssetsByType: vi.fn(() => [
                {id: 'player', source: null}
            ])
        }

        const result = collectAnimators(manifest)

        expect(result).toEqual({})
    })

})


describe('collectScenes', () => {

    test('returns empty object when no scenes', () => {
        const manifest = {
            getAssetsByType: vi.fn(() => [])
        }

        const result = collectScenes(manifest)

        expect(result).toEqual({})
    })


    test('collects scenes from manifest', () => {
        const sceneSource = {entities: [{type: 'Player', x: 0, y: 0}]}
        const manifest = {
            getAssetsByType: vi.fn(() => [
                {id: 'level1', source: sceneSource}
            ])
        }

        const result = collectScenes(manifest)

        expect(result).toEqual({level1: sceneSource})
    })


    test('skips scenes without source', () => {
        const manifest = {
            getAssetsByType: vi.fn(() => [
                {id: 'level1', source: null}
            ])
        }

        const result = collectScenes(manifest)

        expect(result).toEqual({})
    })

})


describe('getStudioConfig', () => {

    test('returns config for tool', () => {
        const config = {unitsInView: {width: 10}}
        const manifest = {
            getConfig: vi.fn(() => config)
        }

        const result = getStudioConfig(manifest, 'animator')

        expect(manifest.getConfig).toHaveBeenCalledWith('studio.animator')
        expect(result).toBe(config)
    })


    test('returns empty object when no config', () => {
        const manifest = {
            getConfig: vi.fn(() => null)
        }

        const result = getStudioConfig(manifest, 'animator')

        expect(result).toEqual({})
    })

})


describe('getBackgroundImage', () => {

    test('returns null when no background configured', () => {
        const manifest = {
            getAsset: vi.fn()
        }

        const result = getBackgroundImage(manifest, {})

        expect(result).toBeNull()
    })


    test('returns background image source', () => {
        const image = new Image()
        const manifest = {
            getAsset: vi.fn(() => ({source: image}))
        }

        const result = getBackgroundImage(manifest, {background: 'bg'})

        expect(manifest.getAsset).toHaveBeenCalledWith('bg')
        expect(result).toBe(image)
    })


    test('returns null when asset not found', () => {
        const manifest = {
            getAsset: vi.fn(() => null)
        }

        const result = getBackgroundImage(manifest, {background: 'missing'})

        expect(result).toBeNull()
    })

})
