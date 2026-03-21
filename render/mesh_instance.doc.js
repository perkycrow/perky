import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import MeshInstance from './mesh_instance.js'


export default doc('MeshInstance', () => {

    text(`
        A positioned instance of a [[Mesh@render]] in the 3D scene. Extends
        [[Object3D@render]] with mesh reference, texture, tint, material, and
        shadow casting options.
    `)


    section('Creation', () => {

        text('Create an instance referencing a mesh with optional texture and material.')

        code('Basic instance', () => {
            const instance = new MeshInstance({
                mesh: boxMesh,
                x: 0,
                y: 0,
                z: 0
            })
        })

        code('With texture and tint', () => {
            const instance = new MeshInstance({
                mesh: boxMesh,
                texture: woodTexture,
                tint: [1, 0.8, 0.6]
            })
        })

        code('With material', () => {
            const instance = new MeshInstance({
                mesh: boxMesh,
                material: stoneMaterial
            })
        })

    })


    section('Mesh Reference', () => {

        text('The mesh property holds the GPU mesh to render.')

        action('Mesh access', () => {
            const instance = new MeshInstance({mesh: 'box-mesh'})

            logger.log('mesh:', instance.mesh)

            instance.mesh = 'sphere-mesh'
            logger.log('after change:', instance.mesh)
        })

    })


    section('Texturing', () => {

        text(`
            Set a texture directly, or use a material. The activeTexture getter
            returns the material texture if present, otherwise the direct texture.
        `)

        action('Direct texture', () => {
            const instance = new MeshInstance({texture: 'wood'})

            logger.log('texture:', instance.texture)
            logger.log('activeTexture:', instance.activeTexture)
        })

        action('Material texture', () => {
            const material = {texture: 'stone'}
            const instance = new MeshInstance({
                texture: 'wood',
                material: material
            })

            logger.log('texture:', instance.texture)
            logger.log('material.texture:', instance.material.texture)
            logger.log('activeTexture:', instance.activeTexture)
        })

    })


    section('Tint', () => {

        text('Apply a color tint to the mesh.')

        action('Tint access', () => {
            const instance = new MeshInstance({tint: [1, 0, 0]})

            logger.log('tint:', instance.tint)

            instance.tint = [0, 1, 0]
            logger.log('after change:', instance.tint)
        })

    })


    section('Shadow Casting', () => {

        text('Control whether this instance casts shadows. Enabled by default.')

        action('Shadow control', () => {
            const caster = new MeshInstance({castShadow: true})
            const nonCaster = new MeshInstance({castShadow: false})

            logger.log('default castShadow:', caster.castShadow)
            logger.log('disabled castShadow:', nonCaster.castShadow)
        })

    })


    section('Render Hints', () => {

        text('The renderHints getter returns tint and material for the renderer.')

        action('Hints', () => {
            const plain = new MeshInstance()
            logger.log('plain hints:', plain.renderHints)

            const tinted = new MeshInstance({tint: [1, 0, 0]})
            logger.log('tinted hints:', tinted.renderHints)

            const material = {texture: 'stone'}
            const withMaterial = new MeshInstance({material})
            logger.log('material hints:', withMaterial.renderHints)
        })

    })


    section('API', () => {

        code('Constructor', () => {
            const instance = new MeshInstance({
                mesh: null,
                texture: null,
                tint: null,
                material: null,
                castShadow: true,
                x: 0,
                y: 0,
                z: 0
            })
        })

        code('Properties', () => {
            instance.mesh
            instance.texture
            instance.tint
            instance.material
            instance.castShadow
            instance.activeTexture
            instance.renderHints
        })

    })

})
