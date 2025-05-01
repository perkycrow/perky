import Manifest from '../src/manifest'
import Source from '../src/source'


describe('Manifest', () => {
    let manifest

    beforeEach(() => {
        manifest = new Manifest()
    })


    test('constructor', () => {
        expect(manifest.data).toEqual({
            metadata: {},
            config: {},
            sources: {},
            aliases: {}
        })
    })


    test('constructor with data', () => {
        const customManifest = new Manifest({
            metadata: {name: 'Test Manifest'}
        })

        expect(customManifest.data.metadata.name).toBe('Test Manifest')
        expect(customManifest.data.config).toEqual({})
        expect(customManifest.data.sources).toEqual({})
        expect(customManifest.data.aliases).toEqual({})
    })


    test('import with JSON string', () => {
        const jsonData = JSON.stringify({
            metadata: {version: '1.0.0'},
            config: {debug: true},
            sources: {images: {logo: {id: 'logo', path: '/assets/logo.png'}}},
            aliases: {mainLogo: 'logo'}
        })
        
        manifest.import(jsonData)
        
        expect(manifest.data.metadata.version).toBe('1.0.0')
        expect(manifest.data.config.debug).toBe(true)
        expect(manifest.data.sources.images.logo.id).toBe('logo')
        expect(manifest.data.aliases.mainLogo).toBe('logo')
    })


    test('import with object', () => {
        const data = {
            metadata: {version: '1.0.0'}
        }
        
        manifest.import(data)
        
        expect(manifest.data.metadata.version).toBe('1.0.0')
    })


    test('export', () => {
        manifest.metadata('version', '1.0.0')

        const exported = manifest.export()
        
        expect(exported.metadata.version).toBe('1.0.0')
    })


    test('metadata', () => {
        manifest.data.metadata = {version: '1.0.0', author: 'Test'}
        
        expect(manifest.metadata()).toEqual({version: '1.0.0', author: 'Test'})
    })


    test('metadata with key', () => {
        manifest.data.metadata = {version: '1.0.0', author: 'Test'}
        
        expect(manifest.metadata('version')).toBe('1.0.0')
    })


    test('metadata set', () => {
        const result = manifest.metadata('version', '1.0.0')
        
        expect(manifest.data.metadata.version).toBe('1.0.0')
        expect(result).toBe(manifest)
    })


    test('config', () => {
        manifest.data.config = {debug: true, logging: {level: 'info'}}
        
        expect(manifest.config()).toEqual({debug: true, logging: {level: 'info'}})
    })


    test('config with key', () => {
        manifest.data.config = {debug: true, logging: {level: 'info'}}
        
        expect(manifest.config('logging.level')).toBe('info')
    })


    test('config set', () => {
        const result = manifest.config('logging.level', 'debug')
        
        expect(manifest.data.config.logging.level).toBe('debug')
        expect(result).toBe(manifest)
    })


    test('addSource', () => {
        manifest.addSource('images', {id: 'logo', path: '/assets/logo.png'})
        
        expect(Object.keys(manifest.data.sources.images)).toHaveLength(1)
        expect(manifest.data.sources.images.logo.id).toBe('logo')
    })


    test('addSource update existing', () => {
        manifest.addSource('images', {id: 'logo', path: '/assets/logo.png'})
        manifest.addSource('images', {id: 'logo', path: '/assets/new-logo.png'})

        expect(Object.keys(manifest.data.sources.images)).toHaveLength(1)
        expect(manifest.data.sources.images.logo.path).toBe('/assets/new-logo.png')
    })


    test('getSource null type', () => {
        expect(manifest.getSource('images', 'logo')).toBeNull()
    })


    test('getSource null id', () => {
        manifest.addSource('images', {id: 'logo', path: '/assets/logo.png'})
        
        expect(manifest.getSource('images', 'icon')).toBeNull()
    })


    test('getSource', () => {
        const sourceData = {id: 'logo', path: '/assets/logo.png'}
        manifest.addSource('images', sourceData)
        
        const sourceInstance = manifest.getSource('images', 'logo')
        expect(sourceInstance).toBeInstanceOf(Source)
        expect(sourceInstance.id).toBe(sourceData.id)
        expect(sourceInstance.path).toBe(sourceData.path)
    })


    test('alias', () => {
        manifest.data.aliases = {mainLogo: 'logo', mainIcon: 'icon'}
        
        expect(manifest.alias()).toEqual({mainLogo: 'logo', mainIcon: 'icon'})
    })


    test('alias key', () => {
        manifest.data.aliases = {mainLogo: 'logo', mainIcon: 'icon'}
        
        expect(manifest.alias('mainLogo')).toBe('logo')
    })


    test('alias set', () => {
        const result = manifest.alias('mainLogo', 'logo')
        
        expect(manifest.data.aliases.mainLogo).toBe('logo')
        expect(result).toBe(manifest)
    })


    test('addSourceType', () => {
        manifest.addSourceType('audio')
        
        expect(manifest.data.sources.audio).toEqual({})
    })


    test('addSourceType existing', () => {
        manifest.addSource('images', {id: 'logo', path: '/assets/logo.png'})
        manifest.addSourceType('images')
        
        expect(Object.keys(manifest.data.sources.images)).toHaveLength(1)
    })


    test('addSourceType key', () => {
        const result = manifest.addSourceType('audio')
        
        expect(result).toEqual({})
    })


    test('hasSourceType', () => {
        manifest.addSourceType('audio')
        
        expect(manifest.hasSourceType('audio')).toBe(true)
    })


    test('hasSourceType null', () => {
        expect(manifest.hasSourceType('audio')).toBe(false)
    })


    test('getSourceTypes', () => {
        manifest.addSourceType('images')
        manifest.addSourceType('audio')
        
        expect(manifest.getSourceTypes()).toEqual(['images', 'audio'])
    })


    test('getSources', () => {
        manifest.addSource('images', {id: 'logo', path: '/assets/logo.png'})
        manifest.addSource('images', {id: 'icon', path: '/assets/icon.png'})
        
        const sources = manifest.getSources('images')
        expect(Object.keys(sources)).toHaveLength(2)
        expect(sources.logo).toBeInstanceOf(Source)
        expect(sources.icon).toBeInstanceOf(Source)
    })


    test('getSources null', () => {
        expect(manifest.getSources('audio')).toEqual({})
    })


    test('getSourcesByTag', () => {
        manifest.addSource('images', {id: 'logo', path: '/assets/logo.png', tags: ['titleScreen']})
        manifest.addSource('images', {id: 'icon', path: '/assets/icon.png', tags: ['mainScene']})
        
        const tagSources = manifest.getSourcesByTag('titleScreen')
        expect(tagSources).toHaveLength(1)
        expect(tagSources[0].id).toBe('logo')
    })


    test('getSourcesByTag multiple types', () => {
        manifest.addSource('images', {id: 'icon', path: '/assets/icon.png', tags: ['titleScreen']})
        manifest.addSource('audio', {id: 'music', path: '/assets/music.mp3', tags: ['titleScreen']})

        const tagSources = manifest.getSourcesByTag('titleScreen')
        expect(tagSources).toHaveLength(2)
        expect(tagSources[0].id).toBe('icon')
        expect(tagSources[1].id).toBe('music')
    })


    test('getSourcesByTag multiple tags', () => {
        manifest.addSource('images', {id: 'icon', path: '/assets/icon.png', tags: ['titleScreen', 'mainScene', 'endingScene']})
        manifest.addSource('images', {id: 'logo', path: '/assets/logo.png', tags: ['endingScene']})

        const titleScreenSources = manifest.getSourcesByTag('titleScreen')
        expect(titleScreenSources).toHaveLength(1)
        expect(titleScreenSources[0].id).toBe('icon')

        const endingSceneSources = manifest.getSourcesByTag('endingScene')
        expect(endingSceneSources).toHaveLength(2)
        expect(endingSceneSources[0].id).toBe('icon')
        expect(endingSceneSources[1].id).toBe('logo')
    })


    test('getSourcesByTag no sources', () => {
        const tagSources = manifest.getSourcesByTag('titleScreen')
        expect(tagSources).toHaveLength(0)
    })

})
