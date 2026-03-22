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


vi.mock('../../io/canvas.js', () => ({
    blobToText: vi.fn(async (blob) => blob._text || '{}'),
    blobToImage: vi.fn(async () => new Image())
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
    }
}))


vi.mock('../../application/loaders.js', () => ({
    loaders: {}
}))


vi.mock('../../core/registry.js', () => ({
    default: class MockRegistry {
        constructor () {}
    }
}))


vi.mock('./animator_view.js', () => ({}))


describe('launchAnimatorStudio', () => {

    let container
    let launchAnimatorStudio

    beforeEach(async () => {
        container = document.createElement('div')

        if (!customElements.get('animator-view')) {
            customElements.define('animator-view', class extends HTMLElement {
                setContext () {}
            })
        }

        const module = await import('./launcher.js')
        launchAnimatorStudio = module.launchAnimatorStudio
    })

    afterEach(() => {
        vi.clearAllMocks()
    })


    test('clears container before rendering', async () => {
        container.innerHTML = '<div>old content</div>'

        await launchAnimatorStudio({assets: {}}, container)

        expect(container.innerHTML).not.toContain('old content')
    })


    test('creates animator-view element when animator exists', async () => {
        const manifestData = {
            assets: {
                player: {
                    type: 'animator',
                    animations: {idle: {frames: []}}
                }
            }
        }

        await launchAnimatorStudio(manifestData, container)

        const animatorView = container.querySelector('animator-view')
        expect(animatorView).not.toBeNull()
    })


    test('appends animator-view to container when animator exists', async () => {
        const manifestData = {
            assets: {
                player: {
                    type: 'animator',
                    animations: {idle: {frames: []}}
                }
            }
        }

        await launchAnimatorStudio(manifestData, container)

        expect(container.children).toHaveLength(1)
        expect(container.children[0].tagName.toLowerCase()).toBe('animator-view')
    })


    test('works with basePath option', async () => {
        const manifestData = {
            assets: {
                player: {
                    type: 'animator',
                    url: './player.json',
                    animations: {idle: {frames: []}}
                }
            }
        }

        await launchAnimatorStudio(manifestData, container, {basePath: '/assets/'})

        const animatorView = container.querySelector('animator-view')
        expect(animatorView).not.toBeNull()
    })


    test('shows error message with empty manifest', async () => {
        await launchAnimatorStudio({}, container)

        expect(container.innerHTML).toContain('No animator found')
    })


    test('selects specific animator by animatorId', async () => {
        const manifestData = {
            assets: {
                player: {
                    type: 'animator',
                    animations: {idle: {frames: []}}
                },
                enemy: {
                    type: 'animator',
                    animations: {walk: {frames: []}}
                }
            }
        }

        let receivedContext = null
        const MockAnimatorView = customElements.get('animator-view')
        const originalSetContext = MockAnimatorView.prototype.setContext
        MockAnimatorView.prototype.setContext = function (ctx) {
            receivedContext = ctx
        }

        await launchAnimatorStudio(manifestData, container, {animatorId: 'enemy'})

        expect(receivedContext.animatorName).toBe('enemy')
        MockAnimatorView.prototype.setContext = originalSetContext
    })


    test('falls back to first animator when animatorId not found', async () => {
        const manifestData = {
            assets: {
                player: {
                    type: 'animator',
                    animations: {idle: {frames: []}}
                }
            }
        }

        let receivedContext = null
        const MockAnimatorView = customElements.get('animator-view')
        const originalSetContext = MockAnimatorView.prototype.setContext
        MockAnimatorView.prototype.setContext = function (ctx) {
            receivedContext = ctx
        }

        await launchAnimatorStudio(manifestData, container, {animatorId: 'nonexistent'})

        expect(receivedContext.animatorName).toBe('player')
        MockAnimatorView.prototype.setContext = originalSetContext
    })


    test('shows error message on exception', async () => {
        const logger = (await import('../../core/logger.js')).default

        const brokenManifest = {
            assets: {
                get player () {
                    throw new Error('Test error')
                }
            }
        }

        await launchAnimatorStudio(brokenManifest, container)

        expect(container.innerHTML).toContain('Error:')
        expect(logger.error).toHaveBeenCalled()
    })

})
