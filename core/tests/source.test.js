import {describe, test, expect} from 'vitest'
import Source from '../src/source'


describe('Source', () => {
    
    test('constructor with parameters', () => {
        const params = {
            type: 'image',
            name: 'example',
            id: 'test_id',
            path: '/path/to/file.jpg',
            data: {key: 'value'},
            tags: ['titleScreen', 'mainScene'],
            options: {width: 100, height: 100}
        }
        
        const source = new Source(params)
        
        expect(source.type).toBe('image')
        expect(source.name).toBe('example')
        expect(source.id).toBe('test_id')
        expect(source.path).toBe('/path/to/file.jpg')
        expect(source.data).toEqual({key: 'value'})
        expect(source.tags).toEqual(['titleScreen', 'mainScene'])
        expect(source.options).toEqual({width: 100, height: 100})
    })


    test('constructor name', () => {
        const source = new Source({
            type: 'video',
            id: 'custom_id'
        })
        
        expect(source.id).toBe('custom_id')
        expect(source.name).toBe('custom_id')
    })


    test('loaded', () => {
        const source = new Source({
            type: 'json',
            id: 'test_id',
            data: {content: 'data'}
        })
        
        expect(source.loaded).toBe(true)
    })


    test('loaded false', () => {
        const source = new Source({
            type: 'text',
            id: 'test_id',
            path: '/path/to/text.txt'
        })
        
        expect(source.loaded).toBe(false)
    })


    test('hasTag', () => {
        const source = new Source({
            type: 'image',
            id: 'test_id',
            tags: ['titleScreen', 'mainScene']
        })
        
        expect(source.hasTag('titleScreen')).toBe(true)
        expect(source.hasTag('mainScene')).toBe(true)
        expect(source.hasTag('endingScene')).toBe(false)
    })


    test('hasTag with empty tags', () => {
        const source = new Source({
            type: 'image',
            id: 'test_id'
        })
        
        expect(source.hasTag('titleScreen')).toBe(false)
    })


    test('export with path', () => {
        const source = new Source({
            type: 'image',
            name: 'example',
            id: 'test_id',
            path: '/path/to/file.jpg',
            tags: ['titleScreen'],
            options: {width: 100}
        })
        
        const exported = source.export()
        
        expect(exported).toEqual({
            type: 'image',
            id: 'test_id',
            name: 'example',
            path: '/path/to/file.jpg',
            tags: ['titleScreen'],
            options: {width: 100}
        })
        expect(exported.data).toBeUndefined()
    })


    test('export with data', () => {
        const source = new Source({
            type: 'json',
            name: 'config',
            id: 'config_id',
            data: {settings: true},
            tags: ['config', 'settings'],
            options: {parse: true}
        })
        
        const exported = source.export()
        
        expect(exported).toEqual({
            type: 'json',
            id: 'config_id',
            name: 'config',
            data: {settings: true},
            tags: ['config', 'settings'],
            options: {parse: true}
        })
        expect(exported.path).toBeUndefined()
    })


    test('default tags', () => {
        const source = new Source({
            type: 'audio',
            id: 'audio_id'
        })
        
        expect(source.tags).toEqual([])
        expect(source.options).toEqual({})
    })

})
