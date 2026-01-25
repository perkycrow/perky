import {describe, test, expect, vi, beforeEach} from 'vitest'
import {
    buildTextureSystem,
    collectAnimators,
    getStudioConfig,
    getBackgroundImage
} from './launcher.js'


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
