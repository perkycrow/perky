import {doc, section, setup, text, code, action, logger} from '../doc/runtime.js'
import Matrix4 from './matrix4.js'
import Quaternion from './quaternion.js'
import Vec3 from './vec3.js'


export default doc('Matrix4', () => {

    text(`
        4x4 transformation matrix for 3D graphics.
        Column-major layout (WebGL-compatible). Methods return \`this\` for chaining.
    `)


    code('Creation', () => {
        const identity = new Matrix4()
        const fromElements = new Matrix4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ])
    })


    section('Basic transforms', () => {

        action('Translation', () => {
            const mat = new Matrix4()
            mat.makeTranslation(10, 5, 3)
            const point = {x: 0, y: 0, z: 0}
            mat.transformPoint(point)
            logger.log('translated:', point)
        })

        action('Scale', () => {
            const mat = new Matrix4()
            mat.makeScale(2, 3, 4)
            const point = {x: 1, y: 1, z: 1}
            mat.transformPoint(point)
            logger.log('scaled:', point)
        })

        action('Rotation X', () => {
            const mat = new Matrix4()
            mat.makeRotationX(Math.PI / 2)
            const point = {x: 0, y: 1, z: 0}
            mat.transformPoint(point)
            logger.log('rotated:', point)
        })

        action('Rotation Y', () => {
            const mat = new Matrix4()
            mat.makeRotationY(Math.PI / 2)
            const point = {x: 1, y: 0, z: 0}
            mat.transformPoint(point)
            logger.log('rotated:', point)
        })

    })


    section('Compose / Decompose', () => {

        text('Combine position, rotation, and scale into a single matrix.')

        action('compose', () => {
            const mat = new Matrix4()
            const position = {x: 10, y: 5, z: 0}
            const rotation = new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), Math.PI / 4)
            const scale = {x: 2, y: 2, z: 2}
            mat.compose(position, rotation, scale)
            logger.log('composed matrix determinant:', mat.determinant())
        })

        action('decompose', () => {
            const mat = new Matrix4()
            mat.compose(
                {x: 10, y: 5, z: 3},
                new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), Math.PI / 4),
                {x: 2, y: 3, z: 4}
            )
            const pos = {x: 0, y: 0, z: 0}
            const rot = new Quaternion()
            const scl = {x: 0, y: 0, z: 0}
            mat.decompose(pos, rot, scl)
            logger.log('position:', pos)
            logger.log('scale:', scl)
        })

    })


    section('Camera matrices', () => {

        action('Perspective', () => {
            const mat = new Matrix4()
            const fov = Math.PI / 4
            const aspect = 16 / 9
            mat.makePerspective(fov, aspect, 0.1, 100)
            logger.log('perspective [0]:', mat.elements[0].toFixed(4))
            logger.log('perspective [5]:', mat.elements[5].toFixed(4))
        })

        action('Orthographic', () => {
            const mat = new Matrix4()
            mat.makeOrthographic(-10, 10, -10, 10, 0.1, 100)
            logger.log('orthographic [0]:', mat.elements[0].toFixed(4))
            logger.log('orthographic [5]:', mat.elements[5].toFixed(4))
        })

        action('Look at', () => {
            const mat = new Matrix4()
            const eye = {x: 0, y: 5, z: 10}
            const target = {x: 0, y: 0, z: 0}
            const up = {x: 0, y: 1, z: 0}
            mat.makeLookAt(eye, target, up)
            logger.log('view matrix determinant:', mat.determinant().toFixed(4))
        })

    })


    section('Matrix operations', () => {

        setup(ctx => {
            ctx.a = new Matrix4().makeTranslation(5, 0, 0)
            ctx.b = new Matrix4().makeScale(2, 2, 2)
        })

        action('Multiply', ctx => {
            const result = ctx.a.clone().multiply(ctx.b)
            const point = {x: 1, y: 0, z: 0}
            result.transformPoint(point)
            logger.log('translate then scale:', point)
        })

        action('Invert', () => {
            const mat = new Matrix4().makeTranslation(10, 5, 3)
            const inv = mat.clone().invert()
            const point = {x: 10, y: 5, z: 3}
            inv.transformPoint(point)
            logger.log('inverted translation:', point)
        })

        action('Transpose', () => {
            const mat = new Matrix4().makeTranslation(1, 2, 3)
            logger.log('before [12]:', mat.elements[12])
            mat.transpose()
            logger.log('after [12]:', mat.elements[12])
            logger.log('after [3]:', mat.elements[3])
        })

        action('Determinant', () => {
            const identity = new Matrix4()
            const scaled = new Matrix4().makeScale(2, 3, 4)
            logger.log('identity det:', identity.determinant())
            logger.log('scaled det:', scaled.determinant())
        })

    })

})
