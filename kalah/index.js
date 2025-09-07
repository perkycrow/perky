import Kalah from './kalah'
import manifest from './manifest'
import ApplicationManager from '../application/application_manager'
import {documentReady} from '../core/utils/dom_utils'

const container = document.getElementById('kalah-container')

const manager = new ApplicationManager()
manager.register('Kalah', Kalah)

documentReady(async () => {
    console.log('Spawning Kalah application...')
    await manager.spawn('Kalah', {container, manifest})
    console.log('Kalah application started.')
})