import ApplicationManager from '../application/application_manager.js'
import MistGame from './mist_game.js'
import {PerkyDevTools} from '../editor/devtools/index.js'
import manifestData from './manifest.json' with {type: 'json'}
import {applyOverrides, loadStudioOverrides} from '../io/manifest_patcher.js'


async function init () {
    const appManager = new ApplicationManager()
    appManager.register('mistGame', MistGame)
    appManager.start()

    const container = document.getElementById('mist')
    const spawnOptions = {container, preload: 'all'}

    const params = new URLSearchParams(window.location.search)
    if (params.has('studio')) {
        const overrides = await loadStudioOverrides()
        if (overrides.length > 0) {
            spawnOptions.manifest = applyOverrides(manifestData, overrides)
        }
    }

    const app = await appManager.spawn('mistGame', spawnOptions)

    const devtools = new PerkyDevTools()
    document.body.appendChild(devtools)
    devtools.setModule(app)
    devtools.setAppManager(appManager)

    window.mist = app
    window.appManager = appManager
    window.devtools = devtools
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
