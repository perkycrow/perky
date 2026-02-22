import generateNormalMap from './generate_normal_map.js'


function createTestImage (width, height, fillFn) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    const data = ctx.createImageData(width, height)

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const offset = (y * width + x) * 4
            const [r, g, b] = fillFn(x, y, width, height)
            data.data[offset] = r
            data.data[offset + 1] = g
            data.data[offset + 2] = b
            data.data[offset + 3] = 255
        }
    }

    ctx.putImageData(data, 0, 0)
    return canvas
}


function getPixel (canvas, x, y) {
    const ctx = canvas.getContext('2d')
    const data = ctx.getImageData(x, y, 1, 1).data
    return [data[0], data[1], data[2], data[3]]
}


describe('generateNormalMap', () => {

    test('returns a canvas with same dimensions', () => {
        const source = createTestImage(16, 8, () => [128, 128, 128])
        const result = generateNormalMap(source)
        expect(result).toBeInstanceOf(HTMLCanvasElement)
        expect(result.width).toBe(16)
        expect(result.height).toBe(8)
    })


    test('flat color produces normals pointing up', () => {
        const source = createTestImage(8, 8, () => [100, 100, 100])
        const result = generateNormalMap(source)
        const [r, g, b, a] = getPixel(result, 4, 4)
        expect(r).toBeCloseTo(128, -1)
        expect(g).toBeCloseTo(128, -1)
        expect(b).toBeCloseTo(255, -1)
        expect(a).toBe(255)
    })


    test('horizontal gradient tilts normals in X', () => {
        const source = createTestImage(16, 16, (x, _y, w) => {
            const v = Math.round((x / (w - 1)) * 255)
            return [v, v, v]
        })
        const result = generateNormalMap(source)
        const [r] = getPixel(result, 8, 8)
        expect(r).not.toBeCloseTo(128, -1)
    })


    test('vertical gradient tilts normals in Y', () => {
        const source = createTestImage(16, 16, (_x, y, _w, h) => {
            const v = Math.round((y / (h - 1)) * 255)
            return [v, v, v]
        })
        const result = generateNormalMap(source)
        const [, g] = getPixel(result, 8, 8)
        expect(g).not.toBeCloseTo(128, -1)
    })


    test('strength parameter affects output', () => {
        const source = createTestImage(16, 16, (x, _y, w) => {
            const v = Math.round((x / (w - 1)) * 255)
            return [v, v, v]
        })
        const low = generateNormalMap(source, {strength: 0.5})
        const high = generateNormalMap(source, {strength: 5.0})
        const [rLow] = getPixel(low, 8, 8)
        const [rHigh] = getPixel(high, 8, 8)
        expect(Math.abs(rHigh - 128)).toBeGreaterThan(Math.abs(rLow - 128))
    })


    test('1x1 pixel input does not crash', () => {
        const source = createTestImage(1, 1, () => [128, 128, 128])
        const result = generateNormalMap(source)
        expect(result.width).toBe(1)
        expect(result.height).toBe(1)
    })


    test('default strength is 2', () => {
        const source = createTestImage(8, 8, (x, _y, w) => {
            const v = Math.round((x / (w - 1)) * 255)
            return [v, v, v]
        })
        const defaultResult = generateNormalMap(source)
        const explicit = generateNormalMap(source, {strength: 2.0})
        const [rDefault] = getPixel(defaultResult, 4, 4)
        const [rExplicit] = getPixel(explicit, 4, 4)
        expect(rDefault).toBe(rExplicit)
    })

})
