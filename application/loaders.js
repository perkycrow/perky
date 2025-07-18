
function normalizeParams (params) {
    if (typeof params === 'string') {
        return {url: params, config: {}}
    }
    return {url: params.url, config: params.config || {}}
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
            resolve(img)
        }

        img.onerror = function () {
            URL.revokeObjectURL(url)
            reject(new Error('Failed to load image'))
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


export async function loadSpritesheetData (params) {
    const {url} = normalizeParams(params)
    const spritesheetData = {frames: [], meta: []}

    const baseJson = await loadJson(params)
    addToSpritesheetData(spritesheetData, baseJson)

    const multipacks = Array.from(baseJson.meta?.related_multi_packs || [])

    if (Array.isArray(multipacks)) {

        while (multipacks.length) {
            const multipack = multipacks.shift()
            const newJson = await loadJson({url: replaceUrlFilename(url, multipack)})

            addToSpritesheetData(spritesheetData, newJson)
        }
    }

    return spritesheetData

}


export function addToSpritesheetData (spritesheetData, newData) {
    newData.frames.forEach(frame => {
        if (newData.meta?.image) {
            frame.baseImage = newData.meta.image
        }

        if (frame.filename) {
            frame.imageName = removeFileExtension(frame.filename)
        }
    })

    spritesheetData.frames.push(...newData.frames)
    spritesheetData.meta.push(newData.meta)
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
    spritesheetData: loadSpritesheetData
}

