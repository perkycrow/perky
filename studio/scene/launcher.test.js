import {vi, beforeEach, afterEach, describe, test, expect} from 'vitest'


vi.mock('../../core/logger.js', () => ({
    default: {
        error: vi.fn()
    }
}))


vi.mock('../../io/perky_store.js', () => ({
    default: class MockPerkyStore {
        constructor () {
            this.data = {}
        }

        async get () {
            return null
        }

        async save () {}

        async list () {
            return []
        }
    }
}))


vi.mock('../../application/manifest.js', () => ({
    default: class MockManifest {
        constructor ({data} = {}) {
            this.data = data || {}
            this.assets = {}
            for (const [id, asset] of Object.entries(this.data.assets || {})) {
                this.assets[id] = {...asset, id, source: asset}
            }
        }

        getAssetsByType (type) {
            return Object.values(this.assets).filter(asset => asset.type === type)
        }

        getConfig () {
            return null
        }

        getAsset () {
            return null
        }

        getSource () {
            return null
        }

        listAssets () {
            return Object.values(this.assets)
        }
    }
}))


vi.mock('../../application/source_manager.js', () => ({
    default: class MockSourceManager {
        async loadAll () {}
    }
}))


vi.mock('../../render/textures/texture_system.js', () => ({
    default: class MockTextureSystem {
        buildFromAssets () {}

        registerSpritesheet () {}

        getSpritesheet () {
            return null
        }

        getRegion () {
            return null
        }
    }
}))


vi.mock('../../application/loaders.js', () => ({
    loaders: {}
}))


describe('launchSceneStudio', () => {

    let container
    let launchSceneStudio

    beforeEach(async () => {
        container = document.createElement('div')
        document.body.appendChild(container)

        const module = await import('./launcher.js')
        launchSceneStudio = module.launchSceneStudio
    })

    afterEach(() => {
        container.remove()
        vi.clearAllMocks()
    })


    test('clears container before rendering', async () => {
        container.innerHTML = '<div>old content</div>'

        await launchSceneStudio({assets: {}}, container)

        expect(container.innerHTML).not.toContain('old content')
    })


    test('mounts application to container', async () => {
        const manifestData = {
            assets: {
                level1: {
                    type: 'scene',
                    entities: [{type: 'Player', x: 0, y: 0}]
                }
            }
        }

        await launchSceneStudio(manifestData, container)

        expect(container.children.length).toBeGreaterThan(0)
    })


    test('passes wiring option', async () => {
        const mockWiring = {
            get: vi.fn(),
            getAll: vi.fn(() => ({}))
        }

        await launchSceneStudio({assets: {}}, container, {wiring: mockWiring})

        expect(container.children.length).toBeGreaterThan(0)
    })


    test('handles errors gracefully', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})

        await launchSceneStudio(null, container)

        expect(container.innerHTML).toContain('Error')
    })

})
