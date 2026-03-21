import {launchSceneStudio} from './launcher.js'
import manifestData from '../../den/manifest.json' with { type: 'json' }


async function init () {
    const container = document.getElementById('app')
    const params = new URLSearchParams(window.location.search)
    const sceneId = params.get('id')

    await launchSceneStudio(manifestData, container, {
        basePath: '../../den/',
        sceneId
    })
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
