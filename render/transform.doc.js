import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Transform from './transform.js'


export default doc('Transform', () => {

    text(`
        Low-level 2D transformation class with matrix math.
        Provides position, rotation, scale, pivot, and hierarchical transforms.

        Extended by [[Object2D@render]] which adds rendering properties.
    `)


    section('Properties', () => {

        text('Basic transform properties. Changes automatically mark the matrix as dirty.')

        action('Position', () => {
            const t = new Transform()
            logger.log('default x:', t.x)
            logger.log('default y:', t.y)

            t.x = 100
            t.y = 50
            logger.log('after set:', t.x, t.y)
        })

        action('Rotation', () => {
            const t = new Transform()
            logger.log('default rotation:', t.rotation)

            t.rotation = Math.PI / 4
            logger.log('45 degrees:', t.rotation, 'radians')

            t.rotation = Math.PI
            logger.log('180 degrees:', t.rotation, 'radians')
        })

        action('Scale', () => {
            const t = new Transform()
            logger.log('default scale:', t.scaleX, t.scaleY)

            t.scaleX = 2
            t.scaleY = 0.5
            logger.log('after set:', t.scaleX, t.scaleY)
        })

        action('Pivot', () => {
            const t = new Transform()
            logger.log('default pivot:', t.pivotX, t.pivotY)

            t.pivotX = 50
            t.pivotY = 25
            logger.log('after set:', t.pivotX, t.pivotY)
        })

    })


    section('Hierarchy', () => {

        text('Transform supports parent-child relationships for nested transforms.')

        action('add / remove', () => {
            const parent = new Transform()
            const child1 = new Transform()
            const child2 = new Transform()

            parent.add(child1, child2)
            logger.log('children count:', parent.children.length)
            logger.log('child1 parent:', child1.parent === parent)

            parent.remove(child1)
            logger.log('after remove:', parent.children.length)
            logger.log('child1 parent:', child1.parent)
        })

        action('Reparenting', () => {
            const parent1 = new Transform()
            const parent2 = new Transform()
            const child = new Transform()

            parent1.add(child)
            logger.log('initial parent:', child.parent === parent1)

            parent2.add(child)
            logger.log('new parent:', child.parent === parent2)
            logger.log('parent1 children:', parent1.children.length)
        })

    })


    section('Depth Sorting', () => {

        text('Children can be sorted by depth for rendering order.')

        action('getSortedChildren', () => {
            const parent = new Transform()

            const a = new Transform()
            const b = new Transform()
            const c = new Transform()

            a.depth = 10
            b.depth = 0
            c.depth = 5

            parent.add(a, b, c)

            const sorted = parent.getSortedChildren()
            logger.log('sorted depths:', sorted.map(child => child.depth))
        })

    })


    section('Matrices', () => {

        text(`
            Transform uses 2x3 affine matrices stored as 6-element arrays:
            \`[a, b, c, d, tx, ty]\` representing the matrix:
            \`\`\`
            | a  c  tx |
            | b  d  ty |
            | 0  0  1  |
            \`\`\`
        `)

        action('worldMatrix', () => {
            const t = new Transform()
            t.x = 100
            t.y = 50
            t.updateWorldMatrix()

            logger.log('worldMatrix:', t.worldMatrix)
        })

        action('updateWorldMatrix', () => {
            const parent = new Transform()
            parent.x = 100
            parent.y = 100

            const child = new Transform()
            child.x = 50
            child.y = 0

            parent.add(child)
            parent.updateWorldMatrix()

            logger.log('parent matrix:', parent.worldMatrix)
            logger.log('child matrix:', child.worldMatrix)
        })

        code('Matrix propagation', () => {
            const root = new Transform()
            root.x = 100

            const child = new Transform()
            child.x = 50

            root.add(child)

            // Updates all matrices in hierarchy
            root.updateWorldMatrix()

            // child.worldMatrix now includes parent's translation
            // child is at world position (150, 0)
        })

    })


    section('Dirty Flag', () => {

        text(`
            Transforms use a dirty flag for efficient matrix updates.
            Changes to properties automatically mark the transform and its children dirty.
        `)

        action('markDirty', () => {
            const parent = new Transform()
            const child = new Transform()
            parent.add(child)

            parent.updateWorldMatrix()
            logger.log('matrices updated')

            // Changing a property marks dirty
            parent.x = 200
            logger.log('parent.x changed, hierarchy marked dirty')

            // Next updateWorldMatrix will recalculate
            parent.updateWorldMatrix()
            logger.log('matrices recalculated')
        })

        code('Dirty propagation', () => {
            const parent = new Transform()
            const child = new Transform()
            const grandchild = new Transform()

            child.add(grandchild)
            parent.add(child)

            // Changing parent marks all descendants dirty
            parent.rotation = Math.PI / 2

            // updateWorldMatrix recalculates the entire hierarchy
            parent.updateWorldMatrix()
        })

    })


    section('Point Transformation', () => {

        text('Transform local points to world space using the world matrix.')

        action('transformPoint', () => {
            const t = new Transform()
            t.x = 100
            t.y = 50
            t.rotation = Math.PI / 2
            t.updateWorldMatrix()

            const local = {x: 10, y: 0}
            const world = t.transformPoint(local)

            logger.log('local point:', local.x, local.y)
            logger.log('world point:', world.x.toFixed(2), world.y.toFixed(2))
        })

        action('With custom matrix', () => {
            const t = new Transform()

            // Identity matrix with translation
            const customMatrix = [1, 0, 0, 1, 200, 100]

            const local = {x: 0, y: 0}
            const transformed = t.transformPoint(local, customMatrix)

            logger.log('transformed:', transformed.x, transformed.y)
        })

    })


    section('Rotation and Scale', () => {

        text('Rotation is applied around the pivot point.')

        action('Rotation with pivot', () => {
            const t = new Transform()
            t.pivotX = 50
            t.pivotY = 0
            t.rotation = Math.PI / 2
            t.updateWorldMatrix()

            const origin = {x: 0, y: 0}
            const pivotPoint = {x: 50, y: 0}

            logger.log('origin in world:', t.transformPoint(origin))
            logger.log('pivot in world:', t.transformPoint(pivotPoint))
        })

        action('Combined transforms', () => {
            const t = new Transform()
            t.x = 100
            t.y = 100
            t.rotation = Math.PI / 4
            t.scaleX = 2
            t.scaleY = 2
            t.updateWorldMatrix()

            const point = {x: 10, y: 0}
            const result = t.transformPoint(point)

            logger.log('local:', point.x, point.y)
            logger.log('world:', result.x.toFixed(2), result.y.toFixed(2))
        })

    })

})
