import {loadImage, extractBaseUrl} from '../application/loaders.js'


export async function loadModifications (url) {
    let response

    try {
        response = await fetch(url)
    } catch {
        return null
    }

    if (!response.ok) {
        return null
    }

    const contentType = response.headers.get('content-type') || ''

    if (!contentType.includes('json')) {
        return null
    }

    const config = await response.json()
    return resolveModifications(config, extractBaseUrl(url))
}


async function resolveModifications (config, baseUrl) {
    const modifications = []

    for (const mod of config.modifications || []) {
        if (mod.type === 'texture_swap') {
            const image = await loadImage(baseUrl + mod.texture)
            modifications.push({...mod, image})
        }
    }

    return modifications
}
