import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Sprite from './sprite.js'


export default doc('Sprite', () => {

    text(`
        Animated sprite extending [[Object2D@render]].
        Displays a single frame from a spritesheet and supports frame-based animations.
        Use with [[CanvasRenderer@render]] or [[WebGLRenderer@render]] for rendering.
    `)


    section('Creation', () => {

        text('Create sprites with an image and optional frame data.')

        code('Basic sprite', () => {
            const sprite = new Sprite({
                image: myImage,
                x: 100,
                y: 100
            })
        })

        code('With frame', () => {
            // Frame from a spritesheet (e.g., from TexturePacker JSON)
            const frame = {
                frame: {x: 0, y: 0, w: 32, h: 32}
            }

            const sprite = new Sprite({
                image: spritesheet,
                frame: frame,
                x: 100,
                y: 100
            })
        })

        code('With custom size', () => {
            const sprite = new Sprite({
                image: myImage,
                width: 64,   // Scales width, height auto-calculated
                x: 100,
                y: 100
            })
        })

    })


    section('Frames', () => {

        text(`
            A frame defines which part of the image to display.
            Frame data typically comes from spritesheet tools like TexturePacker.
        `)

        action('setFrame', () => {
            const sprite = new Sprite({image: null})

            const frame1 = {frame: {x: 0, y: 0, w: 32, h: 32}}
            const frame2 = {frame: {x: 32, y: 0, w: 32, h: 32}}

            sprite.setFrame(frame1)
            logger.log('currentFrame:', sprite.currentFrame ? 'set' : 'null')

            sprite.setFrame(frame2)
            logger.log('after setFrame:', sprite.currentFrame ? 'set' : 'null')
        })

        code('Frame structure', () => {
            // Typical frame object from spritesheet JSON
            const frame = {
                frame: {x: 64, y: 0, w: 32, h: 48},
                sourceSize: {w: 32, h: 48},
                spriteSourceSize: {x: 0, y: 0, w: 32, h: 48}
            }
        })

    })


    section('Animations', () => {

        text(`
            Sprites can have multiple named animations.
            Animations are typically [[SpriteAnimation@render]] instances.
        `)

        action('addAnimation / play / stop', () => {
            const sprite = new Sprite({image: null})

            // Mock animation object
            const walkAnim = {
                play: () => logger.log('walk animation started'),
                stop: () => logger.log('walk animation stopped')
            }

            const idleAnim = {
                play: () => logger.log('idle animation started'),
                stop: () => logger.log('idle animation stopped')
            }

            sprite.addAnimation('walk', walkAnim)
            sprite.addAnimation('idle', idleAnim)
            logger.log('animations added:', sprite.animations.size)

            sprite.play('walk')
            sprite.play('idle')
            sprite.stop()
        })

        code('Animation setup', () => {
            const sprite = new Sprite({image: spritesheet})

            // Add animations (typically SpriteAnimation instances)
            sprite.addAnimation('idle', idleAnimation)
            sprite.addAnimation('walk', walkAnimation)
            sprite.addAnimation('jump', jumpAnimation)

            // Play an animation by name
            sprite.play('walk')

            // Stop current animation
            sprite.stop()
        })

    })


    section('Sizing', () => {

        text(`
            Sprite size can be set explicitly or derived from the frame.
            Setting width or height maintains aspect ratio.
        `)

        code('Explicit sizing', () => {
            // Set width, height auto-calculated from aspect ratio
            const sprite1 = new Sprite({
                image: myImage,
                width: 64
            })

            // Set height, width auto-calculated from aspect ratio
            const sprite2 = new Sprite({
                image: myImage,
                height: 48
            })

            // Both null = use frame dimensions
            const sprite3 = new Sprite({
                image: myImage,
                frame: frame
            })
        })

    })


    section('Bounds', () => {

        text('Bounds are calculated from the current frame or explicit dimensions.')

        action('With frame', () => {
            const frame = {frame: {x: 0, y: 0, w: 64, h: 48}}
            const sprite = new Sprite({
                image: null,
                frame: frame
            })
            const bounds = sprite.getBounds()
            logger.log('width:', bounds.width)
            logger.log('height:', bounds.height)
        })

        action('With explicit width', () => {
            const frame = {frame: {x: 0, y: 0, w: 64, h: 48}}
            const sprite = new Sprite({
                image: null,
                frame: frame,
                width: 128
            })
            const bounds = sprite.getBounds()
            logger.log('width:', bounds.width)
            logger.log('height:', bounds.height, '(scaled proportionally)')
        })

    })


    section('Transforms', () => {

        text('Inherited from [[Object2D@render]]. Supports position, rotation, scale, and anchor.')

        code('Transform example', () => {
            const sprite = new Sprite({
                image: myImage,
                x: 200,
                y: 150,
                rotation: Math.PI / 6,
                scaleX: 2,
                scaleY: 2,
                anchorX: 0.5,
                anchorY: 1
            })
        })

    })

})
