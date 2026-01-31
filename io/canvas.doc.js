import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import {createCanvas, putPixels, calculateResizeDimensions, resizeCanvas, canvasToBlob} from './canvas.js'


export default doc('Canvas Utils', {advanced: true}, () => {

    text(`
        Canvas utilities that work in both browser and Node.js. Handles canvas creation,
        pixel writing, resizing, and blob conversion. Used throughout the PSD-to-spritesheet
        pipeline in \`spritesheet.js\` and \`psd_converter.js\`.
    `)


    section('createCanvas', () => {

        text('Creates a canvas element with the given dimensions. Uses the native canvas package in Node.js.')

        action('Create a canvas', async () => {
            const canvas = await createCanvas(64, 32)
            logger.log('width:', canvas.width)
            logger.log('height:', canvas.height)
        })

    })


    section('putPixels', () => {

        text('Writes raw RGBA pixel data onto a canvas context.')

        action('Write pixel data', async () => {
            const canvas = await createCanvas(2, 2)
            const ctx = canvas.getContext('2d')

            const pixels = new Uint8Array([
                255, 0, 0, 255,
                0, 255, 0, 255,
                0, 0, 255, 255,
                255, 255, 0, 255
            ])

            putPixels(ctx, {pixels, width: 2, height: 2})

            const imageData = ctx.getImageData(0, 0, 2, 2)
            logger.log('top-left red:', imageData.data[0])
            logger.log('top-right green:', imageData.data[5])
        })

    })


    section('calculateResizeDimensions', () => {

        text('Calculates target dimensions while preserving aspect ratio when only one dimension is specified.')

        action('Resize by width', () => {
            const result = calculateResizeDimensions(100, 200, 50, null)
            logger.log('width:', result.width)
            logger.log('height:', result.height)
        })

        action('Resize by height', () => {
            const result = calculateResizeDimensions(100, 200, null, 100)
            logger.log('width:', result.width)
            logger.log('height:', result.height)
        })

        action('Explicit dimensions', () => {
            const result = calculateResizeDimensions(100, 200, 50, 50)
            logger.log('width:', result.width)
            logger.log('height:', result.height)
        })

    })


    section('resizeCanvas', () => {

        text('Resizes a canvas to new dimensions. Supports nearest-neighbor interpolation for pixel art.')

        code('Resize with smoothing', async () => {
            const resized = await resizeCanvas(sourceCanvas, 128, 128)
        })

        code('Nearest-neighbor (pixel art)', async () => {
            const resized = await resizeCanvas(sourceCanvas, 128, 128, true)
        })

    })


    section('canvasToBlob', () => {

        text('Converts a canvas to a PNG Blob.')

        action('Export canvas', async () => {
            const canvas = await createCanvas(4, 4)
            const blob = await canvasToBlob(canvas)
            logger.log('type:', blob.type)
            logger.log('size:', blob.size, 'bytes')
        })

    })

})
