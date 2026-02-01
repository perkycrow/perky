import {doc, section, text, code} from '../../doc/runtime.js'
import CanvasPostProcessor from './canvas_post_processor.js'


export default doc('CanvasPostProcessor', {advanced: true}, () => {

    text(`
        Post-processing for Canvas 2D renderers. Applies CSS filter effects (blur, brightness,
        contrast, etc.) and manual pixel-level effects to the canvas after rendering.
    `)


    section('CSS Filters', () => {

        text(`
            Filters are stacked and applied as a single CSS filter string before rendering.
            Supported types: \`blur\`, \`brightness\`, \`contrast\`, \`grayscale\`, \`saturate\`,
            \`sepia\`, \`hueRotate\`, \`invert\`, \`opacity\`, \`dropShadow\`.
        `)

        code('Adding filters', () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const processor = new CanvasPostProcessor(ctx)

            processor.addFilter('blur', 2)
            processor.addFilter('brightness', 1.2)
            processor.filters.length // 2

            processor.removeFilter('blur')
            processor.filters.length // 1

            processor.clearFilters()
            processor.filters.length // 0
        })

    })


    section('Manual Effects', () => {

        text(`
            Manual effects run after filters during \`finish()\`. Each effect must implement
            an \`apply(ctx, width, height)\` method. This is useful for effects that require
            direct canvas manipulation like vignettes.
        `)

        code('Vignette', () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const processor = new CanvasPostProcessor(ctx)

            processor.applyVignette(0.6, 0.5)
        })

    })


    section('Render Cycle', () => {

        text(`
            Call \`begin()\` before drawing to apply CSS filters, and \`finish()\` after
            drawing to reset filters and run manual effects. [[CanvasRenderer@canvas_renderer]]
            handles this automatically.
        `)

        code('Begin and finish', () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const processor = new CanvasPostProcessor(ctx)

            processor.addFilter('contrast', 1.5)
            processor.begin()

            // ... drawing happens here ...
            processor.finish(canvas.width, canvas.height)
        })

    })

})
