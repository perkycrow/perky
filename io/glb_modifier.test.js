import {test, expect, describe} from 'vitest'
import {applyModifications, applyMaterialOverrides, rebuildGlb, listMaterials} from './glb_modifier.js'


function createTestGltf () {
    return {
        asset: {version: '2.0'},
        buffers: [{byteLength: 0}],
        bufferViews: [
            {buffer: 0, byteOffset: 0, byteLength: 100}
        ],
        images: [
            {bufferView: 0, mimeType: 'image/png'},
            {bufferView: 0, mimeType: 'image/png'}
        ],
        textures: [
            {source: 0},
            {source: 1}
        ],
        materials: [
            {
                name: 'Wall',
                pbrMetallicRoughness: {
                    baseColorTexture: {index: 0}
                }
            },
            {
                name: 'Floor',
                pbrMetallicRoughness: {
                    baseColorTexture: {index: 1}
                },
                normalTexture: {index: 0}
            }
        ],
        meshes: [],
        nodes: [],
        scenes: [{nodes: []}]
    }
}


describe('applyModifications', () => {
    test('texture_swap by material name', () => {
        const gltf = createTestGltf()
        const images = ['original_0', 'original_1']
        const newImage = 'swapped_image'

        const result = applyModifications({gltf, images}, [
            {type: 'texture_swap', material: 'Wall', slot: 'baseColor', image: newImage}
        ])

        expect(result[0]).toBe('swapped_image')
        expect(result[1]).toBe('original_1')
    })

    test('texture_swap by material index', () => {
        const gltf = createTestGltf()
        const images = ['original_0', 'original_1']
        const newImage = 'swapped_image'

        const result = applyModifications({gltf, images}, [
            {type: 'texture_swap', material: 1, slot: 'baseColor', image: newImage}
        ])

        expect(result[0]).toBe('original_0')
        expect(result[1]).toBe('swapped_image')
    })

    test('texture_swap normal slot', () => {
        const gltf = createTestGltf()
        const images = ['original_0', 'original_1']
        const newImage = 'new_normal'

        const result = applyModifications({gltf, images}, [
            {type: 'texture_swap', material: 'Floor', slot: 'normal', image: newImage}
        ])

        expect(result[0]).toBe('new_normal')
        expect(result[1]).toBe('original_1')
    })

    test('does not mutate original images array', () => {
        const gltf = createTestGltf()
        const images = ['original_0', 'original_1']

        applyModifications({gltf, images}, [
            {type: 'texture_swap', material: 'Wall', slot: 'baseColor', image: 'new'}
        ])

        expect(images[0]).toBe('original_0')
    })

    test('unknown material name is ignored', () => {
        const gltf = createTestGltf()
        const images = ['original_0', 'original_1']

        const result = applyModifications({gltf, images}, [
            {type: 'texture_swap', material: 'NonExistent', slot: 'baseColor', image: 'new'}
        ])

        expect(result[0]).toBe('original_0')
        expect(result[1]).toBe('original_1')
    })

    test('out of range material index is ignored', () => {
        const gltf = createTestGltf()
        const images = ['original_0']

        const result = applyModifications({gltf, images}, [
            {type: 'texture_swap', material: 99, slot: 'baseColor', image: 'new'}
        ])

        expect(result[0]).toBe('original_0')
    })

    test('missing texture slot is ignored', () => {
        const gltf = createTestGltf()
        const images = ['original_0']

        const result = applyModifications({gltf, images}, [
            {type: 'texture_swap', material: 'Wall', slot: 'emissive', image: 'new'}
        ])

        expect(result[0]).toBe('original_0')
    })

    test('multiple modifications applied in order', () => {
        const gltf = createTestGltf()
        const images = ['original_0', 'original_1']

        const result = applyModifications({gltf, images}, [
            {type: 'texture_swap', material: 'Wall', slot: 'baseColor', image: 'first'},
            {type: 'texture_swap', material: 'Wall', slot: 'baseColor', image: 'second'}
        ])

        expect(result[0]).toBe('second')
    })

    test('default slot is baseColor', () => {
        const gltf = createTestGltf()
        const images = ['original_0', 'original_1']

        const result = applyModifications({gltf, images}, [
            {type: 'texture_swap', material: 'Wall', image: 'swapped'}
        ])

        expect(result[0]).toBe('swapped')
    })
})


describe('applyMaterialOverrides', () => {
    test('overrides color by material name', () => {
        const gltf = createTestGltf()
        const materials = [{color: [1, 1, 1]}, {color: [1, 1, 1]}]

        applyMaterialOverrides(gltf, materials, [
            {type: 'material_override', material: 'Wall', color: [1, 0, 0]}
        ])

        expect(materials[0].color).toEqual([1, 0, 0])
        expect(materials[1].color).toEqual([1, 1, 1])
    })

    test('overrides roughness', () => {
        const gltf = createTestGltf()
        const materials = [{roughness: 0.5}, {roughness: 0.5}]

        applyMaterialOverrides(gltf, materials, [
            {type: 'material_override', material: 'Floor', roughness: 0.9}
        ])

        expect(materials[0].roughness).toBe(0.5)
        expect(materials[1].roughness).toBe(0.9)
    })

    test('overrides multiple properties at once', () => {
        const gltf = createTestGltf()
        const materials = [{color: [1, 1, 1], roughness: 0.5, emissive: [0, 0, 0]}]

        applyMaterialOverrides(gltf, materials, [
            {type: 'material_override', material: 'Wall', color: [0.2, 0.3, 0.4], roughness: 0.8, emissive: [1, 0, 0]}
        ])

        expect(materials[0].color).toEqual([0.2, 0.3, 0.4])
        expect(materials[0].roughness).toBe(0.8)
        expect(materials[0].emissive).toEqual([1, 0, 0])
    })

    test('overrides opacity and normalStrength', () => {
        const gltf = createTestGltf()
        const materials = [{opacity: 1, normalStrength: 1}]

        applyMaterialOverrides(gltf, materials, [
            {type: 'material_override', material: 'Wall', opacity: 0.5, normalStrength: 2.0}
        ])

        expect(materials[0].opacity).toBe(0.5)
        expect(materials[0].normalStrength).toBe(2.0)
    })

    test('ignores unknown material', () => {
        const gltf = createTestGltf()
        const materials = [{color: [1, 1, 1]}]

        applyMaterialOverrides(gltf, materials, [
            {type: 'material_override', material: 'Nope', color: [0, 0, 0]}
        ])

        expect(materials[0].color).toEqual([1, 1, 1])
    })

    test('ignores non material_override types', () => {
        const gltf = createTestGltf()
        const materials = [{color: [1, 1, 1]}]

        applyMaterialOverrides(gltf, materials, [
            {type: 'texture_swap', material: 'Wall', color: [0, 0, 0]}
        ])

        expect(materials[0].color).toEqual([1, 1, 1])
    })
})


describe('rebuildGlb', () => {
    test('produces valid GLB header', () => {
        const gltf = {
            asset: {version: '2.0'},
            buffers: [{byteLength: 4}],
            bufferViews: [{buffer: 0, byteOffset: 0, byteLength: 4}],
            images: [{bufferView: 0, mimeType: 'image/png'}],
            textures: [{source: 0}],
            materials: [],
            meshes: [],
            nodes: [],
            scenes: [{nodes: []}]
        }
        const images = [new Uint8Array([1, 2, 3, 4])]

        const result = rebuildGlb(gltf, images)
        const view = new DataView(result)

        expect(view.getUint32(0, true)).toBe(0x46546C67)
        expect(view.getUint32(4, true)).toBe(2)
        expect(view.getUint32(8, true)).toBe(result.byteLength)
    })

    test('JSON chunk is padded to 4-byte alignment', () => {
        const gltf = {
            asset: {version: '2.0'},
            buffers: [{byteLength: 4}],
            bufferViews: [{buffer: 0, byteOffset: 0, byteLength: 4}],
            images: [{bufferView: 0, mimeType: 'image/png'}],
            textures: [{source: 0}],
            materials: [],
            meshes: [],
            nodes: [],
            scenes: [{nodes: []}]
        }
        const images = [new Uint8Array([1, 2, 3, 4])]

        const result = rebuildGlb(gltf, images)
        const view = new DataView(result)
        const jsonChunkLength = view.getUint32(12, true)

        expect(jsonChunkLength % 4).toBe(0)
    })

    test('round-trips image data', () => {
        const gltf = {
            asset: {version: '2.0'},
            buffers: [{byteLength: 8}],
            bufferViews: [{buffer: 0, byteOffset: 0, byteLength: 8}],
            images: [{bufferView: 0, mimeType: 'image/png'}],
            textures: [{source: 0}],
            materials: [],
            meshes: [],
            nodes: [],
            scenes: [{nodes: []}]
        }
        const imageData = new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80])
        const images = [imageData]

        const result = rebuildGlb(gltf, images)
        const view = new DataView(result)

        const jsonChunkLength = view.getUint32(12, true)
        const binOffset = 12 + 8 + jsonChunkLength + 8
        const binData = new Uint8Array(result, binOffset, 8)

        expect(Array.from(binData)).toEqual([10, 20, 30, 40, 50, 60, 70, 80])
    })

    test('handles null images', () => {
        const gltf = {
            asset: {version: '2.0'},
            buffers: [{byteLength: 0}],
            bufferViews: [],
            images: [{uri: 'external.png'}],
            textures: [{source: 0}],
            materials: [],
            meshes: [],
            nodes: [],
            scenes: [{nodes: []}]
        }

        const result = rebuildGlb(gltf, [null])
        const view = new DataView(result)

        expect(view.getUint32(0, true)).toBe(0x46546C67)
    })

    test('preserves non-image buffer views', () => {
        const geometryData = new Uint8Array([100, 101, 102, 103, 104, 105])
        const imageData = new Uint8Array([1, 2, 3, 4])
        const binary = new Uint8Array(10)
        binary.set(geometryData, 0)
        binary.set(imageData, 6)

        const gltf = {
            asset: {version: '2.0'},
            buffers: [{byteLength: 10}],
            bufferViews: [
                {buffer: 0, byteOffset: 0, byteLength: 6},
                {buffer: 0, byteOffset: 6, byteLength: 4}
            ],
            images: [{bufferView: 1, mimeType: 'image/png'}],
            textures: [{source: 0}],
            materials: [],
            meshes: [],
            nodes: [],
            scenes: [{nodes: []}]
        }

        const newImage = new Uint8Array([10, 20, 30, 40, 50])
        const result = rebuildGlb(gltf, [newImage], binary)
        const view = new DataView(result)

        const jsonChunkLength = view.getUint32(12, true)
        const binOffset = 12 + 8 + jsonChunkLength + 8
        const binLength = view.getUint32(binOffset - 8, true)

        const binData = new Uint8Array(result, binOffset, binLength)
        expect(Array.from(binData.slice(0, 6))).toEqual([100, 101, 102, 103, 104, 105])
        expect(Array.from(binData.slice(6, 11))).toEqual([10, 20, 30, 40, 50])
    })

    test('updates buffer byteLength', () => {
        const gltf = {
            asset: {version: '2.0'},
            buffers: [{byteLength: 999}],
            bufferViews: [{buffer: 0, byteOffset: 0, byteLength: 4}],
            images: [{bufferView: 0, mimeType: 'image/png'}],
            textures: [{source: 0}],
            materials: [],
            meshes: [],
            nodes: [],
            scenes: [{nodes: []}]
        }
        const images = [new Uint8Array([1, 2, 3, 4])]

        const result = rebuildGlb(gltf, images)
        const view = new DataView(result)

        const jsonChunkLength = view.getUint32(12, true)
        const jsonBytes = new Uint8Array(result, 20, jsonChunkLength)
        const json = JSON.parse(new TextDecoder().decode(jsonBytes))

        expect(json.buffers[0].byteLength).toBe(4)
    })
})


describe('listMaterials', () => {
    test('lists materials with their texture slots', () => {
        const gltf = createTestGltf()
        const result = listMaterials(gltf)

        expect(result).toEqual([
            {index: 0, name: 'Wall', slots: ['baseColor']},
            {index: 1, name: 'Floor', slots: ['baseColor', 'normal']}
        ])
    })

    test('handles gltf with no materials', () => {
        expect(listMaterials({})).toEqual([])
        expect(listMaterials({materials: undefined})).toEqual([])
    })

    test('handles unnamed materials', () => {
        const gltf = {
            materials: [{pbrMetallicRoughness: {}}]
        }

        const result = listMaterials(gltf)
        expect(result[0].name).toBe(null)
        expect(result[0].slots).toEqual([])
    })
})
