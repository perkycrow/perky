import {doc, section, text, code, container, logger} from '../doc/runtime.js'
import './number_input.js'


export default doc('NumberInput', {advanced: true}, () => {

    text(`
        A number input with drag-to-adjust, steppers, and keyboard controls.
        Emits "change" events with \`detail.value\`.
    `)


    section('Basic Usage', () => {

        text('Create a number input and listen for changes.')

        code('Setup', () => {
            const input = document.createElement('number-input')
            input.setValue(10)
            input.addEventListener('change', (e) => {
                logger.log('Value:', e.detail.value)
            })
            document.body.appendChild(input)
        })

        container({title: 'Number input', height: 80, preset: 'centered'}, ctx => {
            const input = document.createElement('number-input')
            input.setValue(42)
            input.addEventListener('change', (e) => {
                logger.log('Value:', e.detail.value)
            })
            ctx.container.appendChild(input)
        })

    })


    section('With Label', () => {

        text(`
            Use \`setLabel()\` to add a draggable label. Drag the label left/right
            to adjust the value. Hold Shift for 10x, Ctrl/Cmd for 0.1x.
        `)

        container({title: 'Labeled inputs', height: 80, preset: 'centered'}, ctx => {
            const row = ctx.row({gap: 16})

            const xInput = document.createElement('number-input')
            xInput.setLabel('x')
            xInput.setValue(100)
            xInput.addEventListener('change', (e) => {
                logger.log('X:', e.detail.value)
            })
            row.appendChild(xInput)

            const yInput = document.createElement('number-input')
            yInput.setLabel('y')
            yInput.setValue(50)
            yInput.addEventListener('change', (e) => {
                logger.log('Y:', e.detail.value)
            })
            row.appendChild(yInput)
        })

    })


    section('Constraints', () => {

        text('Use `setMin()`, `setMax()`, `setStep()`, and `setPrecision()` to constrain values.')

        container({title: 'Constrained input', height: 80, preset: 'centered'}, ctx => {
            const input = document.createElement('number-input')
            input.setLabel('opacity')
            input.setMin(0)
            input.setMax(1)
            input.setStep(0.1)
            input.setPrecision(1)
            input.setValue(0.5)
            input.addEventListener('change', (e) => {
                logger.log('Opacity:', e.detail.value)
            })
            ctx.container.appendChild(input)
        })

    })


    section('Compact Mode', () => {

        text(`
            Use \`setCompact(true)\` or the \`compact\` attribute for a minimal
            inline style without label, useful in toolbars.
        `)

        container({title: 'Compact inputs', height: 80, preset: 'centered'}, ctx => {
            const row = ctx.row({gap: 8})

            const fps = document.createElement('number-input')
            fps.setCompact(true)
            fps.setMin(1)
            fps.setMax(60)
            fps.setStep(1)
            fps.setPrecision(0)
            fps.setValue(30)
            fps.addEventListener('change', (e) => {
                logger.log('FPS:', e.detail.value)
            })
            row.appendChild(fps)

            ctx.label('fps', {parent: row})
        })

    })


    section('Keyboard Controls', () => {

        text(`
            - **Arrow Up/Down**: Increment/decrement by step
            - **Shift + Arrow**: 10x step
            - **Ctrl/Cmd + Arrow**: 0.1x step
            - **Enter**: Confirm and blur
            - **Escape**: Cancel and restore previous value
        `)

        container({title: 'Try keyboard', height: 80, preset: 'centered'}, ctx => {
            const input = document.createElement('number-input')
            input.setLabel('value')
            input.setStep(1)
            input.setPrecision(0)
            input.setValue(0)
            input.addEventListener('change', (e) => {
                logger.log('Value:', e.detail.value)
            })
            ctx.container.appendChild(input)

            ctx.hint('Click to focus, then use arrow keys')
        })

    })


    section('Context Adaptation', () => {

        text(`
            Set \`context="studio"\` for larger touch-friendly controls (44px height).
        `)

        container({title: 'Context comparison', height: 160, preset: 'centered'}, ctx => {
            const col = ctx.column({gap: 16})

            const row1 = ctx.row({gap: 12, parent: col})
            ctx.label('Default:', {parent: row1})
            const input1 = document.createElement('number-input')
            input1.setLabel('x')
            input1.setValue(10)
            row1.appendChild(input1)

            const row2 = ctx.row({gap: 12, parent: col})
            ctx.label('Studio:', {parent: row2})
            const input2 = document.createElement('number-input')
            input2.setAttribute('context', 'studio')
            input2.setLabel('x')
            input2.setValue(10)
            row2.appendChild(input2)
        })

    })

})
