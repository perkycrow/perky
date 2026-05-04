import {describe, test, expect, vi} from 'vitest'
import {applyOverrides, loadStudioOverrides} from './manifest_patcher.js'
import PerkyStore from './perky_store.js'


vi.mock('./perky_store.js', () => {
    const MockPerkyStore = vi.fn()
    MockPerkyStore.prototype.list = vi.fn()
    MockPerkyStore.prototype.get = vi.fn()
    return {default: MockPerkyStore}
})


describe('applyOverrides', () => {

    test('injects source into matching assets', () => {
        const manifestData = {
            config: {name: 'Test'},
            assets: {
                redAnimator: {type: 'animator', url: './red.json'},
                redSpritesheet: {type: 'spritesheet', url: './red_sheet.json'}
            }
        }

        const overrides = [
            {id: 'redAnimator', source: {spritesheet: 'redSpritesheet', animations: {}}},
            {id: 'redSpritesheet', source: {data: {frames: []}, images: []}}
        ]

        const result = applyOverrides(manifestData, overrides)

        expect(result.assets.redAnimator.source).toEqual({spritesheet: 'redSpritesheet', animations: {}})
        expect(result.assets.redSpritesheet.source).toEqual({data: {frames: []}, images: []})
    })


    test('preserves existing asset properties', () => {
        const manifestData = {
            assets: {
                redAnimator: {type: 'animator', url: './red.json', config: {foo: true}}
            }
        }

        const overrides = [{id: 'redAnimator', source: {animations: {}}}]
        const result = applyOverrides(manifestData, overrides)

        expect(result.assets.redAnimator.type).toBe('animator')
        expect(result.assets.redAnimator.url).toBe('./red.json')
        expect(result.assets.redAnimator.config).toEqual({foo: true})
        expect(result.assets.redAnimator.source).toEqual({animations: {}})
    })


    test('does not modify the original manifest data', () => {
        const manifestData = {
            config: {name: 'Test'},
            assets: {
                redAnimator: {type: 'animator', url: './red.json'}
            }
        }

        const overrides = [{id: 'redAnimator', source: {animations: {}}}]
        applyOverrides(manifestData, overrides)

        expect(manifestData.assets.redAnimator.source).toBeUndefined()
    })


    test('ignores overrides for non-existing assets', () => {
        const manifestData = {
            assets: {
                redAnimator: {type: 'animator', url: './red.json'}
            }
        }

        const overrides = [
            {id: 'blueAnimator', source: {animations: {}}}
        ]

        const result = applyOverrides(manifestData, overrides)

        expect(result.assets.blueAnimator).toBeUndefined()
        expect(result.assets.redAnimator.source).toBeUndefined()
    })


    test('preserves config and other top-level manifest fields', () => {
        const manifestData = {
            config: {name: 'Test', audio: {volume: 1}},
            assets: {
                redAnimator: {type: 'animator', url: './red.json'}
            }
        }

        const overrides = [{id: 'redAnimator', source: {animations: {}}}]
        const result = applyOverrides(manifestData, overrides)

        expect(result.config).toEqual({name: 'Test', audio: {volume: 1}})
    })


    test('handles empty overrides', () => {
        const manifestData = {
            assets: {redAnimator: {type: 'animator', url: './red.json'}}
        }

        const result = applyOverrides(manifestData, [])

        expect(result.assets.redAnimator).toEqual({type: 'animator', url: './red.json'})
    })

})


function createBlob (data) {
    const json = JSON.stringify(data)
    return {text: () => Promise.resolve(json)}
}


function createPngBlob () {
    return {text: () => Promise.resolve('')}
}


describe('loadStudioOverrides', () => {

    test('returns empty array when no resources', async () => {
        PerkyStore.prototype.list.mockResolvedValue([])

        const result = await loadStudioOverrides()

        expect(result).toEqual([])
    })


    test('loads animator config from store', async () => {
        const animatorConfig = {spritesheet: 'redSpritesheet', animations: {idle: {}}}

        PerkyStore.prototype.list.mockImplementation((type) => {
            if (type === 'animator') {
                return Promise.resolve([{id: 'redAnimator'}])
            }
            return Promise.resolve([])
        })
        PerkyStore.prototype.get.mockResolvedValue({
            id: 'redAnimator',
            files: [
                {name: 'redAnimator.json', blob: createBlob(animatorConfig)}
            ]
        })

        const result = await loadStudioOverrides()

        expect(result.length).toBeGreaterThanOrEqual(1)
        expect(result[0]).toEqual({id: 'redAnimator', source: animatorConfig})
    })


    test('skips resource when store.get returns null', async () => {
        PerkyStore.prototype.list.mockImplementation((type) => {
            if (type === 'animator') {
                return Promise.resolve([{id: 'missingAnimator'}])
            }
            return Promise.resolve([])
        })
        PerkyStore.prototype.get.mockResolvedValue(null)

        const result = await loadStudioOverrides()

        expect(result).toEqual([])
    })


    test('skips resource when no Animator.json file found', async () => {
        PerkyStore.prototype.list.mockImplementation((type) => {
            if (type === 'animator') {
                return Promise.resolve([{id: 'noConfig'}])
            }
            return Promise.resolve([])
        })
        PerkyStore.prototype.get.mockResolvedValue({
            id: 'noConfig',
            files: [{name: 'other.json', blob: createBlob({})}]
        })

        const result = await loadStudioOverrides()

        expect(result).toEqual([])
    })


    test('includes spritesheet override when spritesheet config exists', async () => {
        const animatorConfig = {spritesheet: 'heroSpritesheet', animations: {run: {}}}
        const spritesheetData = {frames: {frame0: {}}, meta: {}}

        globalThis.createImageBitmap = vi.fn().mockResolvedValue({width: 64, height: 64})

        PerkyStore.prototype.list.mockImplementation((type) => {
            if (type === 'animator') {
                return Promise.resolve([{id: 'heroAnimator'}])
            }
            return Promise.resolve([])
        })
        PerkyStore.prototype.get.mockResolvedValue({
            id: 'heroAnimator',
            files: [
                {name: 'heroAnimator.json', blob: createBlob(animatorConfig)},
                {name: 'heroSpritesheet.json', blob: createBlob(spritesheetData)},
                {name: 'hero_0.png', blob: createPngBlob()}
            ]
        })

        const result = await loadStudioOverrides()

        expect(result.length).toBe(2)
        expect(result[0]).toEqual({id: 'heroAnimator', source: animatorConfig})
        expect(result[1].id).toBe('heroSpritesheet')
        expect(result[1].source.data).toEqual(spritesheetData)
        expect(result[1].source.images).toHaveLength(1)
    })


    test('skips spritesheet when no spritesheet name in config', async () => {
        const animatorConfig = {animations: {idle: {}}}

        PerkyStore.prototype.list.mockImplementation((type) => {
            if (type === 'animator') {
                return Promise.resolve([{id: 'simpleAnimator'}])
            }
            return Promise.resolve([])
        })
        PerkyStore.prototype.get.mockResolvedValue({
            id: 'simpleAnimator',
            files: [
                {name: 'simpleAnimator.json', blob: createBlob(animatorConfig)}
            ]
        })

        const result = await loadStudioOverrides()

        expect(result).toEqual([{id: 'simpleAnimator', source: animatorConfig}])
    })


    test('loads scene overrides from store', async () => {
        const sceneConfig = {entities: [{type: 'Board', x: 1, y: 2}]}

        PerkyStore.prototype.list.mockImplementation((type) => {
            if (type === 'scene') {
                return Promise.resolve([{id: 'chapterScene'}])
            }
            return Promise.resolve([])
        })
        PerkyStore.prototype.get.mockResolvedValue({
            id: 'chapterScene',
            files: [{name: 'chapterScene.json', blob: createBlob(sceneConfig)}]
        })

        const result = await loadStudioOverrides()

        expect(result.length).toBe(1)
        expect(result[0]).toEqual({id: 'chapterScene', source: sceneConfig})
    })


    test('skips scene when store.get returns null', async () => {
        PerkyStore.prototype.list.mockImplementation((type) => {
            if (type === 'scene') {
                return Promise.resolve([{id: 'missingScene'}])
            }
            return Promise.resolve([])
        })
        PerkyStore.prototype.get.mockResolvedValue(null)

        const result = await loadStudioOverrides()

        expect(result).toEqual([])
    })


    test('skips scene when no json file found', async () => {
        PerkyStore.prototype.list.mockImplementation((type) => {
            if (type === 'scene') {
                return Promise.resolve([{id: 'noJsonScene'}])
            }
            return Promise.resolve([])
        })
        PerkyStore.prototype.get.mockResolvedValue({
            id: 'noJsonScene',
            files: [{name: 'texture.png', blob: createPngBlob()}]
        })

        const result = await loadStudioOverrides()

        expect(result).toEqual([])
    })


    test('loads glb overrides from store', async () => {
        const glbConfig = {modifications: [{type: 'material_override', material: 'Wall', color: [1, 0, 0]}]}

        PerkyStore.prototype.list.mockImplementation((type) => {
            if (type === 'glb') {
                return Promise.resolve([{id: 'corridorGlb'}])
            }
            return Promise.resolve([])
        })
        PerkyStore.prototype.get.mockResolvedValue({
            id: 'corridorGlb',
            files: [{name: 'corridorGlb.json', blob: createBlob(glbConfig)}]
        })

        const result = await loadStudioOverrides()

        expect(result.length).toBe(1)
        expect(result[0].id).toBe('corridorGlb')
        expect(result[0].source.modifications).toHaveLength(1)
        expect(result[0].source.modifications[0].type).toBe('material_override')
    })


    test('skips glb when store.get returns null', async () => {
        PerkyStore.prototype.list.mockImplementation((type) => {
            if (type === 'glb') {
                return Promise.resolve([{id: 'missingGlb'}])
            }
            return Promise.resolve([])
        })
        PerkyStore.prototype.get.mockResolvedValue(null)

        const result = await loadStudioOverrides()

        expect(result).toEqual([])
    })


    test('skips glb when no json file found', async () => {
        PerkyStore.prototype.list.mockImplementation((type) => {
            if (type === 'glb') {
                return Promise.resolve([{id: 'noJsonGlb'}])
            }
            return Promise.resolve([])
        })
        PerkyStore.prototype.get.mockResolvedValue({
            id: 'noJsonGlb',
            files: [{name: 'model.glb', blob: createPngBlob()}]
        })

        const result = await loadStudioOverrides()

        expect(result).toEqual([])
    })

})


