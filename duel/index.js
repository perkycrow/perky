import ApplicationManager from '../application/application_manager.js'
import Duel from './duel.js'
import {PerkyDevTools} from '../editor/devtools/index.js'


async function init () {
    const appManager = new ApplicationManager()
    appManager.register('duel', Duel)
    appManager.start()

    const container = document.getElementById('duel')
    const spawnOptions = {container, preload: 'all'}

    const app = await appManager.spawn('duel', spawnOptions)

    const devtools = new PerkyDevTools()
    document.body.appendChild(devtools)
    devtools.setModule(app)
    devtools.setAppManager(appManager)

    window.duel = app
    window.appManager = appManager
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
