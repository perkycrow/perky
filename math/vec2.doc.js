import {doc, section, setup, text, code, action, logger} from '../doc/runtime.js'
import Vec2 from './vec2.js'


export default doc('Vec2', {context: 'simple'}, () => {

    text(`
        Mutable 2D vector with method chaining.
        Used for positions, directions, and dimensions.
    `)


    code('Creation', () => {
        const a = new Vec2(3, 4)
        const b = new Vec2({x: 1, y: 2})
        const c = new Vec2([5, 6])
    })


    section('Arithmetic', () => {

        setup(ctx => {
            ctx.a = new Vec2(3, 4)
            ctx.b = new Vec2(1, 2)
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

    })


    section('Measurements', () => {

        setup(ctx => {
            ctx.v = new Vec2(3, 4)
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
            const other = new Vec2(0, 0)
            logger.log('v:', ctx.v)
            logger.log('other:', other)
            logger.log('distance:', ctx.v.distanceTo(other))
        })

    })


    section('Transformations', () => {

        text('Geometric transformations.')

        action('Rotation', () => {
            const v = new Vec2(1, 0)
            const center = new Vec2(0, 0)
            logger.log('original:', v.clone())
            logger.log('rotated 90deg:', v.rotateAround(center, Math.PI / 2))
        })

        action('Lerp', () => {
            const a = new Vec2(0, 0)
            const b = new Vec2(10, 10)
            logger.log('a:', a)
            logger.log('b:', b)
            logger.log('25%:', a.clone().lerp(b, 0.25))
            logger.log('50%:', a.clone().lerp(b, 0.5))
            logger.log('75%:', a.clone().lerp(b, 0.75))
        })

    })


    section('Chaining', () => {

        text('Methods return `this` for chaining.')

        action('Example', () => {
            const result = new Vec2(1, 0)
                .multiplyScalar(5)
                .add(new Vec2(0, 3))
                .normalize()
            logger.log('result:', result)
        })

    })

})
