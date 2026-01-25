import logger from '../core/logger.js'
import {loadManifest, buildTextureSystem, collectAnimators} from './launcher.js'
import './hub_view.js'
import manifestData from '../den/manifest.json' with { type: 'json' }


async function init () {
    const container = document.getElementById('app')

    try {
        const manifest = await loadManifest(manifestData, '../den/')
        const textureSystem = buildTextureSystem(manifest)
        const animators = collectAnimators(manifest)

        container.innerHTML = ''
        const hubView = document.createElement('hub-view')
        hubView.setContext({manifest, animators, textureSystem})
        container.appendChild(hubView)

    } catch (error) {
        container.innerHTML = `<div class="loading" style="color: #f66;">Error: ${error.message}</div>`
        logger.error(error)
    }
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
