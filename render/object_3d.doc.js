import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import Object3D from './object_3d.js'


export default doc('Object3D', () => {

    text(`
        Base class for 3D scene graph objects. Handles position, rotation (quaternion),
        scale, visibility, opacity, and depth. Supports parent-child hierarchies
        with automatic world matrix propagation.
    `)


    section('Creation', () => {

        text('Create objects with optional position, scale, and visibility.')

        code('Basic options', () => {
            const obj = new Object3D({
                x: 1,
                y: 2,
                z: 3,
                scaleX: 2,
                scaleY: 2,
                scaleZ: 2
            })
        })

        code('Full options', () => {
            const obj = new Object3D({
                x: 0,
                y: 0,
                z: 0,
                scaleX: 1,
                scaleY: 1,
                scaleZ: 1,
                visible: true,
                opacity: 1,
                depth: 0
            })
        })

    })


    section('Position', () => {

        text('Position is stored as a Vec3.')

        action('Position access', () => {
            const obj = new Object3D({x: 10, y: 20, z: 30})

            logger.log('x:', obj.position.x)
            logger.log('y:', obj.position.y)
            logger.log('z:', obj.position.z)

            obj.position.set(5, 10, 15)
            logger.log('after set:', obj.position.x, obj.position.y, obj.position.z)
        })

    })


    section('Rotation', () => {

        text('Rotation uses quaternions for smooth interpolation and gimbal-lock avoidance.')

        action('Quaternion rotation', () => {
            const obj = new Object3D()

            logger.log('default:', obj.rotation.x, obj.rotation.y, obj.rotation.z, obj.rotation.w)

            obj.rotation.setFromAxisAngle({x: 0, y: 1, z: 0}, Math.PI / 2)
            logger.log('after 90° Y rotation:', obj.rotation.w.toFixed(3))
        })

    })


    section('Scale', () => {

        text('Scale is stored as a Vec3.')

        action('Scale access', () => {
            const obj = new Object3D({scaleX: 2, scaleY: 3, scaleZ: 4})

            logger.log('scale:', obj.scale.x, obj.scale.y, obj.scale.z)

            obj.scale.set(1, 1, 1)
            logger.log('after reset:', obj.scale.x, obj.scale.y, obj.scale.z)
        })

    })


    section('Visibility and Opacity', () => {

        text('Control rendering visibility and transparency.')

        action('Visibility', () => {
            const obj = new Object3D()

            logger.log('default visible:', obj.visible)
            obj.visible = false
            logger.log('after hide:', obj.visible)
        })

        action('Opacity', () => {
            const obj = new Object3D()

            logger.log('default opacity:', obj.opacity)
            obj.opacity = 0.5
            logger.log('after change:', obj.opacity)
        })

    })


    section('Depth', () => {

        text('Depth controls rendering order among siblings.')

        action('Depth sorting', () => {
            const parent = new Object3D()
            const back = new Object3D({depth: 0})
            const front = new Object3D({depth: 10})

            parent.addChild(front)
            parent.addChild(back)

            const sorted = parent.getSortedChildren()
            logger.log('first depth:', sorted[0].depth)
            logger.log('second depth:', sorted[1].depth)
        })

    })


    section('Hierarchy', () => {

        text('Objects form a scene graph with parent-child relationships.')

        action('addChild / removeChild', () => {
            const parent = new Object3D()
            const child = new Object3D()

            parent.addChild(child)
            logger.log('children:', parent.children.length)
            logger.log('child parent:', child.parent === parent)

            parent.removeChild(child)
            logger.log('after remove:', parent.children.length)
            logger.log('child parent:', child.parent)
        })

        code('Nested hierarchy', () => {
            const root = new Object3D()
            const level1 = new Object3D()
            const level2 = new Object3D()

            root.addChild(level1)
            level1.addChild(level2)
        })

    })


    section('Matrices', () => {

        text(`
            Local and world matrices are computed from position, rotation, and scale.
            Call updateWorldMatrix() to propagate transforms through the hierarchy.
        `)

        action('Matrix update', () => {
            const parent = new Object3D({x: 10})
            const child = new Object3D({x: 5})
            parent.addChild(child)

            parent.updateWorldMatrix()

            logger.log('parent world x:', parent.worldMatrix.elements[12])
            logger.log('child world x:', child.worldMatrix.elements[12])
        })

        action('markDirty', () => {
            const obj = new Object3D()
            obj.updateWorldMatrix()

            obj.position.x = 100
            obj.markDirty()

            logger.log('position changed, marked dirty')
        })

    })


    section('API', () => {

        code('Constructor', () => {
            const obj = new Object3D({
                x: 0,
                y: 0,
                z: 0,
                scaleX: 1,
                scaleY: 1,
                scaleZ: 1,
                visible: true,
                opacity: 1,
                depth: 0
            })
        })

        code('Properties', () => {
            obj.position
            obj.rotation
            obj.scale
            obj.visible
            obj.opacity
            obj.depth
            obj.parent
            obj.children
            obj.localMatrix
            obj.worldMatrix
        })

        code('Methods', () => {
            obj.addChild(child)
            obj.removeChild(child)
            obj.markDirty()
            obj.updateLocalMatrix()
            obj.updateWorldMatrix(force)
            obj.getSortedChildren()
        })

    })

})
