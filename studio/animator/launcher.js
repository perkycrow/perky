import logger from '../../core/logger.js'
import {
    loadManifest,
    buildTextureSystem,
    collectAnimators,
    getStudioConfig,
    getBackgroundImage
} from '../launcher.js'

import './animator_view.js'


export async function launchAnimatorStudio (manifestData, container, options = {}) {
    try {
        const manifest = await loadManifest(manifestData, options.basePath)
        const textureSystem = buildTextureSystem(manifest)
        const animators = collectAnimators(manifest)
        const studioConfig = getStudioConfig(manifest, 'animator')
        const backgroundImage = getBackgroundImage(manifest, studioConfig)

        const animatorId = options.animatorId
        let animatorConfig = null
        let animatorName = null

        if (animatorId && animators[animatorId]) {
            animatorConfig = animators[animatorId]
            animatorName = animatorId
        } else {
            const firstKey = Object.keys(animators)[0]
            if (firstKey) {
                animatorConfig = animators[firstKey]
                animatorName = firstKey
            }
        }

        if (!animatorConfig) {
            container.innerHTML = '<div class="loading" style="color: #f66;">No animator found</div>'
            return
        }

        container.innerHTML = ''
        const animatorView = document.createElement('animator-view')
        animatorView.setContext({
            textureSystem,
            animatorConfig,
            animatorName,
            backgroundImage,
            studioConfig
        })
        container.appendChild(animatorView)

    } catch (error) {
        container.innerHTML = `<div class="loading" style="color: #f66;">Error: ${error.message}</div>`
        logger.error(error)
    }
}
