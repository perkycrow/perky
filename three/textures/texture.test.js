import Texture from './texture'
import {describe, test, expect} from 'vitest'
import {RepeatWrapping, ClampToEdgeWrapping, LinearFilter, LinearMipmapLinearFilter, NearestFilter, RGBAFormat, UnsignedByteType, NoColorSpace, SRGBColorSpace, UVMapping, Vector2} from 'three'


describe('Texture', () => {

    test('constructor with object parameters', () => {
        const mockImage = document.createElement('canvas')
        const texture = new Texture({
            image: mockImage,
            wrapS: RepeatWrapping,
            wrapT: RepeatWrapping,
            magFilter: LinearFilter,
            minFilter: LinearMipmapLinearFilter,
            format: RGBAFormat,
            type: UnsignedByteType,
            anisotropy: 4,
            colorSpace: SRGBColorSpace
        })

        expect(texture.image).toBe(mockImage)
        expect(texture.wrapS).toBe(RepeatWrapping)
        expect(texture.wrapT).toBe(RepeatWrapping)
        expect(texture.magFilter).toBe(LinearFilter)
        expect(texture.minFilter).toBe(LinearMipmapLinearFilter)
        expect(texture.format).toBe(RGBAFormat)
        expect(texture.type).toBe(UnsignedByteType)
        expect(texture.anisotropy).toBe(4)
        expect(texture.colorSpace).toBe(SRGBColorSpace)
    })


    test('constructor with wrap shorthand', () => {
        const texture = new Texture({
            wrap: RepeatWrapping
        })

        expect(texture.wrapS).toBe(RepeatWrapping)
        expect(texture.wrapT).toBe(RepeatWrapping)
    })


    test('constructor with filter shorthand', () => {
        const texture = new Texture({
            filter: NearestFilter
        })

        expect(texture.magFilter).toBe(NearestFilter)
        expect(texture.minFilter).toBe(NearestFilter)
    })


    test('constructor with wrap shorthand and individual overrides', () => {
        const texture = new Texture({
            wrap: RepeatWrapping,
            wrapS: ClampToEdgeWrapping
        })

        expect(texture.wrapS).toBe(ClampToEdgeWrapping)
        expect(texture.wrapT).toBe(RepeatWrapping)
    })


    test('constructor with filter shorthand and individual overrides', () => {
        const texture = new Texture({
            filter: NearestFilter,
            magFilter: LinearFilter
        })

        expect(texture.magFilter).toBe(LinearFilter)
        expect(texture.minFilter).toBe(NearestFilter)
    })


    test('constructor with additional properties', () => {
        const repeatVector = new Vector2(2, 3)
        const offsetVector = new Vector2(0.1, 0.2)
        const centerVector = new Vector2(0.5, 0.5)

        const texture = new Texture({
            repeat: repeatVector,
            offset: offsetVector,
            rotation: Math.PI / 4,
            center: centerVector,
            flipY: false,
            generateMipmaps: false,
            premultiplyAlpha: true
        })

        expect(texture.repeat.x).toBe(2)
        expect(texture.repeat.y).toBe(3)
        expect(texture.offset.x).toBe(0.1)
        expect(texture.offset.y).toBe(0.2)
        expect(texture.rotation).toBe(Math.PI / 4)
        expect(texture.center.x).toBe(0.5)
        expect(texture.center.y).toBe(0.5)
        expect(texture.flipY).toBe(false)
        expect(texture.generateMipmaps).toBe(false)
        expect(texture.premultiplyAlpha).toBe(true)
    })


    test('constructor with empty object uses defaults', () => {
        const texture = new Texture({})

        expect(texture.mapping).toBe(UVMapping)
        expect(texture.wrapS).toBe(ClampToEdgeWrapping)
        expect(texture.wrapT).toBe(ClampToEdgeWrapping)
        expect(texture.magFilter).toBe(LinearFilter)
        expect(texture.minFilter).toBe(LinearMipmapLinearFilter)
        expect(texture.format).toBe(RGBAFormat)
        expect(texture.type).toBe(UnsignedByteType)
        expect(texture.anisotropy).toBe(1)
        expect(texture.colorSpace).toBe(NoColorSpace)
    })


    test('constructor with partial parameters and defaults', () => {
        const mockImage = document.createElement('canvas')
        const texture = new Texture({
            image: mockImage,
            wrapS: RepeatWrapping,
            anisotropy: 8
        })

        expect(texture.image).toBe(mockImage)
        expect(texture.wrapS).toBe(RepeatWrapping)
        expect(texture.wrapT).toBe(ClampToEdgeWrapping)
        expect(texture.magFilter).toBe(LinearFilter)
        expect(texture.minFilter).toBe(LinearMipmapLinearFilter)
        expect(texture.anisotropy).toBe(8)
        expect(texture.colorSpace).toBe(NoColorSpace)
    })


    test('constructor with positional arguments (legacy mode)', () => {
        const mockImage = document.createElement('canvas')
        const texture = new Texture(
            mockImage,
            UVMapping,
            RepeatWrapping,
            RepeatWrapping,
            LinearFilter,
            LinearMipmapLinearFilter,
            RGBAFormat,
            UnsignedByteType,
            4,
            SRGBColorSpace
        )

        expect(texture.image).toBe(mockImage)
        expect(texture.mapping).toBe(UVMapping)
        expect(texture.wrapS).toBe(RepeatWrapping)
        expect(texture.wrapT).toBe(RepeatWrapping)
        expect(texture.magFilter).toBe(LinearFilter)
        expect(texture.minFilter).toBe(LinearMipmapLinearFilter)
        expect(texture.format).toBe(RGBAFormat)
        expect(texture.type).toBe(UnsignedByteType)
        expect(texture.anisotropy).toBe(4)
        expect(texture.colorSpace).toBe(SRGBColorSpace)
    })


    test('constructor with no arguments uses sensible defaults', () => {
        const texture = new Texture()

        expect(texture.mapping).toBe(UVMapping)
        expect(texture.wrapS).toBe(ClampToEdgeWrapping)
        expect(texture.wrapT).toBe(ClampToEdgeWrapping)
        expect(texture.magFilter).toBe(LinearFilter)
        expect(texture.minFilter).toBe(LinearMipmapLinearFilter)
        expect(texture.format).toBe(RGBAFormat)
        expect(texture.type).toBe(UnsignedByteType)
        expect(texture.anisotropy).toBe(1)
        expect(texture.colorSpace).toBe(NoColorSpace)
    })


    test('constructor with null parameters uses sensible defaults', () => {
        const texture = new Texture(null)

        expect(texture.mapping).toBe(UVMapping)
        expect(texture.wrapS).toBe(ClampToEdgeWrapping)
        expect(texture.wrapT).toBe(ClampToEdgeWrapping)
        expect(texture.magFilter).toBe(LinearFilter)
        expect(texture.minFilter).toBe(LinearMipmapLinearFilter)
        expect(texture.anisotropy).toBe(1)
        expect(texture.colorSpace).toBe(NoColorSpace)
    })


    test('constructor with non-object parameters falls back to legacy mode', () => {
        const mockImage = document.createElement('canvas')
        const texture = new Texture(mockImage, UVMapping, RepeatWrapping)

        expect(texture.image).toBe(mockImage)
        expect(texture.mapping).toBe(UVMapping)
        expect(texture.wrapS).toBe(RepeatWrapping)
    })


    test('constructor with complex configuration', () => {
        const mockImage = document.createElement('canvas')
        const texture = new Texture({
            image: mockImage,
            wrap: RepeatWrapping,
            filter: NearestFilter,
            colorSpace: SRGBColorSpace,
            repeat: new Vector2(4, 4),
            offset: new Vector2(0.25, 0.25),
            rotation: Math.PI / 2,
            flipY: false,
            generateMipmaps: false
        })

        expect(texture.image).toBe(mockImage)
        expect(texture.wrapS).toBe(RepeatWrapping)
        expect(texture.wrapT).toBe(RepeatWrapping)
        expect(texture.magFilter).toBe(NearestFilter)
        expect(texture.minFilter).toBe(NearestFilter)
        expect(texture.colorSpace).toBe(SRGBColorSpace)
        expect(texture.repeat.x).toBe(4)
        expect(texture.repeat.y).toBe(4)
        expect(texture.offset.x).toBe(0.25)
        expect(texture.offset.y).toBe(0.25)
        expect(texture.rotation).toBe(Math.PI / 2)
        expect(texture.flipY).toBe(false)
        expect(texture.generateMipmaps).toBe(false)
    })

}) 