import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Group2D from './group_2d.js'
import Rectangle from './rectangle.js'
import Circle from './circle.js'


export default doc('Group2D', () => {

    text(`
        Container for grouping [[Object2D@render]] instances.
        Transforms applied to the group affect all children.
        Use with [[CanvasRenderer@render]] or [[WebGLRenderer@render]] for rendering.
    `)


    section('Creation', () => {

        text('Create groups to organize and transform objects together.')

        code('Basic group', () => {
            const group = new Group2D()

            group.add(new Rectangle({
                x: -50,
                y: 0,
                width: 40,
                height: 40,
                color: '#e94560'
            }))

            group.add(new Rectangle({
                x: 50,
                y: 0,
                width: 40,
                height: 40,
                color: '#0f3460'
            }))
        })

        code('Positioned group', () => {
            const group = new Group2D({
                x: 100,
                y: 100,
                rotation: Math.PI / 4
            })
        })

    })


    section('Children', () => {

        text('Add, remove, and access children.')

        action('add / addChild', () => {
            const group = new Group2D()

            const rect = new Rectangle({width: 50, height: 50, color: '#e94560'})
            const circle = new Circle({radius: 25, color: '#0f3460'})

            group.add(rect, circle)
            logger.log('children count:', group.children.length)

            // addChild is an alias for add
            group.addChild(new Rectangle({width: 30, height: 30, color: '#533483'}))
            logger.log('after addChild:', group.children.length)
        })

        action('remove', () => {
            const group = new Group2D()
            const rect = new Rectangle({width: 50, height: 50, color: '#e94560'})

            group.add(rect)
            logger.log('before remove:', group.children.length)

            group.remove(rect)
            logger.log('after remove:', group.children.length)
            logger.log('child parent:', rect.parent)
        })

        action('Parent reference', () => {
            const group = new Group2D()
            const rect = new Rectangle({width: 50, height: 50, color: '#e94560'})

            group.add(rect)
            logger.log('rect.parent:', rect.parent === group)

            group.remove(rect)
            logger.log('after remove:', rect.parent)
        })

    })


    section('Transforms', () => {

        text('Group transforms are inherited by all children.')

        code('Group rotation', () => {
            const group = new Group2D({x: 200, y: 200})

            group.add(new Rectangle({x: -50, y: 0, width: 30, height: 30, color: '#e94560'}))
            group.add(new Rectangle({x: 50, y: 0, width: 30, height: 30, color: '#0f3460'}))

            // Rotating the group rotates both rectangles around (200, 200)
            group.rotation = Math.PI / 4
        })

        code('Group scale', () => {
            const group = new Group2D({x: 100, y: 100})

            group.add(new Circle({x: 0, y: 0, radius: 20, color: '#e94560'}))

            // Scaling the group scales the child
            group.scaleX = 2
            group.scaleY = 2
        })

        action('Nested groups', () => {
            const outer = new Group2D({x: 100, y: 100})
            const inner = new Group2D({x: 50, y: 0})

            inner.add(new Rectangle({width: 20, height: 20, color: '#e94560'}))
            outer.add(inner)

            logger.log('outer children:', outer.children.length)
            logger.log('inner children:', inner.children.length)
        })

    })


    section('Depth Sorting', () => {

        text('Children are sorted by depth for rendering order.')

        action('getSortedChildren', () => {
            const group = new Group2D()

            group.add(new Rectangle({width: 30, height: 30, color: '#e94560', depth: 2}))
            group.add(new Rectangle({width: 30, height: 30, color: '#0f3460', depth: 0}))
            group.add(new Rectangle({width: 30, height: 30, color: '#533483', depth: 1}))

            const sorted = group.getSortedChildren()
            logger.log('depths:', sorted.map(c => c.depth))
        })

        code('Depth example', () => {
            const group = new Group2D()

            // Background (rendered first)
            group.add(new Rectangle({
                width: 100,
                height: 100,
                color: '#1a1a2e',
                depth: 0
            }))

            // Foreground (rendered last, on top)
            group.add(new Circle({
                radius: 30,
                color: '#e94560',
                depth: 10
            }))
        })

    })


    section('Bounds', () => {

        text(`
            Group bounds are computed from all children's world-space bounds.
            Returns zero bounds if the group is empty or all children have zero size.
        `)

        action('Empty group', () => {
            const group = new Group2D()
            const bounds = group.getBounds()
            logger.log('empty bounds:', bounds.width, 'x', bounds.height)
        })

        action('With children', () => {
            const group = new Group2D()

            group.add(new Rectangle({x: -50, y: 0, width: 40, height: 40, color: '#e94560'}))
            group.add(new Rectangle({x: 50, y: 0, width: 40, height: 40, color: '#0f3460'}))

            // Force matrix update
            group.updateWorldMatrix()

            const bounds = group.getBounds()
            logger.log('minX:', bounds.minX)
            logger.log('maxX:', bounds.maxX)
            logger.log('width:', bounds.width)
        })

        action('Transformed group', () => {
            const group = new Group2D({scaleX: 2, scaleY: 2})

            group.add(new Rectangle({width: 50, height: 50, color: '#e94560'}))

            group.updateWorldMatrix()

            const bounds = group.getBounds()
            logger.log('width:', bounds.width, '(scaled 2x)')
            logger.log('height:', bounds.height, '(scaled 2x)')
        })

    })


    section('Matrix Updates', () => {

        text('World matrices propagate transforms through the hierarchy.')

        action('updateWorldMatrix', () => {
            const group = new Group2D({x: 100, y: 100})
            const child = new Rectangle({x: 50, y: 0, width: 30, height: 30, color: '#e94560'})
            group.add(child)

            group.updateWorldMatrix()

            const worldPos = child.transformPoint({x: 0, y: 0})
            logger.log('child world position:', worldPos.x, worldPos.y)
        })

        code('Matrix propagation', () => {
            const root = new Group2D({x: 100, y: 100})
            const child = new Group2D({x: 50, y: 50})
            const grandchild = new Rectangle({width: 20, height: 20, color: '#e94560'})

            child.add(grandchild)
            root.add(child)

            // Updates all matrices in hierarchy
            root.updateWorldMatrix()

            // grandchild is now at world position (150, 150)
        })

    })

})
