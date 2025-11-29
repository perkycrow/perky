import Manifest from './manifest'
import SourceDescriptor from './source_descriptor'


describe('Manifest', () => {
    let manifest

    beforeEach(() => {
        manifest = new Manifest()
    })


    test('constructor', () => {
        expect(manifest.getMetadata()).toEqual({})
        expect(manifest.getConfig()).toEqual({})
        expect(manifest.getSourceDescriptorTypes()).toEqual([])
        expect(manifest.getAlias()).toEqual({})
    })


    test('constructor with data', () => {
        const customManifest = new Manifest({
            data: {
                metadata: {name: 'Test Manifest'}
            }
        })

        expect(customManifest.getMetadata('name')).toBe('Test Manifest')
        expect(customManifest.getConfig()).toEqual({})
        expect(customManifest.getSourceDescriptorTypes()).toEqual([])
        expect(customManifest.getAlias()).toEqual({})
    })


    test('import with JSON string', () => {
        const jsonData = JSON.stringify({
            metadata: {version: '1.0.0'},
            config: {debug: true},
            sourceDescriptors: {images: {logo: {id: 'logo', url: '/assets/logo.png'}}},
            aliases: {mainLogo: 'logo'}
        })

        manifest.import(jsonData)

        expect(manifest.getMetadata('version')).toBe('1.0.0')
        expect(manifest.getConfig('debug')).toBe(true)
        expect(manifest.getSourceDescriptor('images', 'logo').id).toBe('logo')
        expect(manifest.getAlias('mainLogo')).toBe('logo')
    })


    test('import with object', () => {
        const data = {
            metadata: {version: '1.0.0'}
        }

        manifest.import(data)

        expect(manifest.getMetadata('version')).toBe('1.0.0')
    })


    test('export', () => {
        manifest.setMetadata('version', '1.0.0')

        const exported = manifest.export()

        expect(exported.metadata.version).toBe('1.0.0')
    })


    test('getMetadata', () => {
        manifest.setMetadata('version', '1.0.0')
        manifest.setMetadata('author', 'Test')

        expect(manifest.getMetadata()).toEqual({version: '1.0.0', author: 'Test'})
    })


    test('getMetadata with key', () => {
        manifest.setMetadata('version', '1.0.0')
        manifest.setMetadata('author', 'Test')

        expect(manifest.getMetadata('version')).toBe('1.0.0')
    })


    test('setMetadata', () => {
        const result = manifest.setMetadata('version', '1.0.0')

        expect(manifest.getMetadata('version')).toBe('1.0.0')
        expect(result).toBe(manifest)
    })


    test('getConfig', () => {
        manifest.setConfig('debug', true)
        manifest.setConfig('logging.level', 'info')

        expect(manifest.getConfig()).toEqual({debug: true, logging: {level: 'info'}})
    })


    test('getConfig with path', () => {
        manifest.setConfig('debug', true)
        manifest.setConfig('logging.level', 'info')

        expect(manifest.getConfig('logging.level')).toBe('info')
    })


    test('setConfig', () => {
        const result = manifest.setConfig('logging.level', 'debug')

        expect(manifest.getConfig('logging.level')).toBe('debug')
        expect(result).toBe(manifest)
    })


    test('addSourceDescriptor', () => {
        manifest.addSourceDescriptor('images', {id: 'logo', url: '/assets/logo.png'})

        expect(Object.keys(manifest.getSourceDescriptorMap('images'))).toHaveLength(1)
        expect(manifest.getSourceDescriptor('images', 'logo').id).toBe('logo')
    })


    test('addSourceDescriptor update existing', () => {
        manifest.addSourceDescriptor('images', {id: 'logo', url: '/assets/logo.png'})
        manifest.addSourceDescriptor('images', {id: 'logo', url: '/assets/new-logo.png'})

        expect(Object.keys(manifest.getSourceDescriptorMap('images'))).toHaveLength(1)
        expect(manifest.getSourceDescriptor('images', 'logo').url).toBe('/assets/new-logo.png')
    })


    test('getSourceDescriptor null type', () => {
        expect(manifest.getSourceDescriptor('images', 'logo')).toBeNull()
    })


    test('getSourceDescriptor null id', () => {
        manifest.addSourceDescriptor('images', {id: 'logo', url: '/assets/logo.png'})

        expect(manifest.getSourceDescriptor('images', 'icon')).toBeNull()
    })


    test('getSourceDescriptor', () => {
        const sourceDescriptorData = {id: 'logo', url: '/assets/logo.png'}
        manifest.addSourceDescriptor('images', sourceDescriptorData)

        const sourceDescriptorInstance = manifest.getSourceDescriptor('images', 'logo')
        expect(sourceDescriptorInstance).toBeInstanceOf(SourceDescriptor)
        expect(sourceDescriptorInstance.id).toBe(sourceDescriptorData.id)
        expect(sourceDescriptorInstance.url).toBe(sourceDescriptorData.url)
    })


    test('getSource', () => {
        const sourceDescriptorData = {id: 'logo', url: '/assets/logo.png', source: 'fakeImage'}
        manifest.addSourceDescriptor('images', sourceDescriptorData)

        const source = manifest.getSource('images', 'logo')
        expect(source).toBe('fakeImage')
    })


    test('getAlias', () => {
        manifest.setAlias('mainLogo', 'logo')
        manifest.setAlias('mainIcon', 'icon')

        expect(manifest.getAlias()).toEqual({mainLogo: 'logo', mainIcon: 'icon'})
    })


    test('getAlias with key', () => {
        manifest.setAlias('mainLogo', 'logo')
        manifest.setAlias('mainIcon', 'icon')

        expect(manifest.getAlias('mainLogo')).toBe('logo')
    })


    test('setAlias', () => {
        const result = manifest.setAlias('mainLogo', 'logo')

        expect(manifest.getAlias('mainLogo')).toBe('logo')
        expect(result).toBe(manifest)
    })


    test('addSourceDescriptorType', () => {
        manifest.addSourceDescriptorType('audio')

        expect(manifest.getSourceDescriptorMap('audio')).toEqual({})
    })


    test('addSourceDescriptorType existing', () => {
        manifest.addSourceDescriptor('images', {id: 'logo', url: '/assets/logo.png'})
        manifest.addSourceDescriptorType('images')

        expect(Object.keys(manifest.getSourceDescriptorMap('images'))).toHaveLength(1)
    })


    test('addSourceDescriptorType key', () => {
        const result = manifest.addSourceDescriptorType('audio')

        expect(result).toEqual({})
    })


    test('hasSourceDescriptorType', () => {
        manifest.addSourceDescriptorType('audio')

        expect(manifest.hasSourceDescriptorType('audio')).toBe(true)
    })


    test('hasSourceDescriptorType null', () => {
        expect(manifest.hasSourceDescriptorType('audio')).toBe(false)
    })


    test('getSourceDescriptorTypes', () => {
        manifest.addSourceDescriptorType('images')
        manifest.addSourceDescriptorType('audio')

        expect(manifest.getSourceDescriptorTypes()).toEqual(['images', 'audio'])
    })


    test('getSourceDescriptorMap', () => {
        manifest.addSourceDescriptor('images', {id: 'logo', url: '/assets/logo.png'})
        manifest.addSourceDescriptor('images', {id: 'icon', url: '/assets/icon.png'})

        const sourceDescriptors = manifest.getSourceDescriptorMap('images')
        expect(Object.keys(sourceDescriptors)).toHaveLength(2)
        expect(sourceDescriptors.logo).toBeInstanceOf(SourceDescriptor)
        expect(sourceDescriptors.icon).toBeInstanceOf(SourceDescriptor)
    })


    test('getSourceDescriptorMap null', () => {
        expect(manifest.getSourceDescriptorMap('audio')).toEqual({})
    })


    test('getSourceDescriptorsByTag', () => {
        manifest.addSourceDescriptor('images', {id: 'logo', url: '/assets/logo.png', tags: ['titleScreen']})
        manifest.addSourceDescriptor('images', {id: 'icon', url: '/assets/icon.png', tags: ['mainScene']})

        const tagSourceDescriptors = manifest.getSourceDescriptorsByTag('titleScreen')
        expect(tagSourceDescriptors).toHaveLength(1)
        expect(tagSourceDescriptors[0].id).toBe('logo')
    })


    test('getSourceDescriptorsByTag multiple types', () => {
        manifest.addSourceDescriptor('images', {id: 'icon', url: '/assets/icon.png', tags: ['titleScreen']})
        manifest.addSourceDescriptor('audio', {id: 'music', url: '/assets/music.mp3', tags: ['titleScreen']})

        const tagSourceDescriptors = manifest.getSourceDescriptorsByTag('titleScreen')
        expect(tagSourceDescriptors).toHaveLength(2)
        expect(tagSourceDescriptors[0].id).toBe('icon')
        expect(tagSourceDescriptors[1].id).toBe('music')
    })


    test('getSourceDescriptorsByTag multiple tags', () => {
        manifest.addSourceDescriptor('images', {id: 'icon', url: '/assets/icon.png', tags: ['titleScreen', 'mainScene', 'endingScene']})
        manifest.addSourceDescriptor('images', {id: 'logo', url: '/assets/logo.png', tags: ['endingScene']})

        const titleScreenSourceDescriptors = manifest.getSourceDescriptorsByTag('titleScreen')
        expect(titleScreenSourceDescriptors).toHaveLength(1)
        expect(titleScreenSourceDescriptors[0].id).toBe('icon')

        const endingSceneSourceDescriptors = manifest.getSourceDescriptorsByTag('endingScene')
        expect(endingSceneSourceDescriptors).toHaveLength(2)
        expect(endingSceneSourceDescriptors[0].id).toBe('icon')
        expect(endingSceneSourceDescriptors[1].id).toBe('logo')
    })


    test('getSourceDescriptorsByTag no sourceDescriptors', () => {
        const tagSourceDescriptors = manifest.getSourceDescriptorsByTag('titleScreen')
        expect(tagSourceDescriptors).toHaveLength(0)
    })

})
