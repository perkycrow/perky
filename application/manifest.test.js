import Manifest from './manifest'
import Asset from './asset'


describe('Manifest', () => {
    let manifest

    beforeEach(() => {
        manifest = new Manifest()
    })


    test('constructor', () => {
        expect(manifest.getConfig()).toEqual({})
        expect(manifest.getAllAssets()).toEqual([])
    })


    test('constructor with data', () => {
        const customManifest = new Manifest({
            data: {
                config: {name: 'Test Manifest'}
            }
        })

        expect(customManifest.getConfig('name')).toBe('Test Manifest')
        expect(customManifest.getAllAssets()).toEqual([])
    })


    test('import with JSON string', () => {
        const jsonData = JSON.stringify({
            config: {debug: true},
            assets: {
                logo: {type: 'image', url: '/assets/logo.png', tags: ['preload']}
            }
        })

        manifest.import(jsonData)

        expect(manifest.getConfig('debug')).toBe(true)
        expect(manifest.getAsset('logo').id).toBe('logo')
        expect(manifest.getAsset('logo').type).toBe('image')
    })


    test('import with object', () => {
        const data = {
            config: {version: '1.0.0'}
        }

        manifest.import(data)

        expect(manifest.getConfig('version')).toBe('1.0.0')
    })


    test('import clears existing assets', () => {
        manifest.addAsset({id: 'old', type: 'image', url: '/old.png'})

        manifest.import({
            config: {},
            assets: {
                new: {type: 'image', url: '/new.png'}
            }
        })

        expect(manifest.getAsset('old')).toBeNull()
        expect(manifest.getAsset('new')).not.toBeNull()
    })


    test('export', () => {
        manifest.setConfig('version', '1.0.0')
        manifest.addAsset({id: 'logo', type: 'image', url: '/logo.png'})

        const exported = manifest.export()

        expect(exported.config.version).toBe('1.0.0')
        expect(exported.assets.logo.id).toBe('logo')
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


    test('addAsset', () => {
        manifest.addAsset({id: 'logo', type: 'image', url: '/assets/logo.png'})

        expect(manifest.getAllAssets()).toHaveLength(1)
        expect(manifest.getAsset('logo').id).toBe('logo')
    })


    test('addAsset updates existing', () => {
        manifest.addAsset({id: 'logo', type: 'image', url: '/assets/logo.png'})
        manifest.addAsset({id: 'logo', type: 'image', url: '/assets/new-logo.png'})

        expect(manifest.getAllAssets()).toHaveLength(1)
        expect(manifest.getAsset('logo').url).toBe('/assets/new-logo.png')
    })


    test('addAsset with Asset instance', () => {
        const asset = new Asset({id: 'logo', type: 'image', url: '/logo.png'})
        manifest.addAsset(asset)

        expect(manifest.getAsset('logo')).toBe(asset)
    })


    test('getAsset returns null for missing', () => {
        expect(manifest.getAsset('nonexistent')).toBeNull()
    })


    test('getAsset', () => {
        const assetData = {id: 'logo', type: 'image', url: '/assets/logo.png'}
        manifest.addAsset(assetData)

        const asset = manifest.getAsset('logo')
        expect(asset).toBeInstanceOf(Asset)
        expect(asset.id).toBe(assetData.id)
        expect(asset.url).toBe(assetData.url)
    })


    test('getSource', () => {
        const assetData = {id: 'logo', type: 'image', url: '/assets/logo.png', source: 'fakeImage'}
        manifest.addAsset(assetData)

        const source = manifest.getSource('logo')
        expect(source).toBe('fakeImage')
    })


    test('getSource returns null for missing', () => {
        expect(manifest.getSource('nonexistent')).toBeNull()
    })


    test('getAssetsByType', () => {
        manifest.addAsset({id: 'logo', type: 'image', url: '/logo.png'})
        manifest.addAsset({id: 'icon', type: 'image', url: '/icon.png'})
        manifest.addAsset({id: 'music', type: 'audio', url: '/music.mp3'})

        const images = manifest.getAssetsByType('image')
        expect(images).toHaveLength(2)
        expect(images.map(a => a.id)).toContain('logo')
        expect(images.map(a => a.id)).toContain('icon')
    })


    test('getAssetsByTag', () => {
        manifest.addAsset({id: 'logo', type: 'image', url: '/logo.png', tags: ['titleScreen']})
        manifest.addAsset({id: 'icon', type: 'image', url: '/icon.png', tags: ['mainScene']})

        const titleScreenAssets = manifest.getAssetsByTag('titleScreen')
        expect(titleScreenAssets).toHaveLength(1)
        expect(titleScreenAssets[0].id).toBe('logo')
    })


    test('getAssetsByTag multiple types', () => {
        manifest.addAsset({id: 'icon', type: 'image', url: '/icon.png', tags: ['titleScreen']})
        manifest.addAsset({id: 'music', type: 'audio', url: '/music.mp3', tags: ['titleScreen']})

        const titleScreenAssets = manifest.getAssetsByTag('titleScreen')
        expect(titleScreenAssets).toHaveLength(2)
    })


    test('getAssetsByTag multiple tags', () => {
        manifest.addAsset({id: 'icon', type: 'image', url: '/icon.png', tags: ['titleScreen', 'mainScene', 'endingScene']})
        manifest.addAsset({id: 'logo', type: 'image', url: '/logo.png', tags: ['endingScene']})

        const titleScreenAssets = manifest.getAssetsByTag('titleScreen')
        expect(titleScreenAssets).toHaveLength(1)
        expect(titleScreenAssets[0].id).toBe('icon')

        const endingSceneAssets = manifest.getAssetsByTag('endingScene')
        expect(endingSceneAssets).toHaveLength(2)
    })


    test('getAssetsByTag no assets', () => {
        const tagAssets = manifest.getAssetsByTag('titleScreen')
        expect(tagAssets).toHaveLength(0)
    })


    test('getAssetsByTag invalid tag', () => {
        expect(manifest.getAssetsByTag(null)).toEqual([])
        expect(manifest.getAssetsByTag('')).toEqual([])
        expect(manifest.getAssetsByTag(123)).toEqual([])
    })


    test('getAllAssets', () => {
        manifest.addAsset({id: 'logo', type: 'image', url: '/logo.png'})
        manifest.addAsset({id: 'music', type: 'audio', url: '/music.mp3'})

        const allAssets = manifest.getAllAssets()
        expect(allAssets).toHaveLength(2)
    })


    test('getAssets is alias for getAllAssets', () => {
        manifest.addAsset({id: 'logo', type: 'image', url: '/logo.png'})

        expect(manifest.getAssets()).toEqual(manifest.getAllAssets())
    })


    test('hasAsset', () => {
        manifest.addAsset({id: 'logo', type: 'image', url: '/logo.png'})

        expect(manifest.hasAsset('logo')).toBe(true)
        expect(manifest.hasAsset('nonexistent')).toBe(false)
    })


    test('removeAsset', () => {
        manifest.addAsset({id: 'logo', type: 'image', url: '/logo.png'})

        expect(manifest.removeAsset('logo')).toBe(true)
        expect(manifest.getAsset('logo')).toBeNull()
    })


    test('removeAsset nonexistent', () => {
        expect(manifest.removeAsset('nonexistent')).toBe(false)
    })


    test('assets registry has type index', () => {
        manifest.addAsset({id: 'logo', type: 'image', url: '/logo.png'})

        expect(manifest.assets.hasIndex('type')).toBe(true)
        expect(manifest.assets.lookup('type', 'image')).toHaveLength(1)
    })


    test('assets registry has tags index', () => {
        manifest.addAsset({id: 'logo', type: 'image', url: '/logo.png', tags: ['preload']})

        expect(manifest.assets.hasIndex('tags')).toBe(true)
        expect(manifest.assets.lookup('tags', 'preload')).toHaveLength(1)
    })

})
