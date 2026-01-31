import {doc, section, setup, text, code, action, logger} from '../doc/runtime.js'
import Vec3 from './vec3.js'


export default doc('Vec3', () => {

    text(`
        Mutable 3D vector with method chaining.
        Used for positions, directions, and colors in 3D space.
    `)


    code('Creation', () => {
        const a = new Vec3(1, 2, 3)
        const b = new Vec3({x: 1, y: 2, z: 3})
        const c = new Vec3([4, 5, 6])
    })


    section('Arithmetic', () => {

        setup(ctx => {
            ctx.a = new Vec3(3, 4, 5)
            ctx.b = new Vec3(1, 2, 3)
        })

        action('Addition', ctx => {
            logger.log('a:', ctx.a)
            logger.log('b:', ctx.b)
            logger.log('a + b:', ctx.a.clone().add(ctx.b))
        })

        action('Subtraction', ctx => {
            logger.log('a:', ctx.a)
            logger.log('b:', ctx.b)
            logger.log('a - b:', ctx.a.clone().sub(ctx.b))
        })

        action('Scalar multiplication', ctx => {
            logger.log('a:', ctx.a)
            logger.log('a * 2:', ctx.a.clone().multiplyScalar(2))
        })

        action('Dot product', ctx => {
            logger.log('a:', ctx.a)
            logger.log('b:', ctx.b)
            logger.log('a · b:', ctx.a.dot(ctx.b))
        })

        action('Cross product', ctx => {
            logger.log('a:', ctx.a)
            logger.log('b:', ctx.b)
            logger.log('a × b:', ctx.a.clone().cross(ctx.b))
        })

    })


    section('Measurements', () => {

        setup(ctx => {
            ctx.v = new Vec3(1, 2, 3)
        })

        text('Measurement methods return numbers.')

        action('Length', ctx => {
            logger.log('v:', ctx.v)
            logger.log('length:', ctx.v.length())
        })

        action('Normalize', ctx => {
            logger.log('original:', ctx.v.clone())
            logger.log('normalized:', ctx.v.clone().normalize())
        })

        action('Distance', ctx => {
            const other = new Vec3(0, 0, 0)
            logger.log('v:', ctx.v)
            logger.log('other:', other)
            logger.log('distance:', ctx.v.distanceTo(other))
        })

        action('Angle', () => {
            const up = new Vec3(0, 1, 0)
            const right = new Vec3(1, 0, 0)
            logger.log('angle (radians):', up.angleTo(right))
        })

    })


    section('Transformations', () => {

        text('Geometric transformations.')

        action('Lerp', () => {
            const a = new Vec3(0, 0, 0)
            const b = new Vec3(10, 10, 10)
            logger.log('a:', a)
            logger.log('b:', b)
            logger.log('25%:', a.clone().lerp(b, 0.25))
            logger.log('50%:', a.clone().lerp(b, 0.5))
            logger.log('75%:', a.clone().lerp(b, 0.75))
        })

        action('Reflect', () => {
            const v = new Vec3(1, -1, 0)
            const normal = new Vec3(0, 1, 0)
            logger.log('v:', v.clone())
            logger.log('normal:', normal)
            logger.log('reflected:', v.reflect(normal))
        })

        action('Project on vector', () => {
            const v = new Vec3(3, 4, 0)
            const axis = new Vec3(1, 0, 0)
            logger.log('v:', v.clone())
            logger.log('axis:', axis)
            logger.log('projected:', v.projectOnVector(axis))
        })

    })


    section('Chaining', () => {

        text('Methods return `this` for chaining.')

        action('Example', () => {
            const result = new Vec3(1, 0, 0)
                .multiplyScalar(5)
                .add(new Vec3(0, 3, 0))
                .normalize()
            logger.log('result:', result)
        })

    })

})
