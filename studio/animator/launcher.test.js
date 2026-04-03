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


describe('launchAnimatorStudio', () => {

    let container
    let launchAnimatorStudio

    beforeEach(async () => {
        container = document.createElement('div')
        document.body.appendChild(container)

        const module = await import('./launcher.js')
        launchAnimatorStudio = module.launchAnimatorStudio
    })

    afterEach(() => {
        container.remove()
        vi.clearAllMocks()
    })


    test('clears container before rendering', async () => {
        container.innerHTML = '<div>old content</div>'

        await launchAnimatorStudio({assets: {}}, container)

        expect(container.innerHTML).not.toContain('old content')
    })


    test('shows error message with empty manifest', async () => {
        await launchAnimatorStudio({}, container)

        expect(container.innerHTML).toContain('No animator found')
    })


    test('mounts application when animator exists', async () => {
        const manifestData = {
            assets: {
                player: {
                    type: 'animator',
                    animations: {idle: {frames: []}}
                }
            }
        }

        await launchAnimatorStudio(manifestData, container)

        expect(container.children.length).toBeGreaterThan(0)
    })


    test('creates animator-view element', async () => {
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


    test('uses specified animatorId when available', async () => {
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

        await launchAnimatorStudio(manifestData, container, {animatorId: 'enemy'})

        const animatorView = container.querySelector('animator-view')
        expect(animatorView).not.toBeNull()
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

        await launchAnimatorStudio(manifestData, container, {animatorId: 'nonexistent'})

        const animatorView = container.querySelector('animator-view')
        expect(animatorView).not.toBeNull()
    })


    test('falls back to game animator when custom animator not found in store', async () => {
        const manifestData = {
            assets: {
                player: {
                    type: 'animator',
                    animations: {idle: {frames: []}}
                }
            }
        }

        await launchAnimatorStudio(manifestData, container, {isCustom: true, animatorId: 'customAnim'})

        const animatorView = container.querySelector('animator-view')
        expect(animatorView).not.toBeNull()
    })

})
