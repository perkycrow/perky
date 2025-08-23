import Kalah from './kalah'
import manifest from './manifest'


function init () {
    const game = new Kalah({manifest})
    const container = document.getElementById('kalah-container')

    game.mountTo(container)

    game.start()

    window.mistbrewer = game
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}