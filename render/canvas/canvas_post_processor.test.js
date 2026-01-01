import {describe, test, expect, beforeEach} from 'vitest'
import CanvasPostProcessor from './canvas_post_processor.js'


describe('CanvasPostProcessor', () => {

    let processor
    let ctx


    beforeEach(() => {
        ctx = {
            filter: 'none',
            canvas: {width: 800, height: 600},
            save: () => {},
            restore: () => {},
            fillRect: () => {},
            fillStyle: null,
            createRadialGradient: () => ({
                addColorStop: () => {}
            })
        }
        processor = new CanvasPostProcessor(ctx)
    })


    test('filters starts empty', () => {
        expect(processor.filters).toEqual([])
    })


    describe('addFilter', () => {

        test('adds filter to list', () => {
            processor.addFilter('blur', 5)
            expect(processor.filters).toEqual([{type: 'blur', value: 5}])
        })


        test('returns this for chaining', () => {
            const result = processor.addFilter('blur', 5)
            expect(result).toBe(processor)
        })


        test('allows multiple filters', () => {
            processor.addFilter('blur', 5)
            processor.addFilter('brightness', 1.2)

            expect(processor.filters).toHaveLength(2)
        })

    })


    describe('removeFilter', () => {

        test('removes filter by type', () => {
            processor.addFilter('blur', 5)
            processor.addFilter('brightness', 1.2)
            processor.removeFilter('blur')

            expect(processor.filters).toEqual([{type: 'brightness', value: 1.2}])
        })


        test('returns this for chaining', () => {
            const result = processor.removeFilter('blur')
            expect(result).toBe(processor)
        })

    })


    describe('clearFilters', () => {

        test('removes all filters', () => {
            processor.addFilter('blur', 5)
            processor.addFilter('brightness', 1.2)
            processor.clearFilters()

            expect(processor.filters).toEqual([])
        })


        test('returns this for chaining', () => {
            const result = processor.clearFilters()
            expect(result).toBe(processor)
        })

    })


    describe('addManualEffect', () => {

        test('returns this for chaining', () => {
            const effect = {apply: () => {}}
            const result = processor.addManualEffect(effect)
            expect(result).toBe(processor)
        })

    })


    describe('removeManualEffect', () => {

        test('removes specific effect', () => {
            const effect1 = {apply: () => {}}
            const effect2 = {apply: () => {}}
            processor.addManualEffect(effect1)
            processor.addManualEffect(effect2)
            processor.removeManualEffect(effect1)

            let appliedCount = 0
            effect1.apply = () => { appliedCount++ }
            effect2.apply = () => { appliedCount++ }

            processor.finish(800, 600)

            expect(appliedCount).toBe(1)
        })


        test('returns this for chaining', () => {
            const result = processor.removeManualEffect({})
            expect(result).toBe(processor)
        })

    })


    describe('clearManualEffects', () => {

        test('removes all manual effects', () => {
            processor.addManualEffect({apply: () => {}})
            processor.addManualEffect({apply: () => {}})
            processor.clearManualEffects()

            let appliedCount = 0
            processor.finish(800, 600)

            expect(appliedCount).toBe(0)
        })


        test('returns this for chaining', () => {
            const result = processor.clearManualEffects()
            expect(result).toBe(processor)
        })

    })


    describe('begin', () => {

        test('sets filter string on context', () => {
            processor.addFilter('blur', 5)
            processor.begin()

            expect(ctx.filter).toBe('blur(5px)')
        })


        test('combines multiple filters', () => {
            processor.addFilter('blur', 5)
            processor.addFilter('brightness', 1.2)
            processor.begin()

            expect(ctx.filter).toBe('blur(5px) brightness(1.2)')
        })


        test('does not set filter when no filters', () => {
            ctx.filter = 'existing'
            processor.begin()

            expect(ctx.filter).toBe('existing')
        })


        test('formats contrast filter', () => {
            processor.addFilter('contrast', 1.5)
            processor.begin()
            expect(ctx.filter).toBe('contrast(1.5)')
        })


        test('formats grayscale filter', () => {
            processor.addFilter('grayscale', 0.5)
            processor.begin()
            expect(ctx.filter).toBe('grayscale(0.5)')
        })


        test('formats saturate filter', () => {
            processor.addFilter('saturate', 2)
            processor.begin()
            expect(ctx.filter).toBe('saturate(2)')
        })


        test('formats sepia filter', () => {
            processor.addFilter('sepia', 0.8)
            processor.begin()
            expect(ctx.filter).toBe('sepia(0.8)')
        })


        test('formats hueRotate filter', () => {
            processor.addFilter('hueRotate', 90)
            processor.begin()
            expect(ctx.filter).toBe('hue-rotate(90deg)')
        })


        test('formats invert filter', () => {
            processor.addFilter('invert', 1)
            processor.begin()
            expect(ctx.filter).toBe('invert(1)')
        })


        test('formats opacity filter', () => {
            processor.addFilter('opacity', 0.5)
            processor.begin()
            expect(ctx.filter).toBe('opacity(0.5)')
        })


        test('formats dropShadow filter', () => {
            processor.addFilter('dropShadow', '4px 4px 10px black')
            processor.begin()
            expect(ctx.filter).toBe('drop-shadow(4px 4px 10px black)')
        })

    })


    describe('finish', () => {

        test('resets filter to none', () => {
            processor.addFilter('blur', 5)
            processor.begin()
            processor.finish(800, 600)

            expect(ctx.filter).toBe('none')
        })


        test('applies manual effects', () => {
            let applied = false
            let appliedWidth = null
            let appliedHeight = null

            processor.addManualEffect({
                apply: (c, w, h) => {
                    applied = true
                    appliedWidth = w
                    appliedHeight = h
                }
            })

            processor.finish(800, 600)

            expect(applied).toBe(true)
            expect(appliedWidth).toBe(800)
            expect(appliedHeight).toBe(600)
        })

    })


    describe('applyVignette', () => {

        test('creates radial gradient', () => {
            let gradientCreated = false
            ctx.createRadialGradient = () => {
                gradientCreated = true
                return {addColorStop: () => {}}
            }

            processor.applyVignette()

            expect(gradientCreated).toBe(true)
        })


        test('saves and restores context', () => {
            let saved = false
            let restored = false
            ctx.save = () => { saved = true }
            ctx.restore = () => { restored = true }

            processor.applyVignette()

            expect(saved).toBe(true)
            expect(restored).toBe(true)
        })


        test('fills rect with gradient', () => {
            let fillRectArgs = null
            ctx.fillRect = (...args) => { fillRectArgs = args }

            processor.applyVignette()

            expect(fillRectArgs).toEqual([0, 0, 800, 600])
        })


        test('uses default intensity and softness', () => {
            let colorStops = []
            ctx.createRadialGradient = () => ({
                addColorStop: (pos, color) => { colorStops.push({pos, color}) }
            })

            processor.applyVignette()

            expect(colorStops[0].color).toBe('rgba(0, 0, 0, 0)')
            expect(colorStops[1].color).toContain('rgba(0, 0, 0,')
        })

    })


    describe('dispose', () => {

        test('clears filters', () => {
            processor.addFilter('blur', 5)
            processor.dispose()

            expect(processor.filters).toEqual([])
        })

    })

})
