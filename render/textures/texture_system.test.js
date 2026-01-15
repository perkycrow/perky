import {describe, test, expect, beforeEach, vi} from 'vitest'
import TextureSystem from './texture_system.js'


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


describe('TextureSystem', () => {

    let system

    beforeEach(() => {
        system = new TextureSystem({atlasSize: 256})
    })


    test('constructor initializes with atlas manager', () => {
        expect(system.atlasManager).toBeDefined()
        expect(system.regionCount).toBe(0)
    })


    describe('addRegion', () => {

        test('adds image to atlas', () => {
            const image = createMockImage(32, 32)
            const region = system.addRegion('sprite1', image)

            expect(region).not.toBeNull()
            expect(region.width).toBe(32)
        })


        test('returns existing region for duplicate', () => {
            const image = createMockImage(32, 32)
            const region1 = system.addRegion('sprite1', image)
            const region2 = system.addRegion('sprite1', createMockImage(64, 64))

            expect(region1).toBe(region2)
        })

    })


    test('addRegions adds multiple images', () => {
        const images = {
            s1: createMockImage(32, 32),
            s2: createMockImage(48, 48)
        }

        system.addRegions(images)

        expect(system.regionCount).toBe(2)
    })


    describe('getRegion', () => {

        test('returns region by id', () => {
            system.addRegion('sprite1', createMockImage(32, 32))
            const region = system.getRegion('sprite1')

            expect(region).not.toBeNull()
        })


        test('returns null for unknown', () => {
            expect(system.getRegion('unknown')).toBeNull()
        })

    })


    describe('hasRegion', () => {

        test('returns true for existing', () => {
            system.addRegion('sprite1', createMockImage(32, 32))
            expect(system.hasRegion('sprite1')).toBe(true)
        })


        test('returns false for unknown', () => {
            expect(system.hasRegion('unknown')).toBe(false)
        })

    })


    describe('registerManualAtlas', () => {

        test('registers frames from manual atlas', () => {
            const atlasImage = createMockImage(256, 256)
            const frames = {
                idle: {x: 0, y: 0, w: 32, h: 32},
                walk: {x: 32, y: 0, w: 32, h: 32}
            }

            system.registerManualAtlas('player', atlasImage, frames)

            expect(system.hasRegion('player:idle')).toBe(true)
            expect(system.hasRegion('player:walk')).toBe(true)
        })


        test('creates correct regions from frames', () => {
            const atlasImage = createMockImage(256, 256)
            const frames = {
                frame1: {x: 64, y: 128, w: 32, h: 48}
            }

            system.registerManualAtlas('atlas', atlasImage, frames)

            const region = system.getRegion('atlas:frame1')

            expect(region.x).toBe(64)
            expect(region.y).toBe(128)
            expect(region.width).toBe(32)
            expect(region.height).toBe(48)
        })

    })


    describe('buildFromAssets', () => {

        test('builds atlas from image assets', () => {
            const assets = [
                {id: 'img1', type: 'image', source: createMockImage(32, 32)},
                {id: 'img2', type: 'image', source: createMockImage(48, 48)},
                {id: 'sound1', type: 'audio', source: {}}
            ]

            system.buildFromAssets(assets)

            expect(system.hasRegion('img1')).toBe(true)
            expect(system.hasRegion('img2')).toBe(true)
            expect(system.hasRegion('sound1')).toBe(false)
        })


        test('skips assets without source', () => {
            const assets = [
                {id: 'img1', type: 'image', source: null}
            ]

            system.buildFromAssets(assets)

            expect(system.hasRegion('img1')).toBe(false)
        })

    })


    describe('addFromAsset', () => {

        test('adds image asset to atlas', () => {
            const asset = {
                id: 'sprite1',
                type: 'image',
                source: createMockImage(32, 32)
            }

            const region = system.addFromAsset(asset)

            expect(region).not.toBeNull()
            expect(region.width).toBe(32)
            expect(system.hasRegion('sprite1')).toBe(true)
        })


        test('returns null for non-image asset', () => {
            const asset = {
                id: 'sound1',
                type: 'audio',
                source: {}
            }

            const region = system.addFromAsset(asset)

            expect(region).toBeNull()
        })


        test('returns null for asset without source', () => {
            const asset = {
                id: 'no-source',
                type: 'image',
                source: null
            }

            const region = system.addFromAsset(asset)

            expect(region).toBeNull()
        })


        test('returns existing region for duplicate asset', () => {
            const asset = {
                id: 'sprite1',
                type: 'image',
                source: createMockImage(32, 32)
            }

            const region1 = system.addFromAsset(asset)
            const region2 = system.addFromAsset({
                id: 'sprite1',
                type: 'image',
                source: createMockImage(64, 64)
            })

            expect(region1).toBe(region2)
        })


        test('stores as manual region when atlas config is false', () => {
            const asset = {
                id: 'standalone',
                type: 'image',
                source: createMockImage(32, 32),
                config: {atlas: false}
            }

            const region = system.addFromAsset(asset)

            expect(region).not.toBeNull()
            expect(system.hasRegion('standalone')).toBe(true)
            expect(region.image).toBe(asset.source)
        })

    })


    test('atlases returns list of atlases', () => {
        system.addRegion('s1', createMockImage(32, 32))

        expect(system.atlases.length).toBe(1)
    })


    describe('getDirtyAtlases', () => {

        test('returns dirty atlases', () => {
            system.addRegion('s1', createMockImage(32, 32))

            expect(system.getDirtyAtlases().length).toBe(1)
        })


        test('empty after markAllClean', () => {
            system.addRegion('s1', createMockImage(32, 32))
            system.markAllClean()

            expect(system.getDirtyAtlases().length).toBe(0)
        })

    })


    test('clear removes all regions', () => {
        system.addRegion('s1', createMockImage(32, 32))
        system.registerManualAtlas('atlas', createMockImage(256, 256), {
            frame1: {x: 0, y: 0, w: 32, h: 32}
        })

        system.clear()

        expect(system.regionCount).toBe(0)
        expect(system.hasRegion('s1')).toBe(false)
        expect(system.hasRegion('atlas:frame1')).toBe(false)
    })


    test('onInstall delegates methods to host', () => {
        const host = {}
        system.onInstall(host)

        expect(host.getRegion).toBeDefined()
        expect(host.hasRegion).toBeDefined()
        expect(host.addRegion).toBeDefined()
    })


    test('onDispose clears all regions', () => {
        system.addRegion('s1', createMockImage(32, 32))
        system.registerManualAtlas('atlas', createMockImage(256, 256), {
            frame1: {x: 0, y: 0, w: 32, h: 32}
        })

        system.onDispose()

        expect(system.regionCount).toBe(0)
        expect(system.hasRegion('s1')).toBe(false)
        expect(system.hasRegion('atlas:frame1')).toBe(false)
    })

})
