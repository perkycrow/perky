import ApplicationManager from '../application/application_manager.js'
import Hollow from './hollow.js'
import {PerkyDevTools} from '../editor/devtools/index.js'


async function init () {
    const appManager = new ApplicationManager()
    appManager.register('hollow', Hollow)
    appManager.start()

    const container = document.getElementById('hollow')
    const spawnOptions = {container, preload: 'all'}

    const app = await appManager.spawn('hollow', spawnOptions)

    const devtools = new PerkyDevTools()
    document.body.appendChild(devtools)
    devtools.setModule(app)
    devtools.setAppManager(appManager)

    window.hollow = app
    window.appManager = appManager
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
