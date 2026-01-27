import logger from '../../core/logger.js'
import PerkyStore from '../../io/perky_store.js'
import TextureSystem from '../../render/textures/texture_system.js'
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
        const studioConfig = getStudioConfig(manifest, 'animator')
        const backgroundImage = getBackgroundImage(manifest, studioConfig)

        const animatorData = await resolveAnimatorData(manifest, options)

        if (!animatorData.animatorConfig) {
            container.innerHTML = '<div class="loading" style="color: #f66;">No animator found</div>'
            return
        }

        container.innerHTML = ''
        const animatorView = document.createElement('animator-view')
        animatorView.setContext({
            ...animatorData,
            backgroundImage,
            studioConfig
        })
        container.appendChild(animatorView)

    } catch (error) {
        container.innerHTML = `<div class="loading" style="color: #f66;">Error: ${error.message}</div>`
        logger.error(error)
    }
}


async function resolveAnimatorData (manifest, options) {
    if (options.isCustom && options.animatorId) {
        const customData = await loadCustomAnimator(options.animatorId)
        if (customData) {
            return {
                textureSystem: customData.textureSystem,
                animatorConfig: customData.animatorConfig,
                animatorName: options.animatorId,
                isCustom: true
            }
        }
    }

    return loadGameAnimator(manifest, options.animatorId)
}


function loadGameAnimator (manifest, animatorId) {
    const textureSystem = buildTextureSystem(manifest)
    const animators = collectAnimators(manifest)

    const result = {textureSystem, animatorConfig: null, animatorName: null, isCustom: false}

    if (animatorId && animators[animatorId]) {
        result.animatorConfig = animators[animatorId]
        result.animatorName = animatorId
        return result
    }

    const firstKey = Object.keys(animators)[0]
    if (firstKey) {
        result.animatorConfig = animators[firstKey]
        result.animatorName = firstKey
    }

    return result
}


async function loadCustomAnimator (animatorId) {
    const store = new PerkyStore()
    const resource = await store.get(animatorId)

    if (!resource) {
        return null
    }

    const configFile = resource.files.find(f => f.name.endsWith('Animator.json'))
    const spritesheetJsonFile = resource.files.find(f => f.name.endsWith('Spritesheet.json'))
    const pngFiles = resource.files.filter(f => f.name.endsWith('.png')).sort((a, b) => a.name.localeCompare(b.name))

    if (!configFile || !spritesheetJsonFile || pngFiles.length === 0) {
        return null
    }

    const configText = await blobToText(configFile.blob)
    const animatorConfig = JSON.parse(configText)

    const spritesheetText = await blobToText(spritesheetJsonFile.blob)
    const spritesheetData = JSON.parse(spritesheetText)
    const images = await Promise.all(pngFiles.map(f => blobToImage(f.blob)))

    const textureSystem = new TextureSystem()
    const spritesheetName = spritesheetJsonFile.name.replace('.json', '')

    textureSystem.registerSpritesheet(spritesheetName, {
        images,
        data: spritesheetData
    })

    return {textureSystem, animatorConfig}
}


function blobToText (blob) {
    if (typeof blob.text === 'function') {
        return blob.text()
    }
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsText(blob)
    })
}


function blobToImage (blob) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob)
        const img = new Image()
        img.onload = () => {
            URL.revokeObjectURL(url)
            resolve(img)
        }
        img.onerror = () => {
            URL.revokeObjectURL(url)
            reject(new Error('Failed to load image'))
        }
        img.src = url
    })
}
