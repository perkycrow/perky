import SpriteTexture from './sprite_texture.js'
import {describe, test, expect} from 'vitest'
import {
    SRGBColorSpace,
    NoColorSpace,
    LinearMipmapLinearFilter,
    LinearFilter,
    NearestFilter,
    Vector2
} from 'three'


describe('SpriteTexture', () => {

    test('constructor with default sprite settings', () => {
        const mockImage = document.createElement('canvas')
        const texture = new SpriteTexture({
            image: mockImage
        })

        expect(texture.image).toBe(mockImage)
        expect(texture.colorSpace).toBe(SRGBColorSpace)
        expect(texture.generateMipmaps).toBe(true)
        expect(texture.minFilter).toBe(LinearMipmapLinearFilter)
        expect(texture.magFilter).toBe(LinearFilter)
    })


    test('constructor with source parameter', () => {
        const mockImage = document.createElement('canvas')
        const texture = new SpriteTexture({
            source: mockImage
        })

        expect(texture.image).toBe(mockImage)
        expect(texture.colorSpace).toBe(SRGBColorSpace)
    })


    test('constructor with generateMipmaps false', () => {
        const mockImage = document.createElement('canvas')
        const texture = new SpriteTexture({
            image: mockImage,
            generateMipmaps: false
        })

        expect(texture.generateMipmaps).toBe(false)
        expect(texture.colorSpace).toBe(SRGBColorSpace)
    })


    test('constructor with custom anisotropy', () => {
        const mockImage = document.createElement('canvas')
        const texture = new SpriteTexture({
            image: mockImage,
            anisotropy: 8
        })

        expect(texture.anisotropy).toBe(8)
        expect(texture.colorSpace).toBe(SRGBColorSpace)
    })


    test('constructor with anisotropy false keeps default', () => {
        const mockImage = document.createElement('canvas')
        const texture = new SpriteTexture({
            image: mockImage,
            anisotropy: false
        })

        expect(texture.anisotropy).toBe(1)
    })


    test('constructor with explicit filters overrides generateMipmaps defaults', () => {
        const mockImage = document.createElement('canvas')
        const texture = new SpriteTexture({
            image: mockImage,
            generateMipmaps: true,
            minFilter: NearestFilter,
            magFilter: NearestFilter
        })

        expect(texture.generateMipmaps).toBe(true)
        expect(texture.minFilter).toBe(NearestFilter)
        expect(texture.magFilter).toBe(NearestFilter)
        expect(texture.colorSpace).toBe(SRGBColorSpace)
    })


    test('constructor with partial explicit filters', () => {
        const mockImage = document.createElement('canvas')
        const texture = new SpriteTexture({
            image: mockImage,
            generateMipmaps: true,
            minFilter: NearestFilter
        })

        expect(texture.minFilter).toBe(NearestFilter)
        expect(texture.magFilter).toBe(LinearFilter)
    })


    test('constructor with custom colorSpace', () => {
        const mockImage = document.createElement('canvas')
        const texture = new SpriteTexture({
            image: mockImage,
            colorSpace: NoColorSpace
        })

        expect(texture.colorSpace).toBe(NoColorSpace)
    })


    test('constructor with additional texture properties', () => {
        const mockImage = document.createElement('canvas')
        const texture = new SpriteTexture({
            image: mockImage,
            repeat: new Vector2(2, 2),
            offset: new Vector2(0.1, 0.1),
            rotation: Math.PI / 4
        })

        expect(texture.repeat.x).toBe(2)
        expect(texture.repeat.y).toBe(2)
        expect(texture.offset.x).toBe(0.1)
        expect(texture.offset.y).toBe(0.1)
        expect(texture.rotation).toBe(Math.PI / 4)
        expect(texture.colorSpace).toBe(SRGBColorSpace)
    })


    test('constructor with empty object uses sprite defaults', () => {
        const texture = new SpriteTexture({})

        expect(texture.colorSpace).toBe(SRGBColorSpace)
        expect(texture.generateMipmaps).toBe(true)
        expect(texture.minFilter).toBe(LinearMipmapLinearFilter)
        expect(texture.magFilter).toBe(LinearFilter)
    })


    test('constructor with no arguments uses sprite defaults', () => {
        const texture = new SpriteTexture()

        expect(texture.colorSpace).toBe(SRGBColorSpace)
        expect(texture.generateMipmaps).toBe(true)
        expect(texture.minFilter).toBe(LinearMipmapLinearFilter)
        expect(texture.magFilter).toBe(LinearFilter)
    })



    test('constructor with generateMipmaps false and explicit filters', () => {
        const mockImage = document.createElement('canvas')
        const texture = new SpriteTexture({
            image: mockImage,
            generateMipmaps: false,
            minFilter: NearestFilter,
            magFilter: NearestFilter
        })

        expect(texture.generateMipmaps).toBe(false)
        expect(texture.minFilter).toBe(NearestFilter)
        expect(texture.magFilter).toBe(NearestFilter)
    })

})
