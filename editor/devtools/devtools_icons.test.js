import {describe, test, expect} from 'vitest'
import {ICONS} from './devtools_icons.js'


describe('devtools_icons', () => {

    describe('ICONS', () => {

        test('is an object', () => {
            expect(typeof ICONS).toBe('object')
            expect(ICONS).not.toBeNull()
        })


        test('action', () => {
            expect(ICONS.action).toBeDefined()
            expect(ICONS.action).toContain('<svg')
        })


        test('start', () => {
            expect(ICONS.start).toBeDefined()
            expect(ICONS.start).toContain('<svg')
        })


        test('stop', () => {
            expect(ICONS.stop).toBeDefined()
            expect(ICONS.stop).toContain('<svg')
        })


        test('close', () => {
            expect(ICONS.close).toBeDefined()
            expect(ICONS.close).toContain('<svg')
        })


        test('spawn', () => {
            expect(ICONS.spawn).toBeDefined()
            expect(ICONS.spawn).toContain('<svg')
        })


        test('dispose', () => {
            expect(ICONS.dispose).toBeDefined()
            expect(ICONS.dispose).toContain('<svg')
        })


        test('apps', () => {
            expect(ICONS.apps).toBeDefined()
            expect(ICONS.apps).toContain('<svg')
        })


        test('explorer', () => {
            expect(ICONS.explorer).toBeDefined()
            expect(ICONS.explorer).toContain('<svg')
        })


        test('logger', () => {
            expect(ICONS.logger).toBeDefined()
            expect(ICONS.logger).toContain('<svg')
        })


        test('terminal', () => {
            expect(ICONS.terminal).toBeDefined()
            expect(ICONS.terminal).toContain('<svg')
        })


        test('chevronLeft', () => {
            expect(ICONS.chevronLeft).toBeDefined()
            expect(ICONS.chevronLeft).toContain('<svg')
        })


        test('chevronRight', () => {
            expect(ICONS.chevronRight).toBeDefined()
            expect(ICONS.chevronRight).toContain('<svg')
        })


        test('history', () => {
            expect(ICONS.history).toBeDefined()
            expect(ICONS.history).toContain('<svg')
        })


        test('crow', () => {
            expect(ICONS.crow).toBeDefined()
            expect(ICONS.crow).toContain('<svg')
        })


        test('all icons have valid SVG viewBox attribute', () => {
            for (const [name, icon] of Object.entries(ICONS)) {
                expect(icon).toContain('viewBox', `${name} icon should have viewBox`)
            }
        })

    })

})
