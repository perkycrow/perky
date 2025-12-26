import {describe, test, expect, beforeEach, vi} from 'vitest'
import WebGLTextureManager from './webgl_texture_manager'
import PerkyModule from '../core/perky_module'


function createMockGL () {
    return {
        createTexture: vi.fn(() => ({})),
        deleteTexture: vi.fn(),
        bindTexture: vi.fn(),
        texImage2D: vi.fn(),
        texParameteri: vi.fn(),
        TEXTURE_2D: 'TEXTURE_2D',
        RGBA: 'RGBA',
        UNSIGNED_BYTE: 'UNSIGNED_BYTE',
        TEXTURE_MIN_FILTER: 'MIN_FILTER',
        TEXTURE_MAG_FILTER: 'MAG_FILTER',
        TEXTURE_WRAP_S: 'WRAP_S',
        TEXTURE_WRAP_T: 'WRAP_T',
        LINEAR: 'LINEAR',
        CLAMP_TO_EDGE: 'CLAMP_TO_EDGE'
    }
}


function createMockImage (width = 100, height = 100) {
    return {width, height, complete: true}
}


describe(WebGLTextureManager, () => {

    let gl
    let manager

    beforeEach(() => {
        gl = createMockGL()
        manager = new WebGLTextureManager({gl, autoFlush: false})
    })


    test('extends PerkyModule', () => {
        expect(manager).toBeInstanceOf(PerkyModule)
    })


    test('$category', () => {
        expect(WebGLTextureManager.$category).toBe('textureManager')
    })


    describe('acquire', () => {

        test('creates texture on first acquire', () => {
            const image = createMockImage()

            const texture = manager.acquire(image)

            expect(texture).toBeDefined()
            expect(gl.createTexture).toHaveBeenCalledTimes(1)
        })


        test('returns same texture on subsequent acquires', () => {
            const image = createMockImage()

            const texture1 = manager.acquire(image)
            const texture2 = manager.acquire(image)

            expect(texture1).toBe(texture2)
            expect(gl.createTexture).toHaveBeenCalledTimes(1)
        })


        test('increments ref count', () => {
            const image = createMockImage()

            manager.acquire(image)
            manager.acquire(image)
            manager.acquire(image)

            expect(manager.stats.activeCount).toBe(1)
        })


        test('returns null for null image', () => {
            expect(manager.acquire(null)).toBeNull()
        })

    })


    describe('release', () => {

        test('decrements ref count', () => {
            const image = createMockImage()

            manager.acquire(image)
            manager.acquire(image)
            manager.release(image)

            expect(manager.stats.activeCount).toBe(1)
        })


        test('moves to zombies when refs reach zero', () => {
            const image = createMockImage()

            manager.acquire(image)
            manager.release(image)

            expect(manager.stats.activeCount).toBe(0)
            expect(manager.stats.zombieCount).toBe(1)
        })


        test('does not delete texture immediately', () => {
            const image = createMockImage()

            manager.acquire(image)
            manager.release(image)

            expect(gl.deleteTexture).not.toHaveBeenCalled()
        })


        test('emits zombie event', () => {
            const image = createMockImage()
            const handler = vi.fn()
            manager.on('zombie', handler)

            manager.acquire(image)
            manager.release(image)

            expect(handler).toHaveBeenCalled()
        })

    })


    describe('resurrect', () => {

        test('resurrects zombie on acquire', () => {
            const image = createMockImage()

            const texture1 = manager.acquire(image)
            manager.release(image)
            const texture2 = manager.acquire(image)

            expect(texture1).toBe(texture2)
            expect(gl.createTexture).toHaveBeenCalledTimes(1)
            expect(manager.stats.zombieCount).toBe(0)
            expect(manager.stats.activeCount).toBe(1)
        })


        test('emits resurrect event', () => {
            const image = createMockImage()
            const handler = vi.fn()
            manager.on('resurrect', handler)

            manager.acquire(image)
            manager.release(image)
            manager.acquire(image)

            expect(handler).toHaveBeenCalled()
        })

    })


    describe('flush', () => {

        test('deletes all zombie textures', () => {
            const image1 = createMockImage()
            const image2 = createMockImage()

            manager.acquire(image1)
            manager.acquire(image2)
            manager.release(image1)
            manager.release(image2)

            manager.flush()

            expect(gl.deleteTexture).toHaveBeenCalledTimes(2)
            expect(manager.stats.zombieCount).toBe(0)
        })


        test('does not delete active textures', () => {
            const image = createMockImage()

            manager.acquire(image)
            manager.flush()

            expect(gl.deleteTexture).not.toHaveBeenCalled()
            expect(manager.stats.activeCount).toBe(1)
        })


        test('emits flush event', () => {
            const image = createMockImage()
            const handler = vi.fn()
            manager.on('flush', handler)

            manager.acquire(image)
            manager.release(image)
            manager.flush()

            expect(handler).toHaveBeenCalledWith(1, expect.any(Number))
        })

    })


    describe('flushIfFull', () => {

        test('flushes oldest zombies when over limit', () => {
            const smallManager = new WebGLTextureManager({
                gl,
                maxZombieSize: 1000,
                autoFlush: false
            })

            const images = []
            for (let i = 0; i < 5; i++) {
                const image = createMockImage(100, 100)
                images.push(image)
                smallManager.acquire(image)
                smallManager.release(image)
            }

            expect(gl.deleteTexture).toHaveBeenCalled()
        })

    })


    describe('flushStale', () => {

        test('flushes textures older than maxAge', () => {
            vi.useFakeTimers()

            const image = createMockImage()
            manager.acquire(image)
            manager.release(image)

            vi.advanceTimersByTime(20 * 60 * 1000)

            manager.flushStale()

            expect(gl.deleteTexture).toHaveBeenCalled()
            expect(manager.stats.zombieCount).toBe(0)

            vi.useRealTimers()
        })


        test('does not flush recent zombies', () => {
            const image = createMockImage()
            manager.acquire(image)
            manager.release(image)

            manager.flushStale()

            expect(gl.deleteTexture).not.toHaveBeenCalled()
            expect(manager.stats.zombieCount).toBe(1)
        })

    })


    describe('getTexture', () => {

        test('returns texture for active image', () => {
            const image = createMockImage()
            const texture = manager.acquire(image)

            expect(manager.getTexture(image)).toBe(texture)
        })


        test('returns texture for zombie image', () => {
            const image = createMockImage()
            const texture = manager.acquire(image)
            manager.release(image)

            expect(manager.getTexture(image)).toBe(texture)
        })


        test('creates texture if not exists (legacy mode)', () => {
            const image = createMockImage()

            const texture = manager.getTexture(image)

            expect(texture).toBeDefined()
            expect(manager.stats.activeCount).toBe(1)
        })

    })


    describe('stats', () => {

        test('returns correct stats', () => {
            const image1 = createMockImage(100, 100)
            const image2 = createMockImage(200, 200)

            manager.acquire(image1)
            manager.acquire(image2)
            manager.release(image2)

            const stats = manager.stats

            expect(stats.activeCount).toBe(1)
            expect(stats.zombieCount).toBe(1)
            expect(stats.totalCount).toBe(2)
        })

    })


    describe('autoFlush', () => {

        test('starts interval on start when enabled', () => {
            vi.useFakeTimers()

            const autoManager = new WebGLTextureManager({
                gl,
                autoFlush: true,
                autoFlushInterval: 1000
            })

            const flushStaleSpy = vi.spyOn(autoManager, 'flushStale')
            autoManager.start()

            vi.advanceTimersByTime(3000)

            expect(flushStaleSpy).toHaveBeenCalledTimes(3)

            autoManager.stop()
            vi.useRealTimers()
        })


        test('stops interval on stop', () => {
            vi.useFakeTimers()

            const autoManager = new WebGLTextureManager({
                gl,
                autoFlush: true,
                autoFlushInterval: 1000
            })

            autoManager.start()
            autoManager.stop()

            const flushStaleSpy = vi.spyOn(autoManager, 'flushStale')

            vi.advanceTimersByTime(3000)

            expect(flushStaleSpy).not.toHaveBeenCalled()

            vi.useRealTimers()
        })

    })


    describe('dispose', () => {

        test('deletes all textures', () => {
            const image1 = createMockImage()
            const image2 = createMockImage()

            manager.acquire(image1)
            manager.acquire(image2)
            manager.release(image2)

            manager.dispose()

            expect(gl.deleteTexture).toHaveBeenCalledTimes(2)
        })

    })

})

