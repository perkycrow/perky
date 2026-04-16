import ApplicationManager from '../application/application_manager.js'
import Dungeon from './dungeon.js'
import {PerkyDevTools} from '../editor/devtools/index.js'


async function init () {
    const appManager = new ApplicationManager()
    appManager.register('dungeon', Dungeon)
    appManager.start()

    const container = document.getElementById('dungeon')
    const spawnOptions = {container, preload: 'all'}

    const app = await appManager.spawn('dungeon', spawnOptions)

    const devtools = new PerkyDevTools()
    document.body.appendChild(devtools)
    devtools.setModule(app)
    devtools.setAppManager(appManager)

    window.dungeon = app
    window.appManager = appManager
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
