import ApplicationManager from '../application/application_manager'
import DefendTheDen from './defend_the_den'

async function init () {
    const appManager = new ApplicationManager()
    appManager.register('defendTheDen', DefendTheDen)
    appManager.start()

    const container = document.getElementById('defend_the_den')
    const app = await appManager.spawn('defendTheDen', {
        container,
        preload: 'all'
    })

    window.defendTheDen = app
    window.appManager = appManager
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
