import {describe, test, expect, beforeEach, vi} from 'vitest'
import ShadowTransform from './shadow_transform.js'
import RenderTransform from '../render_transform.js'


describe(ShadowTransform, () => {

    test('extends RenderTransform', () => {
        const transform = new ShadowTransform()
        expect(transform instanceof RenderTransform).toBe(true)
    })


    test('constructor defaults', () => {
        const transform = new ShadowTransform()
        expect(transform.skewX).toBe(0.5)
        expect(transform.scaleY).toBe(0.5)
        expect(transform.offsetY).toBe(0)
        expect(transform.color).toEqual([0, 0, 0, 0.4])
    })


    test('constructor accepts options', () => {
        const transform = new ShadowTransform({
            skewX: 1.0,
            scaleY: 0.3,
            offsetY: 10,
            color: [0.1, 0.2, 0.3, 0.5]
        })
        expect(transform.skewX).toBe(1.0)
        expect(transform.scaleY).toBe(0.3)
        expect(transform.offsetY).toBe(10)
        expect(transform.color).toEqual([0.1, 0.2, 0.3, 0.5])
    })


    test('constructor inherits enabled option', () => {
        const transform = new ShadowTransform({enabled: false})
        expect(transform.enabled).toBe(false)
    })


    describe('init', () => {

        test('registers shadow shader', () => {
            const transform = new ShadowTransform()
            const mockProgram = {uniforms: {}}
            const mockContext = {
                shaderRegistry: {
                    register: vi.fn(() => mockProgram)
                }
            }

            transform.init(mockContext)

            expect(mockContext.shaderRegistry.register).toHaveBeenCalledWith(
                'shadow',
                expect.objectContaining({
                    vertex: expect.any(String),
                    fragment: expect.any(String)
                })
            )
        })

    })


    describe('getProgram', () => {

        let transform
        let mockProgram

        beforeEach(() => {
            transform = new ShadowTransform()
            mockProgram = {uniforms: {}}
            const mockContext = {
                shaderRegistry: {
                    register: vi.fn(() => mockProgram)
                }
            }
            transform.init(mockContext)
        })


        test('returns program after init', () => {
            expect(transform.getProgram()).toBe(mockProgram)
        })

    })


    describe('applyUniforms', () => {

        let transform
        let mockGL
        let mockProgram

        beforeEach(() => {
            transform = new ShadowTransform({
                skewX: 0.7,
                scaleY: 0.4,
                offsetY: 5,
                color: [0.2, 0.2, 0.2, 0.6]
            })
            mockGL = {
                uniform1f: vi.fn(),
                uniform4fv: vi.fn()
            }
            mockProgram = {
                uniforms: {
                    uShadowSkewX: 'skewLoc',
                    uShadowScaleY: 'scaleLoc',
                    uShadowOffsetY: 'offsetLoc',
                    uShadowColor: 'colorLoc'
                }
            }
        })


        test('sets shadow uniforms', () => {
            transform.applyUniforms(mockGL, mockProgram)

            expect(mockGL.uniform1f).toHaveBeenCalledWith('skewLoc', 0.7)
            expect(mockGL.uniform1f).toHaveBeenCalledWith('scaleLoc', 0.4)
            expect(mockGL.uniform1f).toHaveBeenCalledWith('offsetLoc', 5)
            expect(mockGL.uniform4fv).toHaveBeenCalledWith('colorLoc', [0.2, 0.2, 0.2, 0.6])
        })

    })


    test('getPropertyConfig', () => {
        const transform = new ShadowTransform()
        const config = transform.getPropertyConfig()

        expect(config.skewX).toEqual({min: -2, max: 2, step: 0.05})
        expect(config.scaleY).toEqual({min: -1, max: 0, step: 0.05})
        expect(config.offsetY).toEqual({min: -0.5, max: 0.5, step: 0.01})
        expect(config.color).toEqual({type: 'color'})
    })


    test('static propertyConfig', () => {
        expect(ShadowTransform.propertyConfig).toBeDefined()
        expect(ShadowTransform.propertyConfig.skewX).toBeDefined()
    })


    test('dispose clears program', () => {
        const transform = new ShadowTransform()
        const mockProgram = {uniforms: {}}
        const mockContext = {
            shaderRegistry: {
                register: vi.fn(() => mockProgram)
            }
        }
        transform.init(mockContext)

        transform.dispose()

        expect(transform.getProgram()).toBeNull()
    })

})
