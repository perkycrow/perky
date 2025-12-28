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


export async function loadBlob (params) {
    const response = await loadResponse(params)

    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`)
    }

    return response.blob()
}


export async function loadImage (params) {
    const blob = await loadBlob(params)
    const url = URL.createObjectURL(blob)
    
    return new Promise((resolve, reject) => {
        const img = new Image()

        img.onload = function () {
            URL.revokeObjectURL(url)
            resolve(img)
        }

        img.onerror = function () {
            URL.revokeObjectURL(url)
            const normalizedParams = normalizeParams(params)
            reject(new Error(`Failed to load image: ${normalizedParams.url}`))
        }

        img.src = url
    })
}


export async function loadText (params) {
    const response = await loadResponse(params)

    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`)
    }

    return response.text()
}


export async function loadJson (params) {
    const response = await loadResponse(params)

    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`)
    }

    return response.json()
}


export async function loadArrayBuffer (params) {
    const response = await loadResponse(params)

    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`)
    }

    return response.arrayBuffer()
}


export async function loadAudio (params) {
    const arrayBuffer = await loadArrayBuffer(params)
    
    return new Promise((resolve, reject) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
        audioContext.decodeAudioData(
            arrayBuffer, 
            function (decodedData) {
                resolve(decodedData)
                audioContext.close()
            }, 
            function (error) {
                reject(new Error('Failed to decode audio data: ' + (error ? error.message : 'Unknown error')))
                audioContext.close()
            }
        )
    })
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
    let splitted = url.split('/')
    splitted.pop()
    splitted.push(filename)
    return splitted.join('/')
}


export function removeFileExtension (filename) {
    return filename.replace(/\.[^/.]+$/, '')
}





export const loaders = {
    response: loadResponse,
    blob: loadBlob,
    image: loadImage,
    text: loadText,
    json: loadJson,
    arrayBuffer: loadArrayBuffer,
    audio: loadAudio,
    font: loadFont
}

