import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Image2D from './image_2d.js'


export default doc('Image2D', () => {

    text(`
        Static image display extending [[Object2D@render]].
        For animated sprites, use [[Sprite2D@render]] instead.
        Use with [[Canvas2D@render]] or [[WebGLCanvas2D@render]] for rendering.
    `)


    section('Creation', () => {

        text('Create an image with explicit dimensions.')

        code('Basic image', () => {
            const img = new Image2D({
                image: myImage,
                width: 100,
                height: 100
            })
        })

        code('Positioned image', () => {
            const img = new Image2D({
                image: myImage,
                x: 50,
                y: 50,
                width: 200,
                height: 150
            })
        })

        code('With anchor', () => {
            const img = new Image2D({
                image: myImage,
                x: 100,
                y: 100,
                width: 64,
                height: 64,
                anchorX: 0.5,
                anchorY: 0.5
            })
        })

    })


    section('Properties', () => {

        text('Image2D-specific properties.')

        action('Dimensions', () => {
            const img = new Image2D({
                image: null,
                width: 100,
                height: 50
            })
            logger.log('width:', img.width)
            logger.log('height:', img.height)

            img.width = 200
            img.height = 100
            logger.log('after resize:', img.width, 'x', img.height)
        })

        action('Image reference', () => {
            const img = new Image2D({
                image: null,
                width: 100,
                height: 100
            })
            logger.log('image:', img.image)

            // Set image later (e.g., after loading)
            img.image = new Image()
            logger.log('after set:', img.image ? 'set' : 'null')
        })

    })


    section('Loading', () => {

        text('Images are typically loaded before creating Image2D instances.')

        code('Load then create', () => {
            const htmlImage = new Image()
            htmlImage.src = './assets/background.png'

            htmlImage.onload = () => {
                const img = new Image2D({
                    image: htmlImage,
                    width: htmlImage.width,
                    height: htmlImage.height
                })
                scene.add(img)
            }
        })

        code('With asset loader', () => {
            // Using Perky's asset system
            const assets = perky.query('#assets')

            assets.load('background', './assets/background.png')
            assets.on('load:background', image => {
                const img = new Image2D({
                    image: image,
                    width: 800,
                    height: 600
                })
            })
        })

    })


    section('Bounds', () => {

        text('Bounds are based on width and height, adjusted by anchor.')

        action('Default anchor (0.5, 0.5)', () => {
            const img = new Image2D({
                image: null,
                width: 100,
                height: 50
            })
            const bounds = img.getBounds()
            logger.log('minX:', bounds.minX)
            logger.log('minY:', bounds.minY)
            logger.log('maxX:', bounds.maxX)
            logger.log('maxY:', bounds.maxY)
        })

        action('Top-left anchor (0, 0)', () => {
            const img = new Image2D({
                image: null,
                width: 100,
                height: 50,
                anchorX: 0,
                anchorY: 0
            })
            const bounds = img.getBounds()
            logger.log('minX:', bounds.minX)
            logger.log('minY:', bounds.minY)
            logger.log('maxX:', bounds.maxX)
            logger.log('maxY:', bounds.maxY)
        })

    })


    section('Transforms', () => {

        text('Inherited from [[Object2D@render]]. Supports position, rotation, scale, and anchor.')

        code('Transform example', () => {
            const img = new Image2D({
                image: myImage,
                x: 200,
                y: 150,
                width: 128,
                height: 128,
                rotation: Math.PI / 4,
                scaleX: 0.5,
                scaleY: 0.5,
                opacity: 0.9
            })
        })

        action('Method chaining', () => {
            const img = new Image2D({
                image: null,
                width: 64,
                height: 64
            })
            img.setPosition(100, 100)
                .setRotation(0.5)
                .setScale(2)
                .setOpacity(0.8)
            logger.log('position:', img.x, img.y)
            logger.log('rotation:', img.rotation)
            logger.log('scale:', img.scaleX, img.scaleY)
        })

    })

})
