import {doc, section, text, code, container, logger} from '../doc/runtime.js'
import WebGLCanvas2D from './webgl_canvas_2d.js'
import Rectangle from './rectangle.js'
import Circle from './circle.js'
import Group2D from './group_2d.js'


export default doc('WebGLCanvas2D', () => {

    text(`
        WebGL2-based 2D renderer. Renders scenes with rectangles, circles, sprites,
        and supports post-processing effects, render groups, and shader customization.
    `)


    section('Basic Setup', () => {

        text(`
            Create a renderer and mount it to a container.
            The renderer automatically creates a canvas element.
        `)

        container({title: 'Simple rectangle', width: 400, height: 200}, ctx => {
            const renderer = new WebGLCanvas2D({
                container: ctx.container,
                autoFit: true,
                backgroundColor: '#1a1a2e'
            })

            const scene = new Group2D()

            const rect = new Rectangle({
                width: 4,
                height: 2,
                color: '#e94560',
                x: 0,
                y: 0
            })

            scene.add(rect)
            renderer.render(scene)

            ctx.setApp(renderer)

            logger.log('canvas:', renderer.canvas.width, 'x', renderer.canvas.height)
        })

    })


    section('Shapes', () => {

        text('Render multiple shapes with different colors and positions.')

        container({title: 'Circles and rectangles', width: 400, height: 200}, ctx => {
            const renderer = new WebGLCanvas2D({
                container: ctx.container,
                autoFit: true,
                backgroundColor: '#16213e'
            })

            const scene = new Group2D()

            scene.add(new Rectangle({
                width: 3,
                height: 3,
                color: '#e94560',
                x: -5,
                y: 0
            }))

            scene.add(new Circle({
                radius: 1.5,
                color: '#0f3460',
                x: 0,
                y: 0
            }))

            scene.add(new Rectangle({
                width: 2,
                height: 4,
                color: '#533483',
                x: 5,
                y: 0
            }))

            renderer.render(scene)
            ctx.setApp(renderer)
        })

    })


    section('Transformations', () => {

        text('Objects support position, rotation, scale, and anchor point.')

        container({title: 'Rotated shapes', width: 400, height: 200}, ctx => {
            const renderer = new WebGLCanvas2D({
                container: ctx.container,
                autoFit: true,
                backgroundColor: '#1a1a2e'
            })

            const scene = new Group2D()

            const rect1 = new Rectangle({
                width: 3,
                height: 1.5,
                color: '#e94560',
                x: -5,
                y: 0,
                rotation: Math.PI / 6
            })

            const rect2 = new Rectangle({
                width: 3,
                height: 1.5,
                color: '#0f3460',
                x: 0,
                y: 0,
                rotation: Math.PI / 4
            })

            const rect3 = new Rectangle({
                width: 3,
                height: 1.5,
                color: '#533483',
                x: 5,
                y: 0,
                rotation: -Math.PI / 6,
                scaleX: 1.2,
                scaleY: 0.8
            })

            scene.add(rect1, rect2, rect3)
            renderer.render(scene)
            ctx.setApp(renderer)
        })

    })


    section('Groups', () => {

        text('Group objects together to apply transformations to all children.')

        container({title: 'Nested groups', width: 400, height: 200}, ctx => {
            const renderer = new WebGLCanvas2D({
                container: ctx.container,
                autoFit: true,
                backgroundColor: '#1a1a2e'
            })

            const scene = new Group2D()

            const group = new Group2D({x: 0, y: 0, rotation: Math.PI / 8})

            group.add(new Rectangle({
                width: 2.5,
                height: 2.5,
                color: '#e94560',
                x: -3,
                y: 0
            }))

            group.add(new Rectangle({
                width: 2.5,
                height: 2.5,
                color: '#0f3460',
                x: 3,
                y: 0
            }))

            scene.add(group)
            renderer.render(scene)
            ctx.setApp(renderer)

            logger.log('group rotation:', (group.rotation * 180 / Math.PI).toFixed(0) + '°')
        })

    })


    section('Camera', () => {

        text('The camera controls the view position and zoom level.')

        container({title: 'Camera zoom', width: 400, height: 200}, ctx => {
            const renderer = new WebGLCanvas2D({
                container: ctx.container,
                autoFit: true,
                backgroundColor: '#16213e'
            })

            const scene = new Group2D()

            for (let i = 0; i < 5; i++) {
                scene.add(new Circle({
                    radius: 1,
                    color: `hsl(${i * 60}, 70%, 50%)`,
                    x: (i - 2) * 3,
                    y: 0
                }))
            }

            renderer.camera.zoom = 1.5
            renderer.render(scene)
            ctx.setApp(renderer)

            logger.log('zoom:', renderer.camera.zoom + 'x')
        })

        container({title: 'Camera pan', width: 400, height: 200}, ctx => {
            const renderer = new WebGLCanvas2D({
                container: ctx.container,
                autoFit: true,
                backgroundColor: '#16213e'
            })

            const scene = new Group2D()

            scene.add(new Rectangle({
                width: 4,
                height: 4,
                color: '#e94560',
                x: 0,
                y: 0
            }))

            scene.add(new Circle({
                radius: 1.2,
                color: '#533483',
                x: 0,
                y: 0
            }))

            renderer.camera.x = 3
            renderer.camera.y = 2
            renderer.render(scene)
            ctx.setApp(renderer)

            logger.log('camera pos:', renderer.camera.x, renderer.camera.y)
        })

    })


    section('Background', () => {

        text('Set a background color or use transparent.')

        code('Background options', () => {
            // Solid color
            const renderer1 = new WebGLCanvas2D({
                backgroundColor: '#1a1a2e'
            })

            // Transparent (default)
            const renderer2 = new WebGLCanvas2D({
                backgroundColor: 'transparent'
            })

            // Or set later
            renderer1.backgroundColor = '#ff0000'
        })

    })

})
