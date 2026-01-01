import {describe, it, expect} from 'vitest'
import {ICONS} from './devtools_icons.js'


describe('devtools_icons', () => {

    describe('ICONS', () => {

        it('should be an object', () => {
            expect(typeof ICONS).toBe('object')
            expect(ICONS).not.toBeNull()
        })


        it('should contain action icon', () => {
            expect(ICONS.action).toBeDefined()
            expect(ICONS.action).toContain('<svg')
        })


        it('should contain start icon', () => {
            expect(ICONS.start).toBeDefined()
            expect(ICONS.start).toContain('<svg')
        })


        it('should contain stop icon', () => {
            expect(ICONS.stop).toBeDefined()
            expect(ICONS.stop).toContain('<svg')
        })


        it('should contain close icon', () => {
            expect(ICONS.close).toBeDefined()
            expect(ICONS.close).toContain('<svg')
        })


        it('should contain spawn icon', () => {
            expect(ICONS.spawn).toBeDefined()
            expect(ICONS.spawn).toContain('<svg')
        })


        it('should contain dispose icon', () => {
            expect(ICONS.dispose).toBeDefined()
            expect(ICONS.dispose).toContain('<svg')
        })


        it('should contain apps icon', () => {
            expect(ICONS.apps).toBeDefined()
            expect(ICONS.apps).toContain('<svg')
        })


        it('should contain explorer icon', () => {
            expect(ICONS.explorer).toBeDefined()
            expect(ICONS.explorer).toContain('<svg')
        })


        it('should contain logger icon', () => {
            expect(ICONS.logger).toBeDefined()
            expect(ICONS.logger).toContain('<svg')
        })


        it('should contain terminal icon', () => {
            expect(ICONS.terminal).toBeDefined()
            expect(ICONS.terminal).toContain('<svg')
        })


        it('should contain chevronLeft icon', () => {
            expect(ICONS.chevronLeft).toBeDefined()
            expect(ICONS.chevronLeft).toContain('<svg')
        })


        it('should contain chevronRight icon', () => {
            expect(ICONS.chevronRight).toBeDefined()
            expect(ICONS.chevronRight).toContain('<svg')
        })


        it('should contain history icon', () => {
            expect(ICONS.history).toBeDefined()
            expect(ICONS.history).toContain('<svg')
        })


        it('should contain crow icon', () => {
            expect(ICONS.crow).toBeDefined()
            expect(ICONS.crow).toContain('<svg')
        })


        it('should have valid SVG viewBox attribute', () => {
            for (const [name, icon] of Object.entries(ICONS)) {
                expect(icon).toContain('viewBox', `${name} icon should have viewBox`)
            }
        })

    })

})
