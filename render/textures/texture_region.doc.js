import {doc, section, text, code, container} from '../../doc/runtime.js'
import TextureRegion from './texture_region.js'


export default doc('TextureRegion', {advanced: true}, () => {

    text(`
        Represents a rectangular portion of a texture with UV coordinates.
        Used for spritesheets, texture atlases, and any case where you need
        to render only part of an image.
    `)


    section('UV Coordinates', () => {

        text(`
            A TextureRegion calculates UV coordinates (0-1 range) from pixel coordinates.
            This is essential for GPU rendering where textures are sampled using normalized coordinates.
        `)

        container({title: 'UV visualization', height: 350, preset: 'centered'}, ctx => {
            const wrapper = ctx.column({gap: 12})

            const img = new Image()
            img.src = './assets/images/shroom.png'

            img.onload = () => {
                const region = new TextureRegion({
                    image: img,
                    x: 50,
                    y: 30,
                    width: 150,
                    height: 180
                })

                ctx.label(`Image: ${img.width}x${img.height}px`, {parent: wrapper})
                ctx.label(`Region: x=${region.x}, y=${region.y}, ${region.width}x${region.height}px`, {parent: wrapper})
                ctx.label(`UVs: u0=${region.u0.toFixed(3)}, v0=${region.v0.toFixed(3)}, u1=${region.u1.toFixed(3)}, v1=${region.v1.toFixed(3)}`, {parent: wrapper})

                const canvas = document.createElement('canvas')
                canvas.width = img.width
                canvas.height = img.height
                const cctx = canvas.getContext('2d')

                cctx.drawImage(img, 0, 0)
                cctx.strokeStyle = '#4a9eff'
                cctx.lineWidth = 2
                cctx.strokeRect(region.x, region.y, region.width, region.height)

                ctx.canvas(canvas, {maxWidth: 250, parent: wrapper})
            }
        })

    })


    section('Creating Regions', () => {

        text('Several ways to create texture regions.')

        code('From options', () => {
            const region = new TextureRegion({
                image: spritesheet,
                x: 0,
                y: 0,
                width: 64,
                height: 64
            })
        })

        code('From full image', () => {
            // Creates a region covering the entire image
            const region = TextureRegion.fromImage(image)
        })

        code('From frame data', () => {
            // Useful for spritesheet JSON formats
            const frame = {x: 128, y: 0, w: 64, h: 64}
            const region = TextureRegion.fromFrame(spritesheet, frame)
        })

    })


    section('Properties', () => {

        text(`
            - \`image\` - The source image/canvas
            - \`x\`, \`y\` - Top-left corner in pixels
            - \`width\`, \`height\` - Size in pixels
            - \`u0\`, \`v0\` - Top-left UV coordinates (0-1)
            - \`u1\`, \`v1\` - Bottom-right UV coordinates (0-1)
            - \`uvs\` - Object with all UV coordinates
            - \`bounds\` - Object with pixel bounds
            - \`valid\` - True if region has valid image and dimensions
        `)

        code('Accessing UVs', () => {
            const region = new TextureRegion({
                image: texture,
                x: 100,
                y: 50,
                width: 64,
                height: 64
            })

            // Individual UV values
            const topLeftU = region.u0
            const topLeftV = region.v0
            const bottomRightU = region.u1
            const bottomRightV = region.v1

            // All at once
            const {u0, v0, u1, v1} = region.uvs
        })

    })

})
