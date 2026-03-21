import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import CSGPool, {getActivePool} from './csg_pool.js'


export default doc('CSGPool', () => {

    text(`
        Object pool for Vec3 instances during CSG operations.
        Reduces garbage collection pressure by reusing vectors
        instead of allocating new ones.
    `)


    section('Static run', () => {

        text('CSGPool.run() wraps a function with automatic pooling.')

        code('Basic usage', () => {
            const result = CSGPool.run(() => {
                const pool = getActivePool()
                const v = pool.vec3(1, 2, 3)
                return v.x + v.y + v.z
            })
        })

        action('Run with pool', () => {
            const result = CSGPool.run(() => {
                const pool = getActivePool()
                const v = pool.vec3(1, 2, 3)
                logger.log('vector:', v.x, v.y, v.z)
                logger.log('pool used:', pool.used)
                return v.x + v.y + v.z
            })
            logger.log('result:', result)
        })

    })


    section('Vector allocation', () => {

        text('vec3() returns a pooled vector, reusing existing ones when possible.')

        action('Allocate vectors', () => {
            CSGPool.run(() => {
                const pool = getActivePool()
                const v1 = pool.vec3(1, 0, 0)
                const v2 = pool.vec3(0, 1, 0)
                const v3 = pool.vec3(0, 0, 1)
                logger.log('used:', pool.used)
                logger.log('size:', pool.size)
            })
        })

    })


    section('Pool reset', () => {

        text('After run() completes, the pool resets and vectors are available for reuse.')

        action('Reuse after reset', () => {
            const pool = new CSGPool()
            pool.vec3(1, 2, 3)
            pool.vec3(4, 5, 6)
            logger.log('before reset - used:', pool.used, 'size:', pool.size)
            pool.reset()
            logger.log('after reset - used:', pool.used, 'size:', pool.size)
            const v = pool.vec3(7, 8, 9)
            logger.log('reused vector:', v.x, v.y, v.z)
        })

    })

})
