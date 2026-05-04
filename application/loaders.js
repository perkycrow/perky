export function normalizeParams (params) {
    if (typeof params === 'string') {
        return {url: params, config: {}}
    }
    return {
        url: params.url,
        config: params.config || {}
    }
}


export async function loadResponse (params) {
    const {url, config} = normalizeParams(params)

    return fetch(url, config)
}


async function loadWith (params, method) {
    const {url} = normalizeParams(params)
    const response = await loadResponse(params)

    if (!response.ok) {
        throw new Error(`HTTP Error ${response.status} (${response.statusText}) for ${url}`)
    }

    return response[method]()
}


export async function loadBlob (params) {
    return loadWith(params, 'blob')
}


export async function loadImage (params) {
    const blob = await loadBlob(params)
    const blobUrl = URL.createObjectURL(blob)

    return new Promise((resolve, reject) => {
        const img = new Image()

        img.onload = function () {
            URL.revokeObjectURL(blobUrl)
            resolve(img)
        }

        img.onerror = function () {
            URL.revokeObjectURL(blobUrl)
            const {url} = normalizeParams(params)
            reject(new Error(`Failed to load image: ${url}`))
        }

        img.src = blobUrl
    })
}


export async function loadText (params) {
    return loadWith(params, 'text')
}


export async function loadJson (params) {
    return loadWith(params, 'json')
}


export async function loadArrayBuffer (params) {
    return loadWith(params, 'arrayBuffer')
}


export async function loadAudio (params) {
    const {url} = normalizeParams(params)
    return {
        type: 'deferred_audio',
        url
    }
}


export function loadFont (params) {
    const {url, config} = normalizeParams(params)
    const {
        name,
        family = name,
        style = 'normal',
        weight = 'normal'
    } = config

    const fontName = family || name
    const font = new FontFace(fontName, `url(${url})`, {style, weight})

    return font.load()
        .then(() => {
            document.fonts.add(font)
            return font
        })
        .catch(error => {
            throw new Error(`Failed to load font "${fontName}": ${error.message}`)
        })
}


export function replaceUrlFilename (url, filename) {
    const parts = url.split('/')
    parts.pop()
    parts.push(filename)
    return parts.join('/')
}


export function removeFileExtension (filename) {
    return filename.replace(/\.[^/.]+$/, '')
}


export function extractBaseUrl (url) {
    const index = url.lastIndexOf('/')
    return index === -1 ? '' : url.substring(0, index + 1)
}


export async function loadSpritesheet (params) {
    const {url} = normalizeParams(params)

    const data = await loadJson({url})

    const baseUrl = extractBaseUrl(url)

    const imagePromises = data.meta.images.map(imageInfo => {
        const imageUrl = baseUrl + imageInfo.filename
        return loadImage({url: imageUrl})
    })

    const images = await Promise.all(imagePromises)

    return {
        data,
        images
    }
}




export const loaders = {
    response: loadResponse,
    blob: loadBlob,
    image: loadImage,
    text: loadText,
    json: loadJson,
    arrayBuffer: loadArrayBuffer,
    audio: loadAudio,
    font: loadFont,
    spritesheet: loadSpritesheet,
    animator: loadJson,
    scene: loadJson
}
