import {describe, test, expect, beforeEach} from 'vitest'
import Atlas from './atlas.js'


function createMockImage (width, height) {
    return {width, height}
}


describe('Atlas', () => {

    describe('constructor', () => {

        test('creates with default values', () => {
            const atlas = new Atlas()

            expect(atlas.image).toBe(null)
            expect(atlas.tileWidth).toBe(0)
            expect(atlas.tileHeight).toBe(0)
            expect(atlas.columns).toBe(0)
            expect(atlas.rows).toBe(0)
            expect(atlas.padding).toBe(0)
            expect(atlas.spacing).toBe(0)
        })


        test('creates with provided options', () => {
            const image = createMockImage(512, 256)
            const atlas = new Atlas({
                image,
                tileWidth: 64,
                tileHeight: 64,
                columns: 8,
                rows: 4,
                padding: 2,
                spacing: 1
            })

            expect(atlas.image).toBe(image)
            expect(atlas.tileWidth).toBe(64)
            expect(atlas.tileHeight).toBe(64)
            expect(atlas.columns).toBe(8)
            expect(atlas.rows).toBe(4)
            expect(atlas.padding).toBe(2)
            expect(atlas.spacing).toBe(1)
        })

    })


    describe('getters', () => {

        test('width returns image width', () => {
            const atlas = new Atlas({image: createMockImage(512, 256)})
            expect(atlas.width).toBe(512)
        })


        test('height returns image height', () => {
            const atlas = new Atlas({image: createMockImage(512, 256)})
            expect(atlas.height).toBe(256)
        })


        test('width returns 0 when no image', () => {
            const atlas = new Atlas()
            expect(atlas.width).toBe(0)
        })


        test('height returns 0 when no image', () => {
            const atlas = new Atlas()
            expect(atlas.height).toBe(0)
        })


        test('tileCount returns columns * rows', () => {
            const atlas = new Atlas({columns: 4, rows: 3})
            expect(atlas.tileCount).toBe(12)
        })

    })


    describe('computeGridFromImage', () => {

        test('computes columns and rows from image size', () => {
            const atlas = new Atlas({
                image: createMockImage(256, 128),
                tileWidth: 64,
                tileHeight: 64
            })

            atlas.computeGridFromImage()

            expect(atlas.columns).toBe(4)
            expect(atlas.rows).toBe(2)
        })


        test('accounts for padding', () => {
            const atlas = new Atlas({
                image: createMockImage(260, 132),
                tileWidth: 64,
                tileHeight: 64,
                padding: 2
            })

            atlas.computeGridFromImage()

            expect(atlas.columns).toBe(4)
            expect(atlas.rows).toBe(2)
        })


        test('accounts for spacing', () => {
            const atlas = new Atlas({
                image: createMockImage(259, 129),
                tileWidth: 64,
                tileHeight: 64,
                spacing: 1
            })

            atlas.computeGridFromImage()

            expect(atlas.columns).toBe(4)
            expect(atlas.rows).toBe(2)
        })


        test('returns this for chaining', () => {
            const atlas = new Atlas({
                image: createMockImage(256, 128),
                tileWidth: 64,
                tileHeight: 64
            })

            expect(atlas.computeGridFromImage()).toBe(atlas)
        })


        test('does nothing without image', () => {
            const atlas = new Atlas({tileWidth: 64, tileHeight: 64})

            atlas.computeGridFromImage()

            expect(atlas.columns).toBe(0)
            expect(atlas.rows).toBe(0)
        })

    })


    describe('getTileUVs', () => {

        let atlas

        beforeEach(() => {
            atlas = new Atlas({
                image: createMockImage(256, 128),
                tileWidth: 64,
                tileHeight: 64,
                columns: 4,
                rows: 2
            })
        })


        test('returns UVs for first tile', () => {
            const uvs = atlas.getTileUVs(0)

            expect(uvs.u0).toBe(0)
            expect(uvs.v0).toBe(0)
            expect(uvs.u1).toBe(0.25)
            expect(uvs.v1).toBe(0.5)
        })


        test('returns UVs for tile in middle', () => {
            const uvs = atlas.getTileUVs(5)

            expect(uvs.u0).toBe(0.25)
            expect(uvs.v0).toBe(0.5)
            expect(uvs.u1).toBe(0.5)
            expect(uvs.v1).toBe(1)
        })


        test('returns UVs for last tile', () => {
            const uvs = atlas.getTileUVs(7)

            expect(uvs.u0).toBe(0.75)
            expect(uvs.v0).toBe(0.5)
            expect(uvs.u1).toBe(1)
            expect(uvs.v1).toBe(1)
        })


        test('returns null for negative index', () => {
            expect(atlas.getTileUVs(-1)).toBe(null)
        })


        test('returns null for index out of bounds', () => {
            expect(atlas.getTileUVs(8)).toBe(null)
        })


        test('accounts for padding', () => {
            atlas = new Atlas({
                image: createMockImage(260, 132),
                tileWidth: 64,
                tileHeight: 64,
                columns: 4,
                rows: 2,
                padding: 2
            })

            const uvs = atlas.getTileUVs(0)

            expect(uvs.u0).toBeCloseTo(2 / 260)
            expect(uvs.v0).toBeCloseTo(2 / 132)
        })


        test('accounts for spacing', () => {
            atlas = new Atlas({
                image: createMockImage(259, 129),
                tileWidth: 64,
                tileHeight: 64,
                columns: 4,
                rows: 2,
                spacing: 1
            })

            const uvs = atlas.getTileUVs(1)

            expect(uvs.u0).toBeCloseTo(65 / 259)
            expect(uvs.v0).toBe(0)
        })

    })


    describe('getTileBounds', () => {

        let atlas

        beforeEach(() => {
            atlas = new Atlas({
                image: createMockImage(256, 128),
                tileWidth: 64,
                tileHeight: 64,
                columns: 4,
                rows: 2
            })
        })


        test('returns bounds for first tile', () => {
            const bounds = atlas.getTileBounds(0)

            expect(bounds.x).toBe(0)
            expect(bounds.y).toBe(0)
            expect(bounds.width).toBe(64)
            expect(bounds.height).toBe(64)
        })


        test('returns bounds for tile in middle', () => {
            const bounds = atlas.getTileBounds(5)

            expect(bounds.x).toBe(64)
            expect(bounds.y).toBe(64)
            expect(bounds.width).toBe(64)
            expect(bounds.height).toBe(64)
        })


        test('returns null for invalid index', () => {
            expect(atlas.getTileBounds(-1)).toBe(null)
            expect(atlas.getTileBounds(8)).toBe(null)
        })

    })


    test('getShaderParams returns normalized tile dimensions and grid info', () => {
        const atlas = new Atlas({
            image: createMockImage(256, 128),
            tileWidth: 64,
            tileHeight: 64,
            columns: 4,
            rows: 2
        })

        const params = atlas.getShaderParams()

        expect(params.tileWidth).toBe(0.25)
        expect(params.tileHeight).toBe(0.5)
        expect(params.columns).toBe(4)
        expect(params.rows).toBe(2)
    })

})
