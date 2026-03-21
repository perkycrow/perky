import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Billboard from './billboard.js'


export default doc('Billboard', () => {

    text(`
        A 3D object that always faces the camera. Extends Object3D.
        Useful for particles, sprites in 3D space, labels, and health bars.
    `)


    section('Creation', () => {

        text('Create a billboard with position, dimensions, and an optional material.')

        action('Default values', () => {
            const bb = new Billboard()
            logger.log('material:', bb.material)
            logger.log('width:', bb.width)
            logger.log('height:', bb.height)
        })

        action('With options', () => {
            const bb = new Billboard({
                x: 1,
                y: 2,
                z: 3,
                width: 0.5,
                height: 0.3,
                material: {color: [1, 0, 0]}
            })
            logger.log('position:', bb.position.x, bb.position.y, bb.position.z)
            logger.log('size:', bb.width, 'x', bb.height)
            logger.log('material:', bb.material)
        })

    })


    section('Inherited from Object3D', () => {

        text(`
            Billboard inherits position, rotation, scale, visibility, opacity,
            and depth from Object3D.
        `)

        action('Visibility and opacity', () => {
            const bb = new Billboard({visible: false, opacity: 0.5})
            logger.log('visible:', bb.visible)
            logger.log('opacity:', bb.opacity)
        })

        code('Parent-child hierarchy', () => {
            const parent = new Billboard({y: 5})
            const child = new Billboard({y: 1})

            parent.addChild(child)
            parent.updateWorldMatrix()
        })

    })

})
