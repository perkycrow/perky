import {describe, test, expect, vi} from 'vitest'
import {parseGlb, buildGltfScene, loadGlb} from './gltf_loader.js'
import * as loaders from '../../application/loaders.js'
import {createMockGL as createBaseMockGL} from '../test_helpers.js'
import Material3D from '../material_3d.js'
import MeshInstance from '../mesh_instance.js'


function createMockGL () {
    const gl = createBaseMockGL()
    gl.createVertexArray = () => ({})
    gl.bindVertexArray = () => {}
    gl.deleteVertexArray = () => {}
    return gl
}


function buildGlb (gltf, binary = null) {
    const jsonStr = JSON.stringify(gltf)
    const jsonBytes = new TextEncoder().encode(jsonStr)
    const jsonPadding = (4 - jsonBytes.byteLength % 4) % 4
    const jsonChunkLength = jsonBytes.byteLength + jsonPadding

    let binPadding = 0
    let binChunkLength = 0
    if (binary) {
        binPadding = (4 - binary.byteLength % 4) % 4
        binChunkLength = binary.byteLength + binPadding
    }

    const binSectionLength = binary ? 8 + binChunkLength : 0
    const totalLength = 12 + 8 + jsonChunkLength + binSectionLength
    const buffer = new ArrayBuffer(totalLength)
    const dv = new DataView(buffer)
    const bytes = new Uint8Array(buffer)

    dv.setUint32(0, 0x46546C67, true)
    dv.setUint32(4, 2, true)
    dv.setUint32(8, totalLength, true)

    dv.setUint32(12, jsonChunkLength, true)
    dv.setUint32(16, 0x4E4F534A, true)
    bytes.set(jsonBytes, 20)
    for (let i = 0; i < jsonPadding; i++) {
        bytes[20 + jsonBytes.byteLength + i] = 0x20
    }

    if (binary) {
        const binStart = 20 + jsonChunkLength
        dv.setUint32(binStart, binChunkLength, true)
        dv.setUint32(binStart + 4, 0x004E4942, true)
        bytes.set(new Uint8Array(binary.buffer, binary.byteOffset, binary.byteLength), binStart + 8)
    }

    return buffer
}


function buildTrianglePrimitiveBinary () {
    const positions = new Float32Array([
        0, 0, 0,
        1, 0, 0,
        0, 1, 0
    ])
    const normals = new Float32Array([
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
    ])
    const uvs = new Float32Array([
        0, 0,
        1, 0,
        0, 1
    ])
    const indices = new Uint16Array([0, 1, 2])
    const indicesPad = new Uint16Array([0])

    const posBytes = new Uint8Array(positions.buffer)
    const normBytes = new Uint8Array(normals.buffer)
    const uvBytes = new Uint8Array(uvs.buffer)
    const idxBytes = new Uint8Array(indices.buffer)
    const padBytes = new Uint8Array(indicesPad.buffer)

    const total = posBytes.byteLength + normBytes.byteLength + uvBytes.byteLength + idxBytes.byteLength + padBytes.byteLength
    const out = new Uint8Array(total)
    let offset = 0
    out.set(posBytes, offset)
    offset += posBytes.byteLength
    out.set(normBytes, offset)
    offset += normBytes.byteLength
    out.set(uvBytes, offset)
    offset += uvBytes.byteLength
    out.set(idxBytes, offset)
    offset += idxBytes.byteLength
    out.set(padBytes, offset)

    return {
        binary: out,
        offsets: {
            position: 0,
            normal: posBytes.byteLength,
            uv: posBytes.byteLength + normBytes.byteLength,
            indices: posBytes.byteLength + normBytes.byteLength + uvBytes.byteLength
        },
        lengths: {
            position: posBytes.byteLength,
            normal: normBytes.byteLength,
            uv: uvBytes.byteLength,
            indices: idxBytes.byteLength
        }
    }
}


function buildTriangleGltf (offsets, lengths) {
    return {
        asset: {version: '2.0'},
        scene: 0,
        scenes: [{nodes: [0]}],
        nodes: [{mesh: 0, translation: [1, 2, 3]}],
        meshes: [{
            primitives: [{
                attributes: {POSITION: 0, NORMAL: 1, TEXCOORD_0: 2},
                indices: 3,
                material: 0
            }]
        }],
        materials: [{
            pbrMetallicRoughness: {
                baseColorFactor: [0.8, 0.2, 0.1, 1],
                roughnessFactor: 0.3
            },
            emissiveFactor: [0.05, 0.05, 0]
        }],
        buffers: [{byteLength: lengths.position + lengths.normal + lengths.uv + lengths.indices}],
        bufferViews: [
            {buffer: 0, byteOffset: offsets.position, byteLength: lengths.position},
            {buffer: 0, byteOffset: offsets.normal, byteLength: lengths.normal},
            {buffer: 0, byteOffset: offsets.uv, byteLength: lengths.uv},
            {buffer: 0, byteOffset: offsets.indices, byteLength: lengths.indices}
        ],
        accessors: [
            {bufferView: 0, componentType: 5126, count: 3, type: 'VEC3'},
            {bufferView: 1, componentType: 5126, count: 3, type: 'VEC3'},
            {bufferView: 2, componentType: 5126, count: 3, type: 'VEC2'},
            {bufferView: 3, componentType: 5123, count: 3, type: 'SCALAR'}
        ]
    }
}


describe('loadGlb', () => {

    test('loadGlb loads and parses GLB from URL string', async () => {
        const {binary, offsets, lengths} = buildTrianglePrimitiveBinary()
        const gltfJson = buildTriangleGltf(offsets, lengths)
        const glb = buildGlb(gltfJson, binary)

        vi.spyOn(loaders, 'loadArrayBuffer').mockResolvedValue(glb)

        const result = await loadGlb('http://example.com/models/test.glb')

        expect(loaders.loadArrayBuffer).toHaveBeenCalledWith({url: 'http://example.com/models/test.glb'})
        expect(result.gltf.asset.version).toBe('2.0')
        expect(result.binary).toBeInstanceOf(Uint8Array)
        expect(result.baseUrl).toBe('http://example.com/models/')

        vi.restoreAllMocks()
    })


    test('loadGlb accepts params object with url', async () => {
        const {binary, offsets, lengths} = buildTrianglePrimitiveBinary()
        const gltfJson = buildTriangleGltf(offsets, lengths)
        const glb = buildGlb(gltfJson, binary)

        vi.spyOn(loaders, 'loadArrayBuffer').mockResolvedValue(glb)

        const result = await loadGlb({url: 'http://example.com/assets/model.glb'})

        expect(loaders.loadArrayBuffer).toHaveBeenCalledWith({url: 'http://example.com/assets/model.glb'})
        expect(result.baseUrl).toBe('http://example.com/assets/')

        vi.restoreAllMocks()
    })


    test('loadGlb returns empty baseUrl for filename without path', async () => {
        const {binary, offsets, lengths} = buildTrianglePrimitiveBinary()
        const gltfJson = buildTriangleGltf(offsets, lengths)
        const glb = buildGlb(gltfJson, binary)

        vi.spyOn(loaders, 'loadArrayBuffer').mockResolvedValue(glb)

        const result = await loadGlb('model.glb')

        expect(result.baseUrl).toBe('')

        vi.restoreAllMocks()
    })

})


describe('parseGlb', () => {

    test('parseGlb extracts JSON and BIN chunks from valid GLB', () => {
        const {binary, offsets, lengths} = buildTrianglePrimitiveBinary()
        const gltfJson = buildTriangleGltf(offsets, lengths)
        const glb = buildGlb(gltfJson, binary)

        const {gltf, binary: parsedBinary} = parseGlb(glb)

        expect(gltf.asset.version).toBe('2.0')
        expect(gltf.meshes).toHaveLength(1)
        expect(parsedBinary).toBeInstanceOf(Uint8Array)
        expect(parsedBinary.byteLength).toBe(binary.byteLength)
    })


    test('parseGlb throws on invalid magic', () => {
        const buffer = new ArrayBuffer(12)
        const dv = new DataView(buffer)
        dv.setUint32(0, 0xDEADBEEF, true)

        expect(() => parseGlb(buffer)).toThrow('Not a valid GLB')
    })


    test('parseGlb throws on unsupported version', () => {
        const buffer = new ArrayBuffer(12)
        const dv = new DataView(buffer)
        dv.setUint32(0, 0x46546C67, true)
        dv.setUint32(4, 1, true)
        dv.setUint32(8, 12, true)

        expect(() => parseGlb(buffer)).toThrow('Unsupported GLB version')
    })

})


describe('buildGltfScene', () => {

    test('buildGltfScene creates scene with transformed MeshInstance', async () => {
        const gl = createMockGL()
        const {binary, offsets, lengths} = buildTrianglePrimitiveBinary()
        const gltf = buildTriangleGltf(offsets, lengths)

        const {scene, meshes, materials} = await buildGltfScene({gltf, binary, gl})

        expect(scene.children).toHaveLength(1)

        const instance = scene.children[0]
        expect(instance).toBeInstanceOf(MeshInstance)
        expect(instance.position.x).toBe(1)
        expect(instance.position.y).toBe(2)
        expect(instance.position.z).toBe(3)

        expect(meshes).toHaveLength(1)
        expect(materials).toHaveLength(1)
        expect(materials[0]).toBeInstanceOf(Material3D)
        expect(materials[0].color).toEqual([0.8, 0.2, 0.1])
        expect(materials[0].roughness).toBe(0.3)
        expect(materials[0].emissive).toEqual([0.05, 0.05, 0])
    })


    test('buildGltfScene flips UV V-axis', async () => {
        const gl = createMockGL()
        const {binary, offsets, lengths} = buildTrianglePrimitiveBinary()
        const gltf = buildTriangleGltf(offsets, lengths)

        const {meshes} = await buildGltfScene({gltf, binary, gl})
        const geometry = meshes[0].primitives[0].geometry

        expect(geometry.uvs[1]).toBeCloseTo(1)
        expect(geometry.uvs[3]).toBeCloseTo(1)
        expect(geometry.uvs[5]).toBeCloseTo(0)
    })


    test('buildGltfScene decomposes node matrix into position/rotation/scale', async () => {
        const gl = createMockGL()
        const {binary, offsets, lengths} = buildTrianglePrimitiveBinary()
        const gltf = buildTriangleGltf(offsets, lengths)
        gltf.nodes[0] = {
            mesh: 0,
            matrix: [
                2, 0, 0, 0,
                0, 2, 0, 0,
                0, 0, 2, 0,
                5, 6, 7, 1
            ]
        }

        const {scene} = await buildGltfScene({gltf, binary, gl})
        const instance = scene.children[0]

        expect(instance.position.x).toBe(5)
        expect(instance.position.y).toBe(6)
        expect(instance.position.z).toBe(7)
        expect(instance.scale.x).toBeCloseTo(2)
        expect(instance.scale.y).toBeCloseTo(2)
        expect(instance.scale.z).toBeCloseTo(2)
    })


    test('buildGltfScene shares mesh across multiple nodes', async () => {
        const gl = createMockGL()
        const {binary, offsets, lengths} = buildTrianglePrimitiveBinary()
        const gltf = buildTriangleGltf(offsets, lengths)
        gltf.scenes[0].nodes = [0, 1, 2]
        gltf.nodes = [
            {mesh: 0, translation: [0, 0, 0]},
            {mesh: 0, translation: [5, 0, 0]},
            {mesh: 0, translation: [10, 0, 0]}
        ]

        const {scene, meshes} = await buildGltfScene({gltf, binary, gl})

        expect(scene.children).toHaveLength(3)
        expect(meshes).toHaveLength(1)

        const sharedMesh = scene.children[0].mesh
        expect(scene.children[1].mesh).toBe(sharedMesh)
        expect(scene.children[2].mesh).toBe(sharedMesh)
    })


    test('buildGltfScene uses default material when primitive has none', async () => {
        const gl = createMockGL()
        const {binary, offsets, lengths} = buildTrianglePrimitiveBinary()
        const gltf = buildTriangleGltf(offsets, lengths)
        delete gltf.meshes[0].primitives[0].material
        gltf.materials = []

        const {scene} = await buildGltfScene({gltf, binary, gl})
        const instance = scene.children[0]

        expect(instance.material).toBeInstanceOf(Material3D)
        expect(instance.material.color).toEqual([1, 1, 1])
    })

})
