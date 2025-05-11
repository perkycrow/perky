import SourceManager from './source_manager'
import SourceLoader from './source_loader'
import PerkyModule from '../core/perky_module'
import {vi, beforeEach, describe, test, expect} from 'vitest'


describe('SourceManager', () => {
    let manager
    let manifest
    let loaders

    beforeEach(() => {
        loaders = {
            image: vi.fn().mockResolvedValue('loaded image'),
            audio: vi.fn().mockResolvedValue('loaded audio')
        }

        manifest = {
            getSourceDescriptor: vi.fn(),
            getSourceDescriptorsByTag: vi.fn(),
            getSourceDescriptors: vi.fn()
        }

        manager = new SourceManager({loaders, manifest})
    })


    test('constructor', () => {
        expect(manager).toBeInstanceOf(PerkyModule)
        expect(manager.loaders).toBe(loaders)
        expect(manager.manifest).toBe(manifest)
    })


    test('loadSource success', async () => {
        const sourceDescriptor = {type: 'image', id: 'logo', path: '/assets/logo.png'}
        manifest.getSourceDescriptor.mockReturnValueOnce(sourceDescriptor)
        
        const result = await manager.loadSource('image', 'logo')
        
        expect(manifest.getSourceDescriptor).toHaveBeenCalledWith('image', 'logo')
        expect(result).toBeInstanceOf(SourceLoader)
        expect(result.sourceDescriptors).toEqual([sourceDescriptor])
        expect(result.loaders).toBe(loaders)
    })


    test('loadSource not found', async () => {
        manifest.getSourceDescriptor.mockReturnValueOnce(null)
        
        await expect(manager.loadSource('image', 'nonexistent')).rejects.toThrow('Source not found: image:nonexistent')
        expect(manifest.getSourceDescriptor).toHaveBeenCalledWith('image', 'nonexistent')
    })


    test('loadTag success', async () => {
        const sourceDescriptors = [
            {type: 'image', id: 'logo', path: '/assets/logo.png', tags: ['ui']},
            {type: 'image', id: 'background', path: '/assets/bg.png', tags: ['ui']}
        ]
        manifest.getSourceDescriptorsByTag.mockReturnValueOnce(sourceDescriptors)
        
        const result = await manager.loadTag('ui')
        
        expect(manifest.getSourceDescriptorsByTag).toHaveBeenCalledWith('ui')
        expect(result).toBeInstanceOf(SourceLoader)
        expect(result.sourceDescriptors).toBe(sourceDescriptors)
        expect(result.loaders).toBe(loaders)
    })


    test('loadTag not found', async () => {
        manifest.getSourceDescriptorsByTag.mockReturnValueOnce([])
        
        await expect(manager.loadTag('nonexistent')).rejects.toThrow('No sources found for tag: nonexistent')
        expect(manifest.getSourceDescriptorsByTag).toHaveBeenCalledWith('nonexistent')
    })


    test('loadAll success', async () => {
        const sourceDescriptors = [
            {type: 'image', id: 'logo', path: '/assets/logo.png'},
            {type: 'audio', id: 'music', path: '/assets/music.mp3'}
        ]
        manifest.getSourceDescriptors.mockReturnValueOnce(sourceDescriptors)
        
        const result = await manager.loadAll()
        
        expect(manifest.getSourceDescriptors).toHaveBeenCalled()
        expect(result).toBeInstanceOf(SourceLoader)
        expect(result.sourceDescriptors).toBe(sourceDescriptors)
        expect(result.loaders).toBe(loaders)
    })


    test('loadAll not found', async () => {
        manifest.getSourceDescriptors.mockReturnValueOnce([])
        
        await expect(manager.loadAll()).rejects.toThrow('No sources found')
        expect(manifest.getSourceDescriptors).toHaveBeenCalled()
    })

})
