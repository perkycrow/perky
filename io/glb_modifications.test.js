import {test, expect, describe, vi} from 'vitest'
import {loadModifications} from './glb_modifications.js'


vi.mock('../application/loaders.js', () => ({
    loadImage: vi.fn(url => Promise.resolve({src: url, tagName: 'IMG'}))
}))


describe('loadModifications', () => {
    test('returns null when file not found', async () => {
        global.fetch = vi.fn(() => Promise.resolve({ok: false, headers: new Map()}))

        const result = await loadModifications('assets/corridor.glb.json')
        expect(result).toBe(null)
    })

    test('returns null when response is not json', async () => {
        global.fetch = vi.fn(() => Promise.resolve({
            ok: true,
            headers: new Map([['content-type', 'text/html']])
        }))

        const result = await loadModifications('assets/corridor.glb.json')
        expect(result).toBe(null)
    })

    test('loads and resolves texture_swap modifications', async () => {
        const config = {
            modifications: [
                {type: 'texture_swap', material: 'Wall', slot: 'baseColor', texture: 'painted_wall.png'}
            ]
        }

        global.fetch = vi.fn(() => Promise.resolve({
            ok: true,
            headers: new Map([['content-type', 'application/json']]),
            json: () => Promise.resolve(config)
        }))

        const result = await loadModifications('assets/rooms/corridor.glb.json')

        expect(result).toHaveLength(1)
        expect(result[0].type).toBe('texture_swap')
        expect(result[0].material).toBe('Wall')
        expect(result[0].slot).toBe('baseColor')
        expect(result[0].image.src).toBe('assets/rooms/painted_wall.png')
    })

    test('resolves texture paths relative to json file', async () => {
        const config = {
            modifications: [
                {type: 'texture_swap', material: 'Floor', texture: 'textures/floor.png'}
            ]
        }

        global.fetch = vi.fn(() => Promise.resolve({
            ok: true,
            headers: new Map([['content-type', 'application/json']]),
            json: () => Promise.resolve(config)
        }))

        const result = await loadModifications('data/models/room.glb.json')

        expect(result[0].image.src).toBe('data/models/textures/floor.png')
    })

    test('handles empty modifications array', async () => {
        global.fetch = vi.fn(() => Promise.resolve({
            ok: true,
            headers: new Map([['content-type', 'application/json']]),
            json: () => Promise.resolve({modifications: []})
        }))

        const result = await loadModifications('test.glb.json')
        expect(result).toEqual([])
    })


    test('returns null when fetch throws network error', async () => {
        global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))

        const result = await loadModifications('assets/corridor.glb.json')
        expect(result).toBe(null)
    })


    test('handles config with no modifications property', async () => {
        global.fetch = vi.fn(() => Promise.resolve({
            ok: true,
            headers: new Map([['content-type', 'application/json']]),
            json: () => Promise.resolve({})
        }))

        const result = await loadModifications('test.glb.json')
        expect(result).toEqual([])
    })


    test('handles url without path separator', async () => {
        const config = {
            modifications: [
                {type: 'texture_swap', material: 'Wall', texture: 'wall.png'}
            ]
        }

        global.fetch = vi.fn(() => Promise.resolve({
            ok: true,
            headers: new Map([['content-type', 'application/json']]),
            json: () => Promise.resolve(config)
        }))

        const result = await loadModifications('config.json')

        expect(result[0].image.src).toBe('wall.png')
    })
})
