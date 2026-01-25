import Manifest from '../application/manifest.js'
import SourceManager from '../application/source_manager.js'
import TextureSystem from '../render/textures/texture_system.js'
import {loaders} from '../application/loaders.js'
import Registry from '../core/registry.js'


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


export async function loadManifest (manifestData, basePath) {
    const data = rewriteUrls(manifestData, basePath)
    const manifest = new Manifest({data})

    const sourceManager = new SourceManager({
        loaders: new Registry(loaders),
        manifest
    })

    await sourceManager.loadAll()
    return manifest
}


export function buildTextureSystem (manifest) {
    const textureSystem = new TextureSystem()

    const imageAssets = manifest.getAssetsByType('image')
    textureSystem.buildFromAssets(imageAssets)

    const spritesheetAssets = manifest.getAssetsByType('spritesheet')
    for (const asset of spritesheetAssets) {
        if (asset.source) {
            textureSystem.registerSpritesheet(asset.id, asset.source)
        }
    }

    return textureSystem
}


export function collectAnimators (manifest) {
    const animatorAssets = manifest.getAssetsByType('animator')
    const animators = {}
    for (const asset of animatorAssets) {
        if (asset.source) {
            animators[asset.id] = asset.source
        }
    }
    return animators
}


export function getStudioConfig (manifest, tool) {
    return manifest.getConfig(`studio.${tool}`) || {}
}


export function getBackgroundImage (manifest, studioConfig) {
    const backgroundId = studioConfig.background
    const backgroundAsset = backgroundId ? manifest.getAsset(backgroundId) : null
    return backgroundAsset?.source || null
}
