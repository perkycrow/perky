import ApplicationManager from '../application/application_manager.js'
import DefendTheDen from './defend_the_den.js'
import {PerkyDevTools} from '../editor/devtools/index.js'


async function init () {
    const appManager = new ApplicationManager()
    appManager.register('defendTheDen', DefendTheDen)
    appManager.start()

    const container = document.getElementById('defend_the_den')
    const app = await appManager.spawn('defendTheDen', {
        container,
        preload: 'all'
    })

    const devtools = new PerkyDevTools()
    document.body.appendChild(devtools)
    devtools.setModule(app)
    devtools.setAppManager(appManager)

    window.defendTheDen = app
    window.appManager = appManager
    window.devtools = devtools
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
