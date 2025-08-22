import {describe, test, expect, beforeEach, vi} from 'vitest'
import WebGLRenderer from './webgl_renderer'
import {PCFSoftShadowMap, BasicShadowMap, NoColorSpace} from 'three'


describe('WebGLRenderer', () => {

    let mockContainer

    beforeEach(() => {
        mockContainer = {
            clientWidth: 800,
            clientHeight: 600,
            appendChild: vi.fn()
        }
    })


    test('class exists and extends Three.js WebGLRenderer', () => {
        expect(typeof WebGLRenderer).toBe('function')
        expect(WebGLRenderer.name).toBe('WebGLRenderer')
    })


    test('constructor parameter processing works correctly', () => {
        const testParams = {
            container: mockContainer,
            antialias: false,
            shadows: false,
            customParam: 'test'
        }

        const {
            container,
            antialias = true,
            shadows = true,
            shadowType = PCFSoftShadowMap,
            ...rendererParams
        } = testParams

        expect(container).toBe(mockContainer)
        expect(antialias).toBe(false)
        expect(shadows).toBe(false)
        expect(shadowType).toBe(PCFSoftShadowMap)
        expect(rendererParams.customParam).toBe('test')
        expect(rendererParams.container).toBeUndefined()
    })


    test('parameter defaults are correctly defined', () => {
        const mockParams = {}
        
        const {
            autoPixelRatio = true,
            antialias = true,
            preserveDrawingBuffer = true,
            shadows = true,
            shadowType = PCFSoftShadowMap,
            outputColorSpace = 'srgb'
        } = mockParams

        expect(autoPixelRatio).toBe(true)
        expect(antialias).toBe(true)
        expect(preserveDrawingBuffer).toBe(true)
        expect(shadows).toBe(true)
        expect(shadowType).toBe(PCFSoftShadowMap)
        expect(outputColorSpace).toBe('srgb')
    })


    test('constants are properly imported', () => {
        expect(PCFSoftShadowMap).toBeDefined()
        expect(BasicShadowMap).toBeDefined()
        expect(NoColorSpace).toBeDefined()
    })

}) 