import {describe, test, expect} from 'vitest'
import Asset from './asset.js'


describe('Asset', () => {

    test('constructor with parameters', () => {
        const params = {
            type: 'image',
            name: 'example',
            id: 'test_id',
            url: '/path/to/file.jpg',
            source: {key: 'value'},
            tags: ['titleScreen', 'mainScene'],
            config: {width: 100, height: 100}
        }

        const asset = new Asset(params)

        expect(asset.type).toBe('image')
        expect(asset.name).toBe('example')
        expect(asset.id).toBe('test_id')
        expect(asset.url).toBe('/path/to/file.jpg')
        expect(asset.source).toEqual({key: 'value'})
        expect(asset.tags).toEqual(['titleScreen', 'mainScene'])
        expect(asset.config).toEqual({width: 100, height: 100})
    })


    test('constructor name defaults to id', () => {
        const asset = new Asset({
            type: 'video',
            id: 'custom_id'
        })

        expect(asset.id).toBe('custom_id')
        expect(asset.name).toBe('custom_id')
    })


    test('loaded returns true when source exists', () => {
        const asset = new Asset({
            type: 'json',
            id: 'test_id',
            source: {content: 'source'}
        })

        expect(asset.loaded).toBe(true)
    })


    test('loaded returns false when source is missing', () => {
        const asset = new Asset({
            type: 'text',
            id: 'test_id',
            url: '/path/to/text.txt'
        })

        expect(asset.loaded).toBe(false)
    })


    test('hasTag returns true for existing tags', () => {
        const asset = new Asset({
            type: 'image',
            id: 'test_id',
            tags: ['titleScreen', 'mainScene']
        })

        expect(asset.hasTag('titleScreen')).toBe(true)
        expect(asset.hasTag('mainScene')).toBe(true)
        expect(asset.hasTag('endingScene')).toBe(false)
    })


    test('hasTag returns false when tags are empty', () => {
        const asset = new Asset({
            type: 'image',
            id: 'test_id'
        })

        expect(asset.hasTag('titleScreen')).toBe(false)
    })


    test('export with url', () => {
        const asset = new Asset({
            type: 'image',
            name: 'example',
            id: 'test_id',
            url: '/path/to/file.jpg',
            tags: ['titleScreen'],
            config: {width: 100}
        })

        const exported = asset.export()

        expect(exported).toEqual({
            type: 'image',
            id: 'test_id',
            name: 'example',
            url: '/path/to/file.jpg',
            tags: ['titleScreen'],
            config: {width: 100}
        })
        expect(exported.source).toBeUndefined()
    })


    test('export with source', () => {
        const asset = new Asset({
            type: 'json',
            name: 'config',
            id: 'config_id',
            source: {settings: true},
            tags: ['config', 'settings'],
            config: {parse: true}
        })

        const exported = asset.export()

        expect(exported).toEqual({
            type: 'json',
            id: 'config_id',
            name: 'config',
            source: {settings: true},
            tags: ['config', 'settings'],
            config: {parse: true}
        })
        expect(exported.path).toBeUndefined()
    })


    test('default tags and config', () => {
        const asset = new Asset({
            type: 'audio',
            id: 'audio_id'
        })

        expect(asset.tags).toEqual([])
        expect(asset.config).toEqual({})
    })


    test('constructor accepts path as alias for url', () => {
        const asset = new Asset({
            type: 'image',
            id: 'path_test',
            path: '/assets/image.png'
        })

        expect(asset.url).toBe('/assets/image.png')
    })


    test('constructor generates id from name when id not provided', () => {
        const asset = new Asset({
            type: 'image',
            name: 'Hero Sprite'
        })

        expect(asset.id).toMatch(/^hero_sprite/)
        expect(asset.name).toBe('Hero Sprite')
    })


    test('constructor generates id from type when no id or name', () => {
        const asset = new Asset({
            type: 'audio'
        })

        expect(asset.id).toMatch(/^audio/)
    })


    test('updatedAt defaults to 0', () => {
        const asset = new Asset({
            type: 'json',
            id: 'config'
        })

        expect(asset.updatedAt).toBe(0)
    })


    test('updatedAt can be set via params', () => {
        const timestamp = Date.now()
        const asset = new Asset({
            type: 'json',
            id: 'config',
            updatedAt: timestamp
        })

        expect(asset.updatedAt).toBe(timestamp)
    })

})
