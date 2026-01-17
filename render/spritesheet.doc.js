import {doc, section, text, code, action, logger, container} from '../doc/runtime.js'
import {loadSpritesheet} from '../application/loaders.js'
import Spritesheet from './spritesheet.js'


export default doc('Spritesheet', () => {

    text(`
        Manages spritesheet data including frames and animations.
        Parses JSON atlas data and provides easy access to [[TextureRegion@render/textures]] objects.
    `)


    section('Loading a Spritesheet', () => {

        text('Create a Spritesheet from an image and JSON atlas data.')

        code('Basic usage', () => {
            // Load the image and JSON data first
            // const image = await loadImage('character.png')
            // const data = await loadJSON('character.json')

            const spritesheet = new Spritesheet({
                image: image,
                data: data
            })
        })

        code('Multiple atlas images', () => {
            // Some spritesheets span multiple images
            const spritesheet = new Spritesheet({
                images: [image0, image1],
                data: data
            })
        })

        code('JSON format', () => {
            // Expected JSON structure
            const data = {
                frames: [
                    {
                        filename: 'idle/1',
                        frame: {x: 0, y: 0, w: 64, h: 64},
                        atlas: 0  // Optional, defaults to 0
                    },
                    {
                        filename: 'idle/2',
                        frame: {x: 64, y: 0, w: 64, h: 64}
                    }
                ],
                animations: {
                    idle: ['idle/1', 'idle/2'],
                    walk: ['walk/1', 'walk/2', 'walk/3', 'walk/4']
                },
                meta: {}  // Optional metadata
            }
        })

    })


    section('Accessing Frames', () => {

        text('Get individual frames or groups of frames by name.')

        container({title: 'Frame access demo', height: 250, preset: 'centered'}, async ctx => {
            const wrapper = ctx.column({gap: 12})

            const source = await loadSpritesheet('./assets/spritesheets/red.json')
            const spritesheet = new Spritesheet(source)

            ctx.label(`Frames: ${spritesheet.listFrames().length}`, {parent: wrapper})
            ctx.label(`Animations: ${spritesheet.listAnimations().join(', ')}`, {parent: wrapper})

            const frame = spritesheet.getFrame('throw/1')
            if (frame) {
                ctx.label(`Frame 'throw/1': ${frame.frame.w}x${frame.frame.h}px`, {parent: wrapper})
            }

            const region = spritesheet.getRegion('throw/1')
            if (region) {
                const canvas = document.createElement('canvas')
                canvas.width = region.width
                canvas.height = region.height
                const cctx = canvas.getContext('2d')
                cctx.drawImage(
                    region.image,
                    region.x, region.y, region.width, region.height,
                    0, 0, region.width, region.height
                )
                ctx.canvas(canvas, {maxWidth: 100, parent: wrapper})
            }
        })

        code('getFrame / getRegion', () => {
            const frame = spritesheet.getFrame('hero/idle')

            // Returns frame data or null

            const region = spritesheet.getRegion('hero/idle')

            // Returns TextureRegion or null
        })

        code('getFrames / getRegions', () => {
            // Get specific frames by name
            const frames = spritesheet.getFrames(['a', 'c'])

            // Get all frames
            const allFrames = spritesheet.getFrames()

            // Get regions for animation
            const regions = spritesheet.getRegions(['a', 'b', 'c'])
        })

    })


    section('Animations', () => {

        text(`
            Spritesheets can define named animations as arrays of frame names.
            Use these with [[SpriteAnimation@render]] for playback.
        `)

        container({title: 'Animation frames', height: 200, preset: 'centered'}, async ctx => {
            const wrapper = ctx.row({gap: 8})

            const source = await loadSpritesheet('./assets/spritesheets/red.json')
            const spritesheet = new Spritesheet(source)
            const regions = spritesheet.getAnimationRegions('throw')

            for (const region of regions.slice(0, 4)) {
                const canvas = document.createElement('canvas')
                canvas.width = region.width
                canvas.height = region.height
                const cctx = canvas.getContext('2d')
                cctx.drawImage(
                    region.image,
                    region.x, region.y, region.width, region.height,
                    0, 0, region.width, region.height
                )
                ctx.canvas(canvas, {maxWidth: 80, parent: wrapper})
            }
        })

        code('getAnimation / getAnimationRegions', () => {
            // Get array of frame names for an animation
            const frameNames = spritesheet.getAnimation('walk')

            // ['walk/1', 'walk/2', 'walk/3']

            // Get TextureRegions directly for use with SpriteAnimation
            const regions = spritesheet.getAnimationRegions('walk')
        })

        code('With SpriteAnimation', () => {
            // const source = await loadSpritesheet('character.json')
            // const spritesheet = new Spritesheet(source)

            const sprite = new Sprite({
                image: spritesheet.images[0]
            })

            const animation = new SpriteAnimation({
                sprite: sprite,
                frames: spritesheet.getAnimationRegions('walk'),
                fps: 12,
                loop: true
            })

            animation.play()
        })

    })


    section('Listing Contents', () => {

        text('Inspect what frames and animations are available.')

        code('listFrames / listAnimations', () => {
            // Get all frame names
            const frames = spritesheet.listFrames()

            // ['idle/1', 'idle/2', 'walk/1', 'walk/2']

            // Get all animation names
            const animations = spritesheet.listAnimations()

            // ['idle', 'walk']
        })

    })


    section('Properties', () => {

        text(`
            - \`images\` - Array of source images
            - \`data\` - The parsed JSON atlas data
            - \`animations\` - Object mapping animation names to frame arrays
            - \`framesMap\` - Internal Map of frame name to frame data
        `)

        code('Accessing properties', () => {
            // Primary image (for single-atlas spritesheets)
            const mainImage = spritesheet.images[0]

            // All defined animations
            const animationNames = Object.keys(spritesheet.animations)

            // Raw data access
            const meta = spritesheet.data.meta
        })

    })

})
