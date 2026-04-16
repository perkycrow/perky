import {doc, section, text, code} from '../../doc/runtime.js'


export default doc('GLTFLoader', () => {

    text(`
        Load and parse GLB files (binary glTF 2.0). Extracts meshes, materials,
        textures, and node hierarchy into Perky's 3D scene structure.
    `)


    section('Loading a GLB file', () => {

        text(`
            loadGlb fetches and parses a GLB file. Returns the parsed glTF JSON,
            binary buffer, and base URL for resolving external resources.
        `)

        code('Basic usage', async () => {
            const {gltf, binary, baseUrl} = await loadGlb('models/character.glb')
        })

        code('With params object', async () => {
            const {gltf, binary, baseUrl} = await loadGlb({url: 'models/character.glb'})
        })

    })


    section('Parsing GLB data', () => {

        text(`
            parseGlb extracts the JSON and binary chunks from a GLB ArrayBuffer.
            Use this when you already have the file data.
        `)

        code('Parse from ArrayBuffer', () => {
            const {gltf, binary} = parseGlb(arrayBuffer)
        })

    })


    section('Building a 3D scene', () => {

        text(`
            buildGltfScene creates Perky 3D objects from parsed glTF data.
            Returns the scene root, meshes, materials, and loaded images.
        `)

        code('Build scene from parsed data', async () => {
            const {gltf, binary, baseUrl} = await loadGlb('models/character.glb')

            const {scene, meshes, materials, images} = await buildGltfScene({
                gltf,
                binary,
                baseUrl,
                gl
            })
        })

        code('Add to renderer', async () => {
            const {scene} = await buildGltfScene({gltf, binary, gl})

            scene.children.forEach(child => {
                myScene.addChild(child)
            })
        })

    })


    section('Node transforms', () => {

        text(`
            Nodes preserve their transforms from the glTF file: translation,
            rotation (quaternion), and scale. Matrix transforms are decomposed
            automatically.
        `)

        code('Access node transforms', async () => {
            const {scene} = await buildGltfScene({gltf, binary, gl})

            const character = scene.children[0]
            character.position.x
            character.rotation.w
            character.scale.y
        })

    })


    section('Materials', () => {

        text(`
            PBR materials from glTF are converted to Material3D. Supports base
            color, roughness, emissive, normal maps, and alpha blending.
        `)

        code('Material properties', async () => {
            const {materials} = await buildGltfScene({gltf, binary, gl})

            const material = materials[0]
            material.color
            material.roughness
            material.emissive
            material.texture
            material.normalMap
        })

    })


    section('API', () => {

        code('loadGlb with URL string', async () => {
            const {gltf, binary, baseUrl} = await loadGlb(url)
        })

        code('loadGlb with options object', async () => {
            const {gltf, binary, baseUrl} = await loadGlb({url})
        })

        code('parseGlb', () => {
            const {gltf, binary} = parseGlb(arrayBuffer)
        })

        code('buildGltfScene', async () => {
            const {scene, meshes, materials, images} = await buildGltfScene({
                gltf: Object,
                binary: Uint8Array,
                baseUrl: String,
                gl: WebGL2RenderingContext
            })
        })

    })

})
