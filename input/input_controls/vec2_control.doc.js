import {doc, section, text, code, logger} from '../../doc/runtime.js'
import Vec2Control from './vec2_control.js'
import Vec2 from '../../math/vec2.js'


export default doc('Vec2Control', () => {

    text(`
        Input control for 2D vector values. Extends InputControl to handle Vec2 objects,
        commonly used for joystick axes or mouse movement.
    `)


    section('Basic Usage', () => {

        text(`
            Create a Vec2Control and update its value with Vec2 objects.
        `)

        code('Simple Vec2 control', () => {
            const control = new Vec2Control({
                device: null,
                name: 'joystick',
                value: new Vec2(0, 0)
            })

            control.on('updated', (newValue, oldValue) => {
                logger.log(`Joystick moved: (${newValue.x}, ${newValue.y})`)
            })

            control.setValue(new Vec2(0.5, -0.3))
        })

    })


    section('Auto Conversion', () => {

        text(`
            Vec2Control automatically converts plain objects to Vec2 instances.
        `)

        code('Object to Vec2', () => {
            const control = new Vec2Control({
                device: null,
                name: 'mouse',
                value: new Vec2()
            })

            // Accepts plain objects
            control.setValue({x: 100, y: 200})

            // Always returns Vec2 instance
            logger.log(control.value instanceof Vec2)  // true
            logger.log(control.value.x, control.value.y)  // 100, 200
        })

    })


    section('Equality Check', () => {

        text(`
            Only emits 'updated' event when the value actually changes.
            Uses Vec2.equals() for comparison.
        `)

        code('Change detection', () => {
            const control = new Vec2Control({
                device: null,
                name: 'stick',
                value: new Vec2(0, 0)
            })

            let updateCount = 0
            control.on('updated', () => {
                updateCount++
            })

            control.setValue(new Vec2(1, 1))  // Updates (count: 1)
            control.setValue(new Vec2(1, 1))  // No update (same value)
            control.setValue(new Vec2(2, 2))  // Updates (count: 2)

            logger.log(updateCount)  // 2
        })

    })

})
