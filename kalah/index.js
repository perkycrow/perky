import Kalah from './kalah'
import Gate from '../game/gate'
import manifest from './manifest'
import ApplicationManager from '../application/application_manager'
import {documentReady} from '../core/utils/dom_utils'

const container = document.getElementById('kalah-container')

const manager = new ApplicationManager()
manager.register('Gate', Gate)
manager.register('Kalah', Kalah)

documentReady(async () => {
    const gate = await manager.spawn('Gate', {
        container,
        title: 'Kalah',
        fadeDuration: 1500
    })
    const kalah = manager.create('Kalah', {container, manifest})

    kalah.preload().then(gate.actionCaller('setReadyToClose'))

    gate.once('closed', () => {
        manager.dispose(gate.id)
        kalah.mountTo(container)
        kalah.start()
    })
})