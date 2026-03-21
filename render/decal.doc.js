import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Decal from './decal.js'


export default doc('Decal', () => {

    text(`
        A 3D object for projecting textures onto surfaces. Extends [[Object3D@render]].
        Useful for bullet holes, blood splatter, footprints, and other surface details.
    `)


    section('Creation', () => {

        text('Create a decal with position, dimensions, and an optional material.')

        action('Default values', () => {
            const decal = new Decal()
            logger.log('material:', decal.material)
            logger.log('width:', decal.width)
            logger.log('height:', decal.height)
        })

        action('With options', () => {
            const decal = new Decal({
                x: 1,
                y: 2,
                z: 3,
                width: 0.5,
                height: 0.3,
                material: {color: [1, 0, 0]}
            })
            logger.log('position:', decal.position.x, decal.position.y, decal.position.z)
            logger.log('size:', decal.width, 'x', decal.height)
            logger.log('material:', decal.material)
        })

    })


    section('Inherited from Object3D', () => {

        text(`
            Decal inherits position, rotation, scale, visibility, opacity,
            and depth from Object3D.
        `)

        action('Visibility and opacity', () => {
            const decal = new Decal({visible: false, opacity: 0.5})
            logger.log('visible:', decal.visible)
            logger.log('opacity:', decal.opacity)
        })

        code('Parent-child hierarchy', () => {
            const parent = new Decal({y: 5})
            const child = new Decal({y: 1})

            parent.addChild(child)
            parent.updateWorldMatrix()
        })

    })

})
