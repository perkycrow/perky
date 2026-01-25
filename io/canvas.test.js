import {
    createCanvas,
    canvasToBlob,
    putPixels,
    calculateResizeDimensions,
    resizeCanvas
} from './canvas.js'


describe('calculateResizeDimensions', () => {

    test('returns target dimensions when both provided', () => {
        const result = calculateResizeDimensions(100, 200, 50, 100)
        expect(result).toEqual({width: 50, height: 100})
    })

    test('scales by width when only width provided', () => {
        const result = calculateResizeDimensions(100, 200, 50, undefined)
        expect(result).toEqual({width: 50, height: 100})
    })

    test('scales by height when only height provided', () => {
        const result = calculateResizeDimensions(100, 200, undefined, 100)
        expect(result).toEqual({width: 50, height: 100})
    })

    test('returns source dimensions when no target provided', () => {
        const result = calculateResizeDimensions(100, 200, undefined, undefined)
        expect(result).toEqual({width: 100, height: 200})
    })

    test('handles non-proportional scaling', () => {
        const result = calculateResizeDimensions(100, 100, 200, 50)
        expect(result).toEqual({width: 200, height: 50})
    })

    test('rounds scaled dimensions', () => {
        const result = calculateResizeDimensions(100, 100, 33, undefined)
        expect(result.width).toBe(33)
        expect(result.height).toBe(33)
    })

})


describe('createCanvas', () => {

    test('creates canvas with specified dimensions', async () => {
        const canvas = await createCanvas(100, 200)
        expect(canvas.width).toBe(100)
        expect(canvas.height).toBe(200)
    })

    test('canvas has 2d context', async () => {
        const canvas = await createCanvas(50, 50)
        const ctx = canvas.getContext('2d')
        expect(ctx).toBeDefined()
    })

})


describe('putPixels', () => {

    test('puts pixel data on canvas context', async () => {
        const canvas = await createCanvas(2, 2)
        const ctx = canvas.getContext('2d')

        const pixels = new Uint8Array([
            255, 0, 0, 255,
            0, 255, 0, 255,
            0, 0, 255, 255,
            255, 255, 255, 255
        ])

        putPixels(ctx, {pixels, width: 2, height: 2})

        const imageData = ctx.getImageData(0, 0, 2, 2)
        expect(imageData.data[0]).toBe(255)
        expect(imageData.data[1]).toBe(0)
        expect(imageData.data[2]).toBe(0)
        expect(imageData.data[3]).toBe(255)
    })

    test('puts pixels at specified offset', async () => {
        const canvas = await createCanvas(4, 4)
        const ctx = canvas.getContext('2d')

        const pixels = new Uint8Array([255, 0, 0, 255])

        putPixels(ctx, {pixels, width: 1, height: 1, x: 2, y: 2})

        const imageData = ctx.getImageData(2, 2, 1, 1)
        expect(imageData.data[0]).toBe(255)
    })

})


describe('resizeCanvas', () => {

    test('resizes canvas to target dimensions', async () => {
        const source = await createCanvas(100, 100)
        const resized = await resizeCanvas(source, 50, 50)
        expect(resized.width).toBe(50)
        expect(resized.height).toBe(50)
    })

    test('uses smooth interpolation by default', async () => {
        const source = await createCanvas(100, 100)
        const resized = await resizeCanvas(source, 50, 50)
        const ctx = resized.getContext('2d')
        expect(ctx.imageSmoothingEnabled).toBe(true)
    })

    test('disables smoothing with nearest flag', async () => {
        const source = await createCanvas(100, 100)
        const resized = await resizeCanvas(source, 50, 50, true)
        const ctx = resized.getContext('2d')
        expect(ctx.imageSmoothingEnabled).toBe(false)
    })

})


describe('canvasToBlob', () => {

    test('converts canvas to blob', async () => {
        const canvas = await createCanvas(10, 10)
        const blob = await canvasToBlob(canvas)
        expect(blob).toBeInstanceOf(Blob)
        expect(blob.type).toBe('image/png')
    })

})


