import PerkyStore from './perky_store.js'
import {blobToImage} from './canvas.js'


export function applyOverrides (manifestData, overrides) {
    const assets = {...manifestData.assets}

    for (const {id, source} of overrides) {
        if (assets[id]) {
            assets[id] = {...assets[id], source}
        }
    }

    return {...manifestData, assets}
}


export async function loadStudioOverrides () {
    const store = new PerkyStore()
    const overrides = []

    await loadAnimatorOverrides(store, overrides)
    await loadSceneOverrides(store, overrides)
    await loadGlbOverrides(store, overrides)

    return overrides
}


async function loadAnimatorOverrides (store, overrides) {
    const resources = await store.list('animator')

    for (const meta of resources) {
        const resource = await store.get(meta.id)
        if (!resource) {
            continue
        }

        const animatorFile = resource.files.find(f => f.name.endsWith('Animator.json'))
        if (!animatorFile) {
            continue
        }

        const animatorConfig = JSON.parse(await animatorFile.blob.text())
        overrides.push({id: meta.id, source: animatorConfig})

        const spritesheetName = animatorConfig.spritesheet
        if (!spritesheetName) {
            continue
        }

        const spritesheetFile = resource.files.find(f =>
            f.name.endsWith('.json') && !f.name.endsWith('Animator.json'))
        if (!spritesheetFile) {
            continue
        }

        const spritesheetData = JSON.parse(await spritesheetFile.blob.text())
        const pngFiles = resource.files
            .filter(f => f.name.endsWith('.png'))
            .sort((a, b) => a.name.localeCompare(b.name))
        const images = await Promise.all(pngFiles.map(f => createImageBitmap(f.blob)))

        overrides.push({id: spritesheetName, source: {data: spritesheetData, images}})
    }
}


async function loadSceneOverrides (store, overrides) {
    const resources = await store.list('scene')

    for (const meta of resources) {
        const resource = await store.get(meta.id)
        if (!resource) {
            continue
        }

        const jsonFile = resource.files.find(f => f.name.endsWith('.json'))
        if (!jsonFile) {
            continue
        }

        const sceneConfig = JSON.parse(await jsonFile.blob.text())
        overrides.push({id: meta.id, source: sceneConfig})
    }
}


async function loadGlbOverrides (store, overrides) {
    const resources = await store.list('glb')

    for (const meta of resources) {
        const resource = await store.get(meta.id)
        if (!resource) {
            continue
        }

        const jsonFile = resource.files.find(f => f.name.endsWith('.json'))
        if (!jsonFile) {
            continue
        }

        const config = JSON.parse(await jsonFile.blob.text())
        const modifications = await resolveGlbModifications(config, resource.files)
        overrides.push({id: meta.id, source: {modifications}})
    }
}


async function resolveGlbModifications (config, files) {
    const modifications = []

    for (const mod of config.modifications || []) {
        if (mod.type !== 'texture_swap') {
            modifications.push(mod)
            continue
        }

        const imageFile = files.find(f => f.name === mod.texture)
        if (!imageFile) {
            continue
        }

        const image = await blobToImage(imageFile.blob)
        modifications.push({...mod, image})
    }

    return modifications
}
