import logger from '../../core/logger.js'
import {loadManifest, buildTextureSystem, getStudioConfig} from '../launcher.js'

import './scene_view.js'


export async function launchSceneStudio (manifestData, container, options = {}) {
    try {
        const manifest = await loadManifest(manifestData, options.basePath)
        const textureSystem = buildTextureSystem(manifest)
        const studioConfig = getStudioConfig(manifest, 'scene')
        const scenes = collectScenes(manifest)
        const sceneId = options.sceneId || Object.keys(scenes)[0] || null

        container.innerHTML = ''
        const sceneView = document.createElement('scene-view')
        sceneView.setContext({
            manifest,
            textureSystem,
            studioConfig,
            scenes,
            sceneId
        })
        container.appendChild(sceneView)

    } catch (error) {
        container.innerHTML = `<div class="loading" style="color: #f66;">Error: ${error.message}</div>`
        logger.error(error)
    }
}


function collectScenes (manifest) {
    const sceneAssets = manifest.getAssetsByType('scene')
    const scenes = {}

    for (const asset of sceneAssets) {
        if (asset.source) {
            scenes[asset.id] = asset.source
        }
    }

    return scenes
}
