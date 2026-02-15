import ApplicationManager from '../application/application_manager.js'
import MistGame from './mist_game.js'
import {PerkyDevTools} from '../editor/devtools/index.js'


async function init () {
    const appManager = new ApplicationManager()
    appManager.register('mistGame', MistGame)
    appManager.start()

    const container = document.getElementById('mist')
    const app = await appManager.spawn('mistGame', {
        container,
        preload: 'all'
    })

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
