import logger from '../../core/logger.js'
import Manifest from '../../application/manifest.js'
import SourceManager from '../../application/source_manager.js'
import TextureSystem from '../../render/textures/texture_system.js'
import {loaders} from '../../application/loaders.js'
import Registry from '../../core/registry.js'


import manifestData from '../../den/manifest.js'
import RedEnemyAnimator from '../../den/animators/red_enemy_animator.js'

import './animator_view.js'


const ANIMATORS = {
    RedEnemyAnimator
}


const GITHUB_BASE = 'https://raw.githubusercontent.com/perkycrow/perky/main/den/'


function rewriteManifestUrls (data) {
    const rewritten = {...data, assets: {}}
    for (const [id, asset] of Object.entries(data.assets)) {
        rewritten.assets[id] = {
            ...asset,
            url: asset.url.replace('./', GITHUB_BASE)
        }
    }
    return rewritten
}


async function init () {
    const container = document.getElementById('app')

    try {

        const manifest = new Manifest({data: rewriteManifestUrls(manifestData)})


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


        container.innerHTML = ''
        const animatorView = document.createElement('animator-view')
        animatorView.setContext({
            textureSystem,
            animators: ANIMATORS
        })
        container.appendChild(animatorView)

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
