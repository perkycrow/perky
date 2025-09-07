import Kalah from './kalah'
import Intro from './intro'
import manifest from './manifest'
import ApplicationManager from '../application/application_manager'
import {documentReady} from '../core/utils/dom_utils'

const container = document.getElementById('kalah-container')

const manager = new ApplicationManager()
manager.register('Intro', Intro)
manager.register('Kalah', Kalah)

documentReady(async () => {
    const intro = await manager.spawn('Intro', {container})
    const kalah = manager.create('Kalah', {container, manifest})

    kalah.preload().then(() => {
        intro.notifyPreloadComplete()
    })
    
    intro.once('intro:complete', () => {
        manager.dispose(intro.id)
        kalah.mountTo(container)
        kalah.start()
    })
})