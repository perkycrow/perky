import ApplicationManager from '../application/application_manager.js'
import ForgeSandbox from './forge_sandbox.js'


async function init () {
    const appManager = new ApplicationManager()
    appManager.register('forge', ForgeSandbox)
    appManager.start()

    const container = document.getElementById('forge')
    await appManager.spawn('forge', {container})
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
