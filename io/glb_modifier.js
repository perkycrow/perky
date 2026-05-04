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


const GLB_MAGIC = 0x46546C67
const GLB_VERSION = 2
const CHUNK_JSON = 0x4E4F534A
const CHUNK_BIN = 0x004E4942


export function applyModifications ({gltf, images}, modifications) {
    const modifiedImages = [...images]

    for (const mod of modifications) {
        if (mod.type === 'texture_swap') {
            applyTextureSwap(gltf, modifiedImages, mod)
        }
    }

    return modifiedImages
}


function applyTextureSwap (gltf, images, mod) {
    const materialIndex = findMaterialIndex(gltf, mod.material)

    if (materialIndex === -1) {
        return
    }

    const mat = gltf.materials[materialIndex]
    const imageIndex = resolveImageIndex(gltf, mat, mod.slot)

    if (imageIndex === -1) {
        return
    }

    images[imageIndex] = mod.image
}


function findMaterialIndex (gltf, name) {
    if (!gltf.materials) {
        return -1
    }

    if (typeof name === 'number') {
        return name < gltf.materials.length ? name : -1
    }

    return gltf.materials.findIndex(m => m.name === name)
}


function resolveImageIndex (gltf, mat, slot) { // eslint-disable-line complexity -- clean
    const pbr = mat.pbrMetallicRoughness || {}
    let textureIndex

    if (slot === 'baseColor' || slot === undefined) {
        textureIndex = pbr.baseColorTexture?.index
    } else if (slot === 'normal') {
        textureIndex = mat.normalTexture?.index
    } else if (slot === 'emissive') {
        textureIndex = mat.emissiveTexture?.index
    }

    if (textureIndex === undefined) {
        return -1
    }

    const tex = gltf.textures?.[textureIndex]

    if (!tex || tex.source === undefined) {
        return -1
    }

    return tex.source
}


export async function rebuildGlb (gltf, images, binary = new Uint8Array(0)) {
    const imageBuffers = await Promise.all(images.map(img => imageToBytes(img)))
    const {json, bin} = buildChunks(gltf, imageBuffers, binary)

    const jsonBytes = new TextEncoder().encode(JSON.stringify(json))
    const jsonPadded = padToAlignment(jsonBytes, 0x20)
    const binPadded = padToAlignment(bin, 0x00)

    const totalLength = 12 + 8 + jsonPadded.length + 8 + binPadded.length

    const output = new ArrayBuffer(totalLength)
    const view = new DataView(output)
    let offset = 0

    view.setUint32(offset, GLB_MAGIC, true)
    offset += 4
    view.setUint32(offset, GLB_VERSION, true)
    offset += 4
    view.setUint32(offset, totalLength, true)
    offset += 4

    view.setUint32(offset, jsonPadded.length, true)
    offset += 4
    view.setUint32(offset, CHUNK_JSON, true)
    offset += 4
    new Uint8Array(output, offset, jsonPadded.length).set(jsonPadded)
    offset += jsonPadded.length

    view.setUint32(offset, binPadded.length, true)
    offset += 4
    view.setUint32(offset, CHUNK_BIN, true)
    offset += 4
    new Uint8Array(output, offset, binPadded.length).set(binPadded)

    return output
}


function buildChunks (gltf, imageBuffers, binary) {
    const json = structuredClone(gltf)
    const bufferParts = []

    let byteOffset = rebuildNonImageBufferViews(json, binary, bufferParts)

    for (let i = 0; i < imageBuffers.length; i++) {
        const bytes = imageBuffers[i]

        if (!bytes) {
            continue
        }

        const bvIndex = ensureImageBufferView(json, i)
        json.bufferViews[bvIndex].byteOffset = byteOffset
        json.bufferViews[bvIndex].byteLength = bytes.length
        bufferParts.push(bytes)
        byteOffset += bytes.length
    }

    const bin = concatenateBuffers(bufferParts)

    json.buffers = [{byteLength: bin.length}]

    return {json, bin}
}


function rebuildNonImageBufferViews (gltf, originalBinary, parts) {
    const imageBufferViews = new Set()

    for (const img of gltf.images || []) {
        if (img.bufferView !== undefined) {
            imageBufferViews.add(img.bufferView)
        }
    }

    let byteOffset = 0

    for (let i = 0; i < (gltf.bufferViews || []).length; i++) {
        if (imageBufferViews.has(i)) {
            continue
        }

        const bv = gltf.bufferViews[i]
        const srcOffset = bv.byteOffset || 0
        const bytes = new Uint8Array(
            originalBinary.buffer,
            originalBinary.byteOffset + srcOffset,
            bv.byteLength
        )

        bv.byteOffset = byteOffset
        parts.push(bytes)
        byteOffset += bv.byteLength
    }

    return byteOffset
}


function ensureImageBufferView (gltf, imageIndex) {
    const img = gltf.images[imageIndex]

    if (img.bufferView !== undefined) {
        return img.bufferView
    }

    const bvIndex = gltf.bufferViews.length
    gltf.bufferViews.push({buffer: 0, byteOffset: 0, byteLength: 0})
    img.bufferView = bvIndex
    img.mimeType = img.mimeType || 'image/png'
    delete img.uri
    return bvIndex
}


function concatenateBuffers (parts) {
    const totalLength = parts.reduce((sum, b) => sum + b.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0

    for (const part of parts) {
        result.set(part, offset)
        offset += part.length
    }

    return result
}


function padToAlignment (bytes, padByte) {
    const remainder = bytes.length % 4

    if (remainder === 0) {
        return bytes
    }

    const padded = new Uint8Array(bytes.length + (4 - remainder))
    padded.set(bytes)
    padded.fill(padByte, bytes.length)
    return padded
}


async function imageToBytes (image) {
    if (!image) {
        return null
    }

    if (image instanceof Uint8Array) {
        return image
    }

    if (image instanceof ArrayBuffer) {
        return new Uint8Array(image)
    }

    if (image instanceof Blob) {
        const buffer = await blobToArrayBuffer(image)
        return new Uint8Array(buffer)
    }

    if (typeof image.naturalWidth === 'number' || typeof image.width === 'number') {
        return imageToPngBytes(image)
    }

    return null
}


async function imageToPngBytes (image) {
    const w = image.naturalWidth || image.width
    const h = image.naturalHeight || image.height
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d').drawImage(image, 0, 0)

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    return new Uint8Array(await blob.arrayBuffer())
}


export async function exportGlb ({gltf, binary, images}, modifications) {
    const modifiedGltf = structuredClone(gltf)
    const modifiedImages = applyModifications({gltf: modifiedGltf, images}, modifications)

    applyMaterialOverridesToGltf(modifiedGltf, modifications)

    return rebuildGlb(modifiedGltf, modifiedImages, binary)
}


function applyMaterialOverridesToGltf (gltf, modifications) { // eslint-disable-line complexity -- clean
    for (const mod of modifications) {
        if (mod.type !== 'material_override') {
            continue
        }

        const index = findMaterialIndex(gltf, mod.material)

        if (index === -1) {
            continue
        }

        const mat = gltf.materials[index]
        const pbr = mat.pbrMetallicRoughness || (mat.pbrMetallicRoughness = {})

        if (mod.color !== undefined) {
            const a = pbr.baseColorFactor?.[3] ?? 1
            pbr.baseColorFactor = [...mod.color, a]
        }

        if (mod.roughness !== undefined) {
            pbr.roughnessFactor = mod.roughness
        }

        if (mod.emissive !== undefined) {
            mat.emissiveFactor = mod.emissive
        }

        if (mod.opacity !== undefined) {
            const rgb = pbr.baseColorFactor?.slice(0, 3) ?? [1, 1, 1]
            pbr.baseColorFactor = [...rgb, mod.opacity]
            if (mod.opacity < 1) {
                mat.alphaMode = 'BLEND'
            }
        }
    }
}


export function applyMaterialOverrides (gltf, materials, modifications) {
    for (const mod of modifications) {
        if (mod.type === 'material_override') {
            applyMaterialOverride(gltf, materials, mod)
        }
    }
}


function applyMaterialOverride (gltf, materials, mod) {
    const index = findMaterialIndex(gltf, mod.material)

    if (index === -1) {
        return
    }

    const material = materials[index]

    if (mod.color !== undefined) {
        material.color = mod.color
    }

    if (mod.roughness !== undefined) {
        material.roughness = mod.roughness
    }

    if (mod.emissive !== undefined) {
        material.emissive = mod.emissive
    }

    if (mod.opacity !== undefined) {
        material.opacity = mod.opacity
    }

    if (mod.normalStrength !== undefined) {
        material.normalStrength = mod.normalStrength
    }
}


export function listMaterials (gltf) {
    if (!gltf.materials) {
        return []
    }

    return gltf.materials.map((mat, index) => {
        const pbr = mat.pbrMetallicRoughness || {}
        const slots = []

        if (pbr.baseColorTexture !== undefined) {
            slots.push('baseColor')
        }
        if (mat.normalTexture !== undefined) {
            slots.push('normal')
        }
        if (mat.emissiveTexture !== undefined) {
            slots.push('emissive')
        }

        return {index, name: mat.name || null, slots}
    })
}
