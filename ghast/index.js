import ApplicationManager from '../application/application_manager.js'
import Ghast from './ghast.js'
import {PerkyDevTools} from '../editor/devtools/index.js'


async function init () {
    const appManager = new ApplicationManager()
    appManager.register('ghast', Ghast)
    appManager.start()

    const container = document.getElementById('ghast')
    const app = await appManager.spawn('ghast', {
        container,
        preload: 'all'
    })

    const devtools = new PerkyDevTools()
    document.body.appendChild(devtools)
    devtools.setModule(app)
    devtools.setAppManager(appManager)

    window.ghast = app
    window.appManager = appManager
    window.devtools = devtools
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
