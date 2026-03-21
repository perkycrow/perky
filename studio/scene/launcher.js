import logger from '../../core/logger.js'
import PerkyStore from '../../io/perky_store.js'
import {loadManifest, buildTextureSystem, getStudioConfig} from '../launcher.js'

import './scene_view.js'


export async function launchSceneStudio (manifestData, container, options = {}) {
    try {
        const manifest = await loadManifest(manifestData, options.basePath)
        const textureSystem = buildTextureSystem(manifest)
        const studioConfig = getStudioConfig(manifest, 'scene')
        const scenes = collectScenes(manifest)
        const sceneId = options.sceneId || Object.keys(scenes)[0] || null
        const wiring = options.wiring || null

        if (sceneId) {
            const customScene = await loadCustomScene(sceneId)
            if (customScene) {
                scenes[sceneId] = customScene
            }
        }

        container.innerHTML = ''
        const sceneView = document.createElement('scene-view')
        sceneView.setContext({
            manifest,
            textureSystem,
            studioConfig,
            scenes,
            sceneId,
            wiring
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


async function loadCustomScene (sceneId) {
    const store = new PerkyStore()
    const resource = await store.get(sceneId)

    if (!resource) {
        return null
    }

    const jsonFile = resource.files.find(f => f.name.endsWith('.json'))

    if (!jsonFile) {
        return null
    }

    const text = await jsonFile.blob.text()
    return JSON.parse(text)
}
