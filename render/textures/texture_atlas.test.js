import {describe, test, expect, beforeEach, vi} from 'vitest'
import TextureAtlas from './texture_atlas.js'


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


describe('TextureAtlas', () => {

    let atlas

    beforeEach(() => {
        atlas = new TextureAtlas({width: 256, height: 256})
    })


    describe('constructor', () => {

        test('default dimensions', () => {
            const defaultAtlas = new TextureAtlas()
            expect(defaultAtlas.width).toBe(4096)
            expect(defaultAtlas.height).toBe(4096)
        })


        test('custom dimensions', () => {
            expect(atlas.width).toBe(256)
            expect(atlas.height).toBe(256)
        })


        test('creates canvas', () => {
            expect(atlas.canvas).toBeDefined()
            expect(atlas.canvas.width).toBe(256)
        })

    })


    describe('add', () => {

        test('adds image and returns region', () => {
            const image = createMockImage(32, 32)
            const region = atlas.add('sprite1', image)

            expect(region).not.toBeNull()
            expect(region.width).toBe(32)
            expect(region.height).toBe(32)
            expect(region.image).toBe(atlas.canvas)
        })


        test('marks atlas as dirty', () => {
            expect(atlas.dirty).toBe(false)

            const image = createMockImage(32, 32)
            atlas.add('sprite1', image)

            expect(atlas.dirty).toBe(true)
        })


        test('returns existing region for duplicate id', () => {
            const image1 = createMockImage(32, 32)
            const image2 = createMockImage(64, 64)

            const region1 = atlas.add('sprite1', image1)
            const region2 = atlas.add('sprite1', image2)

            expect(region1).toBe(region2)
            expect(region2.width).toBe(32)
        })


        test('places images without overlap', () => {
            const image1 = createMockImage(64, 64)
            const image2 = createMockImage(64, 64)

            const region1 = atlas.add('sprite1', image1)
            const region2 = atlas.add('sprite2', image2)

            const noOverlap = region1.x + region1.width <= region2.x ||
                              region2.x + region2.width <= region1.x ||
                              region1.y + region1.height <= region2.y ||
                              region2.y + region2.height <= region1.y ||
                              (region1.x === region2.x && region1.y !== region2.y) ||
                              (region1.y === region2.y && region1.x !== region2.x)

            expect(noOverlap).toBe(true)
        })


        test('returns null when atlas is full', () => {
            const largeImage = createMockImage(250, 250)
            atlas.add('large', largeImage)

            const anotherLarge = createMockImage(200, 200)
            const result = atlas.add('another', anotherLarge)

            expect(result).toBeNull()
        })

    })


    describe('get', () => {

        test('returns region by id', () => {
            const image = createMockImage(32, 32)
            atlas.add('sprite1', image)

            const region = atlas.get('sprite1')

            expect(region).not.toBeNull()
            expect(region.width).toBe(32)
        })


        test('returns null for unknown id', () => {
            expect(atlas.get('unknown')).toBeNull()
        })

    })


    describe('has', () => {

        test('returns true for existing id', () => {
            const image = createMockImage(32, 32)
            atlas.add('sprite1', image)

            expect(atlas.has('sprite1')).toBe(true)
        })


        test('returns false for unknown id', () => {
            expect(atlas.has('unknown')).toBe(false)
        })

    })


    describe('canFit', () => {

        test('returns true when space available', () => {
            expect(atlas.canFit(64, 64)).toBe(true)
        })


        test('returns false when no space', () => {
            const largeImage = createMockImage(250, 250)
            atlas.add('large', largeImage)

            expect(atlas.canFit(200, 200)).toBe(false)
        })

    })


    test('regionCount counts added regions', () => {
        expect(atlas.regionCount).toBe(0)

        atlas.add('s1', createMockImage(32, 32))
        expect(atlas.regionCount).toBe(1)

        atlas.add('s2', createMockImage(32, 32))
        expect(atlas.regionCount).toBe(2)
    })


    test('markClean clears dirty flag', () => {
        atlas.add('sprite1', createMockImage(32, 32))
        expect(atlas.dirty).toBe(true)

        atlas.markClean()
        expect(atlas.dirty).toBe(false)
    })


    describe('clear', () => {

        test('removes all regions', () => {
            atlas.add('s1', createMockImage(32, 32))
            atlas.add('s2', createMockImage(32, 32))

            atlas.clear()

            expect(atlas.regionCount).toBe(0)
            expect(atlas.has('s1')).toBe(false)
        })


        test('allows adding new images after clear', () => {
            const largeImage = createMockImage(250, 250)
            atlas.add('large', largeImage)

            atlas.clear()

            const region = atlas.add('new', createMockImage(100, 100))
            expect(region).not.toBeNull()
        })

    })


    describe('full', () => {

        test('false initially', () => {
            expect(atlas.full).toBe(false)
        })


        test('true when no more space', () => {
            const largeImage = createMockImage(250, 250)
            atlas.add('large', largeImage)

            atlas.add('overflow', createMockImage(200, 200))

            expect(atlas.full).toBe(true)
        })

    })


    describe('getAllRegions', () => {

        test('returns map of all regions', () => {
            atlas.add('s1', createMockImage(32, 32))
            atlas.add('s2', createMockImage(48, 48))

            const regions = atlas.getAllRegions()

            expect(regions).toBeInstanceOf(Map)
            expect(regions.size).toBe(2)
            expect(regions.has('s1')).toBe(true)
            expect(regions.has('s2')).toBe(true)
        })


        test('returns empty map when no regions', () => {
            const regions = atlas.getAllRegions()

            expect(regions).toBeInstanceOf(Map)
            expect(regions.size).toBe(0)
        })

    })


    describe('static properties', () => {

        test('DEFAULT_SIZE', () => {
            expect(TextureAtlas.DEFAULT_SIZE).toBe(4096)
        })


        test('MAX_SIZE', () => {
            expect(TextureAtlas.MAX_SIZE).toBe(4096)
        })

    })

})
