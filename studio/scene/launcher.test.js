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

        async get (id) {
            return this.data[id] || null
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


vi.mock('./scene_view.js', () => ({}))


describe('launchSceneStudio', () => {

    let container
    let launchSceneStudio

    beforeEach(async () => {
        container = document.createElement('div')

        if (!customElements.get('scene-view')) {
            customElements.define('scene-view', class extends HTMLElement {
                setContext () {}
            })
        }

        const module = await import('./launcher.js')
        launchSceneStudio = module.launchSceneStudio
    })

    afterEach(() => {
        vi.clearAllMocks()
    })


    test('clears container before rendering', async () => {
        container.innerHTML = '<div>old content</div>'

        await launchSceneStudio({assets: {}}, container)

        expect(container.innerHTML).not.toContain('old content')
    })


    test('creates scene-view element when scene exists', async () => {
        const manifestData = {
            assets: {
                level1: {
                    type: 'scene',
                    entities: [{type: 'Player', x: 0, y: 0}]
                }
            }
        }

        await launchSceneStudio(manifestData, container)

        const sceneView = container.querySelector('scene-view')
        expect(sceneView).not.toBeNull()
    })


    test('appends scene-view to container when scene exists', async () => {
        const manifestData = {
            assets: {
                level1: {
                    type: 'scene',
                    entities: []
                }
            }
        }

        await launchSceneStudio(manifestData, container)

        expect(container.children).toHaveLength(1)
        expect(container.children[0].tagName.toLowerCase()).toBe('scene-view')
    })


    test('works with basePath option', async () => {
        const manifestData = {
            assets: {
                level1: {
                    type: 'scene',
                    url: './level1.json',
                    entities: []
                }
            }
        }

        await launchSceneStudio(manifestData, container, {basePath: '/assets/'})

        const sceneView = container.querySelector('scene-view')
        expect(sceneView).not.toBeNull()
    })


    test('selects specific scene by sceneId', async () => {
        const manifestData = {
            assets: {
                level1: {
                    type: 'scene',
                    entities: [{type: 'Player'}]
                },
                level2: {
                    type: 'scene',
                    entities: [{type: 'Enemy'}]
                }
            }
        }

        let receivedContext = null
        const MockSceneView = customElements.get('scene-view')
        const originalSetContext = MockSceneView.prototype.setContext
        MockSceneView.prototype.setContext = function (ctx) {
            receivedContext = ctx
        }

        await launchSceneStudio(manifestData, container, {sceneId: 'level2'})

        expect(receivedContext.sceneId).toBe('level2')
        MockSceneView.prototype.setContext = originalSetContext
    })


    test('falls back to first scene when sceneId not provided', async () => {
        const manifestData = {
            assets: {
                level1: {
                    type: 'scene',
                    entities: []
                }
            }
        }

        let receivedContext = null
        const MockSceneView = customElements.get('scene-view')
        const originalSetContext = MockSceneView.prototype.setContext
        MockSceneView.prototype.setContext = function (ctx) {
            receivedContext = ctx
        }

        await launchSceneStudio(manifestData, container)

        expect(receivedContext.sceneId).toBe('level1')
        MockSceneView.prototype.setContext = originalSetContext
    })


    test('creates scene-view even with empty manifest', async () => {
        await launchSceneStudio({assets: {}}, container)

        const sceneView = container.querySelector('scene-view')
        expect(sceneView).not.toBeNull()
    })


    test('passes wiring option to context', async () => {
        const manifestData = {
            assets: {
                level1: {
                    type: 'scene',
                    entities: []
                }
            }
        }

        const mockWiring = {get: vi.fn()}
        let receivedContext = null
        const MockSceneView = customElements.get('scene-view')
        const originalSetContext = MockSceneView.prototype.setContext
        MockSceneView.prototype.setContext = function (ctx) {
            receivedContext = ctx
        }

        await launchSceneStudio(manifestData, container, {wiring: mockWiring})

        expect(receivedContext.wiring).toBe(mockWiring)
        MockSceneView.prototype.setContext = originalSetContext
    })


    test('shows error message on exception', async () => {
        const logger = (await import('../../core/logger.js')).default

        const brokenManifest = {
            assets: {
                get level1 () {
                    throw new Error('Test error')
                }
            }
        }

        await launchSceneStudio(brokenManifest, container)

        expect(container.innerHTML).toContain('Error:')
        expect(logger.error).toHaveBeenCalled()
    })

})
