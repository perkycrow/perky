export async function pack (files) {
    const header = {
        files: files.map(f => ({
            name: f.name,
            size: f.blob.size,
            type: f.blob.type
        }))
    }

    const headerBytes = new TextEncoder().encode(JSON.stringify(header))
    const headerSize = new Uint32Array([headerBytes.length])

    return new Blob([headerSize, headerBytes, ...files.map(f => f.blob)])
}


function blobToArrayBuffer (blob) {
    if (typeof blob.arrayBuffer === 'function') {
        return blob.arrayBuffer()
    }
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsArrayBuffer(blob)
    })
}


export async function unpack (blob) {
    const buffer = await blobToArrayBuffer(blob)
    const headerSize = new Uint32Array(buffer, 0, 1)[0]
    const headerBytes = new Uint8Array(buffer, 4, headerSize)
    const header = JSON.parse(new TextDecoder().decode(headerBytes))

    let offset = 4 + headerSize
    return header.files.map(file => {
        const data = new Blob([buffer.slice(offset, offset + file.size)], {type: file.type})
        offset += file.size
        return {name: file.name, blob: data}
    })
}
