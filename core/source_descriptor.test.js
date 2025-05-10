import {describe, test, expect} from 'vitest'
import SourceDescriptor from './source_descriptor'


describe('SourceDescriptor', () => {
    
    test('constructor with parameters', () => {
        const params = {
            type: 'image',
            name: 'example',
            id: 'test_id',
            path: '/path/to/file.jpg',
            source: {key: 'value'},
            tags: ['titleScreen', 'mainScene'],
            options: {width: 100, height: 100}
        }

        const descriptor = new SourceDescriptor(params)
        
        expect(descriptor.type).toBe('image')
        expect(descriptor.name).toBe('example')
        expect(descriptor.id).toBe('test_id')
        expect(descriptor.path).toBe('/path/to/file.jpg')
        expect(descriptor.source).toEqual({key: 'value'})
        expect(descriptor.tags).toEqual(['titleScreen', 'mainScene'])
        expect(descriptor.options).toEqual({width: 100, height: 100})
    })


    test('constructor name', () => {
        const descriptor = new SourceDescriptor({
            type: 'video',
            id: 'custom_id'
        })
        
        expect(descriptor.id).toBe('custom_id')
        expect(descriptor.name).toBe('custom_id')
    })


    test('loaded', () => {
        const descriptor = new SourceDescriptor({
            type: 'json',
            id: 'test_id',
            source: {content: 'source'}
        })
        
        expect(descriptor.loaded).toBe(true)
    })


    test('loaded false', () => {
        const descriptor = new SourceDescriptor({
            type: 'text',
            id: 'test_id',
            path: '/path/to/text.txt'
        })
        
        expect(descriptor.loaded).toBe(false)
    })


    test('hasTag', () => {
        const descriptor = new SourceDescriptor({
            type: 'image',
            id: 'test_id',
            tags: ['titleScreen', 'mainScene']
        })
        
        expect(descriptor.hasTag('titleScreen')).toBe(true)
        expect(descriptor.hasTag('mainScene')).toBe(true)
        expect(descriptor.hasTag('endingScene')).toBe(false)
    })


    test('hasTag with empty tags', () => {
        const descriptor = new SourceDescriptor({
            type: 'image',
            id: 'test_id'
        })
        
        expect(descriptor.hasTag('titleScreen')).toBe(false)
    })


    test('export with path', () => {
        const descriptor = new SourceDescriptor({
            type: 'image',
            name: 'example',
            id: 'test_id',
            path: '/path/to/file.jpg',
            tags: ['titleScreen'],
            options: {width: 100}
        })
        
        const exported = descriptor.export()
        
        expect(exported).toEqual({
            type: 'image',
            id: 'test_id',
            name: 'example',
            path: '/path/to/file.jpg',
            tags: ['titleScreen'],
            options: {width: 100}
        })
        expect(exported.source).toBeUndefined()
    })


    test('export with source', () => {
        const descriptor = new SourceDescriptor({
            type: 'json',
            name: 'config',
            id: 'config_id',
            source: {settings: true},
            tags: ['config', 'settings'],
            options: {parse: true}
        })
        
        const exported = descriptor.export()
        
        expect(exported).toEqual({
            type: 'json',
            id: 'config_id',
            name: 'config',
            source: {settings: true},
            tags: ['config', 'settings'],
            options: {parse: true}
        })
        expect(exported.path).toBeUndefined()
    })


    test('default tags', () => {
        const descriptor = new SourceDescriptor({
            type: 'audio',
            id: 'audio_id'
        })
        
        expect(descriptor.tags).toEqual([])
        expect(descriptor.options).toEqual({})
    })

}) 