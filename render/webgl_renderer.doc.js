import {doc, section, text, code, container} from '../doc/runtime.js'
import WebGLRenderer from './webgl_renderer.js'
import Rectangle from './rectangle.js'
import Circle from './circle.js'
import Group2D from './group_2d.js'
import Sprite from './sprite.js'


export default doc('WebGLRenderer', {featured: true}, () => {

    text(`
        WebGL2-based 2D renderer. Renders scenes with [[Rectangle@render]], [[Circle@render]], [[Sprite@render]],
        and supports post-processing effects, render groups, and shader customization.
    `)


    section('Basic Setup', () => {

        text(`
            Create a renderer and mount it to a container.
            The renderer automatically creates a canvas element.
        `)

        container({title: 'Simple rectangle', height: 200}, ctx => {
            const renderer = new WebGLRenderer({
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

            ctx.setApp(renderer, scene)
        })

    })


    section('Shapes', () => {

        text('Render multiple shapes with different colors and positions.')

        container({title: 'Circles and rectangles', height: 200}, ctx => {
            const renderer = new WebGLRenderer({
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

            ctx.setApp(renderer, scene)
        })

    })


    section('Transformations', () => {

        text('Objects support position, rotation, scale, and anchor point.')

        container({title: 'Rotated shapes', height: 200}, ctx => {
            const renderer = new WebGLRenderer({
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
                y: 0
            })

            const rect2 = new Rectangle({
                width: 3,
                height: 1.5,
                color: '#0f3460',
                x: 0,
                y: 0
            })

            const rect3 = new Rectangle({
                width: 3,
                height: 1.5,
                color: '#533483',
                x: 5,
                y: 0
            })

            scene.add(rect1, rect2, rect3)

            ctx.slider('rotation', {min: -180, max: 180, default: 0}, value => {
                const rad = value * Math.PI / 180
                rect1.rotation = rad
                rect2.rotation = rad
                rect3.rotation = rad
                renderer.render(scene)
            })

            ctx.setApp(renderer, scene)
        })

    })


    section('Groups', () => {

        text('Use [[Group2D@render]] to group objects and apply transformations to all children.')

        container({title: 'Nested groups', height: 200}, ctx => {
            const renderer = new WebGLRenderer({
                container: ctx.container,
                autoFit: true,
                backgroundColor: '#1a1a2e'
            })

            const scene = new Group2D()

            const group = new Group2D({x: 0, y: 0})

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

            ctx.slider('rotation', {min: -180, max: 180, default: 0}, value => {
                group.rotation = value * Math.PI / 180
                renderer.render(scene)
            })

            ctx.slider('scale', {min: 0.5, max: 2, default: 1}, value => {
                group.scaleX = value
                group.scaleY = value
                renderer.render(scene)
            })

            ctx.setApp(renderer, scene)
        })

        container({title: 'Articulated chain', height: 200}, ctx => {
            const renderer = new WebGLRenderer({
                container: ctx.container,
                autoFit: true,
                backgroundColor: '#1a1a2e'
            })

            const scene = new Group2D()
            const segments = []
            const segmentCount = 6
            const segmentLength = 1.5

            let parent = scene
            const colors = ['#e94560', '#0f3460', '#533483', '#f39c12', '#1abc9c', '#9b59b6']

            for (let i = 0; i < segmentCount; i++) {
                const group = new Group2D({x: i === 0 ? 0 : segmentLength, y: 0})

                group.add(new Rectangle({
                    width: segmentLength,
                    height: 0.4,
                    color: colors[i % colors.length],
                    anchorX: 0,
                    anchorY: 0.5,
                    x: 0,
                    y: 0
                }))

                group.add(new Circle({
                    radius: 0.15,
                    color: '#ffffff',
                    x: 0,
                    y: 0
                }))

                parent.add(group)
                segments.push(group)
                parent = group
            }

            renderer.render(scene)

            ctx.slider('rotation', {min: -45, max: 45, default: 0}, value => {
                const rad = value * Math.PI / 180
                for (const segment of segments) {
                    segment.rotation = rad
                }
                renderer.render(scene)
            })

            ctx.setApp(renderer, scene)
        })

    })


    section('Camera', () => {

        text('The camera controls the view position and zoom level.')

        container({title: 'Camera zoom', height: 200}, ctx => {
            const renderer = new WebGLRenderer({
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

            ctx.slider('zoom', {min: 0.5, max: 3, default: 1}, value => {
                renderer.camera.zoom = value
                renderer.render(scene)
            })

            ctx.slider('pan X', {min: -10, max: 10, default: 0}, value => {
                renderer.camera.x = value
                renderer.render(scene)
            })

            ctx.setApp(renderer, scene)
        })

        container({title: 'Camera pan', height: 200}, ctx => {
            const renderer = new WebGLRenderer({
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

            ctx.action('Center', () => {
                renderer.camera.x = 0
                renderer.camera.y = 0
                renderer.render(scene)
            })

            ctx.action('Offset (3, 2)', () => {
                renderer.camera.x = 3
                renderer.camera.y = 2
                renderer.render(scene)
            })

            ctx.setApp(renderer, scene)
        })

    })


    section('Images', () => {

        text('Render images and sprites using [[Sprite@render]] objects.')

        container({title: 'Sprite rendering', height: 200}, ctx => {
            const renderer = new WebGLRenderer({
                container: ctx.container,
                autoFit: true,
                backgroundColor: '#1a1a2e'
            })

            const scene = new Group2D()

            const shroomImage = new Image()
            shroomImage.src = './assets/images/shroom.png'

            shroomImage.onload = () => {
                const sprite = new Sprite({
                    x: 0,
                    y: 0,
                    width: 7,
                    height: 7,
                    anchorX: 0.5,
                    anchorY: 0.5,
                    image: shroomImage
                })

                scene.add(sprite)
                renderer.render(scene)
            }

            ctx.setApp(renderer, scene)
        })

    })


    section('Debug Gizmos', () => {

        text('Enable debug gizmos to visualize bounding boxes and object origins.')

        container({title: 'Debug visualization', height: 200}, ctx => {
            const renderer = new WebGLRenderer({
                container: ctx.container,
                autoFit: true,
                backgroundColor: '#1a1a2e',
                enableDebugGizmos: true
            })

            const scene = new Group2D()

            const rect = new Rectangle({
                width: 4,
                height: 2,
                color: '#e94560',
                x: -3,
                y: 0
            })
            rect.showDebugGizmos()

            const circle = new Circle({
                radius: 1.5,
                color: '#0f3460',
                x: 3,
                y: 0
            })
            circle.showDebugGizmos()

            scene.add(rect, circle)
            renderer.render(scene)

            ctx.action('Gizmos On', () => {
                rect.showDebugGizmos()
                circle.showDebugGizmos()
                renderer.render(scene)
            })

            ctx.action('Gizmos Off', () => {
                rect.hideDebugGizmos()
                circle.hideDebugGizmos()
                renderer.render(scene)
            })

            ctx.setApp(renderer, scene)
        })

    })


    section('Background', () => {

        text('Set a background color or use transparent.')

        code('Background options', () => {
            // Solid color
            const renderer1 = new WebGLRenderer({
                backgroundColor: '#1a1a2e'
            })

            // Transparent (default)
            const renderer2 = new WebGLRenderer({
                backgroundColor: 'transparent'
            })

            // Or set later
            renderer1.backgroundColor = '#ff0000'
        })

    })

})
