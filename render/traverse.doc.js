import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import {traverseAndCollect} from './traverse.js'
import Group2D from './group_2d.js'
import Rectangle from './rectangle.js'
import Circle from './circle.js'


export default doc('Traverse', () => {

    text(`
        Recursive scene graph traversal used by renderers.
        Walks the object hierarchy, checks visibility, applies frustum culling,
        propagates opacity, and routes each object to its registered renderer.
    `)


    section('Basic Traversal', () => {

        text(`
            \`traverseAndCollect\` takes a root object, a renderer registry, and optional settings.
            It visits every visible node depth-first and calls \`collect\` on the matching renderer.
        `)

        code('Minimal setup', () => {
            const scene = new Group2D()

            scene.add(new Rectangle({x: -40, y: 0, width: 30, height: 30, color: '#e94560'}))
            scene.add(new Circle({x: 40, y: 0, radius: 15, color: '#0f3460'}))

            // The renderer calls traverseAndCollect internally
            // traverseAndCollect(scene, rendererRegistry)
        })

    })


    section('Visibility', () => {

        text(`
            Invisible objects are skipped entirely, including their children.
            This is the cheapest way to hide a branch of the scene graph.
        `)

        code('Hiding a branch', () => {
            const scene = new Group2D()
            const enemies = new Group2D()

            enemies.add(new Rectangle({width: 20, height: 20, color: '#e94560'}))
            enemies.add(new Rectangle({width: 20, height: 20, color: '#e94560'}))

            scene.add(enemies)

            // Hides the entire group and all its children
            enemies.visible = false
        })

    })


    section('Opacity Propagation', () => {

        text(`
            Parent opacity multiplies down the hierarchy.
            A child with opacity 0.5 inside a parent with opacity 0.5 renders at 0.25.
        `)

        action('Opacity multiplication', () => {
            const parent = new Group2D()
            parent.opacity = 0.5

            const child = new Rectangle({width: 30, height: 30, color: '#e94560'})
            child.opacity = 0.5
            parent.add(child)

            logger.log('parent opacity:', parent.opacity)
            logger.log('child opacity:', child.opacity)
            logger.log('effective child opacity:', parent.opacity * child.opacity)
        })

    })


    section('Depth Sorting', () => {

        text(`
            Children are sorted by depth before traversal.
            Lower depth values render first (behind), higher values render last (in front).
        `)

        action('Sorted rendering order', () => {
            const scene = new Group2D()

            const background = new Rectangle({width: 100, height: 100, color: '#1a1a2e', depth: 0})
            const midground = new Rectangle({width: 60, height: 60, color: '#16213e', depth: 5})
            const foreground = new Circle({radius: 20, color: '#e94560', depth: 10})

            scene.add(foreground, background, midground)

            const sorted = scene.getSortedChildren()
            logger.log('render order:', sorted.map(c => c.depth))
        })

    })


    section('Frustum Culling', () => {

        text(`
            When a camera is provided with \`enableCulling: true\`, objects outside
            the camera viewport are skipped. Culled parents skip their children too.
        `)

        code('Enabling culling', () => {
            // traverseAndCollect(scene, registry, {
            //     camera: myCamera,
            //     enableCulling: true
            // })
        })

    })


    section('Stats', () => {

        text(`
            Pass a stats object to track traversal metrics.
            Useful for performance monitoring and debugging.
        `)

        action('Tracking stats', () => {
            const stats = {totalObjects: 0, culledObjects: 0, renderedObjects: 0}

            logger.log('stats shape:', Object.keys(stats).join(', '))
            logger.log('totalObjects: visible objects visited')
            logger.log('culledObjects: objects skipped by frustum culling')
            logger.log('renderedObjects: objects passed to renderers')
        })

        code('Passing stats', () => {
            const stats = {totalObjects: 0, culledObjects: 0, renderedObjects: 0}

            // traverseAndCollect(scene, registry, {stats})
            //
            // After traversal:
            // stats.totalObjects    → total visible objects visited
            // stats.culledObjects   → objects outside camera
            // stats.renderedObjects → objects sent to renderers
        })

    })

})
