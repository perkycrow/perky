import {doc, section, setup, text, code, action, logger} from '../doc/runtime.js'
import Vec4 from './vec4.js'


export default doc('Vec4', () => {

    text(`
        Mutable 4D vector with method chaining.
        Used for RGBA colors, quaternion-like data, and rectangle bounds (x, y, width, height).
    `)


    code('Creation', () => {
        const a = new Vec4(1, 2, 3, 4)
        const b = new Vec4({x: 1, y: 2, z: 3, w: 4})
        const c = new Vec4([1, 2, 3, 4])
    })


    section('Arithmetic', () => {

        setup(ctx => {
            ctx.a = new Vec4(3, 4, 5, 6)
            ctx.b = new Vec4(1, 2, 3, 4)
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
            logger.log('a . b:', ctx.a.dot(ctx.b))
        })

    })


    section('Measurements', () => {

        setup(ctx => {
            ctx.v = new Vec4(1, 2, 3, 4)
        })

        text('Measurement methods return numbers.')

        action('Length', ctx => {
            logger.log('v:', ctx.v)
            logger.log('length:', ctx.v.length())
            logger.log('lengthSq:', ctx.v.lengthSq())
            logger.log('manhattanLength:', ctx.v.manhattanLength())
        })

        action('Normalize', ctx => {
            logger.log('original:', ctx.v.clone())
            logger.log('normalized:', ctx.v.clone().normalize())
        })

    })


    section('Transformations', () => {

        text('Geometric transformations.')

        action('Lerp', () => {
            const a = new Vec4(0, 0, 0, 0)
            const b = new Vec4(10, 10, 10, 10)
            logger.log('a:', a)
            logger.log('b:', b)
            logger.log('25%:', a.clone().lerp(b, 0.25))
            logger.log('50%:', a.clone().lerp(b, 0.5))
            logger.log('75%:', a.clone().lerp(b, 0.75))
        })

        action('Clamp', () => {
            const v = new Vec4(5, -3, 12, 0.5)
            const min = new Vec4(0, 0, 0, 0)
            const max = new Vec4(10, 10, 10, 1)
            logger.log('original:', v.clone())
            logger.log('clamped:', v.clamp(min, max))
        })

        action('Negate', () => {
            const v = new Vec4(1, -2, 3, -4)
            logger.log('original:', v.clone())
            logger.log('negated:', v.negate())
        })

    })


    section('Rectangle Aliases', () => {

        text('`width` and `height` are aliases for `z` and `w`, useful for rectangle bounds.')

        action('Example', () => {
            const rect = new Vec4(10, 20, 100, 50)
            logger.log('x:', rect.x)
            logger.log('y:', rect.y)
            logger.log('width:', rect.width)
            logger.log('height:', rect.height)
        })

    })


    section('Chaining', () => {

        text('Methods return `this` for chaining.')

        action('Example', () => {
            const result = new Vec4(1, 0, 0, 0)
                .multiplyScalar(5)
                .add(new Vec4(0, 3, 0, 1))
                .normalize()
            logger.log('result:', result)
        })

    })

})
