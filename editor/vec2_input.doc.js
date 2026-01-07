import {doc, section, text, code, container, logger} from '../doc/runtime.js'
import Vec2 from '../math/vec2.js'
import './vec2_input.js'


export default doc('Vec2Input', () => {

    text(`
        A dual number input for Vec2 objects. Displays x/y fields and emits
        "change" events with the modified vector.
    `)


    section('Basic Usage', () => {

        text('Set a Vec2 as value and listen for changes.')

        code('Setup', () => {
            const input = document.createElement('vec2-input')
            input.value = new Vec2(10, 20)
            input.addEventListener('change', (e) => {
                console.log('Value:', e.detail.value)
            })
            document.body.appendChild(input)
        })

        container({title: 'Vec2 input', height: 100, preset: 'centered'}, ctx => {
            const wrapper = document.createElement('div')
            wrapper.style.width = '280px'

            const input = document.createElement('vec2-input')
            input.value = new Vec2(100, 50)
            input.addEventListener('change', (e) => {
                logger.log('Value:', e.detail.value.x, e.detail.value.y)
            })

            wrapper.appendChild(input)
            ctx.container.appendChild(wrapper)
        })

    })


    section('With Label', () => {

        text('Use `setLabel()` to add a label above the inputs.')

        container({title: 'Labeled input', height: 120, preset: 'centered'}, ctx => {
            const wrapper = document.createElement('div')
            wrapper.style.width = '280px'

            const input = document.createElement('vec2-input')
            input.setLabel('Position')
            input.value = new Vec2(0, 0)
            input.addEventListener('change', (e) => {
                logger.log('Position:', e.detail.value.x, e.detail.value.y)
            })

            wrapper.appendChild(input)
            ctx.container.appendChild(wrapper)
        })

    })


    section('Change Details', () => {

        text(`
            The change event includes \`axis\` ("x" or "y") and \`componentValue\`
            for the specific component that changed.
        `)

        container({title: 'Change details', height: 120, preset: 'centered'}, ctx => {
            const wrapper = document.createElement('div')
            wrapper.style.width = '280px'

            const input = document.createElement('vec2-input')
            input.setLabel('Velocity')
            input.value = new Vec2(1, 0)
            input.addEventListener('change', (e) => {
                logger.log(`${e.detail.axis} changed to ${e.detail.componentValue}`)
            })

            wrapper.appendChild(input)
            ctx.container.appendChild(wrapper)
        })

    })

})
