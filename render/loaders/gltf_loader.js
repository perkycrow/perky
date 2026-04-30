import Geometry from '../geometry.js'
import Mesh from '../mesh.js'
import MeshInstance from '../mesh_instance.js'
import Material3D from '../material_3d.js'
import Object3D from '../object_3d.js'
import Matrix4 from '../../math/matrix4.js'
import {loadArrayBuffer} from '../../application/loaders.js'


const GLB_MAGIC = 0x46546C67
const CHUNK_JSON = 0x4E4F534A
const CHUNK_BIN = 0x004E4942

const TYPED_ARRAY = {
    5120: Int8Array,
    5121: Uint8Array,
    5122: Int16Array,
    5123: Uint16Array,
    5125: Uint32Array,
    5126: Float32Array
}

const TYPE_COUNT = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16
}


export async function loadGlb (params) {
    const url = typeof params === 'string' ? params : params.url
    const buffer = await loadArrayBuffer({url})
    const {gltf, binary} = parseGlb(buffer)
    const baseUrl = extractBaseUrl(url)

    return {gltf, binary, baseUrl}
}


export function parseGlb (arrayBuffer) {
    const dv = new DataView(arrayBuffer)
    const magic = dv.getUint32(0, true)

    if (magic !== GLB_MAGIC) {
        throw new Error('Not a valid GLB file')
    }

    const version = dv.getUint32(4, true)
    if (version !== 2) {
        throw new Error(`Unsupported GLB version: ${version}`)
    }

    const totalLength = dv.getUint32(8, true)
    let offset = 12
    let gltf = null
    let binary = null

    while (offset < totalLength) {
        const chunkLength = dv.getUint32(offset, true)
        const chunkType = dv.getUint32(offset + 4, true)
        const dataStart = offset + 8

        if (chunkType === CHUNK_JSON) {
            const bytes = new Uint8Array(arrayBuffer, dataStart, chunkLength)
            gltf = JSON.parse(new TextDecoder().decode(bytes))
        } else if (chunkType === CHUNK_BIN) {
            binary = new Uint8Array(arrayBuffer, dataStart, chunkLength)
        }

        offset = dataStart + chunkLength
    }

    if (!gltf) {
        throw new Error('GLB is missing its JSON chunk')
    }

    return {gltf, binary}
}


export async function buildGltfScene ({gltf, binary, baseUrl = '', gl}) {
    const images = await loadGltfImages(gltf, binary, baseUrl)
    const materials = buildMaterials(gltf, images)
    const defaultMaterial = new Material3D({color: [1, 1, 1], roughness: 0.7})
    const meshes = buildMeshes(gltf, binary, gl)

    const ctx = {gltf, meshes, materials, defaultMaterial}
    const sceneIndex = gltf.scene ?? 0
    const sceneSpec = gltf.scenes?.[sceneIndex]
    const root = new Object3D()

    if (sceneSpec?.nodes) {
        for (const nodeIndex of sceneSpec.nodes) {
            root.addChild(buildNode(ctx, nodeIndex))
        }
    }

    root.markDirty()

    return {scene: root, meshes, materials, images}
}


function buildNode (ctx, nodeIndex) {
    const node = ctx.gltf.nodes[nodeIndex]
    const obj = createNodeObject(ctx, node)

    applyNodeTransform(obj, node)

    if (node.name) {
        obj.name = node.name
    }

    if (node.children) {
        for (const childIndex of node.children) {
            obj.addChild(buildNode(ctx, childIndex))
        }
    }

    return obj
}


function createNodeObject (ctx, node) {
    if (node.mesh === undefined) {
        return new Object3D()
    }

    const meshData = ctx.meshes[node.mesh]

    if (meshData.primitives.length === 1) {
        const prim = meshData.primitives[0]
        const material = resolvePrimitiveMaterial(ctx, prim)
        return new MeshInstance({mesh: prim.mesh, material})
    }

    const group = new Object3D()
    for (const prim of meshData.primitives) {
        const material = resolvePrimitiveMaterial(ctx, prim)
        group.addChild(new MeshInstance({mesh: prim.mesh, material}))
    }
    return group
}


function resolvePrimitiveMaterial (ctx, prim) {
    if (prim.materialIndex === undefined) {
        return ctx.defaultMaterial
    }
    return ctx.materials[prim.materialIndex]
}


function applyNodeTransform (obj, node) {
    if (node.matrix) {
        const m = new Matrix4().fromArray(node.matrix)
        m.decompose(obj.position, obj.rotation, obj.scale)
        return
    }

    if (node.translation) {
        obj.position.set(node.translation[0], node.translation[1], node.translation[2])
    }

    if (node.rotation) {
        obj.rotation.set(node.rotation[0], node.rotation[1], node.rotation[2], node.rotation[3])
    }

    if (node.scale) {
        obj.scale.set(node.scale[0], node.scale[1], node.scale[2])
    }
}


function buildMeshes (gltf, binary, gl) {
    const meshes = []

    for (const mesh of gltf.meshes || []) {
        const primitives = []

        for (const prim of mesh.primitives) {
            const geometry = buildGeometry(gltf, binary, prim)
            const meshObj = new Mesh({gl, geometry})
            primitives.push({mesh: meshObj, geometry, materialIndex: prim.material})
        }

        meshes.push({primitives, name: mesh.name})
    }

    return meshes
}


function buildGeometry (gltf, binary, prim) {
    const positions = readAccessorData(gltf, binary, prim.attributes.POSITION)
    const vertexCount = positions.length / 3

    const normals = prim.attributes.NORMAL === undefined
        ? new Float32Array(positions.length)
        : readAccessorData(gltf, binary, prim.attributes.NORMAL)

    const uvs = prim.attributes.TEXCOORD_0 === undefined
        ? new Float32Array(vertexCount * 2)
        : readAccessorData(gltf, binary, prim.attributes.TEXCOORD_0)

    const colors = prim.attributes.COLOR_0 === undefined
        ? null
        : readAccessorData(gltf, binary, prim.attributes.COLOR_0)

    const indices = buildIndices(gltf, binary, prim, vertexCount)

    const geometry = new Geometry({positions, normals, uvs, indices, colors})
    geometry.computeTangents()
    return geometry
}


function buildIndices (gltf, binary, prim, vertexCount) {
    if (prim.indices === undefined) {
        const indices = new Uint16Array(vertexCount)
        for (let i = 0; i < vertexCount; i++) {
            indices[i] = i
        }
        return indices
    }

    const raw = readAccessorData(gltf, binary, prim.indices)
    return raw instanceof Uint16Array ? raw : new Uint16Array(raw)
}


function flipV (uvs) {
    const flipped = new Float32Array(uvs.length)
    for (let i = 0; i < uvs.length; i += 2) {
        flipped[i] = uvs[i]
        flipped[i + 1] = 1 - uvs[i + 1]
    }
    return flipped
}


function readAccessorData (gltf, binary, accessorIndex) {
    const accessor = gltf.accessors[accessorIndex]
    const bufferView = gltf.bufferViews[accessor.bufferView]
    const CType = TYPED_ARRAY[accessor.componentType]
    const componentCount = TYPE_COUNT[accessor.type]
    const bytesPerElement = CType.BYTES_PER_ELEMENT * componentCount
    const byteStride = bufferView.byteStride || bytesPerElement
    const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0)
    const absoluteOffset = binary.byteOffset + byteOffset

    const out = new CType(accessor.count * componentCount)

    if (byteStride === bytesPerElement) {
        const srcBytes = new Uint8Array(binary.buffer, absoluteOffset, accessor.count * bytesPerElement)
        new Uint8Array(out.buffer).set(srcBytes)
        return out
    }

    for (let i = 0; i < accessor.count; i++) {
        const srcBytes = new Uint8Array(binary.buffer, absoluteOffset + i * byteStride, bytesPerElement)
        new Uint8Array(out.buffer, i * bytesPerElement, bytesPerElement).set(srcBytes)
    }

    return out
}


async function loadGltfImages (gltf, binary, baseUrl) {
    const images = []

    for (const img of gltf.images || []) {
        if (img.bufferView !== undefined) {
            const bv = gltf.bufferViews[img.bufferView]
            const bytes = new Uint8Array(binary.buffer, binary.byteOffset + (bv.byteOffset || 0), bv.byteLength)
            const blob = new Blob([bytes], {type: img.mimeType || 'image/png'})
            const url = URL.createObjectURL(blob)
            try {
                images.push(await loadImageElement(url))
            } finally {
                URL.revokeObjectURL(url)
            }
        } else if (img.uri) {
            const src = img.uri.startsWith('data:') ? img.uri : baseUrl + img.uri
            try {
                images.push(await loadImageElement(src))
            } catch {
                console.warn(`glTF: failed to load image "${img.uri}", skipping`)
                images.push(null)
            }
        } else {
            images.push(null)
        }
    }

    return images
}


function loadImageElement (src) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error(`Failed to load GLB image: ${src}`))
        img.src = src
    })
}


function buildMaterials (gltf, images) {
    const materials = []

    for (const mat of gltf.materials || []) {
        materials.push(buildMaterial(gltf, mat, images))
    }

    return materials
}


function buildMaterial (gltf, mat, images) {
    const opts = {}
    const pbr = mat.pbrMetallicRoughness || {}

    applyBaseColor(opts, pbr)
    applyBaseColorTexture(opts, gltf, images, pbr)
    applyRoughness(opts, pbr)
    applyEmissive(opts, mat)
    applyNormalTexture(opts, gltf, images, mat)
    applyAlphaMode(opts, mat)

    return new Material3D(opts)
}


function applyBaseColor (opts, pbr) {
    if (!pbr.baseColorFactor) {
        return
    }
    const [r, g, b, a] = pbr.baseColorFactor
    opts.color = [r, g, b]
    if (a !== undefined && a < 1) {
        opts.opacity = a
    }
}


function applyBaseColorTexture (opts, gltf, images, pbr) {
    if (pbr.baseColorTexture === undefined) {
        return
    }
    const image = resolveTextureImage(gltf, images, pbr.baseColorTexture.index)
    if (image) {
        opts.texture = image
    }
}


function applyRoughness (opts, pbr) {
    if (pbr.roughnessFactor === undefined) {
        return
    }
    opts.roughness = pbr.roughnessFactor
}


function applyEmissive (opts, mat) {
    if (!mat.emissiveFactor) {
        return
    }
    opts.emissive = mat.emissiveFactor
}


function applyNormalTexture (opts, gltf, images, mat) {
    if (mat.normalTexture === undefined) {
        return
    }
    const image = resolveTextureImage(gltf, images, mat.normalTexture.index)
    if (!image) {
        return
    }
    opts.normalMap = image
    if (mat.normalTexture.scale !== undefined) {
        opts.normalStrength = mat.normalTexture.scale
    }
}


function applyAlphaMode (opts, mat) {
    if (mat.alphaMode === 'BLEND') {
        opts.opacity = opts.opacity ?? 1
    }
}


function resolveTextureImage (gltf, images, textureIndex) {
    const tex = gltf.textures?.[textureIndex]
    if (!tex || tex.source === undefined) {
        return null
    }
    return images[tex.source] || null
}


function extractBaseUrl (url) {
    const index = url.lastIndexOf('/')
    return index === -1 ? '' : url.substring(0, index + 1)
}
