import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Object2D from './object_2d.js'


export default doc('Object2D', () => {

    text(`
        Base class for all 2D renderable objects. Extends [[Transform2D@render]].
        Provides visibility, opacity, depth sorting, anchors, and debug gizmos.

        Subclasses: [[Rectangle@render]], [[Circle@render]], [[Image2D@render]],
        [[Sprite2D@render]], [[Group2D@render]].
    `)


    section('Creation', () => {

        text('Object2D is typically subclassed, but can be instantiated directly.')

        code('Basic options', () => {
            const obj = new Object2D({
                x: 100,
                y: 100,
                rotation: Math.PI / 4,
                scaleX: 2,
                scaleY: 2
            })
        })

        code('Full options', () => {
            const obj = new Object2D({
                x: 100,
                y: 100,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                pivotX: 0,
                pivotY: 0,
                anchorX: 0.5,
                anchorY: 0.5,
                visible: true,
                opacity: 1,
                depth: 0,
                tint: '#ff0000'
            })
        })

    })


    section('Visibility', () => {

        text('Control whether objects are rendered and their transparency.')

        action('visible', () => {
            const obj = new Object2D()
            logger.log('default visible:', obj.visible)

            obj.visible = false
            logger.log('after hide:', obj.visible)

            obj.setVisible(true)
            logger.log('after setVisible:', obj.visible)
        })

        action('opacity', () => {
            const obj = new Object2D()
            logger.log('default opacity:', obj.opacity)

            obj.opacity = 0.5
            logger.log('after change:', obj.opacity)

            obj.setOpacity(0.8)
            logger.log('after setOpacity:', obj.opacity)
        })

    })


    section('Depth', () => {

        text('Depth controls rendering order within a parent. Higher depth renders on top.')

        action('depth', () => {
            const obj = new Object2D()
            logger.log('default depth:', obj.depth)

            obj.depth = 10
            logger.log('after change:', obj.depth)

            obj.setDepth(5)
            logger.log('after setDepth:', obj.depth)
        })

        code('Depth example', () => {
            // Background layer
            const bg = new Object2D({depth: 0})

            // Game objects
            const player = new Object2D({depth: 10})
            const enemy = new Object2D({depth: 10})

            // UI layer (always on top)
            const ui = new Object2D({depth: 100})
        })

    })


    section('Anchor', () => {

        text(`
            Anchor defines the origin point for positioning and bounds calculation.
            Values are normalized: (0,0) = top-left, (0.5,0.5) = center, (1,1) = bottom-right.
        `)

        action('anchorX / anchorY', () => {
            const obj = new Object2D()
            logger.log('default anchor:', obj.anchorX, obj.anchorY)

            obj.anchorX = 0
            obj.anchorY = 0
            logger.log('top-left:', obj.anchorX, obj.anchorY)

            obj.setAnchor(1, 1)
            logger.log('bottom-right:', obj.anchorX, obj.anchorY)

            obj.setAnchor(0.5)
            logger.log('center (single value):', obj.anchorX, obj.anchorY)
        })

        code('Common anchors', () => {
            // Center (default)
            const centered = new Object2D({anchorX: 0.5, anchorY: 0.5})

            // Top-left (traditional)
            const topLeft = new Object2D({anchorX: 0, anchorY: 0})

            // Bottom-center (for characters)
            const character = new Object2D({anchorX: 0.5, anchorY: 1})
        })

    })


    section('Pivot', () => {

        text('Pivot defines the rotation center point in local coordinates.')

        action('pivotX / pivotY', () => {
            const obj = new Object2D()
            logger.log('default pivot:', obj.pivotX, obj.pivotY)

            obj.pivotX = 50
            obj.pivotY = 50
            logger.log('after change:', obj.pivotX, obj.pivotY)

            obj.setPivot(25, 25)
            logger.log('after setPivot:', obj.pivotX, obj.pivotY)
        })

    })


    section('Transforms', () => {

        text('Position, rotation, and scale inherited from [[Transform2D@render]].')

        action('Position', () => {
            const obj = new Object2D({x: 100, y: 50})
            logger.log('initial:', obj.x, obj.y)

            obj.setPosition(200, 150)
            logger.log('after setPosition:', obj.x, obj.y)
        })

        action('Rotation', () => {
            const obj = new Object2D()
            logger.log('default rotation:', obj.rotation)

            obj.setRotation(Math.PI / 2)
            logger.log('after setRotation:', obj.rotation, 'radians')
        })

        action('Scale', () => {
            const obj = new Object2D()
            logger.log('default scale:', obj.scaleX, obj.scaleY)

            obj.setScale(2)
            logger.log('uniform scale:', obj.scaleX, obj.scaleY)

            obj.setScale(1.5, 2)
            logger.log('non-uniform:', obj.scaleX, obj.scaleY)
        })

    })


    section('Tint', () => {

        text('Apply a color tint to the object (renderer-dependent).')

        action('tint', () => {
            const obj = new Object2D()
            logger.log('default tint:', obj.tint)

            obj.tint = '#ff0000'
            logger.log('after set:', obj.tint)

            obj.tint = null
            logger.log('after clear:', obj.tint)
        })

        code('Tint at creation', () => {
            const obj = new Object2D({
                tint: '#ff6b6b'
            })
        })

    })


    section('Effects', () => {

        text('Access the [[SpriteEffectStack@render]] for post-processing effects.')

        action('effects', () => {
            const obj = new Object2D()

            // Accessing effects creates the stack lazily
            const stack = obj.effects
            logger.log('effects stack:', stack.constructor.name)
        })

        code('Adding effects', () => {
            const obj = new Object2D()

            // Effects are added to the stack
            obj.effects.add(myEffect)
        })

    })


    section('Debug Gizmos', () => {

        text('Visualize bounds, anchor, pivot, and origin for debugging.')

        action('showDebugGizmos / hideDebugGizmos', () => {
            const obj = new Object2D()
            logger.log('default gizmos:', obj.debugGizmos)

            obj.showDebugGizmos()
            logger.log('after show:', obj.debugGizmos)

            obj.hideDebugGizmos()
            logger.log('after hide:', obj.debugGizmos)
        })

        action('Selective gizmos', () => {
            const obj = new Object2D()

            obj.showDebugGizmos({
                bounds: true,
                anchor: true,
                pivot: false,
                origin: false
            })
            logger.log('selective:', obj.debugGizmos)
        })

        code('At creation', () => {
            const obj = new Object2D({
                debugGizmos: {
                    bounds: true,
                    anchor: true,
                    pivot: true,
                    origin: true
                }
            })
        })

    })


    section('Bounds', () => {

        text('Get local and world-space bounding boxes.')

        action('getBounds', () => {
            const obj = new Object2D()
            const bounds = obj.getBounds()
            logger.log('local bounds:', bounds)
        })

        action('getWorldBounds', () => {
            const obj = new Object2D({
                x: 100,
                y: 100,
                scaleX: 2,
                scaleY: 2
            })
            obj.updateWorldMatrix()

            const worldBounds = obj.getWorldBounds()
            logger.log('world bounds:', worldBounds)
        })

        code('Bounds structure', () => {
            // Bounds object format
            const bounds = {
                minX: -50,
                minY: -25,
                maxX: 50,
                maxY: 25,
                width: 100,
                height: 50
            }
        })

    })


    section('Method Chaining', () => {

        text('Setter methods return `this` for chaining.')

        action('Chained calls', () => {
            const obj = new Object2D()

            obj.setPosition(100, 100)
                .setRotation(Math.PI / 4)
                .setScale(2)
                .setOpacity(0.8)
                .setDepth(10)
                .setAnchor(0.5)
                .showDebugGizmos()

            logger.log('position:', obj.x, obj.y)
            logger.log('rotation:', obj.rotation)
            logger.log('scale:', obj.scaleX)
            logger.log('opacity:', obj.opacity)
            logger.log('depth:', obj.depth)
        })

    })

})
