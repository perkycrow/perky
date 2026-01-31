import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import Vec3Control from './vec3_control.js'
import Vec3 from '../../math/vec3.js'


export default doc('Vec3Control', {advanced: true}, () => {

    text(`
        Input control for 3D vector values. Extends [[InputControl@input]] to handle [[Vec3@math]] objects.
        Works the same as [[Vec2Control@input]] but with an additional z component.
    `)


    section('Basic Usage', () => {

        text(`
            Create a Vec3Control and update its value with Vec3 objects.
        `)

        code('Simple Vec3 control', () => {
            const control = new Vec3Control({
                device: null,
                name: 'position',
                value: new Vec3(0, 0, 0)
            })

            control.on('updated', (newValue, oldValue) => {
                logger.log(`Moved: (${newValue.x}, ${newValue.y}, ${newValue.z})`)
            })

            control.setValue(new Vec3(1, 2, 3))
        })

    })


    section('Auto Conversion', () => {

        text(`
            Vec3Control automatically converts plain objects to [[Vec3@math]] instances.
        `)

        code('Object to Vec3', () => {
            const control = new Vec3Control({
                device: null,
                name: 'sensor'
            })

            control.setValue({x: 10, y: 20, z: 30})

            logger.log(control.value instanceof Vec3)  // true
            logger.log(control.value.x, control.value.y, control.value.z)
        })

    })


    section('Equality Check', () => {

        text(`
            Only emits \`updated\` when the value actually changes.
            Uses Vec3.equals() for comparison.
        `)

        action('Change detection', () => {
            const control = new Vec3Control({
                device: null,
                name: 'gyro'
            })

            let updateCount = 0
            control.on('updated', () => {
                updateCount++
            })

            control.setValue(new Vec3(1, 1, 1))
            control.setValue(new Vec3(1, 1, 1))
            control.setValue(new Vec3(2, 2, 2))

            logger.log('Updates:', updateCount)
        })

    })

})
