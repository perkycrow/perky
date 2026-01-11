import ApplicationManager from '../application/application_manager.js'
import Ghast from './ghast.js'


async function init () {
    const appManager = new ApplicationManager()
    appManager.register('ghast', Ghast)
    appManager.start()

    const container = document.getElementById('ghast')
    const app = await appManager.spawn('ghast', {
        container
    })

    window.ghast = app
    window.appManager = appManager
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
