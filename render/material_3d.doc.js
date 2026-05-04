import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Material3D from './material_3d.js'


export default doc('Material3D', () => {

    text(`
        Material definition for 3D meshes. Holds properties like color,
        texture, roughness, and emission used by the mesh shader.
    `)


    section('Creating a Material', () => {

        text('Create materials with default or custom properties.')

        code('Default material', () => {
            const material = new Material3D()
        })

        code('Colored material', () => {
            const material = new Material3D({
                color: [0.8, 0.2, 0.2]
            })
        })

        code('Textured material', () => {
            const material = new Material3D({
                texture: myTexture,
                roughness: 0.3,
                specular: 0.8
            })
        })

    })


    section('Properties', () => {

        action('Default values', () => {
            const material = new Material3D()
            logger.log('color:', material.color)
            logger.log('emissive:', material.emissive)
            logger.log('opacity:', material.opacity)
            logger.log('unlit:', material.unlit)
            logger.log('uvScale:', material.uvScale)
            logger.log('roughness:', material.roughness)
            logger.log('specular:', material.specular)
            logger.log('filtering:', material.filtering)
        })

        action('Custom values', () => {
            const material = new Material3D({
                color: [1, 0.5, 0],
                emissive: [0.2, 0, 0],
                opacity: 0.8,
                roughness: 0.2
            })
            logger.log('color:', material.color)
            logger.log('emissive:', material.emissive)
            logger.log('opacity:', material.opacity)
            logger.log('roughness:', material.roughness)
        })

    })


    section('Textures', () => {

        text(`
            Materials can reference textures for diffuse color and normal
            mapping. The uvScale property tiles the texture.
        `)

        code('With textures', () => {
            const material = new Material3D({
                texture: diffuseTexture,
                normalMap: normalTexture,
                normalStrength: 1.5,
                uvScale: [2, 2]
            })
        })

    })


    section('Unlit Mode', () => {

        text(`
            Set unlit to true to bypass lighting calculations. Useful for
            UI elements, emissive surfaces, or stylized rendering.
        `)

        code('Unlit material', () => {
            const material = new Material3D({
                color: [1, 1, 1],
                unlit: true
            })
        })

    })


    section('API', () => {

        code('Constructor', () => {
            const material = new Material3D({
                texture: null,
                color: [1, 1, 1],
                emissive: [0, 0, 0],
                opacity: 1,
                unlit: false,
                uvScale: [1, 1],
                roughness: 0.8,
                specular: 0.04,
                normalMap: null,
                normalStrength: 1.0,
                filtering: 'linear'
            })
        })

    })

})
