import logger from '../../core/logger.js'
import PerkyStore from '../../io/perky_store.js'
import {loadManifest, buildTextureSystem, getStudioConfig, collectScenes} from '../launcher.js'
import SceneView from './scene_view.js'


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

        const app = new SceneView()
        app.setContext({manifest, textureSystem, studioConfig, scenes, sceneId, wiring})
        app.mount(container)
        app.start()

    } catch (error) {
        container.innerHTML = `<div class="loading" style="color: #f66;">Error: ${error.message}</div>`
        logger.error(error)
    }
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
