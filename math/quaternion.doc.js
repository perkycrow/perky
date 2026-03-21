import {doc, section, setup, text, code, action, logger} from '../doc/runtime.js'
import Quaternion from './quaternion.js'
import Vec3 from './vec3.js'


export default doc('Quaternion', () => {

    text(`
        Mutable quaternion for 3D rotations.
        Avoids gimbal lock and enables smooth interpolation.
    `)


    code('Creation', () => {
        const q = new Quaternion()
        const fromValues = new Quaternion(0, 0, 0, 1)
        const fromObject = new Quaternion({x: 0, y: 0, z: 0, w: 1})
        const fromArray = new Quaternion([0, 0, 0, 1])
    })


    section('From axis-angle', () => {

        text('Create a rotation around an arbitrary axis.')

        action('90° around Y', () => {
            const q = new Quaternion()
            const axis = new Vec3(0, 1, 0)
            q.setFromAxisAngle(axis, Math.PI / 2)
            logger.log('quaternion:', q)
        })

        action('45° around X', () => {
            const q = new Quaternion()
            const axis = new Vec3(1, 0, 0)
            q.setFromAxisAngle(axis, Math.PI / 4)
            logger.log('quaternion:', q)
        })

    })


    section('From Euler angles', () => {

        text('Convert Euler angles to quaternion. Default order is YXZ.')

        action('Pitch 45°', () => {
            const q = new Quaternion()
            q.setFromEuler(Math.PI / 4, 0, 0)
            logger.log('quaternion:', q)
        })

        action('Yaw 90°', () => {
            const q = new Quaternion()
            q.setFromEuler(0, Math.PI / 2, 0)
            logger.log('quaternion:', q)
        })

    })


    section('Rotate a vector', () => {

        setup(ctx => {
            ctx.q = new Quaternion()
            ctx.q.setFromAxisAngle(new Vec3(0, 1, 0), Math.PI / 2)
        })

        action('Rotate (1, 0, 0) by 90° Y', ctx => {
            const v = new Vec3(1, 0, 0)
            logger.log('before:', v.clone())
            ctx.q.rotateVec3(v)
            logger.log('after:', v)
        })

        action('Rotate (0, 0, 1) by 90° Y', ctx => {
            const v = new Vec3(0, 0, 1)
            logger.log('before:', v.clone())
            ctx.q.rotateVec3(v)
            logger.log('after:', v)
        })

    })


    section('Interpolation', () => {

        text('Spherical linear interpolation (slerp) for smooth rotations.')

        action('slerp', () => {
            const a = new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), 0)
            const b = new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), Math.PI)
            logger.log('start:', a.clone())
            logger.log('end:', b)
            logger.log('25%:', a.clone().slerp(b, 0.25))
            logger.log('50%:', a.clone().slerp(b, 0.5))
            logger.log('75%:', a.clone().slerp(b, 0.75))
        })

    })


    section('Operations', () => {

        action('multiply', () => {
            const a = new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), Math.PI / 2)
            const b = new Quaternion().setFromAxisAngle(new Vec3(1, 0, 0), Math.PI / 2)
            logger.log('a (90° Y):', a.clone())
            logger.log('b (90° X):', b)
            logger.log('a * b:', a.multiply(b))
        })

        action('invert', () => {
            const q = new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), Math.PI / 2)
            logger.log('original:', q.clone())
            logger.log('inverted:', q.clone().invert())
        })

        action('normalize', () => {
            const q = new Quaternion(1, 2, 3, 4)
            logger.log('before:', q.clone())
            logger.log('length:', q.length())
            logger.log('normalized:', q.normalize())
            logger.log('length after:', q.length())
        })

    })

})
