import {doc, section, text, action, code, logger} from '../doc/runtime.js'
import {applyModifications, rebuildGlb, exportGlb, applyMaterialOverrides, listMaterials} from './glb_modifier.js'


export default doc('GLB Modifier', {advanced: true}, () => {

    text(`
        Modifies GLB files at runtime. Swap textures, override material properties, and rebuild
        the binary GLB format. Used alongside [[GLB Modifications@glb_modifications]] to apply
        config-driven modifications to 3D models.
    `)


    section('applyModifications', () => {

        text(`
            Applies modifications to a parsed GLTF model. Returns a new images array with
            swapped textures. Does not mutate the original data.
        `)

        code('Apply texture swap', () => {
            const modifications = [{
                type: 'texture_swap',
                material: 'wood',
                slot: 'baseColor',
                image: loadedImage
            }]

            const modifiedImages = applyModifications({gltf, images}, modifications)
        })

    })


    section('listMaterials', () => {

        text(`
            Lists all materials in a GLTF model with their available texture slots.
            Useful for building modification UIs or validating configs.
        `)

        code('List materials', () => {
            const materials = listMaterials(gltf)
            for (const mat of materials) {
                logger.info(mat.name, 'slots:', mat.slots.join(', '))
            }
        })

    })


    section('applyMaterialOverrides', () => {

        text(`
            Applies material property overrides (color, roughness, emissive, opacity)
            to the runtime material objects. Modifies materials in place.
        `)

        code('Override material color', () => {
            const modifications = [{
                type: 'material_override',
                material: 'metal',
                color: [0.8, 0.2, 0.2],
                roughness: 0.3
            }]

            applyMaterialOverrides(gltf, materials, modifications)
        })

    })


    section('rebuildGlb', () => {

        text(`
            Rebuilds a complete GLB binary from modified GLTF data and images.
            Handles buffer view reorganization and proper GLB chunk alignment.
        `)

        code('Rebuild GLB', async () => {
            const arrayBuffer = await rebuildGlb(gltf, images, binaryChunk)
        })

    })


    section('exportGlb', () => {

        text(`
            Combines modification application and GLB rebuilding into one step.
            Takes the original parsed GLB data and modifications, returns a new GLB ArrayBuffer.
        `)

        code('Export modified GLB', async () => {
            const modifications = [
                {type: 'texture_swap', material: 'skin', image: customTexture},
                {type: 'material_override', material: 'eyes', emissive: [1, 0.8, 0]}
            ]

            const glbBuffer = await exportGlb({gltf, binary, images}, modifications)
        })

    })

})
