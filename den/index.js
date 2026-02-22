import ApplicationManager from '../application/application_manager.js'
import DefendTheDen from './den.js'
import {PerkyDevTools} from '../editor/devtools/index.js'
import manifestData from './manifest.json' with { type: 'json' }
import {applyOverrides, loadStudioOverrides} from '../io/manifest_patcher.js'


async function init () {
    const appManager = new ApplicationManager()
    appManager.register('defendTheDen', DefendTheDen)
    appManager.start()

    const container = document.getElementById('den')
    const spawnOptions = {container, preload: 'all'}

    const params = new URLSearchParams(window.location.search)
    if (params.has('studio')) {
        const overrides = await loadStudioOverrides()
        if (overrides.length > 0) {
            spawnOptions.manifest = applyOverrides(manifestData, overrides)
        }
    }

    if (params.has('preview')) {
        spawnOptions.preview = true
    }

    const app = await appManager.spawn('defendTheDen', spawnOptions)

    const devtools = new PerkyDevTools()
    document.body.appendChild(devtools)
    devtools.setModule(app)
    devtools.setAppManager(appManager)

    const animatorConfigs = {}
    const manifest = app.manifest
    const animatorAssets = manifest.getAssetsByType('animator')
    for (const asset of animatorAssets) {
        if (asset.source) {
            animatorConfigs[asset.id] = asset.source
        }
    }

    window.defendTheDen = app
    window.appManager = appManager
    window.devtools = devtools
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
