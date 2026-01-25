import logger from '../../core/logger.js'
import Manifest from '../../application/manifest.js'
import SourceManager from '../../application/source_manager.js'
import TextureSystem from '../../render/textures/texture_system.js'
import {loaders} from '../../application/loaders.js'
import Registry from '../../core/registry.js'

import './animator_view.js'


function rewriteUrls (data, basePath) {
    if (!basePath) {
        return data
    }
    const rewritten = {...data, assets: {}}
    for (const [id, asset] of Object.entries(data.assets)) {
        rewritten.assets[id] = {
            ...asset,
            url: asset.url.replace('./', basePath)
        }
    }
    return rewritten
}


export async function launchAnimatorStudio (manifestData, container, options = {}) {
    try {
        const data = rewriteUrls(manifestData, options.basePath)
        const manifest = new Manifest({data})

        const sourceManager = new SourceManager({
            loaders: new Registry(loaders),
            manifest
        })

        await sourceManager.loadAll()

        const textureSystem = new TextureSystem()

        const imageAssets = manifest.getAssetsByType('image')
        textureSystem.buildFromAssets(imageAssets)

        const spritesheetAssets = manifest.getAssetsByType('spritesheet')
        for (const asset of spritesheetAssets) {
            if (asset.source) {
                textureSystem.registerSpritesheet(asset.id, asset.source)
            }
        }

        const animatorAssets = manifest.getAssetsByType('animator')
        const animators = {}
        for (const asset of animatorAssets) {
            if (asset.source) {
                animators[asset.id] = asset.source
            }
        }

        const studioConfig = manifest.getConfig('studio.animator') || {}
        const backgroundId = studioConfig.background
        const backgroundAsset = backgroundId ? manifest.getAsset(backgroundId) : null
        const backgroundImage = backgroundAsset?.source || null

        container.innerHTML = ''
        const animatorView = document.createElement('animator-view')
        animatorView.setContext({
            textureSystem,
            animators,
            backgroundImage,
            studioConfig
        })
        container.appendChild(animatorView)

    } catch (error) {
        container.innerHTML = `<div class="loading" style="color: #f66;">Error: ${error.message}</div>`
        logger.error(error)
    }
}
