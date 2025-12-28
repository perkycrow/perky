import ApplicationManager from '../application/application_manager'
import DefendTheDen from './defend_the_den'
import '../editor/perky_explorer'

async function init () {
    const appManager = new ApplicationManager()
    appManager.register('defendTheDen', DefendTheDen)
    appManager.start()

    const container = document.getElementById('defend_the_den')
    const app = await appManager.spawn('defendTheDen', {
        container,
        preload: 'all'
    })

    // Attach module explorer for debugging
    const explorer = document.createElement('perky-explorer')
    document.body.appendChild(explorer)
    explorer.setModule(app)

    window.defendTheDen = app
    window.appManager = appManager
    window.explorer = explorer
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
