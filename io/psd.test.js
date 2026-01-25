import {parsePsd, layerToRGBA} from './psd.js'


function createMinimalPsd (options = {}) {
    const {
        width = 100,
        height = 100,
        channels = 3,
        depth = 8,
        colorMode = 3
    } = options

    const parts = []

    parts.push(stringToBytes('8BPS'))
    parts.push(uint16ToBytes(1))
    parts.push(new Uint8Array(6))
    parts.push(uint16ToBytes(channels))
    parts.push(uint32ToBytes(height))
    parts.push(uint32ToBytes(width))
    parts.push(uint16ToBytes(depth))
    parts.push(uint16ToBytes(colorMode))
    parts.push(uint32ToBytes(0))
    parts.push(uint32ToBytes(0))
    parts.push(uint32ToBytes(0))

    return concatBuffers(parts)
}


function stringToBytes (str) {
    const bytes = new Uint8Array(str.length)
    for (let i = 0; i < str.length; i++) {
        bytes[i] = str.charCodeAt(i)
    }
    return bytes
}


function uint16ToBytes (value) {
    const bytes = new Uint8Array(2)
    bytes[0] = (value >> 8) & 0xFF
    bytes[1] = value & 0xFF
    return bytes
}


function uint32ToBytes (value) {
    const bytes = new Uint8Array(4)
    bytes[0] = (value >> 24) & 0xFF
    bytes[1] = (value >> 16) & 0xFF
    bytes[2] = (value >> 8) & 0xFF
    bytes[3] = value & 0xFF
    return bytes
}


function concatBuffers (buffers) {
    const totalLength = buffers.reduce((sum, buf) => sum + buf.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0
    for (const buf of buffers) {
        result.set(buf, offset)
        offset += buf.length
    }
    return result.buffer
}


describe('parsePsd', () => {

    test('parses minimal valid PSD', () => {
        const buffer = createMinimalPsd()
        const result = parsePsd(buffer)

        expect(result.width).toBe(100)
        expect(result.height).toBe(100)
        expect(result.depth).toBe(8)
        expect(result.colorMode).toBe('RGB')
    })

    test('parses PSD dimensions', () => {
        const buffer = createMinimalPsd({width: 200, height: 150})
        const result = parsePsd(buffer)

        expect(result.width).toBe(200)
        expect(result.height).toBe(150)
    })

    test('parses grayscale color mode', () => {
        const buffer = createMinimalPsd({colorMode: 1})
        const result = parsePsd(buffer)

        expect(result.colorMode).toBe('Grayscale')
    })

    test('parses CMYK color mode', () => {
        const buffer = createMinimalPsd({colorMode: 4})
        const result = parsePsd(buffer)

        expect(result.colorMode).toBe('CMYK')
    })

    test('throws on invalid signature', () => {
        const buffer = new ArrayBuffer(26)
        const view = new DataView(buffer)
        view.setUint8(0, 'X'.charCodeAt(0))

        expect(() => parsePsd(buffer)).toThrow('Invalid PSD signature')
    })

    test('throws on unsupported version', () => {
        const parts = []
        parts.push(stringToBytes('8BPS'))
        parts.push(uint16ToBytes(99))
        parts.push(new Uint8Array(20))

        expect(() => parsePsd(concatBuffers(parts))).toThrow('Unsupported PSD version')
    })

    test('returns empty layers for minimal PSD', () => {
        const buffer = createMinimalPsd()
        const result = parsePsd(buffer)

        expect(result.layers).toEqual([])
    })

    test('returns empty tree for minimal PSD', () => {
        const buffer = createMinimalPsd()
        const result = parsePsd(buffer)

        expect(result.tree).toEqual([])
    })

    test('returns empty animations for minimal PSD', () => {
        const buffer = createMinimalPsd()
        const result = parsePsd(buffer)

        expect(result.animations).toEqual({})
    })

    test('returns default sRGB color profile', () => {
        const buffer = createMinimalPsd()
        const result = parsePsd(buffer)

        expect(result.colorProfile.name).toBe('sRGB')
        expect(result.colorProfile.isP3).toBe(false)
    })

})


describe('layerToRGBA', () => {

    test('returns null for empty layer', () => {
        const layer = {
            channelData: {},
            width: 0,
            height: 0,
            left: 0,
            top: 0
        }

        const result = layerToRGBA(layer, 100, 100)
        expect(result).toBeNull()
    })

    test('converts layer to RGBA with trim option', () => {
        const layer = {
            channelData: {
                0: new Uint8Array([255, 0]),
                1: new Uint8Array([0, 255]),
                2: new Uint8Array([0, 0]),
                [-1]: new Uint8Array([255, 255])
            },
            width: 2,
            height: 1,
            left: 10,
            top: 20
        }

        const result = layerToRGBA(layer, 100, 100, {trim: true})

        expect(result.width).toBe(2)
        expect(result.height).toBe(1)
        expect(result.left).toBe(10)
        expect(result.top).toBe(20)
        expect(result.pixels[0]).toBe(255)
        expect(result.pixels[1]).toBe(0)
        expect(result.pixels[2]).toBe(0)
        expect(result.pixels[3]).toBe(255)
    })

    test('converts layer to full canvas RGBA', () => {
        const layer = {
            channelData: {
                0: new Uint8Array([255]),
                1: new Uint8Array([128]),
                2: new Uint8Array([64]),
                [-1]: new Uint8Array([255])
            },
            width: 1,
            height: 1,
            left: 0,
            top: 0
        }

        const result = layerToRGBA(layer, 2, 2)

        expect(result.width).toBe(2)
        expect(result.height).toBe(2)
        expect(result.pixels[0]).toBe(255)
        expect(result.pixels[1]).toBe(128)
        expect(result.pixels[2]).toBe(64)
        expect(result.pixels[3]).toBe(255)
    })

    test('handles missing alpha channel', () => {
        const layer = {
            channelData: {
                0: new Uint8Array([255]),
                1: new Uint8Array([0]),
                2: new Uint8Array([0])
            },
            width: 1,
            height: 1,
            left: 0,
            top: 0
        }

        const result = layerToRGBA(layer, 1, 1)
        expect(result.pixels[3]).toBe(255)
    })

    test('handles layer positioned outside canvas bounds', () => {
        const layer = {
            channelData: {
                0: new Uint8Array([255]),
                1: new Uint8Array([0]),
                2: new Uint8Array([0]),
                [-1]: new Uint8Array([255])
            },
            width: 1,
            height: 1,
            left: -10,
            top: -10
        }

        const result = layerToRGBA(layer, 10, 10)
        expect(result).not.toBeNull()
        expect(result.width).toBe(10)
        expect(result.height).toBe(10)
    })

})
