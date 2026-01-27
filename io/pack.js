async function compress (blob) {
    const stream = blob.stream().pipeThrough(new CompressionStream('gzip'))
    return new Response(stream).blob()
}


async function decompress (blob) {
    const stream = blob.stream().pipeThrough(new DecompressionStream('gzip'))
    return new Response(stream).blob()
}


export async function pack (files, { compress: shouldCompress = true } = {}) {
    const header = {
        files: files.map(f => ({
            name: f.name,
            size: f.blob.size,
            type: f.blob.type
        }))
    }

    const headerBytes = new TextEncoder().encode(JSON.stringify(header))
    const headerSize = new Uint32Array([headerBytes.length])

    const blob = new Blob([headerSize, headerBytes, ...files.map(f => f.blob)])

    return shouldCompress ? compress(blob) : blob
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


export async function unpack (blob, { compressed = true } = {}) {
    const data = compressed ? await decompress(blob) : blob
    const buffer = await blobToArrayBuffer(data)
    const headerSize = new Uint32Array(buffer, 0, 1)[0]
    const headerBytes = new Uint8Array(buffer, 4, headerSize)
    const header = JSON.parse(new TextDecoder().decode(headerBytes))

    let offset = 4 + headerSize
    return header.files.map(file => {
        const fileBlob = new Blob([buffer.slice(offset, offset + file.size)], {type: file.type})
        offset += file.size
        return {name: file.name, blob: fileBlob}
    })
}
