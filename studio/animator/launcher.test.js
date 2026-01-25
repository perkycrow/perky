import {vi, beforeEach, afterEach} from 'vitest'


vi.mock('../../core/logger.js', () => ({
    default: {
        error: vi.fn()
    }
}))


vi.mock('../../application/manifest.js', () => ({
    default: class MockManifest {
        constructor () {
            this.assets = {}
        }

        getAssetsByType (type) {
            return this.assets[type] || []
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


    test('creates animator-view element', async () => {
        await launchAnimatorStudio({assets: {}}, container)

        const animatorView = container.querySelector('animator-view')
        expect(animatorView).not.toBeNull()
    })


    test('appends animator-view to container', async () => {
        await launchAnimatorStudio({assets: {}}, container)

        expect(container.children).toHaveLength(1)
        expect(container.children[0].tagName.toLowerCase()).toBe('animator-view')
    })


    test('works with basePath option', async () => {
        const manifestData = {
            assets: {
                sprite: {url: './sprite.png'}
            }
        }

        await launchAnimatorStudio(manifestData, container, {basePath: '/assets/'})

        const animatorView = container.querySelector('animator-view')
        expect(animatorView).not.toBeNull()
    })


    test('works with empty manifest', async () => {
        await launchAnimatorStudio({}, container)

        const animatorView = container.querySelector('animator-view')
        expect(animatorView).not.toBeNull()
    })

})
