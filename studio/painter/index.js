import {launchPainterStudio} from './launcher.js'


function init () {
    const container = document.getElementById('app')
    const params = new URLSearchParams(window.location.search)
    const paintingId = params.get('id')

    launchPainterStudio(container, {paintingId})
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
