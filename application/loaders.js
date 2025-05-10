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
            URL.revokeObjectURL(url)
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
