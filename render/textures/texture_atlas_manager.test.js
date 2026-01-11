import {describe, test, expect, beforeEach, vi} from 'vitest'
import TextureAtlasManager from './texture_atlas_manager.js'


function createMockImage (width = 64, height = 64) {
    return {
        width,
        height,
        complete: true,
        naturalWidth: width
    }
}


function createMockCanvasContext () {
    return {
        drawImage: vi.fn(),
        clearRect: vi.fn()
    }
}


class MockCanvas {

    #ctx = null

    constructor (width, height) {
        this.width = width
        this.height = height
        this.#ctx = createMockCanvasContext()
    }

    getContext () {
        return this.#ctx
    }

}


vi.stubGlobal('OffscreenCanvas', MockCanvas)


describe('TextureAtlasManager', () => {

    let manager

    beforeEach(() => {
        manager = new TextureAtlasManager({atlasSize: 256})
    })


    test('constructor initializes empty', () => {
        expect(manager.atlasCount).toBe(0)
        expect(manager.regionCount).toBe(0)
    })


    describe('add', () => {

        test('adds image and returns region', () => {
            const image = createMockImage(32, 32)
            const region = manager.add('sprite1', image)

            expect(region).not.toBeNull()
            expect(region.width).toBe(32)
            expect(region.height).toBe(32)
        })


        test('creates atlas on first add', () => {
            expect(manager.atlasCount).toBe(0)

            manager.add('sprite1', createMockImage(32, 32))

            expect(manager.atlasCount).toBe(1)
        })


        test('reuses existing atlas when space available', () => {
            manager.add('s1', createMockImage(32, 32))
            manager.add('s2', createMockImage(32, 32))

            expect(manager.atlasCount).toBe(1)
        })


        test('creates new atlas when current is full', () => {
            manager.add('large1', createMockImage(200, 200))
            manager.add('large2', createMockImage(200, 200))

            expect(manager.atlasCount).toBe(2)
        })


        test('returns existing region for duplicate id', () => {
            const image = createMockImage(32, 32)
            const region1 = manager.add('sprite1', image)
            const region2 = manager.add('sprite1', createMockImage(64, 64))

            expect(region1).toBe(region2)
        })


        test('returns null for invalid image', () => {
            expect(manager.add('invalid', null)).toBeNull()
            expect(manager.add('zero', {width: 0, height: 0})).toBeNull()
        })


        test('handles oversized images as standalone regions', () => {
            const oversized = createMockImage(500, 500)
            const region = manager.add('oversized', oversized)

            expect(region).not.toBeNull()
            expect(region.image).toBe(oversized)
            expect(manager.atlasCount).toBe(0)
        })

    })


    describe('addBatch', () => {

        test('adds multiple images', () => {
            const images = {
                s1: createMockImage(32, 32),
                s2: createMockImage(48, 48),
                s3: createMockImage(24, 24)
            }

            const results = manager.addBatch(images)

            expect(results.size).toBe(3)
            expect(manager.regionCount).toBe(3)
        })


        test('returns map of regions', () => {
            const images = {
                s1: createMockImage(32, 32),
                s2: createMockImage(48, 48)
            }

            const results = manager.addBatch(images)

            expect(results.get('s1')).not.toBeNull()
            expect(results.get('s2')).not.toBeNull()
        })

    })


    describe('get', () => {

        test('returns region by id', () => {
            manager.add('sprite1', createMockImage(32, 32))

            const region = manager.get('sprite1')

            expect(region).not.toBeNull()
            expect(region.width).toBe(32)
        })


        test('returns null for unknown id', () => {
            expect(manager.get('unknown')).toBeNull()
        })

    })


    describe('has', () => {

        test('returns true for existing id', () => {
            manager.add('sprite1', createMockImage(32, 32))
            expect(manager.has('sprite1')).toBe(true)
        })


        test('returns false for unknown id', () => {
            expect(manager.has('unknown')).toBe(false)
        })

    })


    describe('getDirtyAtlases', () => {

        test('returns newly modified atlases', () => {
            manager.add('s1', createMockImage(32, 32))

            const dirty = manager.getDirtyAtlases()

            expect(dirty.length).toBe(1)
        })


        test('returns empty after markAllClean', () => {
            manager.add('s1', createMockImage(32, 32))
            manager.markAllClean()

            const dirty = manager.getDirtyAtlases()

            expect(dirty.length).toBe(0)
        })

    })


    test('clear removes all atlases and regions', () => {
        manager.add('s1', createMockImage(32, 32))
        manager.add('s2', createMockImage(32, 32))

        manager.clear()

        expect(manager.atlasCount).toBe(0)
        expect(manager.regionCount).toBe(0)
    })


    test('atlases returns list of atlases', () => {
        manager.add('large1', createMockImage(200, 200))
        manager.add('large2', createMockImage(200, 200))

        const atlases = manager.atlases

        expect(atlases.length).toBe(2)
    })


    test('dispose clears all atlases and regions', () => {
        manager.add('s1', createMockImage(32, 32))
        manager.add('s2', createMockImage(32, 32))

        manager.dispose()

        expect(manager.atlasCount).toBe(0)
        expect(manager.regionCount).toBe(0)
    })

})
